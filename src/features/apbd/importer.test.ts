import { readFile } from "node:fs/promises";
import path from "node:path";

import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { ApbdImportError, importApbdSnapshot } from "./importer";
import { normalizeApbdResult } from "./normalizer";
import type { ApbdValidatedSnapshot } from "./types";
import { validateApbdNormalization } from "./validation";

type RpcArgs = {
  p_report: Record<string, unknown>;
  p_accounts: Array<Record<string, unknown>>;
};

interface FakeReport {
  id: string;
  rows: Map<number, Record<string, unknown>>;
}

function createFakeClient() {
  const reports = new Map<string, FakeReport>();
  let sequence = 0;
  let calls = 0;

  const rpc = async (fn: string, args: RpcArgs) => {
    calls++;
    if (fn !== "import_apbd_snapshot") {
      throw new Error(`Unexpected RPC: ${fn}`);
    }

    const key = [
      args.p_report.budget_year,
      args.p_report.period_month,
      args.p_report.provinsi_code,
      args.p_report.pemda_code,
    ].join("|");

    let report = reports.get(key);
    if (!report) {
      report = { id: `report-${++sequence}`, rows: new Map() };
      reports.set(key, report);
    }

    const incoming = new Set(
      args.p_accounts.map((account) => account.row_index as number),
    );
    let staleDeleted = 0;

    for (const rowIndex of report.rows.keys()) {
      if (!incoming.has(rowIndex)) {
        report.rows.delete(rowIndex);
        staleDeleted++;
      }
    }

    for (const account of args.p_accounts) {
      report.rows.set(account.row_index as number, account);
    }

    return {
      data: {
        report_id: report.id,
        account_count: args.p_accounts.length,
        stale_deleted: staleDeleted,
      },
      error: null,
    };
  };

  return {
    client: { rpc } as unknown as Pick<SupabaseClient, "rpc">,
    reports,
    get calls() {
      return calls;
    },
  };
}

async function loadSnapshot(file: string): Promise<ApbdValidatedSnapshot> {
  const raw = JSON.parse(
    await readFile(path.resolve(process.cwd(), "data/raw/apbd", file), "utf8"),
  );
  const result = validateApbdNormalization(normalizeApbdResult(raw));

  if (!result.data) {
    throw new Error(`Fixture ${file} gagal divalidasi: ${JSON.stringify(result.errors)}`);
  }
  return result.data;
}

describe("importApbdSnapshot", () => {
  it("is idempotent when the same file is imported twice", async () => {
    const fake = createFakeClient();
    const snapshot = await loadSnapshot("apbd_2026_m11_pemda17.json");

    const first = await importApbdSnapshot(fake.client, snapshot);
    const second = await importApbdSnapshot(fake.client, snapshot);

    expect(first).toMatchObject({ accountCount: 29, staleDeleted: 0 });
    expect(second).toMatchObject({
      reportId: first.reportId,
      accountCount: 29,
      staleDeleted: 0,
    });
    expect(fake.reports.size).toBe(1);
    expect(fake.reports.get("2026|11|11|17")?.rows.size).toBe(29);
    expect(fake.calls).toBe(2);
  });

  it("removes stale rows but keeps the same report identity", async () => {
    const fake = createFakeClient();
    const snapshot = await loadSnapshot("apbd_2026_m11_pemda17.json");

    const first = await importApbdSnapshot(fake.client, snapshot);
    const shorter = await importApbdSnapshot(fake.client, {
      ...snapshot,
      accounts: snapshot.accounts.slice(0, 28),
    });

    expect(shorter.reportId).toBe(first.reportId);
    expect(shorter.accountCount).toBe(28);
    expect(shorter.staleDeleted).toBe(1);
    expect(fake.reports.get("2026|11|11|17")?.rows.size).toBe(28);
  });

  it("keeps different periods as separate reports", async () => {
    const fake = createFakeClient();
    const january = await loadSnapshot("apbd_2026_m01_pemda17.json");
    const november = await loadSnapshot("apbd_2026_m11_pemda17.json");

    const januaryResult = await importApbdSnapshot(fake.client, january);
    await importApbdSnapshot(fake.client, november);
    await importApbdSnapshot(fake.client, january);

    expect(fake.reports.size).toBe(2);
    expect(fake.reports.get("2026|1|11|17")?.id).toBe(januaryResult.reportId);
    expect(fake.reports.get("2026|1|11|17")?.rows.size).toBe(29);
    expect(fake.reports.get("2026|11|11|17")?.rows.size).toBe(29);
  });

  it("throws a clear error when Supabase rejects the import", async () => {
    const snapshot = await loadSnapshot("apbd_2026_m11_pemda17.json");
    const client = {
      rpc: async () => ({ data: null, error: { message: "relation does not exist" } }),
    } as unknown as Pick<SupabaseClient, "rpc">;

    await expect(importApbdSnapshot(client, snapshot)).rejects.toThrow(ApbdImportError);
    await expect(importApbdSnapshot(client, snapshot)).rejects.toThrow(
      "relation does not exist",
    );
  });

  it("rejects a malformed RPC response", async () => {
    const snapshot = await loadSnapshot("apbd_2026_m11_pemda17.json");
    const client = {
      rpc: async () => ({ data: {}, error: null }),
    } as unknown as Pick<SupabaseClient, "rpc">;

    await expect(importApbdSnapshot(client, snapshot)).rejects.toThrow(
      "tidak memuat report_id",
    );
  });
});
