import "server-only";

import type { Json } from "@/types/supabase";
import { createClient } from "@/lib/supabase/server";

export type ReportReview = {
  rating: number;
  comment: string;
  createdAt: string;
  isViewer: boolean;
};

export type ReportReviewSummary = {
  reviewCount: number;
  averageRating: number;
  viewerHasReviewed: boolean;
  canReview: boolean;
  reviews: ReportReview[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseReviews(value: Json): ReportReview[] {
  if (!Array.isArray(value)) {
    throw new Error("Format ulasan laporan tidak valid.");
  }

  return value.map((entry) => {
    if (
      !isRecord(entry) ||
      typeof entry.rating !== "number" ||
      typeof entry.comment !== "string" ||
      typeof entry.created_at !== "string" ||
      typeof entry.is_viewer !== "boolean"
    ) {
      throw new Error("Data ulasan laporan tidak lengkap.");
    }

    return {
      rating: entry.rating,
      comment: entry.comment,
      createdAt: entry.created_at,
      isViewer: entry.is_viewer,
    };
  });
}

export async function getReportReviewSummary(reportId: string): Promise<ReportReviewSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_report_review_summary", {
    p_report_id: reportId,
  });

  if (error) {
    console.error("Failed to fetch report review summary", {
      code: error.code,
      message: error.message,
      reportId,
    });
    throw new Error(`Gagal memuat penilaian laporan: ${error.message}`);
  }

  const summary = data?.[0];
  if (!summary) {
    throw new Error(`Ringkasan penilaian laporan ${reportId} tidak ditemukan.`);
  }

  return {
    reviewCount: summary.review_count,
    averageRating: summary.average_rating,
    viewerHasReviewed: summary.viewer_has_reviewed,
    canReview: summary.can_review,
    reviews: parseReviews(summary.reviews),
  };
}
