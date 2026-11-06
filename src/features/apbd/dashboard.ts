/**
 * Pure APBD dashboard calculations.
 *
 * DJPK exports accounts as a flat list with no codes or level metadata, so
 * hierarchy must be inferred carefully. The official totals live on
 * `apbd_reports`; account rows are only used for distribution.
 */

export interface ApbdReportSnapshot {
  id: string;
  budget_year: number;
  period_month: number;
  period_name: string;
  provinsi_name: string;
  pemda_name: string;
  source_url: string;
  download_url: string;
  fetched_at: string;
  keterangan_portal: string | null;
  total_belanja_anggaran: number | null;
  total_belanja_realisasi: number | null;
}

export interface ApbdAccountRow {
  row_index: number;
  akun: string;
  anggaran: number | null;
  realisasi: number | null;
  persentase: number | null;
  is_total_row: boolean;
}

export interface ApbdSummary {
  pagu: number | null;
  realisasi: number | null;
  sisa: number | null;
  persentase: number | null;
  /** Nilai persentase yang sudah dibatasi 0–100 untuk lebar progress bar. */
  progressPercent: number | null;
}

export interface ApbdAllocationItem {
  label: string;
  pagu: number;
  realisasi: number;
  persentase: number | null;
}

/**
 * Direct children of `Belanja Daerah` in the DJPK export. Sub-accounts under
 * `Belanja Lainnya` are intentionally excluded to avoid double counting.
 *
 * shortcut: group names are curated from the current DJPK export format;
 * upgrade to a source-provided hierarchy/code when DJPK exposes one.
 */
export const BELANJA_GROUPS = [
  "Belanja Pegawai",
  "Belanja Barang dan Jasa",
  "Belanja Modal",
  "Belanja Lainnya",
] as const;

function toNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

export function clampPercentage(value: number | null): number {
  if (value === null || !Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function calculateShare(
  value: number | null,
  total: number | null,
): number | null {
  if (
    value === null ||
    total === null ||
    total <= 0 ||
    !Number.isFinite(value) ||
    !Number.isFinite(total)
  ) {
    return null;
  }

  return (value / total) * 100;
}

export function calculateApbdSummary(report: {
  total_belanja_anggaran: number | null;
  total_belanja_realisasi: number | null;
}): ApbdSummary {
  const pagu = toNumber(report.total_belanja_anggaran);
  const realisasi = toNumber(report.total_belanja_realisasi);

  if (pagu === null || realisasi === null) {
    return {
      pagu,
      realisasi,
      sisa: null,
      persentase: null,
      progressPercent: null,
    };
  }

  const persentase = pagu > 0 ? (realisasi / pagu) * 100 : null;

  return {
    pagu,
    realisasi,
    sisa: pagu - realisasi,
    persentase,
    progressPercent: persentase === null ? null : clampPercentage(persentase),
  };
}

/**
 * Picks a snapshot from an already sorted list (latest first). Invalid or
 * missing query values fall back to the latest available snapshot.
 */
export function selectApbdReport(
  reports: ApbdReportSnapshot[],
  year?: string,
  period?: string,
): ApbdReportSnapshot | null {
  if (reports.length === 0) return null;

  const selectedYear = Number(year);
  const selectedPeriod = Number(period);

  if (Number.isInteger(selectedYear) && Number.isInteger(selectedPeriod)) {
    return (
      reports.find(
        (report) =>
          report.budget_year === selectedYear &&
          report.period_month === selectedPeriod,
      ) ?? reports[0]
    );
  }

  return reports[0];
}

/**
 * Aggregates only direct Belanja Daerah groups. Total rows and exact duplicate
 * rows from the source export are removed first, then descendant accounts under
 * `Belanja Lainnya` are ignored because their parent row already includes them.
 */
export function aggregateBelanjaAllocation(
  accounts: ApbdAccountRow[],
): ApbdAllocationItem[] {
  const unique = new Map<string, ApbdAccountRow>();

  for (const account of accounts) {
    if (account.is_total_row) continue;

    const pagu = toNumber(account.anggaran);
    const realisasi = toNumber(account.realisasi);
    if (!account.akun.trim() || pagu === null || realisasi === null) continue;

    const key = `${normalizeName(account.akun)}|${pagu}|${realisasi}`;
    if (!unique.has(key)) unique.set(key, account);
  }

  const byName = new Map<string, ApbdAccountRow>();
  for (const account of unique.values()) {
    const key = normalizeName(account.akun);
    if (!byName.has(key)) byName.set(key, account);
  }

  return BELANJA_GROUPS.flatMap((label) => {
    const account = byName.get(normalizeName(label));
    if (!account) return [];

    const pagu = toNumber(account.anggaran);
    const realisasi = toNumber(account.realisasi);
    if (pagu === null || realisasi === null) return [];

    return [
      {
        label,
        pagu,
        realisasi,
        persentase: pagu > 0 ? (realisasi / pagu) * 100 : null,
      },
    ];
  }).sort((a, b) => b.pagu - a.pagu);
}

export function formatRupiah(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Belum tersedia";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRupiahCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Belum tersedia";
  }

  const absolute = Math.abs(value);
  if (absolute >= 1_000_000_000_000) {
    return `Rp ${new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 1_000_000_000_000)} T`;
  }
  if (absolute >= 1_000_000_000) {
    return `Rp ${new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 1_000_000_000)} M`;
  }
  if (absolute >= 1_000_000) {
    return `Rp ${new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 1_000_000)} jt`;
  }

  return formatRupiah(value);
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Belum tersedia";
  }

  return `${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value)}%`;
}
