import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isMissingAuthSessionError } from "@/lib/auth/session";
import { normalizeReportStatus } from "@/config/theme";
import { buildSearchOrFilter, normalizeSearchTerm } from "@/lib/reports/search";
import { getSignedPhotoUrls } from "@/lib/reports/signed-urls";
import { getReportSupportSummaries } from "@/lib/reports/support";
import { getReportReviewRatings } from "@/lib/reports/reviews";
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
export const ACTIVE_PUBLIC_STATUSES = ["diterima", "diverifikasi", "diproses"] as const;

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
  supportCount: number;
  hasSupported: boolean;
  isOwner: boolean;
  canSupport: boolean;
  isAuthenticated: boolean;
  rating?: {
    reviewCount: number;
    averageRating: number;
  };
  groupSupportCount?: number;
  mergedReportCount?: number;
  image_url?: string;
};

export type PublicReportQuery = {
  category?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: "recent" | "attention";
};

type EngagementRanking = {
  report_id: string;
  group_support_count: number;
  merged_report_count: number;
  engagement_score: number;
};

type PublicReportRow = Pick<
  PublicReport,
  | "id"
  | "ticket_number"
  | "category"
  | "title"
  | "description"
  | "detail_location"
  | "status"
  | "created_at"
>;

export async function getPublicReports(
  query: PublicReportQuery = {},
): Promise<{ reports: PublicReport[]; total: number }> {
  if (query.sort === "attention") {
    return getPublicEngagementReports(query);
  }

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

  const reportRows = (data ?? []) as Omit<
    PublicReport,
    | "supportCount"
    | "hasSupported"
    | "isOwner"
    | "canSupport"
    | "isAuthenticated"
    | "groupSupportCount"
    | "mergedReportCount"
  >[];
  const [
    imageUrlByReport,
    supportSummaries,
    reviewRatings,
    { data: authData, error: authError },
  ] =
    await Promise.all([
      getFirstPhotoUrls(reportRows.map((report) => report.id)),
      getReportSupportSummaries(reportRows.map((report) => report.id)),
      getReportReviewRatings(reportRows.map((report) => report.id)),
      supabase.auth.getUser(),
    ]);

  if (authError && !isMissingAuthSessionError(authError)) {
    console.error("Failed to verify viewer for public reports", authError);
    throw new Error(`Gagal memeriksa sesi pengguna: ${authError.message}`);
  }

  return {
    reports: reportRows.map((report) => {
      const support = supportSummaries.get(report.id);
      if (!support) {
        throw new Error(`Ringkasan dukungan laporan ${report.id} tidak ditemukan.`);
      }

      return {
        ...report,
        ...support,
        rating: reviewRatings.get(report.id),
        isAuthenticated: Boolean(authData.user),
        image_url: imageUrlByReport.get(report.id),
      };
    }),
    total: count ?? reportRows.length,
  };
}

async function getPublicEngagementReports(
  query: PublicReportQuery,
): Promise<{ reports: PublicReport[]; total: number }> {
  if (
    query.status
    && !ACTIVE_PUBLIC_STATUSES.includes(query.status as (typeof ACTIVE_PUBLIC_STATUSES)[number])
  ) {
    return { reports: [], total: 0 };
  }

  const supabase = await createClient();
  const searchTerm = query.search ? normalizeSearchTerm(query.search) : null;
  const limit = query.limit ?? 6;
  const offset = query.offset ?? 0;
  const [rankingResult, countResult] = await Promise.all([
    supabase.rpc("get_public_report_engagement_rankings", {
      p_category: query.category || null,
      p_status: query.status || null,
      p_search: searchTerm,
      p_limit: limit,
      p_offset: offset,
    }),
    getActiveReportCount(supabase, query, searchTerm),
  ]);

  if (rankingResult.error) {
    console.error("Failed to fetch public report engagement ranking", rankingResult.error);
    throw new Error(
      `Gagal memuat urutan perhatian warga: ${rankingResult.error.message}`,
    );
  }

  if (countResult.error) {
    console.error("Failed to count active public reports", countResult.error);
    throw new Error(`Gagal menghitung laporan aktif: ${countResult.error.message}`);
  }

  const rankings = (rankingResult.data ?? []) as EngagementRanking[];
  const reportIds = rankings.map((ranking) => ranking.report_id);
  const reportsResult = reportIds.length > 0
    ? await supabase
      .from("reports")
      .select(PUBLIC_REPORT_COLUMNS)
      .in("id", reportIds)
    : { data: [], error: null };

  if (reportsResult.error) {
    console.error("Failed to fetch ranked public reports", reportsResult.error);
    throw new Error(`Gagal memuat laporan terurut: ${reportsResult.error.message}`);
  }

  const rankedReportRows = (reportsResult.data ?? []) as PublicReportRow[];
  const reportById = new Map(rankedReportRows.map((report) => [report.id, report]));
  const orderedReports = rankings.map((ranking) => {
    const report = reportById.get(ranking.report_id);
    if (!report) {
      throw new Error(`Laporan ${ranking.report_id} dari ranking tidak ditemukan.`);
    }

    return {
      ...report,
      groupSupportCount: Number(ranking.group_support_count),
      mergedReportCount: Number(ranking.merged_report_count),
    };
  });

  const [
    imageUrlByReport,
    supportSummaries,
    reviewRatings,
    { data: authData, error: authError },
  ] =
    await Promise.all([
      getFirstPhotoUrls(reportIds),
      getReportSupportSummaries(reportIds),
      getReportReviewRatings(reportIds),
      supabase.auth.getUser(),
    ]);

  if (authError && !isMissingAuthSessionError(authError)) {
    console.error("Failed to verify viewer for public report ranking", authError);
    throw new Error(`Gagal memeriksa sesi pengguna: ${authError.message}`);
  }

  return {
    reports: orderedReports.map((report) => {
      const support = supportSummaries.get(report.id);
      if (!support) {
        throw new Error(`Ringkasan dukungan laporan ${report.id} tidak ditemukan.`);
      }

      return {
        ...report,
        ...support,
        rating: reviewRatings.get(report.id),
        isAuthenticated: Boolean(authData.user),
        image_url: imageUrlByReport.get(report.id),
      };
    }),
    total: countResult.count ?? 0,
  };
}

async function getActiveReportCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: PublicReportQuery,
  searchTerm: string | null,
) {
  let countQuery = supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .is("merged_into_report_id", null)
    .in("status", [...ACTIVE_PUBLIC_STATUSES]);

  if (query.category) {
    countQuery = countQuery.eq("category", query.category);
  }

  if (query.status) {
    countQuery = countQuery.eq("status", query.status);
  }

  const searchFilter = searchTerm ? buildSearchOrFilter(searchTerm) : null;
  if (searchFilter) {
    countQuery = countQuery.or(searchFilter);
  }

  return countQuery;
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
    supportCount: report.supportCount,
    hasSupported: report.hasSupported,
    isOwner: report.isOwner,
    canSupport: report.canSupport,
    isAuthenticated: report.isAuthenticated,
    engagement: report.groupSupportCount === undefined
      || report.mergedReportCount === undefined
      ? undefined
      : {
        groupSupportCount: report.groupSupportCount,
        mergedReportCount: report.mergedReportCount,
      },
    imageUrl: report.image_url,
  };
}
