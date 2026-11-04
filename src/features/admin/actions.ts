"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { logAdminActivity } from "./activity-logger";

// ============================================================================
// Validation Schemas
// ============================================================================

const verifyReportSchema = z.object({
  reportId: z.string().uuid("ID laporan tidak valid"),
  note: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

const rejectReportSchema = z.object({
  reportId: z.string().uuid("ID laporan tidak valid"),
  reason: z
    .string()
    .min(10, "Alasan penolakan minimal 10 karakter")
    .max(500, "Alasan penolakan maksimal 500 karakter"),
});

const updateStatusSchema = z.object({
  reportId: z.string().uuid("ID laporan tidak valid"),
  newStatus: z.enum(["diverifikasi", "diproses", "selesai"]),
  note: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

// ============================================================================
// Action Result Types
// ============================================================================

export type ActionResult<T = unknown> =
  | { ok: true; data: T; message: string }
  | { ok: false; message: string };

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
  try {
    // Authorization check
    const adminUser = await requireAdmin();

    // Validate input
    const validated = verifyReportSchema.parse({ reportId, note });

    const supabase = await createClient();

    // Get current report
    const { data: report, error: fetchError } = await supabase
      .from("reports")
      .select("id, status")
      .eq("id", validated.reportId)
      .single();

    if (fetchError || !report) {
      return {
        ok: false,
        message: "Laporan tidak ditemukan.",
      };
    }

    // Check current status
    if (report.status !== "diterima") {
      return {
        ok: false,
        message: `Laporan dengan status "${report.status}" tidak dapat diverifikasi.`,
      };
    }

    // Update status
    const { error: updateError } = await supabase
      .from("reports")
      .update({
        status: "diverifikasi",
        verified_at: new Date().toISOString(),
      })
      .eq("id", validated.reportId);

    if (updateError) {
      console.error("Error updating report:", updateError);
      return {
        ok: false,
        message: "Gagal memverifikasi laporan. Silakan coba lagi.",
      };
    }

    // Record status history
    const { error: historyError } = await supabase
      .from("report_status_history")
      .insert({
        report_id: validated.reportId,
        status: "diverifikasi",
        note: validated.note || "Laporan telah diverifikasi oleh admin",
      });

    if (historyError) {
      console.error("Error recording history:", historyError);
      // Don't fail the operation if history recording fails
    }

    // Revalidate admin pages
    revalidatePath("/admin");
    revalidatePath("/admin/reports");
    revalidatePath(`/admin/reports/${validated.reportId}`);

    // Log admin activity (non-blocking)
    logAdminActivity({
      adminUserId: adminUser.id,
      actionType: "verify_report",
      targetReportId: validated.reportId,
      details: {
        note: validated.note,
        previousStatus: "diterima",
        newStatus: "diverifikasi",
      },
    });

    return {
      ok: true,
      data: { reportId: validated.reportId },
      message: "Laporan berhasil diverifikasi.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        message: error.issues[0]?.message || "Data tidak valid.",
      };
    }

    console.error("verifyReport error:", error);
    return {
      ok: false,
      message: "Terjadi kesalahan. Silakan coba lagi.",
    };
  }
}

/**
 * Tolak laporan - mengubah status dari "diterima" menjadi "ditolak"
 */
export async function rejectReport(
  reportId: string,
  reason: string,
): Promise<ActionResult> {
  try {
    // Authorization check
    const adminUser = await requireAdmin();

    // Validate input
    const validated = rejectReportSchema.parse({ reportId, reason });

    const supabase = await createClient();

    // Get current report
    const { data: report, error: fetchError } = await supabase
      .from("reports")
      .select("id, status")
      .eq("id", validated.reportId)
      .single();

    if (fetchError || !report) {
      return {
        ok: false,
        message: "Laporan tidak ditemukan.",
      };
    }

    // Check current status
    if (report.status !== "diterima") {
      return {
        ok: false,
        message: `Laporan dengan status "${report.status}" tidak dapat ditolak.`,
      };
    }

    // Update status
    const { error: updateError } = await supabase
      .from("reports")
      .update({
        status: "ditolak",
      })
      .eq("id", validated.reportId);

    if (updateError) {
      console.error("Error updating report:", updateError);
      return {
        ok: false,
        message: "Gagal menolak laporan. Silakan coba lagi.",
      };
    }

    // Record status history with rejection reason
    const { error: historyError } = await supabase
      .from("report_status_history")
      .insert({
        report_id: validated.reportId,
        status: "ditolak",
        note: `Laporan ditolak: ${validated.reason}`,
      });

    if (historyError) {
      console.error("Error recording history:", historyError);
    }

    // Revalidate admin pages
    revalidatePath("/admin");
    revalidatePath("/admin/reports");
    revalidatePath(`/admin/reports/${validated.reportId}`);

    // Log admin activity
    logAdminActivity({
      adminUserId: adminUser.id,
      actionType: "reject_report",
      targetReportId: validated.reportId,
      details: {
        reason: validated.reason,
        previousStatus: "diterima",
        newStatus: "ditolak",
      },
    });

    return {
      ok: true,
      data: { reportId: validated.reportId },
      message: "Laporan berhasil ditolak.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        message: error.issues[0]?.message || "Data tidak valid.",
      };
    }

    console.error("rejectReport error:", error);
    return {
      ok: false,
      message: "Terjadi kesalahan. Silakan coba lagi.",
    };
  }
}

/**
 * Update status laporan - untuk transisi lanjutan (diverifikasi → diproses → selesai)
 */
export async function updateReportStatus(
  reportId: string,
  newStatus: "diverifikasi" | "diproses" | "selesai",
  note?: string,
): Promise<ActionResult> {
  try {
    // Authorization check
    const adminUser = await requireAdmin();

    // Validate input
    const validated = updateStatusSchema.parse({ reportId, newStatus, note });

    const supabase = await createClient();

    // Get current report
    const { data: report, error: fetchError } = await supabase
      .from("reports")
      .select("id, status")
      .eq("id", validated.reportId)
      .single();

    if (fetchError || !report) {
      return {
        ok: false,
        message: "Laporan tidak ditemukan.",
      };
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      diterima: ["diverifikasi"],
      diverifikasi: ["diproses"],
      diproses: ["selesai"],
    };

    const allowedStatuses = validTransitions[report.status] || [];
    if (!allowedStatuses.includes(validated.newStatus)) {
      return {
        ok: false,
        message: `Transisi dari "${report.status}" ke "${validated.newStatus}" tidak diizinkan.`,
      };
    }

    // Update status
    const { error: updateError } = await supabase
      .from("reports")
      .update({
        status: validated.newStatus,
      })
      .eq("id", validated.reportId);

    if (updateError) {
      console.error("Error updating report:", updateError);
      return {
        ok: false,
        message: "Gagal mengubah status laporan. Silakan coba lagi.",
      };
    }

    // Record status history
    const { error: historyError } = await supabase
      .from("report_status_history")
      .insert({
        report_id: validated.reportId,
        status: validated.newStatus,
        note: validated.note || `Status diubah menjadi ${validated.newStatus}`,
      });

    if (historyError) {
      console.error("Error recording history:", historyError);
    }

    // Revalidate admin pages
    revalidatePath("/admin");
    revalidatePath("/admin/reports");
    revalidatePath(`/admin/reports/${validated.reportId}`);

    // Log admin activity
    logAdminActivity({
      adminUserId: adminUser.id,
      actionType: "update_status",
      targetReportId: validated.reportId,
      details: {
        note: validated.note,
        previousStatus: report.status,
        newStatus: validated.newStatus,
      },
    });

    return {
      ok: true,
      data: { reportId: validated.reportId, newStatus: validated.newStatus },
      message: `Status berhasil diubah menjadi ${validated.newStatus}.`,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        message: error.issues[0]?.message || "Data tidak valid.",
      };
    }

    console.error("updateReportStatus error:", error);
    return {
      ok: false,
      message: "Terjadi kesalahan. Silakan coba lagi.",
    };
  }
}
