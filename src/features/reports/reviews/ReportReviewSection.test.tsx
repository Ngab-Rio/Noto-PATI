import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockPush, mockRefresh, mockSubmitReview } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
  mockSubmitReview: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));
vi.mock("@/features/reports/reviews/actions", () => ({
  submitReportReview: mockSubmitReview,
}));

import { ReportReviewSection } from "./ReportReviewSection";
import type { ReportReviewSummary } from "@/lib/reports/reviews";

const REPORT_ID = "e9c2987f-7c74-4d84-b2d0-044d6bd43db1";

const defaultProps: {
  reportId: string;
  isAuthenticated: boolean;
  summary: ReportReviewSummary;
} = {
  reportId: REPORT_ID,
  isAuthenticated: true,
  summary: {
    reviewCount: 0,
    averageRating: 0,
    viewerHasReviewed: false,
    canReview: true,
    reviews: [],
  },
};

let container: HTMLDivElement;
let root: Root;

function renderReviewSection(
  props: Partial<typeof defaultProps> = {},
): HTMLDivElement {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => {
    root.render(createElement(ReportReviewSection, { ...defaultProps, ...props }));
  });
  return container;
}

describe("ReportReviewSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  it("directs guests to login and does not render the review form", () => {
    renderReviewSection({ isAuthenticated: false });

    const loginLink = container.querySelector<HTMLAnchorElement>("a");
    expect(loginLink?.textContent).toContain("Masuk untuk menilai");
    expect(loginLink?.getAttribute("href")).toContain(encodeURIComponent(`/reports/${REPORT_ID}`));
    expect(container.querySelector("form")).toBeNull();
  });

  it("allows warga to submit one rating and comment", async () => {
    mockSubmitReview.mockResolvedValue({ ok: true });
    renderReviewSection();

    const ratingButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="5 dari 5 bintang"]',
    );
    const commentInput = container.querySelector<HTMLTextAreaElement>(
      "#report-review-comment",
    );
    if (!ratingButton || !commentInput) throw new Error("Form penilaian tidak dirender.");

    await act(async () => {
      ratingButton.click();
      const setter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      setter?.call(commentInput, "Penanganan selesai dengan baik.");
      commentInput.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const form = container.querySelector("form");
    if (!form) throw new Error("Form penilaian tidak dirender.");
    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(mockSubmitReview).toHaveBeenCalledWith({
      reportId: REPORT_ID,
      rating: 5,
      comment: "Penanganan selesai dengan baik.",
    });
    expect(mockRefresh).toHaveBeenCalledOnce();
    expect(container.textContent).toContain("Anda sudah mengirim penilaian");
  });

  it("shows a user's existing public review without allowing another submission", () => {
    renderReviewSection({
      summary: {
        reviewCount: 1,
        averageRating: 4,
        viewerHasReviewed: true,
        canReview: true,
        reviews: [
          {
            rating: 4,
            comment: "Sudah ditangani.",
            createdAt: "2026-11-09T08:00:00.000Z",
            isViewer: true,
          },
        ],
      },
    });

    expect(container.textContent).toContain("Ulasan Anda");
    expect(container.textContent).toContain("Sudah ditangani.");
    expect(container.querySelector("form")).toBeNull();
  });
});
