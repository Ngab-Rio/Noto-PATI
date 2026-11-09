import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockPush, mockRefresh, mockSupportReport } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
  mockSupportReport: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));
vi.mock("@/features/reports/actions", () => ({
  supportReport: mockSupportReport,
}));

import { ReportSupportButton } from "./ReportSupportButton";

const REPORT_ID = "e9c2987f-7c74-4d84-b2d0-044d6bd43db1";

const defaultProps = {
  reportId: REPORT_ID,
  supportCount: 2,
  hasSupported: false,
  isOwner: false,
  canSupport: false,
  isAuthenticated: false,
  returnTo: `/reports/${REPORT_ID}`,
};

let container: HTMLDivElement;
let root: Root;

function renderSupportButton(
  props: Partial<typeof defaultProps> & { showCount?: boolean } = {},
): HTMLButtonElement {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => {
    root.render(createElement(ReportSupportButton, { ...defaultProps, ...props }));
  });
  const button = container.querySelector("button");
  if (!button) throw new Error("Tombol dukungan tidak dirender.");
  return button;
}

describe("ReportSupportButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  it("directs guests to login without calling the support action", async () => {
    const button = renderSupportButton();

    expect(button.textContent).toContain("Masuk untuk dukung");
    await act(async () => button.click());

    expect(mockPush).toHaveBeenCalledWith(
      `/login?next=${encodeURIComponent(`/reports/${REPORT_ID}`)}`,
    );
    expect(mockSupportReport).not.toHaveBeenCalled();
  });

  it("updates the count after the authenticated action succeeds", async () => {
    mockSupportReport.mockResolvedValue({
      ok: true,
      supportCount: 3,
      hasSupported: true,
    });
    const button = renderSupportButton({
      isAuthenticated: true,
      canSupport: true,
    });

    await act(async () => button.click());

    expect(mockSupportReport).toHaveBeenCalledWith({ reportId: REPORT_ID });
    expect(container.textContent).toContain("Didukung");
    expect(container.textContent).toContain("3");
    expect(container.querySelector("button")?.disabled).toBe(true);
  });

  it("refreshes aggregated engagement metrics after supporting from a ranked list", async () => {
    mockSupportReport.mockResolvedValue({
      ok: true,
      supportCount: 3,
      hasSupported: true,
    });
    const button = renderSupportButton({
      isAuthenticated: true,
      canSupport: true,
      showCount: false,
    });

    await act(async () => button.click());

    expect(container.textContent).toContain("Didukung");
    expect(container.textContent).not.toContain("2");
    expect(mockRefresh).toHaveBeenCalledOnce();
  });

  it("prevents a resident from supporting their own report", async () => {
    const button = renderSupportButton({
      isAuthenticated: true,
      isOwner: true,
    });

    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain("Laporan Anda");
    await act(async () => button.click());
    expect(mockSupportReport).not.toHaveBeenCalled();
  });

  it("shows a recoverable error without increasing the count", async () => {
    mockSupportReport.mockResolvedValue({
      ok: false,
      reason: "error",
      message: "Dukungan gagal disimpan. Silakan coba lagi.",
    });
    const button = renderSupportButton({
      isAuthenticated: true,
      canSupport: true,
    });

    await act(async () => button.click());

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "Dukungan gagal disimpan",
    );
    expect(container.textContent).toContain("2");
    expect(container.textContent).not.toContain("Didukung");
  });
});
