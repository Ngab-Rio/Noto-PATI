import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";

import { serverEnv } from "@/config/env.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasTrustedRequestOrigin } from "@/lib/security/request-origin";
import { fetchWithTimeout, FetchTimeoutError } from "@/lib/utils/fetch-with-timeout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GeocodeReservation = {
  cached_address: string | null;
  allowed: boolean;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function GET(request: Request) {
  if (!hasTrustedRequestOrigin(request)) {
    return jsonError("Permintaan lokasi tidak valid.", 403);
  }

  const query = new URL(request.url).searchParams;
  const latitude = Number(query.get("lat"));
  const longitude = Number(query.get("lon"));
  if (
    !Number.isFinite(latitude)
    || latitude < -90
    || latitude > 90
    || !Number.isFinite(longitude)
    || longitude < -180
    || longitude > 180
  ) {
    return jsonError("Koordinat lokasi tidak valid.", 400);
  }

  const serviceRoleKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return jsonError("Layanan pencarian alamat tidak tersedia.", 503);
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (error) {
    console.error("Could not create Supabase admin client for reverse geocoding.", error);
    return jsonError("Layanan pencarian alamat tidak tersedia.", 503);
  }

  const coordinateHash = createHmac("sha256", serviceRoleKey)
    .update(`${latitude.toFixed(5)},${longitude.toFixed(5)}`)
    .digest("hex");
  const { data, error } = await admin.rpc("claim_reverse_geocode", {
    p_coordinate_hash: coordinateHash,
  });
  const reservation = (Array.isArray(data) ? data[0] : data) as GeocodeReservation | null;

  if (error || !reservation) {
    console.error("Could not reserve reverse geocoding request.", {
      code: error?.code,
      message: error?.message,
    });
    return jsonError("Layanan pencarian alamat tidak tersedia.", 503);
  }
  if (reservation.cached_address) {
    return NextResponse.json({
      ok: true,
      address: reservation.cached_address,
      attribution: "© OpenStreetMap contributors",
    });
  }
  if (!reservation.allowed) {
    return NextResponse.json(
      { ok: false, message: "Pencarian alamat sedang sibuk. Silakan isi lokasi secara manual." },
      { status: 429, headers: { "Retry-After": "1" } },
    );
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("zoom", "18");
    url.searchParams.set("addressdetails", "1");

    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "Noto-PATI/0.1 (https://github.com/Ngab-Rio/Noto-PATI)",
      },
      cache: "no-store",
      timeout: 10000, // 10 seconds timeout for OSM Nominatim
    });

    if (!response.ok) {
      console.error("OpenStreetMap reverse geocoding failed.", { status: response.status });
      return jsonError("Alamat belum dapat ditemukan. Silakan isi lokasi secara manual.", 503);
    }

    const payload: unknown = await response.json();
    const address = payload && typeof payload === "object" && "display_name" in payload
      ? payload.display_name
      : null;
    if (typeof address !== "string" || !address.trim()) {
      return jsonError("Alamat belum dapat ditemukan. Silakan isi lokasi secara manual.", 404);
    }

    const displayAddress = address.trim().slice(0, 500);
    const { error: cacheError } = await admin.rpc("store_reverse_geocode_cache", {
      p_coordinate_hash: coordinateHash,
      p_display_name: displayAddress,
    });
    if (cacheError) {
      console.error("Could not cache reverse geocoding result.", {
        code: cacheError.code,
        message: cacheError.message,
      });
      return jsonError("Alamat ditemukan tetapi tidak dapat disimpan. Silakan isi lokasi secara manual.", 503);
    }

    return NextResponse.json({
      ok: true,
      address: displayAddress,
      attribution: "© OpenStreetMap contributors",
    });
  } catch (error) {
    if (error instanceof FetchTimeoutError) {
      console.error("Reverse geocoding request timed out.", error);
      return jsonError("Pencarian alamat terlalu lama. Silakan isi lokasi secara manual.", 504);
    }

    console.error("Reverse geocoding request failed.", error);
    return jsonError("Alamat belum dapat ditemukan. Silakan isi lokasi secara manual.", 503);
  }
}
