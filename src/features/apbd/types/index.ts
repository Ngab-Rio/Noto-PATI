export interface ApbdScraperParams {
  tahun: number; // e.g., 2026
  periode: number; // 1 = Januari, ..., 12 = Desember
  provinsi: string; // e.g. "11" (Jawa Tengah)
  pemda: string; // e.g. "17" (Kabupaten Pati)
}

export interface ApbdMetadata {
  sourceUrl: string;
  downloadUrl: string;
  fetchedAt: string;
  httpStatus: number;
  keteranganPortal?: string;
  region: {
    provinsiCode: string;
    provinsiName: string;
    pemdaCode: string;
    pemdaName: string;
  };
  budgetYear: number;
  periodMonth: number;
  periodName: string;
  dataHash: string;
  rawRowCount: number;
}

export interface ApbdRawRow {
  akun: string;
  anggaran: number;
  realisasi: number;
  persentase: number;
}

export interface ApbdExtractionResult {
  metadata: ApbdMetadata;
  rows: ApbdRawRow[];
  summary: {
    totalPendapatanAnggaran?: number;
    totalPendapatanRealisasi?: number;
    totalBelanjaAnggaran?: number;
    totalBelanjaRealisasi?: number;
    totalPembiayaanAnggaran?: number;
    totalPembiayaanRealisasi?: number;
  };
}

/**
 * APBD snapshot after normalization. Values that could not be parsed are null
 * so validation can report them instead of silently importing zero.
 */
export interface ApbdNormalizedReport {
  budgetYear: number | null;
  periodMonth: number | null;
  periodName: string;
  provinsiCode: string;
  provinsiName: string;
  pemdaCode: string;
  pemdaName: string;
  sourceUrl: string;
  downloadUrl: string;
  fetchedAt: string;
  httpStatus: number | null;
  keteranganPortal: string | null;
  dataHash: string;
  rawRowCount: number | null;
  totalPendapatanAnggaran: number | null;
  totalPendapatanRealisasi: number | null;
  totalBelanjaAnggaran: number | null;
  totalBelanjaRealisasi: number | null;
  totalPembiayaanAnggaran: number | null;
  totalPembiayaanRealisasi: number | null;
}

export interface ApbdNormalizedAccount {
  /** Zero-based position in the source file; the only stable identity DJPK provides. */
  rowIndex: number;
  akun: string;
  anggaran: number | null;
  realisasi: number | null;
  persentase: number | null;
  /** True only for the three top-level totals the scraper already treats as totals. */
  isTotalRow: boolean;
  /** Original source row, kept so no scraped attribute is lost. */
  rawRow: Record<string, unknown>;
}

export interface ApbdNormalizationResult {
  report: ApbdNormalizedReport | null;
  accounts: ApbdNormalizedAccount[];
  warnings: string[];
}

export interface ApbdValidatedSnapshot {
  report: ApbdNormalizedReport;
  accounts: ApbdNormalizedAccount[];
}

export interface ApbdValidationIssue {
  path: string;
  message: string;
}

export interface ApbdValidationResult {
  data: ApbdValidatedSnapshot | null;
  errors: ApbdValidationIssue[];
  warnings: string[];
}

