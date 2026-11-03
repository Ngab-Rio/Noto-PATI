import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizeReportStatus } from "@/config/theme";
import { buildSearchOrFilter } from "@/lib/reports/search";
import { getSignedPhotoUrls } from "@/lib/reports/signed-urls";
import type { ReportItemData } from "@/components/shared/report-card";

export const CATEGORY_LABELS: Record<string, string> = {
  jalan: "Jalan Berlubang / Rusak",
  lampu: "Penerangan Jalan Umum (PJU)",
  drainase: "Saluran Air / Drainase",
  jembatan: "Jembatan Rusak / Retak",
  tanggul: "Tanggul Sungai / Penahan Banjir",
  trotoar: "Trotoar / Pedestrian Rusak",
  rambu: "Rambu / Marka Jalan",
  lainnya: "Fasilitas Publik Lainnya",
};

export const PUBLIC_STATUSES = ["diterima", "diverifikasi", "diproses", "selesai", "ditolak"] as const;

const PUBLIC_REPORT_COLUMNS =
  "id, ticket_number, category, title, description, detail_location, status, created_at";

export type PublicReport = {
  id: string;
  ticket_number: string;
  category: string;
  title: string;
  description: string;
  detail_location: string;
  status: string;
  created_at: string;
  image_url?: string;
};

export type PublicReportQuery = {
  category?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export async function getPublicReports(
  query: PublicReportQuery = {},
): Promise<{ reports: PublicReport[]; total: number }> {
  const supabase = await createClient();

  let request = supabase
    .from("reports")
    .select(PUBLIC_REPORT_COLUMNS, { count: "exact" })
    .is("merged_into_report_id", null)
    .neq("status", "digabung")
    .order("created_at", { ascending: false });

  if (query.category) {
    request = request.eq("category", query.category);
  }

  if (query.status && PUBLIC_STATUSES.includes(query.status as (typeof PUBLIC_STATUSES)[number])) {
    request = request.eq("status", query.status);
  }

  const searchFilter = query.search ? buildSearchOrFilter(query.search) : null;
  if (searchFilter) {
    request = request.or(searchFilter);
  }

  if (query.limit) {
    const offset = query.offset ?? 0;
    request = request.range(offset, offset + query.limit - 1);
  }

  const { data, error, count } = await request;

  if (error) {
    console.error("Failed to fetch public reports", error);
    return { reports: [], total: 0 };
  }

  const reports = (data ?? []) as PublicReport[];
  const imageUrlByReport = await getFirstPhotoUrls(reports.map((report) => report.id));

  return {
    reports: reports.map((report) => ({
      ...report,
      image_url: imageUrlByReport.get(report.id),
    })),
    total: count ?? reports.length,
  };
}

// Foto pertama selalu sort_order = 0 (unique per report, maksimal 3 foto).
async function getFirstPhotoUrls(reportIds: string[]): Promise<Map<string, string>> {
  const urlByReport = new Map<string, string>();
  if (reportIds.length === 0) return urlByReport;

  const { data: photos } = await createAdminClient()
    .from("report_photos")
    .select("report_id, storage_path")
    .in("report_id", reportIds)
    .eq("sort_order", 0);

  const pathByReport = new Map<string, string>();
  for (const photo of photos ?? []) {
    pathByReport.set(photo.report_id, photo.storage_path);
  }

  const signedUrls = await getSignedPhotoUrls([...pathByReport.values()]);

  for (const [reportId, path] of pathByReport) {
    const url = signedUrls.get(path);
    if (url) urlByReport.set(reportId, url);
  }

  return urlByReport;
}

export type PublicReportStats = {
  total: number;
  diproses: number;
  selesai: number;
  lokasi: number;
};

export async function getPublicReportStats(): Promise<PublicReportStats> {
  const supabase = await createClient();
  // shortcut: hitung dari kolom ringan (bukan join); ganti ke RPC count(distinct)
  // bila jumlah laporan sudah puluhan ribu.
  // Kecualikan laporan yang digabung agar tidak dihitung sebagai laporan aktif independen.
  const { data, error } = await supabase
    .from("reports")
    .select("status, detail_location")
    .is("merged_into_report_id", null)
    .neq("status", "digabung");

  if (error) {
    console.error("Failed to fetch public report stats", error);
    return { total: 0, diproses: 0, selesai: 0, lokasi: 0 };
  }

  const rows = data ?? [];

  return {
    total: rows.length,
    diproses: rows.filter((row) => row.status === "diproses").length,
    selesai: rows.filter((row) => row.status === "selesai").length,
    lokasi: new Set(rows.map((row) => row.detail_location)).size,
  };
}

export function toReportItem(report: PublicReport): ReportItemData {
  return {
    id: report.id,
    ticketNumber: report.ticket_number,
    title: report.title,
    description: report.description,
    category: CATEGORY_LABELS[report.category] ?? report.category,
    status: normalizeReportStatus(report.status),
    location: report.detail_location,
    date: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(report.created_at)),
    supportCount: 0,
    imageUrl: report.image_url,
  };
}
