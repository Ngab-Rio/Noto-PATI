import type { SupabaseClient } from "@supabase/supabase-js";

import type { ApbdValidatedSnapshot } from "./types";

export class ApbdImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApbdImportError";
  }
}

export interface ApbdImportSummary {
  reportId: string;
  accountCount: number;
  staleDeleted: number;
}

type RpcClient = Pick<SupabaseClient, "rpc">;

function asRpcSummary(data: unknown): ApbdImportSummary {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new ApbdImportError("Respons RPC import_apbd_snapshot tidak valid.");
  }

  const record = data as Record<string, unknown>;
  const reportId = record.report_id;
  const accountCount = record.account_count;
  const staleDeleted = record.stale_deleted;

  if (
    typeof reportId !== "string" ||
    typeof accountCount !== "number" ||
    typeof staleDeleted !== "number"
  ) {
    throw new ApbdImportError(
      "Respons RPC import_apbd_snapshot tidak memuat report_id/account_count/stale_deleted.",
    );
  }

  return { reportId, accountCount, staleDeleted };
}

/**
 * Imports one year/period snapshot atomically through a database function.
 * The report is keyed by year + period + region, and each account by its source
 * row index, so importing the same file twice updates instead of duplicating.
 */
export async function importApbdSnapshot(
  client: RpcClient,
  snapshot: ApbdValidatedSnapshot,
): Promise<ApbdImportSummary> {
  const { report, accounts } = snapshot;

  const { data, error } = await client.rpc("import_apbd_snapshot", {
    p_report: {
      budget_year: report.budgetYear,
      period_month: report.periodMonth,
      period_name: report.periodName,
      provinsi_code: report.provinsiCode,
      provinsi_name: report.provinsiName,
      pemda_code: report.pemdaCode,
      pemda_name: report.pemdaName,
      source_url: report.sourceUrl,
      download_url: report.downloadUrl,
      fetched_at: report.fetchedAt,
      http_status: report.httpStatus,
      keterangan_portal: report.keteranganPortal,
      data_hash: report.dataHash,
      raw_row_count: report.rawRowCount,
      total_pendapatan_anggaran: report.totalPendapatanAnggaran,
      total_pendapatan_realisasi: report.totalPendapatanRealisasi,
      total_belanja_anggaran: report.totalBelanjaAnggaran,
      total_belanja_realisasi: report.totalBelanjaRealisasi,
      total_pembiayaan_anggaran: report.totalPembiayaanAnggaran,
      total_pembiayaan_realisasi: report.totalPembiayaanRealisasi,
    },
    p_accounts: accounts.map((account) => ({
      row_index: account.rowIndex,
      akun: account.akun,
      anggaran: account.anggaran,
      realisasi: account.realisasi,
      persentase: account.persentase,
      is_total_row: account.isTotalRow,
      raw_row: account.rawRow,
    })),
  });

  if (error) {
    throw new ApbdImportError(
      `Gagal mengimpor APBD ${report.budgetYear}-${report.periodMonth} ` +
        `${report.pemdaName}: ${error.message}`,
    );
  }

  return asRpcSummary(data);
}
