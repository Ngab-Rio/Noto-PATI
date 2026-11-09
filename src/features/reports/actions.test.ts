import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { supportReport } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const REPORT_ID = "e9c2987f-7c74-4d84-b2d0-044d6bd43db1";

function createSupabaseMock({
  user = { id: "c65af7d2-3856-459d-b9a0-ef213ad1cb0a" },
  userError = null,
  rpcData = [{ support_count: 7, has_supported: true }],
  rpcError = null,
}: {
  user?: { id: string } | null;
  userError?: { name?: string; message: string } | null;
  rpcData?: { support_count: number; has_supported: boolean }[] | null;
  rpcError?: { code?: string; message: string } | null;
} = {}) {
  const rpc = vi.fn().mockResolvedValue({ data: rpcData, error: rpcError });
  const auth = {
    getUser: vi.fn().mockResolvedValue({ data: { user }, error: userError }),
  };
  vi.mocked(createClient).mockResolvedValue({ auth, rpc } as unknown as Awaited<
    ReturnType<typeof createClient>
  >);
  return { auth, rpc };
}

describe("supportReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid report IDs before checking auth or calling the database", async () => {
    const { auth, rpc } = createSupabaseMock();

    const result = await supportReport({ reportId: "not-a-uuid" });

    expect(result).toMatchObject({ ok: false, reason: "invalid" });
    expect(auth.getUser).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("does not call the support RPC for a guest", async () => {
    const { auth, rpc } = createSupabaseMock({ user: null });

    const result = await supportReport({ reportId: REPORT_ID });

    expect(result).toMatchObject({ ok: false, reason: "unauthenticated" });
    expect(auth.getUser).toHaveBeenCalledOnce();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("treats a missing auth session as a guest rather than an auth failure", async () => {
    const { rpc } = createSupabaseMock({
      user: null,
      userError: { name: "AuthSessionMissingError", message: "Auth session missing!" },
    });

    const result = await supportReport({ reportId: REPORT_ID });

    expect(result).toMatchObject({ ok: false, reason: "unauthenticated" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("surfaces genuine auth lookup errors instead of treating them as guests", async () => {
    const { rpc } = createSupabaseMock({
      user: null,
      userError: { name: "AuthRetryableFetchError", message: "Network unavailable" },
    });

    const result = await supportReport({ reportId: REPORT_ID });

    expect(result).toMatchObject({ ok: false, reason: "error" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns the persisted support count and revalidates affected surfaces", async () => {
    const { rpc } = createSupabaseMock();

    const result = await supportReport({ reportId: REPORT_ID });

    expect(rpc).toHaveBeenCalledWith("support_report", { p_report_id: REPORT_ID });
    expect(result).toEqual({ ok: true, supportCount: 7, hasSupported: true });
    expect(revalidatePath).toHaveBeenCalledWith("/reports");
    expect(revalidatePath).toHaveBeenCalledWith("/reports/list");
    expect(revalidatePath).toHaveBeenCalledWith(`/reports/${REPORT_ID}`);
    expect(revalidatePath).toHaveBeenCalledWith("/my-reports");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/reports");
  });

  it("returns a clear message when the database rejects supporting one's own report", async () => {
    createSupabaseMock({
      rpcData: null,
      rpcError: { message: "OWN_REPORT_NOT_SUPPORTABLE" },
    });

    const result = await supportReport({ reportId: REPORT_ID });

    expect(result).toMatchObject({ ok: false, reason: "not_allowed" });
  });
});
