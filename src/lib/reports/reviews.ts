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

export type ReportReviewRating = Pick<
  ReportReviewSummary,
  "reviewCount" | "averageRating"
>;

type ReportReviewRatingRow = {
  report_id: string;
  review_count: number;
  average_rating: number;
};

const REVIEW_RATING_BATCH_SIZE = 500;

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
      (typeof entry.is_viewer !== "boolean" && entry.is_viewer !== null)
    ) {
      throw new Error("Data ulasan laporan tidak lengkap.");
    }

    return {
      rating: entry.rating,
      comment: entry.comment,
      createdAt: entry.created_at,
      isViewer: entry.is_viewer === true,
    };
  });
}

export async function getReportReviewRatings(
  reportIds: string[],
): Promise<Map<string, ReportReviewRating>> {
  const ratings = new Map<string, ReportReviewRating>();
  if (reportIds.length === 0) return ratings;

  const supabase = await createClient();
  const batches: string[][] = [];
  for (let offset = 0; offset < reportIds.length; offset += REVIEW_RATING_BATCH_SIZE) {
    batches.push(reportIds.slice(offset, offset + REVIEW_RATING_BATCH_SIZE));
  }

  const results = await Promise.all(
    batches.map((p_report_ids) =>
      supabase.rpc("get_report_review_ratings", { p_report_ids }),
    ),
  );

  for (const { data, error } of results) {
    if (error) {
      console.error("Failed to fetch report review ratings", error);
      throw new Error(`Gagal memuat ringkasan penilaian laporan: ${error.message}`);
    }

    for (const row of (data ?? []) as ReportReviewRatingRow[]) {
      ratings.set(row.report_id, {
        reviewCount: row.review_count,
        averageRating: row.average_rating,
      });
    }
  }

  return ratings;
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
