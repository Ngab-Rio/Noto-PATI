import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  normalizeApbdResult,
  parsePercentage,
  parseRupiah,
} from "./normalizer";

const FIXTURE = path.resolve(
  process.cwd(),
  "data/raw/apbd/apbd_2026_m11_pemda17.json",
);

async function loadFixture(): Promise<unknown> {
  return JSON.parse(await readFile(FIXTURE, "utf8"));
}

describe("parseRupiah", () => {
  it("keeps finite numbers and rejects non-finite values", () => {
    expect(parseRupiah(2719861122000)).toBe(2719861122000);
    expect(parseRupiah(0)).toBe(0);
    expect(parseRupiah(Number.NaN)).toBeNull();
    expect(parseRupiah(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("parses plain and Indonesian formatted amounts", () => {
    expect(parseRupiah("2719861122000")).toBe(2719861122000);
    expect(parseRupiah("Rp 2.719.861.122.000")).toBe(2719861122000);
    expect(parseRupiah("1.234.567,89")).toBe(1234567.89);
    expect(parseRupiah("9,14")).toBe(9.14);
    expect(parseRupiah("1.234")).toBe(1234);
  });

  it("handles empty, null, and invalid values as null", () => {
    expect(parseRupiah("")).toBeNull();
    expect(parseRupiah("   ")).toBeNull();
    expect(parseRupiah("-")).toBeNull();
    expect(parseRupiah(null)).toBeNull();
    expect(parseRupiah(undefined)).toBeNull();
    expect(parseRupiah("bukan angka")).toBeNull();
  });
});

describe("parsePercentage", () => {
  it("parses percentages with dot, comma, or percent sign", () => {
    expect(parsePercentage(9.14)).toBe(9.14);
    expect(parsePercentage("9,14")).toBe(9.14);
    expect(parsePercentage("542,46%")).toBe(542.46);
  });

  it("returns null for empty or invalid values", () => {
    expect(parsePercentage("")).toBeNull();
    expect(parsePercentage(null)).toBeNull();
    expect(parsePercentage("n/a")).toBeNull();
  });
});

describe("normalizeApbdResult", () => {
  it("normalizes the real DJPK fixture without dropping rows", async () => {
    const result = normalizeApbdResult(await loadFixture());

    expect(result.report).not.toBeNull();
    expect(result.report?.budgetYear).toBe(2026);
    expect(result.report?.periodMonth).toBe(11);
    expect(result.report?.periodName).toBe("November");
    expect(result.report?.pemdaCode).toBe("17");
    expect(result.report?.totalPendapatanAnggaran).toBe(2719861122000);
    expect(result.accounts).toHaveLength(29);
    expect(result.accounts[0].rawRow).toMatchObject({
      akun: "Pendapatan Daerah",
      anggaran: 2719861122000,
    });
  });

  it("preserves duplicate account names as distinct source rows", async () => {
    const result = normalizeApbdResult(await loadFixture());
    const duplicates = result.accounts.filter((row) => row.akun === "Belanja Pegawai");

    expect(duplicates).toHaveLength(2);
    expect(duplicates.map((row) => row.rowIndex)).toEqual([11, 12]);
    expect(result.warnings.some((warning) => warning.includes("Belanja Pegawai"))).toBe(true);
  });

  it("marks only the three top-level total rows", async () => {
    const result = normalizeApbdResult(await loadFixture());
    const totals = result.accounts.filter((row) => row.isTotalRow);

    expect(totals.map((row) => row.akun)).toEqual([
      "Pendapatan Daerah",
      "Belanja Daerah",
      "Pembiayaan Daerah",
    ]);
  });

  it("converts blank/null/invalid values to null instead of zero", () => {
    const result = normalizeApbdResult({
      metadata: {
        sourceUrl: "https://example.test/apbd",
        downloadUrl: "https://example.test/csv",
        fetchedAt: "2026-11-05T15:50:07.700Z",
        httpStatus: 200,
        region: { provinsiCode: "11", pemdaCode: "17" },
        budgetYear: "2026",
        periodMonth: 11,
        dataHash: "a".repeat(64),
        rawRowCount: 2,
      },
      rows: [
        { akun: "Pendapatan Daerah", anggaran: "", realisasi: null, persentase: "-" },
        { akun: "PAD", anggaran: "Rp 1.000", realisasi: "500", persentase: "50,5" },
      ],
    });

    expect(result.report?.budgetYear).toBe(2026);
    expect(result.accounts[0]).toMatchObject({
      anggaran: null,
      realisasi: null,
      persentase: null,
    });
    expect(result.accounts[1]).toMatchObject({
      anggaran: 1000,
      realisasi: 500,
      persentase: 50.5,
    });
  });

  it("returns a null report when metadata is missing", () => {
    const result = normalizeApbdResult({ rows: [] });

    expect(result.report).toBeNull();
    expect(result.accounts).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
