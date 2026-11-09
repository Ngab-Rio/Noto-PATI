import "server-only";

import { cache } from "react";
import { getSignedPhotoUrls, getSignedCompletionEvidenceUrls } from "@/lib/reports/signed-urls";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/guards";
import { CATEGORY_LABELS } from "@/lib/reports/public";
import { normalizeReportStatus } from "@/config/theme";
import type { AdminReportItem } from "./types";
import { calculateReportSla, formatRemainingTime } from "@/domain/sla";
import { getReportSupportSummaries } from "@/lib/reports/support";
import type { ReportStatus } from "@/types/map";

export const ADMIN_MAP_STATUSES = [
  "diterima",
  "diverifikasi",
  "diproses",
  "selesai",
  "ditolak",
  "digabung",
] as const satisfies readonly ReportStatus[];

const CATEGORY_KEYS: Record<string, AdminReportItem["categoryKey"]> = {
  jalan: "road_damage",
  lampu: "street_lighting",
  drainase: "drainage",
  jembatan: "other_infrastructure",
  tanggul: "other_infrastructure",
  trotoar: "sidewalk",
  rambu: "other_infrastructure",
  lainnya: "other_infrastructure",
};

type ReportRow = {
  id: string;
  ticket_number: string;
  reporter_id: string | null;
  category: string;
  title: string;
  description: string;
  detail_location: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  verification_due_at: string | null;
  handling_due_at: string | null;
  verified_at: string | null;
};

type PhotoRow = {
  id: string;
  report_id: string;
  storage_path: string;
  sort_order: number;
};

type HistoryRow = {
  id: string;
  report_id: string;
  status: string;
  changed_by: string | null;
  note: string | null;
  proof_image_url: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string;
  phone: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function isUuid(value: string | null | undefined): value is string {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      ),
  );
}

function toReportItem(
  report: ReportRow,
  profile: ProfileRow | undefined,
  photos: PhotoRow[],
  history: HistoryRow[],
  signedUrls: Map<string, string>,
  proofSignedUrls: Map<string, string>,
  supportCount: number,
  completedAtOverride?: string | null,
): AdminReportItem {
  const category = report.category.toLowerCase();
  const status = normalizeReportStatus(report.status);
  const completedAt =
    history.find((entry) => entry.status === "selesai")?.created_at ??
    completedAtOverride ??
    null;
  const sla = calculateReportSla(
    {
      status,
      verificationDueAt: report.verification_due_at,
      handlingDueAt: report.handling_due_at,
      completedAt,
    },
    new Date().toISOString(),
  );
  const dueDateLabel =
    sla.state === "completed_on_time"
      ? "Tuntas"
      : sla.state === "completed_late"
        ? "Tuntas (terlambat)"
        : sla.state === "overdue"
          ? `Terlambat ${formatRemainingTime(sla.remainingMs)}`
          : sla.state === "in_target"
            ? `Tersisa ${formatRemainingTime(sla.remainingMs)}`
            : undefined;

  return {
    id: report.id,
    ticketNumber: report.ticket_number,
    title: report.title,
    description: report.description,
    category: CATEGORY_LABELS[category] ?? category,
    categoryKey: CATEGORY_KEYS[category] ?? "other_infrastructure",
    status,
    location: report.detail_location,
    coordinates: {
      lat: report.latitude ?? 0,
      lng: report.longitude ?? 0,
    },
    reporterName: profile?.full_name ?? "Pengguna anonim",
    reporterPhone: profile?.phone ?? undefined,
    supportCount,
    submittedAt: formatDate(report.created_at),
    submittedAtRaw: report.created_at,
    slaState: sla.state,
    slaDueAt: sla.dueAt ?? undefined,
    dueDateLabel,
    isOverdue: sla.state === "overdue",
    images: photos
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((photo) => signedUrls.get(photo.storage_path))
      .filter((url): url is string => Boolean(url)),
    priority: "sedang",
    timeline: history
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((entry) => ({
        id: entry.id,
        status: normalizeReportStatus(entry.status),
        actor: entry.changed_by ? "Pengguna terautentikasi" : "Sistem",
        role: entry.changed_by ? "warga" : "sistem",
        note: entry.note ?? undefined,
        proofImage: entry.proof_image_url ? proofSignedUrls.get(entry.proof_image_url) : undefined,
        timestamp: formatDate(entry.created_at),
      })),
  };
}

