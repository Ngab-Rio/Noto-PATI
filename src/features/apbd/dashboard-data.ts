import "server-only";

import { createClient } from "@/lib/supabase/server";

import {
  aggregateBelanjaAllocation,
  calculateApbdSummary,
  selectApbdReport,
  type ApbdAccountRow,
  type ApbdAllocationItem,
  type ApbdReportSnapshot,
  type ApbdSummary,
} from "./dashboard";

const REGION_PROVINSI_CODE = "11"; // Jawa Tengah
const REGION_PEMDA_CODE = "17"; // Kabupaten Pati

const REPORT_COLUMNS = [
  "id",
  "budget_year",
  "period_month",
  "period_name",
  "provinsi_name",
  "pemda_name",
  "source_url",
  "download_url",
  "fetched_at",
  "keterangan_portal",
  "total_belanja_anggaran",
  "total_belanja_realisasi",
].join(", ");

const ACCOUNT_COLUMNS = [
  "row_index",
  "akun",
  "anggaran",
  "realisasi",
  "persentase",
  "is_total_row",
].join(", ");

export interface ApbdDashboardQuery {
  year?: string;
  period?: string;
}

export interface ApbdDashboardData {
  selected: ApbdReportSnapshot;
  reports: ApbdReportSnapshot[];
  summary: ApbdSummary;
  allocation: ApbdAllocationItem[];
}

export async function getApbdDashboard(
  query: ApbdDashboardQuery = {},
): Promise<ApbdDashboardData | null> {
  const supabase = await createClient();

  const { data: reportData, error: reportError } = await supabase
    .from("apbd_reports")
    .select(REPORT_COLUMNS)
    .eq("provinsi_code", REGION_PROVINSI_CODE)
    .eq("pemda_code", REGION_PEMDA_CODE)
    .order("budget_year", { ascending: false })
    .order("period_month", { ascending: false });

  if (reportError) {
    throw new Error(`Gagal memuat ringkasan APBD: ${reportError.message}`);
  }

  const reports = (reportData ?? []) as unknown as ApbdReportSnapshot[];
  const selected = selectApbdReport(reports, query.year, query.period);
  if (!selected) return null;

  const { data: accountData, error: accountError } = await supabase
    .from("apbd_accounts")
    .select(ACCOUNT_COLUMNS)
    .eq("report_id", selected.id)
    .order("row_index", { ascending: true });

  if (accountError) {
    throw new Error(`Gagal memuat rincian APBD: ${accountError.message}`);
  }

  const accounts = (accountData ?? []) as unknown as ApbdAccountRow[];

  return {
    selected,
    reports,
    summary: calculateApbdSummary(selected),
    allocation: aggregateBelanjaAllocation(accounts),
  };
}
