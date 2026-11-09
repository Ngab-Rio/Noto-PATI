import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  useLinkStatus: () => ({ pending: false }),
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => createElement("a", { href, ...props }, children),
}));
vi.mock("@/features/reports/components/ReportSupportButton", () => ({
  ReportSupportButton: () => createElement("button", null, "Dukung"),
}));

import { ReportCard, type ReportItemData } from "./report-card";

const defaultReport: ReportItemData = {
  id: "e9c2987f-7c74-4d84-b2d0-044d6bd43db1",
  title: "Jalan berlubang",
  description: "Terdapat lubang di badan jalan.",
  category: "Jalan Berlubang / Rusak",
  status: "selesai",
  location: "Kecamatan Pati",
  date: "9 Nov 2026",
  supportCount: 0,
  hasSupported: false,
  isOwner: false,
  canSupport: false,
  isAuthenticated: false,
};

let container: HTMLDivElement;
let root: Root;

function renderReport(report: ReportItemData) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => {
    root.render(createElement(ReportCard, { report }));
  });
}

describe("ReportCard rating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  it("does not show a rating CTA or rating before the report has been reviewed", () => {
    renderReport(defaultReport);

    expect(container.textContent).not.toContain("Beri penilaian");
    expect(container.querySelector('[role="img"][aria-label*="Rating rata-rata"]')).toBeNull();
  });

  it("shows the existing average rating and review count without a CTA", () => {
    renderReport({
      ...defaultReport,
      rating: { averageRating: 4.5, reviewCount: 2 },
    });

    expect(container.textContent).toContain("4,5");
    expect(container.textContent).toContain("2 penilaian");
    expect(container.textContent).not.toContain("Beri penilaian");
    expect(
      container.querySelector(
        '[role="img"][aria-label="Rating rata-rata 4,5 dari 5 berdasarkan 2 penilaian"]',
      ),
    ).not.toBeNull();
  });
});
