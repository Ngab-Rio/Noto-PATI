import type {
  ApbdNormalizationResult,
  ApbdNormalizedAccount,
  ApbdNormalizedReport,
} from "./types";

const TOTAL_ROW_NAMES = new Set([
  "pendapatan daerah",
  "belanja daerah",
  "pembiayaan daerah",
]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function parseInteger(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && Number.isInteger(value) ? value : null;
  }
  if (typeof value !== "string") return null;

  const text = value.trim();
  if (!/^-?\d+$/.test(text)) return null;

  const parsed = Number(text);
  return Number.isInteger(parsed) ? parsed : null;
}

/**
 * Parses DJPK money values: numbers, plain numeric strings, and Indonesian
 * formats such as "Rp 2.719.861.122.000" or "1.234.567,89".
 * Empty/invalid values return null so validation can reject them explicitly.
 */
export function parseRupiah(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string") return null;

  let text = value.trim();
  if (!text) return null;

  const negative = text.startsWith("-") || (text.startsWith("(") && text.endsWith(")"));
  text = text
    .replace(/[()]/g, "")
    .replace(/rp\.?/gi, "")
    .replace(/[\s\u00a0]/g, "")
    .replace(/^-/, "");

  if (!text) return null;

  if (text.includes(",")) {
    text = text.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(text)) {
    text = text.replace(/\./g, "");
  }

  const parsed = Number(text);
  if (!Number.isFinite(parsed)) return null;

  return negative ? -parsed : parsed;
}

/**
 * Parses percentages such as 9.14, "9,14", or "9,14%".
 */
export function parsePercentage(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string") return null;

  const text = value
    .trim()
    .replace(/%/g, "")
    .replace(/[\s\u00a0]/g, "")
    .replace(",", ".");

  if (!text) return null;

  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeAccount(row: unknown, rowIndex: number): ApbdNormalizedAccount {
  const record = asRecord(row) ?? {};
  const akun = asText(record.akun);

  return {
    rowIndex,
    akun,
    anggaran: parseRupiah(record.anggaran),
    realisasi: parseRupiah(record.realisasi),
    persentase: parsePercentage(record.persentase),
    isTotalRow: TOTAL_ROW_NAMES.has(akun.toLowerCase()),
    rawRow: { ...record },
  };
}

function normalizeReport(
  metadata: Record<string, unknown>,
  summaryInput: unknown,
): ApbdNormalizedReport {
  const region = asRecord(metadata.region) ?? {};
  const summary = asRecord(summaryInput) ?? {};

  return {
    budgetYear: parseInteger(metadata.budgetYear),
    periodMonth: parseInteger(metadata.periodMonth),
    periodName: asText(metadata.periodName),
    provinsiCode: asText(region.provinsiCode),
    provinsiName: asText(region.provinsiName),
    pemdaCode: asText(region.pemdaCode),
    pemdaName: asText(region.pemdaName),
    sourceUrl: asText(metadata.sourceUrl),
    downloadUrl: asText(metadata.downloadUrl),
    fetchedAt: asText(metadata.fetchedAt),
    httpStatus: parseInteger(metadata.httpStatus),
    keteranganPortal: asText(metadata.keteranganPortal) || null,
    dataHash: asText(metadata.dataHash),
    rawRowCount: parseInteger(metadata.rawRowCount),
    totalPendapatanAnggaran: parseRupiah(summary.totalPendapatanAnggaran),
    totalPendapatanRealisasi: parseRupiah(summary.totalPendapatanRealisasi),
    totalBelanjaAnggaran: parseRupiah(summary.totalBelanjaAnggaran),
    totalBelanjaRealisasi: parseRupiah(summary.totalBelanjaRealisasi),
    totalPembiayaanAnggaran: parseRupiah(summary.totalPembiayaanAnggaran),
    totalPembiayaanRealisasi: parseRupiah(summary.totalPembiayaanRealisasi),
  };
}

/**
 * Converts a scraped DJPK result into a uniform shape. It is intentionally
 * tolerant: unparseable values become null and are rejected by validation.
 */
export function normalizeApbdResult(input: unknown): ApbdNormalizationResult {
  const root = asRecord(input);
  const metadata = root ? asRecord(root.metadata) : null;

  if (!root || !metadata) {
    return {
      report: null,
      accounts: [],
      warnings: ["Struktur data tidak valid: objek metadata tidak ditemukan."],
    };
  }

  const rawRows = Array.isArray(root.rows) ? root.rows : [];
  const accounts = rawRows.map((row, index) => normalizeAccount(row, index));

  const accountsByName = new Map<string, number[]>();
  for (const account of accounts) {
    if (!account.akun) continue;
    const indexes = accountsByName.get(account.akun) ?? [];
    indexes.push(account.rowIndex);
    accountsByName.set(account.akun, indexes);
  }

  const warnings = [...accountsByName.entries()]
    .filter(([, indexes]) => indexes.length > 1)
    .map(
      ([akun, indexes]) =>
        `Akun "${akun}" muncul ${indexes.length} kali pada indeks baris ${indexes.join(", ")}; ` +
        "semua baris dipertahankan karena DJPK tidak menyediakan kode akun pembeda.",
    );

  return { report: normalizeReport(metadata, root.summary), accounts, warnings };
}
