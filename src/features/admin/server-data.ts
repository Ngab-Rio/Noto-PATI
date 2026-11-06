import "server-only";

import { getSignedPhotoUrls, getSignedCompletionEvidenceUrls } from "@/lib/reports/signed-urls";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/guards";
import { CATEGORY_LABELS } from "@/lib/reports/public";
import { normalizeReportStatus } from "@/config/theme";
import type { AdminReportItem } from "./types";
import { calculateReportSla, formatRemainingTime } from "@/domain/sla";

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
): AdminReportItem {
  const category = report.category.toLowerCase();
  const status = normalizeReportStatus(report.status);
  const completedAt =
    history.find((entry) => entry.status === "selesai")?.created_at ?? null;
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
    supportCount: 0,
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

  const [{ data: reports, error: reportsError }, { data: photos, error: photosError }, { data: history, error: historyError }] =
    await Promise.all([
      admin
        .from("reports")
        .select(
          "id, ticket_number, reporter_id, category, title, description, detail_location, status, latitude, longitude, created_at, verification_due_at, handling_due_at, verified_at",
        )
        .order("created_at", { ascending: false }),
      admin
        .from("report_photos")
        .select("id, report_id, storage_path, sort_order")
        .order("sort_order", { ascending: true }),
      admin
        .from("report_status_history")
        .select("id, report_id, status, changed_by, note, proof_image_url, created_at")
        .order("created_at", { ascending: false }),
    ]);

  if (reportsError) throw new Error(`Gagal memuat laporan admin: ${reportsError.message}`);
  if (photosError) throw new Error(`Gagal memuat foto laporan: ${photosError.message}`);
  if (historyError) throw new Error(`Gagal memuat riwayat laporan: ${historyError.message}`);

  const reportRows = (reports ?? []) as ReportRow[];
  const photoRows = (photos ?? []) as PhotoRow[];
  const historyRows = (history ?? []) as HistoryRow[];
  const profileIds = [
    ...new Set([
      ...reportRows.map((report) => report.reporter_id),
      ...historyRows.flatMap((entry) => (entry.changed_by ? [entry.changed_by] : [])),
    ]),
  ].filter(isUuid);

  const { data: profiles, error: profilesError } = profileIds.length
    ? await admin.from("profiles").select("id, full_name, phone").in("id", profileIds)
    : { data: [], error: null };

  if (profilesError) throw new Error(`Gagal memuat profil pelapor: ${profilesError.message}`);

  const profileById = new Map(
    ((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]),
  );
  
  // Generate signed URLs untuk foto laporan
  const signedUrls = await getSignedPhotoUrls(photoRows.map((photo) => photo.storage_path));
  
  // Generate signed URLs untuk proof completion evidence
  const proofPaths = historyRows
    .map((entry) => entry.proof_image_url)
    .filter((path): path is string => Boolean(path));
  const proofSignedUrls = await getSignedCompletionEvidenceUrls(proofPaths);
  
  const photosByReport = new Map<string, PhotoRow[]>();
  const historyByReport = new Map<string, HistoryRow[]>();

  for (const photo of photoRows) {
    const items = photosByReport.get(photo.report_id) ?? [];
    items.push(photo);
    photosByReport.set(photo.report_id, items);
  }

  for (const entry of historyRows) {
    const items = historyByReport.get(entry.report_id) ?? [];
    items.push(entry);
    historyByReport.set(entry.report_id, items);
  }

  return reportRows.map((report) =>
    toReportItem(
      report,
      profileById.get(report.reporter_id ?? ""),
      photosByReport.get(report.id) ?? [],
      historyByReport.get(report.id) ?? [],
      signedUrls,
      proofSignedUrls,
    ),
  );
}

export async function getAdminReport(id: string) {
  const reports = await getAdminReports();
  return reports.find((report) => report.id === id) ?? null;
}
