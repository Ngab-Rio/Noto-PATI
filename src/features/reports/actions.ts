"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isMissingAuthSessionError } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const supportReportSchema = z.object({
  reportId: z.string().uuid("ID laporan tidak valid."),
});

export type SupportReportResult =
  | { ok: true; supportCount: number; hasSupported: true }
  | {
      ok: false;
      reason: "invalid" | "unauthenticated" | "not_allowed" | "not_found" | "error";
      message: string;
    };

export async function supportReport(input: unknown): Promise<SupportReportResult> {
  const parsed = supportReportSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "invalid",
      message: parsed.error.issues[0]?.message ?? "ID laporan tidak valid.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError && !isMissingAuthSessionError(userError)) {
    console.error("Failed to verify user before supporting report", userError);
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
      message: "Masuk atau daftar untuk mendukung laporan.",
    };
  }

  const { data, error } = await supabase.rpc("support_report", {
    p_report_id: parsed.data.reportId,
  });
  const support = data?.[0];

  if (error || !support) {
    const errorMessage = error?.message ?? "";
    console.error("Failed to support report", {
      code: error?.code,
      message: errorMessage,
      reportId: parsed.data.reportId,
      userId: user.id,
    });

    if (errorMessage.includes("OWN_REPORT_NOT_SUPPORTABLE")) {
      return {
        ok: false,
        reason: "not_allowed",
        message: "Anda tidak dapat mendukung laporan yang Anda buat sendiri.",
      };
    }
    if (errorMessage.includes("CITIZEN_ONLY")) {
      return {
        ok: false,
        reason: "not_allowed",
        message: "Fitur dukungan hanya tersedia untuk akun warga.",
      };
    }
    if (errorMessage.includes("REPORT_NOT_FOUND")) {
      return {
        ok: false,
        reason: "not_found",
        message: "Laporan tidak ditemukan.",
      };
    }
    if (errorMessage.includes("REPORT_NOT_SUPPORTABLE")) {
      return {
        ok: false,
        reason: "not_allowed",
        message: "Laporan ini sudah digabung dan tidak menerima dukungan baru.",
      };
    }
    if (errorMessage.includes("AUTHENTICATION_REQUIRED")) {
      return {
        ok: false,
        reason: "unauthenticated",
        message: "Masuk atau daftar untuk mendukung laporan.",
      };
    }

    return {
      ok: false,
      reason: "error",
      message: "Dukungan gagal disimpan. Silakan coba lagi.",
    };
  }

  revalidatePath("/reports");
  revalidatePath("/reports/list");
  revalidatePath(`/reports/${parsed.data.reportId}`);
  revalidatePath("/my-reports");
  revalidatePath("/admin");
  revalidatePath("/admin/reports");

  return {
    ok: true,
    supportCount: support.support_count,
    hasSupported: support.has_supported,
  };
}
