"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isMissingAuthSessionError } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const submitReportReviewSchema = z.object({
  reportId: z.string().uuid("ID laporan tidak valid."),
  rating: z.number().int().min(1, "Pilih rating dari 1 sampai 5.").max(5, "Pilih rating dari 1 sampai 5."),
  comment: z.string().trim().min(1, "Komentar wajib diisi.").max(1000, "Komentar maksimal 1000 karakter."),
});

export type SubmitReportReviewResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "invalid"
        | "unauthenticated"
        | "not_allowed"
        | "not_found"
        | "not_completed"
        | "already_submitted"
        | "error";
      message: string;
    };

export async function submitReportReview(input: unknown): Promise<SubmitReportReviewResult> {
  const parsed = submitReportReviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "invalid",
      message: parsed.error.issues[0]?.message ?? "Penilaian tidak valid.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError && !isMissingAuthSessionError(userError)) {
    console.error("Failed to verify user before submitting report review", userError);
    return {
      ok: false,
      reason: "error",
      message: "Sesi tidak dapat diverifikasi. Silakan masuk kembali.",
    };
  }

  if (!user) {
    return {
      ok: false,
      reason: "unauthenticated",
      message: "Masuk untuk mengirim penilaian.",
    };
  }

  const { error } = await supabase.rpc("submit_report_review", {
    p_report_id: parsed.data.reportId,
    p_rating: parsed.data.rating,
    p_comment: parsed.data.comment,
  });

  if (error) {
    const errorMessage = error.message;
    console.error("Failed to submit report review", {
      code: error.code,
      message: errorMessage,
      reportId: parsed.data.reportId,
      userId: user.id,
    });

    if (errorMessage.includes("CITIZEN_ONLY")) {
      return {
        ok: false,
        reason: "not_allowed",
        message: "Penilaian hanya tersedia untuk akun warga.",
      };
    }
    if (errorMessage.includes("REPORT_NOT_FOUND")) {
      return {
        ok: false,
        reason: "not_found",
        message: "Laporan tidak ditemukan.",
      };
    }
    if (errorMessage.includes("REPORT_NOT_COMPLETED")) {
      return {
        ok: false,
        reason: "not_completed",
        message: "Penilaian hanya dapat diberikan pada laporan yang sudah selesai.",
      };
    }
    if (errorMessage.includes("REVIEW_ALREADY_SUBMITTED")) {
      return {
        ok: false,
        reason: "already_submitted",
        message: "Anda sudah mengirim penilaian untuk laporan ini.",
      };
    }
    if (errorMessage.includes("AUTHENTICATION_REQUIRED")) {
      return {
        ok: false,
        reason: "unauthenticated",
        message: "Masuk untuk mengirim penilaian.",
      };
    }
    if (errorMessage.includes("INVALID_REVIEW")) {
      return {
        ok: false,
        reason: "invalid",
        message: "Rating atau komentar tidak valid.",
      };
    }

    return {
      ok: false,
      reason: "error",
      message: "Penilaian gagal disimpan. Silakan coba lagi.",
    };
  }

  revalidatePath(`/reports/${parsed.data.reportId}`);

  return { ok: true };
}