export async function getAdminReports(): Promise<AdminReportItem[]> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: reports, error: reportsError } = await admin
    .from("reports")
    .select(
      "id, ticket_number, reporter_id, category, title, description, detail_location, status, latitude, longitude, created_at, verification_due_at, handling_due_at, verified_at",
    )
    .order("created_at", { ascending: false });

  if (reportsError) throw new Error(`Gagal memuat laporan admin: ${reportsError.message}`);

  const reportRows = (reports ?? []) as ReportRow[];
  const reportIds = reportRows.map((report) => report.id);
  const completedReportIds = reportRows
    .filter((report) => normalizeReportStatus(report.status) === "selesai")
    .map((report) => report.id);
  const profileIds = [...new Set(reportRows.map((report) => report.reporter_id))]
    .filter(isUuid);

  const [completionHistoryResult, supportSummaries, profilesResult] = await Promise.all([
    completedReportIds.length
      ? admin
          .from("report_status_history")
          .select("report_id, status, created_at")
          .in("report_id", completedReportIds)
          .eq("status", "selesai")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    getReportSupportSummaries(reportIds, true),
    profileIds.length
      ? admin.from("profiles").select("id, full_name, phone").in("id", profileIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (completionHistoryResult.error) {
    throw new Error(`Gagal memuat tanggal penyelesaian laporan: ${completionHistoryResult.error.message}`);
  }
  if (profilesResult.error) {
    throw new Error(`Gagal memuat profil pelapor: ${profilesResult.error.message}`);
  }

  const profileById = new Map(
    ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]),
  );
  const completedAtByReport = new Map<string, string>();
  for (const row of completionHistoryResult.data ?? []) {
    if (!completedAtByReport.has(row.report_id)) {
      completedAtByReport.set(row.report_id, row.created_at);
    }
  }

  return reportRows.map((report) => {
    const support = supportSummaries.get(report.id);
    if (!support) {
      throw new Error(`Ringkasan dukungan laporan ${report.id} tidak ditemukan.`);
    }

    return toReportItem(
      report,
      profileById.get(report.reporter_id ?? ""),
      [],
      [],
      new Map(),
      new Map(),
      support.supportCount,
      completedAtByReport.get(report.id) ?? null,
    );
  });
}

export async function getAdminRecentActivity(): Promise<
  Array<{
    id: string;
    ticketNumber: string;
    actor: string;
    note: string | null;
    timestamp: string;
  }>
> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: history, error: historyError } = await admin
    .from("report_status_history")
    .select("id, report_id, changed_by, note, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (historyError) {
    throw new Error(`Gagal memuat aktivitas admin terbaru: ${historyError.message}`);
  }

  const historyRows = history ?? [];
  if (historyRows.length === 0) return [];

  const reportIds = [...new Set(historyRows.map((entry) => entry.report_id))];
  const { data: reports, error: reportsError } = await admin
    .from("reports")
    .select("id, ticket_number")
    .in("id", reportIds);

  if (reportsError) {
    throw new Error(`Gagal memuat nomor tiket aktivitas admin: ${reportsError.message}`);
  }

  const ticketByReportId = new Map(
    (reports ?? []).map((report) => [report.id, report.ticket_number]),
  );

  return historyRows.map((entry) => {
    const ticketNumber = ticketByReportId.get(entry.report_id);
    if (!ticketNumber) {
      throw new Error(`Nomor tiket laporan ${entry.report_id} tidak ditemukan.`);
    }

    return {
      id: entry.id,
      ticketNumber,
      actor: entry.changed_by ? "Pengguna terautentikasi" : "Sistem",
      note: entry.note,
      timestamp: formatDate(entry.created_at),
    };
  });
}

