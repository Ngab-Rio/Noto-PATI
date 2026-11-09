import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { submitReportReview } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const REPORT_ID = "e9c2987f-7c74-4d84-b2d0-044d6bd43db1";

function createSupabaseMock({
  user = { id: "c65af7d2-3856-459d-b9a0-ef213ad1cb0a" },
  userError = null,
  rpcError = null,
}: {
  user?: { id: string } | null;
  userError?: { name?: string; message: string } | null;
  rpcError?: { code?: string; message: string } | null;
} = {}) {
  const rpc = vi.fn().mockResolvedValue({ data: null, error: rpcError });
  const auth = {
    getUser: vi.fn().mockResolvedValue({ data: { user }, error: userError }),
  };
  vi.mocked(createClient).mockResolvedValue({ auth, rpc } as unknown as Awaited<
    ReturnType<typeof createClient>
  >);
  return { auth, rpc };
}

const VALID_REVIEW = {
  reportId: REPORT_ID,
  rating: 5,
  comment: "Penanganan laporan berjalan dengan baik.",
};

describe("submitReportReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid rating and comment before checking authentication", async () => {
    const { auth, rpc } = createSupabaseMock();

    const result = await submitReportReview({
      ...VALID_REVIEW,
      rating: 6,
      comment: "   ",
    });

    expect(result).toMatchObject({ ok: false, reason: "invalid" });
    expect(auth.getUser).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("does not call the review RPC for a guest", async () => {
    const { rpc } = createSupabaseMock({ user: null });

    const result = await submitReportReview(VALID_REVIEW);

    expect(result).toMatchObject({ ok: false, reason: "unauthenticated" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("stores a valid review through the RPC and revalidates the detail page", async () => {
    const { rpc } = createSupabaseMock();

    const result = await submitReportReview(VALID_REVIEW);

    expect(rpc).toHaveBeenCalledWith("submit_report_review", {
      p_report_id: REPORT_ID,
      p_rating: 5,
      p_comment: VALID_REVIEW.comment,
    });
    expect(result).toEqual({ ok: true });
    expect(revalidatePath).toHaveBeenCalledWith(`/reports/${REPORT_ID}`);
  });

  it("returns a clear message when the report already has the resident's review", async () => {
    createSupabaseMock({
      rpcError: { message: "REVIEW_ALREADY_SUBMITTED" },
    });

    const result = await submitReportReview(VALID_REVIEW);

    expect(result).toMatchObject({ ok: false, reason: "already_submitted" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("only allows warga accounts to submit a review", async () => {
    createSupabaseMock({
      rpcError: { message: "CITIZEN_ONLY" },
    });

    const result = await submitReportReview(VALID_REVIEW);

    expect(result).toMatchObject({ ok: false, reason: "not_allowed" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects reviews for reports that are not completed", async () => {
    createSupabaseMock({
      rpcError: { message: "REPORT_NOT_COMPLETED" },
    });

    const result = await submitReportReview(VALID_REVIEW);

    expect(result).toMatchObject({ ok: false, reason: "not_completed" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("does not hide unexpected database errors", async () => {
    createSupabaseMock({
      rpcError: { message: "Database unavailable" },
    });

    const result = await submitReportReview(VALID_REVIEW);

    expect(result).toMatchObject({ ok: false, reason: "error" });
  });
});
