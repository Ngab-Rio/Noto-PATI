import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { normalizeApbdResult } from "./normalizer";
import type { ApbdNormalizationResult } from "./types";
import { validateApbdNormalization } from "./validation";

const FIXTURE = path.resolve(
  process.cwd(),
  "data/raw/apbd/apbd_2026_m11_pemda17.json",
);

async function loadNormalized(): Promise<ApbdNormalizationResult> {
  const raw = JSON.parse(await readFile(FIXTURE, "utf8"));
  return normalizeApbdResult(raw);
}

describe("validateApbdNormalization", () => {
  it("accepts the real DJPK fixture", async () => {
    const result = validateApbdNormalization(await loadNormalized());

    expect(result.errors).toEqual([]);
    expect(result.data?.accounts).toHaveLength(29);
    expect(result.data?.report.pemdaCode).toBe("17");
  });

  it("rejects an invalid report and blocks all rows", async () => {
    const normalized = await loadNormalized();
    normalized.report = {
      ...normalized.report!,
      budgetYear: 1999,
      httpStatus: 500,
      dataHash: "bukan-hash",
      sourceUrl: "bukan-url",
    };

    const result = validateApbdNormalization(normalized);

    expect(result.data).toBeNull();
    expect(result.errors.map((error) => error.path)).toEqual(
      expect.arrayContaining([
        "metadata.budgetYear",
        "metadata.httpStatus",
        "metadata.dataHash",
        "metadata.sourceUrl",
      ]),
    );
  });

  it("drops invalid rows but keeps valid rows importable", async () => {
    const normalized = await loadNormalized();
    normalized.accounts[0] = { ...normalized.accounts[0], akun: "" };
    normalized.accounts[1] = { ...normalized.accounts[1], anggaran: -1 };
    normalized.accounts[2] = { ...normalized.accounts[2], realisasi: null };

    const result = validateApbdNormalization(normalized);

    expect(result.errors.map((error) => error.path)).toEqual(
      expect.arrayContaining([
        "rows[0].akun",
        "rows[1].anggaran",
        "rows[2].realisasi",
      ]),
    );
    expect(result.data?.accounts).toHaveLength(26);
  });

  it("rejects duplicate row indexes", async () => {
    const normalized = await loadNormalized();
    normalized.accounts[1] = { ...normalized.accounts[1], rowIndex: 0 };

    const result = validateApbdNormalization(normalized);

    expect(result.errors.some((error) => error.path === "rows[1].rowIndex")).toBe(true);
    expect(result.data?.accounts).toHaveLength(28);
  });

  it("rejects a snapshot with no valid accounts", async () => {
    const normalized = await loadNormalized();
    normalized.accounts = [];

    const result = validateApbdNormalization(normalized);

    expect(result.data).toBeNull();
    expect(result.errors.some((error) => error.path === "rows")).toBe(true);
  });

  it("warns when rawRowCount does not match the provided rows", async () => {
    const normalized = await loadNormalized();
    normalized.report = { ...normalized.report!, rawRowCount: 30 };

    const result = validateApbdNormalization(normalized);

    expect(result.warnings.some((warning) => warning.includes("rawRowCount"))).toBe(true);
  });
});