export async function getAdminMapSummary() {
  await requireAdmin();
  const admin = createAdminClient();

  const [statusCounts, locatedResult] = await Promise.all([
    Promise.all(
      ADMIN_MAP_STATUSES.map(async (status) => {
        const { count, error } = await admin
          .from("reports")
          .select("id", { count: "exact", head: true })
          .eq("status", status);

        if (error) {
          throw new Error(`Gagal menghitung laporan berstatus ${status}: ${error.message}`);
        }

        return { status, count: count ?? 0 };
      }),
    ),
    admin
      .from("reports")
      .select("id", { count: "exact", head: true })
      .gte("latitude", -90)
      .lte("latitude", 90)
      .gte("longitude", -180)
      .lte("longitude", 180),
  ]);

  if (locatedResult.error) {
    throw new Error(`Gagal menghitung laporan dengan koordinat valid: ${locatedResult.error.message}`);
  }

  const countsByStatus = new Map(
    statusCounts.map(({ status, count }) => [status, count]),
  );

  return {
    totalCount: statusCounts.reduce((total, item) => total + item.count, 0),
    locatedCount: locatedResult.count ?? 0,
    activeCount:
      (countsByStatus.get("diterima") ?? 0)
      + (countsByStatus.get("diverifikasi") ?? 0)
      + (countsByStatus.get("diproses") ?? 0),
    completedCount: countsByStatus.get("selesai") ?? 0,
    statusCounts,
  };
}

export const getAdminReport = cache(async (id: string) => {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("reports")
    .select(
      "id, ticket_number, reporter_id, category, title, description, detail_location, status, latitude, longitude, created_at, verification_due_at, handling_due_at, verified_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat laporan admin: ${error.message}`);
  if (!data) return null;

  const report = data as ReportRow;
  const [{ data: photos, error: photosError }, { data: history, error: historyError }, supportSummaries, profileResult] =
    await Promise.all([
      admin
        .from("report_photos")
        .select("id, report_id, storage_path, sort_order")
        .eq("report_id", id)
        .order("sort_order", { ascending: true }),
      admin
        .from("report_status_history")
        .select("id, report_id, status, changed_by, note, proof_image_url, created_at")
        .eq("report_id", id)
        .order("created_at", { ascending: false }),
      getReportSupportSummaries([id], true),
      report.reporter_id
        ? admin
          .from("profiles")
          .select("id, full_name, phone")
          .eq("id", report.reporter_id)
          .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

  if (photosError) throw new Error(`Gagal memuat foto laporan: ${photosError.message}`);
  if (historyError) throw new Error(`Gagal memuat riwayat laporan: ${historyError.message}`);
  if (profileResult.error) throw new Error(`Gagal memuat profil pelapor: ${profileResult.error.message}`);

  const support = supportSummaries.get(id);
  if (!support) throw new Error(`Ringkasan dukungan laporan ${id} tidak ditemukan.`);

  const photoRows = (photos ?? []) as PhotoRow[];
  const historyRows = (history ?? []) as HistoryRow[];
  const signedUrls = await getSignedPhotoUrls(photoRows.map((photo) => photo.storage_path));
  const proofPaths = historyRows
    .map((entry) => entry.proof_image_url)
    .filter((path): path is string => Boolean(path));
  const proofSignedUrls = await getSignedCompletionEvidenceUrls(proofPaths);

  return toReportItem(
    report,
    profileResult.data as ProfileRow | undefined,
    photoRows,
    historyRows,
    signedUrls,
    proofSignedUrls,
    support.supportCount,
  );
});
