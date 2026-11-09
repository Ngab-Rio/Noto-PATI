import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const SUPPORT_SUMMARY_BATCH_SIZE = 500;

export type ReportSupportSummary = {
  supportCount: number;
  hasSupported: boolean;
  isOwner: boolean;
  canSupport: boolean;
};

type SupportSummaryRow = {
  report_id: string;
  support_count: number;
  has_supported: boolean;
  is_owner: boolean;
  can_support: boolean;
};

export async function getReportSupportSummaries(
  reportIds: string[],
  useAdminClient = false,
): Promise<Map<string, ReportSupportSummary>> {
  const summaries = new Map<string, ReportSupportSummary>();
  if (reportIds.length === 0) return summaries;

  const client = useAdminClient ? createAdminClient() : await createClient();
  const batches: string[][] = [];
  for (let offset = 0; offset < reportIds.length; offset += SUPPORT_SUMMARY_BATCH_SIZE) {
    batches.push(reportIds.slice(offset, offset + SUPPORT_SUMMARY_BATCH_SIZE));
  }

  const results = await Promise.all(
    batches.map((p_report_ids) =>
      client.rpc("get_report_support_summaries", { p_report_ids }),
    ),
  );

  for (const { data, error } of results) {
    if (error) {
      console.error("Failed to fetch report support summaries", error);
      throw new Error(`Gagal memuat dukungan laporan: ${error.message}`);
    }

    for (const row of (data ?? []) as SupportSummaryRow[]) {
      summaries.set(row.report_id, {
        supportCount: row.support_count,
        hasSupported: row.has_supported,
        isOwner: row.is_owner,
        canSupport: row.can_support,
      });
    }
  }

  return summaries;
}
