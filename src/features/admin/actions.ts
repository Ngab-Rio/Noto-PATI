"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { logAdminActivity } from "./activity-logger";

// ============================================================================
// Validation Schemas
// ============================================================================

const transitionSchema = z.object({
  reportId: z.string().uuid("ID laporan tidak valid"),
  toStatus: z.enum(["diverifikasi", "diproses", "selesai", "ditolak"]),
  note: z.string().trim().max(2000, "Catatan maksimal 2000 karakter").nullable().optional(),
  evidencePath: z.string().trim().max(500).nullable().optional(),
});

// ============================================================================
// Action Result Types
// ============================================================================

export type ActionResult<T = unknown> =
  | { ok: true; data: T; message: string }
  | { ok: false; message: string };

export async function transitionReport(
  input: unknown,
): Promise<ActionResult<{ status: string }>> {
  const parsed = transitionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    const adminUser = await requireAdmin();
    const supabase = await createClient();
    const rpcParams = {
      p_report_id: parsed.data.reportId,
      p_to_status: parsed.data.toStatus,
      p_note: parsed.data.note ?? null,
      p_merged_into_report_id: null,
      ...(parsed.data.toStatus === "selesai"
        ? { p_proof_image_path: parsed.data.evidencePath ?? null }
        : {}),
    };
    const { data, error } = await supabase
      .rpc("admin_transition_report", rpcParams)
      .maybeSingle();

    if (error || !data) {
      console.error("Failed to transition report:", {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        reportId: parsed.data.reportId,
        toStatus: parsed.data.toStatus,
      });
      const message = error?.message ?? "";
      if (message.includes("NOT_AUTHORIZED")) {
        return { ok: false, message: "Sesi admin tidak memiliki izin mengubah laporan. Silakan login ulang." };
      }
      if (message.includes("REPORT_NOT_FOUND")) {
        return { ok: false, message: "Laporan tidak ditemukan atau sudah dihapus." };
      }
      if (message.includes("INVALID_STATUS_TRANSITION")) {
        return { ok: false, message: "Perubahan status tersebut tidak diperbolehkan." };
      }
      if (message.includes("REJECTION_NOTE_REQUIRED")) {
        return { ok: false, message: "Alasan penolakan wajib diisi." };
      }
      if (message.includes("COMPLETION_EVIDENCE_REQUIRED")) {
        return { ok: false, message: "Bukti penyelesaian wajib diunggah." };
      }
      if (message.includes("INVALID_COMPLETION_EVIDENCE")) {
        return { ok: false, message: "Bukti penyelesaian tidak valid." };
      }
      if (message.includes("SLA_POLICY_NOT_CONFIGURED")) {
        return { ok: false, message: "Konfigurasi SLA belum tersedia." };
      }
      if (message.includes("SYSTEM_ONLY_MERGE")) {
        return { ok: false, message: "Penggabungan laporan hanya dapat dilakukan oleh sistem deteksi duplikat." };
      }
      if (error?.code === "PGRST202") {
        return {
          ok: false,
          message: "Fungsi perubahan status belum tersedia pada API Supabase. Tunggu beberapa saat lalu coba lagi.",
        };
      }
      return { ok: false, message: "Perubahan status gagal disimpan." };
    }

    await logAdminActivity({
      adminUserId: adminUser.id,
      actionType:
        parsed.data.toStatus === "ditolak"
          ? "reject_report"
          : parsed.data.toStatus === "diverifikasi"
              ? "verify_report"
              : "update_status",
      targetReportId: parsed.data.reportId,
      details: { newStatus: parsed.data.toStatus, note: parsed.data.note },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/reports");
    revalidatePath(`/admin/reports/${parsed.data.reportId}`);
    revalidatePath(`/reports/${parsed.data.reportId}`);

    const transition = data as { status: string };
    return {
      ok: true,
      data: { status: transition.status },
      message: "Status laporan berhasil diperbarui.",
    };
  } catch (error) {
    console.error("transitionReport error:", error);
    return { ok: false, message: "Terjadi kesalahan. Silakan coba lagi." };
  }
}

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Verifikasi laporan - mengubah status dari "diterima" menjadi "diverifikasi"
 */
export async function verifyReport(
  reportId: string,
  note?: string,
): Promise<ActionResult> {
  return transitionReport({
    reportId,
    toStatus: "diverifikasi",
    note: note ?? null,
  });
}

/**
 * Tolak laporan - mengubah status dari "diterima" menjadi "ditolak"
 */
export async function rejectReport(
  reportId: string,
  reason: string,
): Promise<ActionResult> {
  return transitionReport({
    reportId,
    toStatus: "ditolak",
    note: reason,
  });
}

/**
 * Update status laporan - untuk transisi lanjutan (diverifikasi → diproses → selesai)
 */
export async function updateReportStatus(
  reportId: string,
  newStatus: "diverifikasi" | "diproses" | "selesai",
  note?: string,
): Promise<ActionResult> {
  return transitionReport({ reportId, toStatus: newStatus, note: note ?? null });
}
