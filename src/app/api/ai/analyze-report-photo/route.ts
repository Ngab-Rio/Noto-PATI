import { createHmac, createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { serverEnv } from "@/config/env.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasTrustedRequestOrigin } from "@/lib/security/request-origin";
import {
  AiProviderError,
  createOpenAICompatibleProvider,
} from "@/features/ai/server/openai-compatible-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + 64 * 1024;
const RATE_LIMIT = 5;

class RequestTooLargeError extends Error {}

type AnalysisStart = {
  analysis_id: string | null;
  allowed: boolean;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

function hasExpectedImageSignature(
  bytes: Uint8Array,
  mimeType: string,
): mimeType is "image/jpeg" | "image/png" | "image/webp" {
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return bytes.length >= 8
      && bytes[0] === 0x89
      && bytes[1] === 0x50
      && bytes[2] === 0x4e
      && bytes[3] === 0x47
      && bytes[4] === 0x0d
      && bytes[5] === 0x0a
      && bytes[6] === 0x1a
      && bytes[7] === 0x0a;
  }
  if (mimeType === "image/webp") {
    return bytes.length >= 12
      && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
      && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }
  return false;
}

function getRequesterHash(request: Request, key: string) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const address = forwardedFor?.split(",").at(-1)?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  return createHmac("sha256", key).update(address).digest("hex");
}

async function readFormDataWithinLimit(request: Request): Promise<FormData> {
  const contentType = request.headers.get("content-type");
  if (!contentType?.toLowerCase().startsWith("multipart/form-data;")) {
    throw new Error("Invalid content type");
  }

  const reader = request.body?.getReader();
  if (!reader) {
    throw new Error("Missing request body");
  }

  const chunks: Uint8Array[] = [];
  let totalSize = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    totalSize += value.byteLength;
    if (totalSize > MAX_REQUEST_SIZE) {
      await reader.cancel();
      throw new RequestTooLargeError();
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new Response(body, {
    headers: { "content-type": contentType },
  }).formData();
}

async function updateAnalysis(
  admin: ReturnType<typeof createAdminClient>,
  analysisId: string,
  values: Record<string, string | number | null>,
) {
  const { error } = await admin
    .from("report_ai_analyses")
    .update(values)
    .eq("id", analysisId);

  if (error) {
    throw new Error("Could not persist AI analysis metadata.");
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!hasTrustedRequestOrigin(request)) {
    console.warn("Rejected AI photo analysis request with untrusted origin.", {
      origin,
      requestOrigin: new URL(request.url).origin,
    });
    return jsonError("Permintaan analisis tidak valid.", 403);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_SIZE) {
    return jsonError("Ukuran foto maksimal 5MB.", 413);
  }

  const provider = createOpenAICompatibleProvider();
  const rateLimitKey = serverEnv.AI_VISION_API_KEY;
  if (!provider || !rateLimitKey) {
    return jsonError("Analisis AI belum dikonfigurasi. Anda tetap dapat mengisi form secara manual.", 503);
  }

  let photo: File;
  try {
    const formData = await readFormDataWithinLimit(request);
    const input = formData.get("photo");
    if (!(input instanceof File)) {
      return jsonError("Pilih foto yang valid untuk dianalisis.", 400);
    }
    photo = input;
  } catch (error) {
    if (error instanceof RequestTooLargeError) {
      return jsonError("Ukuran foto maksimal 5MB.", 413);
    }
    return jsonError("Data foto tidak dapat dibaca. Silakan coba lagi.", 400);
  }

  if (photo.size < 1 || photo.size > MAX_FILE_SIZE) {
    return jsonError("Ukuran foto harus antara 1 byte dan 5MB.", 413);
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await photo.arrayBuffer());
  } catch {
    return jsonError("Foto tidak dapat dibaca. Silakan pilih ulang foto.", 400);
  }
  if (!hasExpectedImageSignature(bytes, photo.type)) {
    return jsonError("Foto harus berupa JPEG, PNG, atau WEBP yang valid.", 415);
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (error) {
    console.error("Could not create Supabase admin client for AI analysis.", error);
    return jsonError("Layanan analisis belum siap. Anda tetap dapat mengisi form secara manual.", 503);
  }

  const photoHash = createHash("sha256").update(bytes).digest("hex");
  const requesterHash = getRequesterHash(request, rateLimitKey);
  const { data: startData, error: startError } = await admin.rpc(
    "start_report_ai_analysis",
    {
      p_requester_hash: requesterHash,
      p_photo_sha256: photoHash,
      p_provider: provider.provider,
      p_model: provider.model,
      p_rate_limit: RATE_LIMIT,
    },
  );
  const start = (Array.isArray(startData) ? startData[0] : startData) as AnalysisStart | null;

  if (startError || !start) {
    console.error("Could not start AI photo analysis.", {
      code: startError?.code,
      message: startError?.message,
    });
    return jsonError("Layanan analisis belum siap. Anda tetap dapat mengisi form secara manual.", 503);
  }
  if (!start.allowed || !start.analysis_id) {
    return jsonError("Batas analisis tercapai. Coba lagi nanti atau lanjutkan pengisian manual.", 429);
  }

  const startedAt = Date.now();
  try {
    const analysis = await provider.analyze({ bytes, mimeType: photo.type });
    await updateAnalysis(admin, start.analysis_id, {
      status: "succeeded",
      suggested_category: analysis.category,
      suggested_title: analysis.title,
      suggested_description: analysis.description,
      confidence: analysis.confidence ?? null,
      duration_ms: Date.now() - startedAt,
    });

    return NextResponse.json({
      ok: true,
      analysisId: start.analysis_id,
      analysis,
      provider: provider.provider,
      model: provider.model,
    });
  } catch (error) {
    const code = error instanceof AiProviderError ? error.code : "metadata_error";
    console.error("AI photo analysis failed.", {
      code,
      upstreamStatus: error instanceof AiProviderError ? error.upstreamStatus : undefined,
    });
    try {
      await updateAnalysis(admin, start.analysis_id, {
        status: "failed",
        error_code: code,
        duration_ms: Date.now() - startedAt,
      });
    } catch (metadataError) {
      console.error("Could not persist failed AI analysis metadata.", metadataError);
    }

    const message = code === "rate_limited"
      ? "Layanan AI sedang membatasi permintaan. Silakan coba lagi nanti atau lanjutkan secara manual."
      : code === "timeout"
        ? "Analisis AI melebihi batas waktu (30 detik). Silakan coba lagi atau lanjutkan secara manual."
        : "Analisis AI gagal. Silakan coba lagi atau lanjutkan secara manual.";
    const status = code === "rate_limited" ? 429 : code === "timeout" ? 504 : 502;
    return jsonError(message, status);
  }
}
