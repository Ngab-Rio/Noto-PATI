import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRpc } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ rpc: mockRpc })),
}));

import { getReportReviewSummary } from "./reviews";

describe("getReportReviewSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("treats a null viewer marker as false for anonymous viewers", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          review_count: 1,
          average_rating: 4,
          viewer_has_reviewed: false,
          can_review: false,
          reviews: [
            {
              rating: 4,
              comment: "Sudah ditangani.",
              created_at: "2026-11-09T08:00:00.000Z",
              is_viewer: null,
            },
          ],
        },
      ],
      error: null,
    });

    await expect(getReportReviewSummary("report-id")).resolves.toMatchObject({
      reviewCount: 1,
      averageRating: 4,
      viewerHasReviewed: false,
      canReview: false,
      reviews: [
        {
          rating: 4,
          comment: "Sudah ditangani.",
          isViewer: false,
        },
      ],
    });
  });

  it("rejects review entries with missing required fields", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          review_count: 1,
          average_rating: 4,
          viewer_has_reviewed: false,
          can_review: false,
          reviews: [{ rating: 4, comment: "Ulasan." }],
        },
      ],
      error: null,
    });

    await expect(getReportReviewSummary("report-id")).rejects.toThrow(
      "Data ulasan laporan tidak lengkap.",
    );
  });
});
