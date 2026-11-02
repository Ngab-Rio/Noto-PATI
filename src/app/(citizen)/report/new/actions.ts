"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const REPORT_PHOTOS_BUCKET = "report-photos";
const MAX_PHOTOS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const reportInputSchema = z.object({
  clientRequestId: z.string().uuid(),
  category: z.enum([
    "jalan",
    "lampu",
    "drainase",
    "jembatan",
    "tanggul",
    "trotoar",
    "rambu",
    "lainnya",
  ]),
  title: z.string().trim().min(10).max(100),
  description: z.string().trim().min(20).max(1000),
  detailLocation: z.string().trim().min(20).max(500),
  photos: z.array(z.instanceof(File)).min(1).max(MAX_PHOTOS),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  locationAccuracyM: z.number().finite().nonnegative().max(10000).nullable(),
  locationCapturedAt: z.string().datetime({ offset: true }),
});

export type CreateReportResult =
  | { ok: true; reportId: string; ticketNumber: string }
  | { ok: false; message: string };

type ReportRpcResult = {
  id: string;
  ticket_number: string;
  created: boolean;
};

async function uploadWithRetry(
  admin: ReturnType<typeof createAdminClient>,
  storagePath: string,
  photo: File,
) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { error } = await admin.storage
      .from(REPORT_PHOTOS_BUCKET)
      .upload(storagePath, photo, {
        contentType: photo.type,
        upsert: true,
      });

    if (!error) {
      return;
    }

    lastError = error;
  }

  throw lastError;
}

export async function createReport(
  input: unknown,
): Promise<CreateReportResult> {
  const parsedInput = reportInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Data laporan belum valid. Periksa kembali isian Anda.",
    };
  }

  const supabase = await createClient();
  const { data, error: reportError } = await supabase
    .rpc("create_report", {
      p_client_request_id: parsedInput.data.clientRequestId,
      p_category: parsedInput.data.category,
      p_title: parsedInput.data.title,
      p_description: parsedInput.data.description,
      p_detail_location: parsedInput.data.detailLocation,
      p_latitude: parsedInput.data.latitude,
      p_longitude: parsedInput.data.longitude,
      p_location_accuracy_m: parsedInput.data.locationAccuracyM,
      p_location_captured_at: parsedInput.data.locationCapturedAt,
    })
    .maybeSingle();
  const report = data as ReportRpcResult | null;

  if (reportError || !report) {
    console.error("Failed to create report", reportError);
    if (reportError?.message.includes("Lokasi laporan berada di luar wilayah Kabupaten Pati")) {
      return {
        ok: false,
        message: "Lokasi laporan berada di luar wilayah Kabupaten Pati. Silakan ambil lokasi di dalam Kabupaten Pati.",
      };
    }

    return { ok: false, message: "Laporan gagal disimpan. Silakan coba lagi." };
  }

  const admin = createAdminClient();
  const uploadedPaths: string[] = [];

  try {
    const { data: existingPhotos, error: photosError } = await admin
      .from("report_photos")
      .select("sort_order")
      .eq("report_id", report.id);

    if (photosError) {
      throw photosError;
    }

    const existingSortOrders = new Set(
      (existingPhotos ?? []).map((photo) => photo.sort_order),
    );

    for (const [index, photo] of parsedInput.data.photos.entries()) {
      if (existingSortOrders.has(index)) {
        continue;
      }

      if (
        !ALLOWED_MIME_TYPES.includes(photo.type as (typeof ALLOWED_MIME_TYPES)[number])
        || photo.size < 1
        || photo.size > MAX_FILE_SIZE
      ) {
        throw new Error("INVALID_PHOTO");
      }

      const extension = photo.type.split("/")[1];
      const storagePath = `${report.id}/${parsedInput.data.clientRequestId}-${index}.${extension}`;
      await uploadWithRetry(admin, storagePath, photo);

      uploadedPaths.push(storagePath);

      const { error: metadataError } = await admin
        .from("report_photos")
        .upsert({
          report_id: report.id,
          storage_path: storagePath,
          mime_type: photo.type,
          file_size_bytes: photo.size,
          sort_order: index,
        }, { onConflict: "report_id,sort_order" });

      if (metadataError) {
        throw metadataError;
      }
    }
  } catch (error) {
    console.error("Failed to store report photos", error);

    if (uploadedPaths.length > 0) {
      await admin.storage.from(REPORT_PHOTOS_BUCKET).remove(uploadedPaths);
    }

    if (report.created) {
      await admin.from("reports").delete().eq("id", report.id);
    }

    return {
      ok: false,
      message: error instanceof Error && error.message === "INVALID_PHOTO"
        ? "Foto harus berupa JPG, PNG, atau WEBP dengan ukuran maksimal 5MB."
        : "Pengiriman foto belum selesai. Data form tetap tersimpan, silakan coba lagi.",
    };
  }

  return {
    ok: true,
    reportId: report.id,
    ticketNumber: report.ticket_number,
  };
}
