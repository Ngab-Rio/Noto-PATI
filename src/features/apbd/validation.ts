import { z } from "zod";

import type {
  ApbdNormalizationResult,
  ApbdNormalizedAccount,
  ApbdNormalizedReport,
  ApbdValidatedSnapshot,
  ApbdValidationIssue,
  ApbdValidationResult,
} from "./types";

const finiteNumber = z.number().refine(Number.isFinite, "Nilai harus berupa angka finite");

const reportSchema = z.object({
  budgetYear: z.number().int().min(2000).max(2100),
  periodMonth: z.number().int().min(1).max(12),
  periodName: z.string().min(1),
  provinsiCode: z.string().min(1),
  provinsiName: z.string().min(1),
  pemdaCode: z.string().min(1),
  pemdaName: z.string().min(1),
  sourceUrl: z.string().url(),
  downloadUrl: z.string().url(),
  fetchedAt: z
    .string()
    .min(1)
    .refine((value) => !Number.isNaN(Date.parse(value)), "fetchedAt harus berupa tanggal ISO yang valid"),
  httpStatus: z.number().int().min(200).max(299),
  keteranganPortal: z.string().nullable(),
  dataHash: z.string().regex(/^[a-f0-9]{64}$/i, "dataHash harus berupa SHA-256 hex (64 karakter)"),
  rawRowCount: z.number().int().min(0),
  totalPendapatanAnggaran: finiteNumber.nullable(),
  totalPendapatanRealisasi: finiteNumber.nullable(),
  totalBelanjaAnggaran: finiteNumber.nullable(),
  totalBelanjaRealisasi: finiteNumber.nullable(),
  totalPembiayaanAnggaran: finiteNumber.nullable(),
  totalPembiayaanRealisasi: finiteNumber.nullable(),
});

const accountSchema = z.object({
  rowIndex: z.number().int().min(0),
  akun: z.string().min(1, "Nama akun wajib diisi"),
  anggaran: finiteNumber.min(0, "Anggaran tidak boleh negatif"),
  realisasi: finiteNumber.min(0, "Realisasi tidak boleh negatif"),
  persentase: finiteNumber,
  isTotalRow: z.boolean(),
  rawRow: z.record(z.string(), z.unknown()),
});

function issuePath(scope: string, path: PropertyKey[]): string {
  return path.length > 0 ? `${scope}.${path.map(String).join(".")}` : scope;
}

function toIssues(scope: string, issues: z.ZodIssue[]): ApbdValidationIssue[] {
  return issues.map((issue) => ({
    path: issuePath(scope, issue.path),
    message: issue.message,
  }));
}

/**
 * Validates the normalized snapshot. Invalid rows are excluded while valid rows
 * are returned for import; report-level errors block the whole snapshot.
 */
export function validateApbdNormalization(
  input: ApbdNormalizationResult,
): ApbdValidationResult {
  const errors: ApbdValidationIssue[] = [];
  const warnings = [...input.warnings];

  if (!input.report) {
    errors.push({
      path: "metadata",
      message: "Metadata sumber tidak ditemukan atau bukan objek.",
    });
    return { data: null, errors, warnings };
  }

  const parsedReport = reportSchema.safeParse(input.report);
  if (!parsedReport.success) {
    errors.push(...toIssues("metadata", parsedReport.error.issues));
  }

  const accounts: ApbdNormalizedAccount[] = [];
  const seenRowIndexes = new Set<number>();

  input.accounts.forEach((account, index) => {
    const parsed = accountSchema.safeParse(account);
    if (!parsed.success) {
      errors.push(...toIssues(`rows[${index}]`, parsed.error.issues));
      return;
    }

    if (seenRowIndexes.has(account.rowIndex)) {
      errors.push({
        path: `rows[${index}].rowIndex`,
        message: `rowIndex ${account.rowIndex} duplikat; baris dilewati.`,
      });
      return;
    }

    seenRowIndexes.add(account.rowIndex);
    accounts.push(parsed.data);
  });

  if (accounts.length === 0) {
    errors.push({
      path: "rows",
      message: "Tidak ada baris akun valid untuk diimpor.",
    });
  }

  if (
    parsedReport.success &&
    parsedReport.data.rawRowCount !== input.accounts.length
  ) {
    warnings.push(
      `rawRowCount (${parsedReport.data.rawRowCount}) berbeda dengan jumlah baris ` +
        `yang diberikan (${input.accounts.length}).`,
    );
  }

  if (!parsedReport.success) {
    return { data: null, errors, warnings };
  }

  const data: ApbdValidatedSnapshot = {
    report: parsedReport.data as ApbdNormalizedReport,
    accounts,
  };

  return { data: accounts.length > 0 ? data : null, errors, warnings };
}
