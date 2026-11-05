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

