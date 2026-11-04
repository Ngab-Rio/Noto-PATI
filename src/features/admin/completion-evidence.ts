"use server";

/**
 * Completion Evidence Upload System (FR-11: Bukti Penyelesaian)
 * 
 * Allows admin to upload completion photos when marking report as "selesai"
 * Photos stored in Supabase Storage and referenced in report_status_history
 */

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

export type UploadEvidenceResult = 
  | { ok: true; data: { publicUrl: string; path: string }; message: string }
  | { ok: false; message: string };

// ─────────────────────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────────────────────

const uploadEvidenceSchema = z.object({
  reportId: z.string().uuid("ID laporan tidak valid"),
  file: z.instanceof(File, { message: "File wajib diupload" }),
  note: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

// ─────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const STORAGE_BUCKET = "completion-evidence";

// ─────────────────────────────────────────────────────────────────────────
// Server Actions
// ─────────────────────────────────────────────────────────────────────────

/**
 * Upload completion evidence photo
 * Used when admin marks report as "selesai" with proof
 */
export async function uploadCompletionEvidence(
  formData: FormData
): Promise<UploadEvidenceResult> {
  try {
    // Auth guard
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return {
        ok: false,
        message: "Unauthorized: Admin access required",
      };
    }

    // Extract and validate inputs
    const reportId = formData.get("reportId") as string;
    const file = formData.get("file") as File;
    const note = formData.get("note") as string | null;

    const validation = uploadEvidenceSchema.safeParse({
      reportId,
      file,
      note: note || undefined,
    });

    if (!validation.success) {
      return {
        ok: false,
        message: validation.error.issues[0]?.message || "Data tidak valid",
      };
    }

    const validated = validation.data;

    // File type validation
    if (!ALLOWED_MIME_TYPES.includes(validated.file.type)) {
      return {
        ok: false,
        message: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP",
      };
    }

    // File size validation
    if (validated.file.size > MAX_FILE_SIZE) {
      return {
        ok: false,
        message: "Ukuran file maksimal 5MB",
      };
    }

    const supabase = await createClient();

    // Verify report exists and current status
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("id, status, ticket_number")
      .eq("id", validated.reportId)
      .single();

    if (reportError || !report) {
      return {
        ok: false,
        message: "Laporan tidak ditemukan",
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = validated.file.name.split(".").pop();
    const fileName = `${report.ticket_number}_completion_${timestamp}.${fileExt}`;
    const filePath = `${validated.reportId}/${fileName}`;

    // Upload to Supabase Storage
    const fileBuffer = await validated.file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: validated.file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return {
        ok: false,
        message: "Gagal mengupload foto. Silakan coba lagi.",
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      return {
        ok: false,
        message: "Gagal mendapatkan URL foto",
      };
    }

    // Record in status history with proof_image_url
    const { error: historyError } = await supabase
      .from("report_status_history")
      .insert({
        report_id: validated.reportId,
        status: "selesai",
        note:
          validated.note ||
          "Pekerjaan selesai 100%. Foto bukti penyelesaian telah diupload.",
        proof_image_url: urlData.publicUrl,
      });

    if (historyError) {
      console.error("Error recording history:", historyError);
      // Don't fail if history fails, photo is already uploaded
    }

    // Revalidate pages
    revalidatePath("/admin");
    revalidatePath("/admin/reports");
    revalidatePath(`/admin/reports/${validated.reportId}`);

    return {
      ok: true,
      data: {
        publicUrl: urlData.publicUrl,
        path: filePath,
      },
      message: "Foto bukti penyelesaian berhasil diupload",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        message: error.issues[0]?.message || "Data tidak valid",
      };
    }

    console.error("uploadCompletionEvidence error:", error);
    return {
      ok: false,
      message: "Terjadi kesalahan sistem. Silakan coba lagi.",
    };
  }
}

/**
 * Delete completion evidence (if admin needs to re-upload)
 */
export async function deleteCompletionEvidence(
  filePath: string
): Promise<{ ok: boolean; message: string }> {
  try {
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return {
        ok: false,
        message: "Unauthorized",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error("Delete evidence error:", error);
      return {
        ok: false,
        message: "Gagal menghapus foto",
      };
    }

    return {
      ok: true,
      message: "Foto berhasil dihapus",
    };
  } catch (error) {
    console.error("deleteCompletionEvidence error:", error);
    return {
      ok: false,
      message: "Terjadi kesalahan sistem",
    };
  }
}

/**
 * Get all completion evidence for a report
 */
export async function getCompletionEvidence(reportId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("report_status_history")
      .select("id, created_at, note, proof_image_url")
      .eq("report_id", reportId)
      .eq("status", "selesai")
      .not("proof_image_url", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get evidence error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("getCompletionEvidence error:", error);
    return [];
  }
}
