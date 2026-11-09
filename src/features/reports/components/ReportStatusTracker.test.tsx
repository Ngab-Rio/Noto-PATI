import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const realtimeMock = vi.hoisted(() => ({
  changeHandler: null as null | ((payload: { new: Record<string, unknown> }) => void),
  statusHandler: null as null | ((status: string) => void),
  selectResult: {
    data: [] as Record<string, unknown>[],
    error: null as Error | null,
  },
  removeChannel: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => {
    const channel = {
      on: (
        _event: string,
        _filter: unknown,
        handler: (payload: { new: Record<string, unknown> }) => void,
      ) => {
        realtimeMock.changeHandler = handler;
        return channel;
      },
      subscribe: (handler: (status: string) => void) => {
        realtimeMock.statusHandler = handler;
        handler("SUBSCRIBED");
        return channel;
      },
    };

    return {
      channel: () => channel,
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve(realtimeMock.selectResult),
          }),
        }),
      }),
      removeChannel: realtimeMock.removeChannel,
    };
  },
}));

import { ReportStatusTracker } from "./ReportStatusTracker";

const REPORT_ID = "e9c2987f-7c74-4d84-b2d0-044d6bd43db1";

let container: HTMLDivElement;
let root: Root;

describe("ReportStatusTracker", () => {
  beforeEach(() => {
    realtimeMock.changeHandler = null;
    realtimeMock.statusHandler = null;
    realtimeMock.selectResult = { data: [], error: null };
    realtimeMock.removeChannel.mockClear();
  });

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  it("shows a newly inserted public status update without reloading", async () => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root.render(
        createElement(ReportStatusTracker, {
          reportId: REPORT_ID,
          initialStatus: "diterima",
          initialUpdates: [{
            id: "status-initial",
            report_id: REPORT_ID,
            status: "diterima",
            note: null,
            created_at: "2026-11-09T10:00:00.000Z",
          }],
        }),
      );
    });

    expect(container.textContent).toContain(
      "Laporan sudah tercatat dan menunggu verifikasi petugas.",
    );
    expect(container.textContent).toContain("Pembaruan status langsung aktif.");

    await act(async () => {
      realtimeMock.changeHandler?.({
        new: {
          id: "status-processing",
          report_id: REPORT_ID,
          status: "diproses",
          note: "Penanganan telah dimulai.",
          created_at: "2026-11-09T11:00:00.000Z",
        },
      });
    });

    expect(container.textContent).toContain(
      "Penanganan laporan sedang berlangsung.",
    );
    expect(container.textContent).toContain("Penanganan telah dimulai.");
    expect(container.querySelector('[data-status="diproses"]')).not.toBeNull();

    act(() => root.unmount());
    expect(realtimeMock.removeChannel).toHaveBeenCalledOnce();
  });

  it("reports when the live status channel cannot connect", async () => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root.render(
        createElement(ReportStatusTracker, {
          reportId: REPORT_ID,
          initialStatus: "diterima",
          initialUpdates: [],
        }),
      );
    });

    await act(async () => {
      realtimeMock.statusHandler?.("CHANNEL_ERROR");
    });

    expect(container.textContent).toContain(
      "Pembaruan langsung tidak tersedia. Muat ulang halaman untuk memeriksa status terbaru.",
    );
  });
});
