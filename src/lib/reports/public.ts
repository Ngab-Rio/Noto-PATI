import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizeReportStatus } from "@/config/theme";
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

export async function getPublicReports(): Promise<PublicReport[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("id, ticket_number, category, title, description, detail_location, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch public reports", error);
    return [];
  }

  const reports = (data ?? []) as PublicReport[];
  const admin = createAdminClient();
  const { data: photos } = await admin
    .from("report_photos")
    .select("report_id, storage_path, sort_order")
    .in("report_id", reports.map((report) => report.id))
    .order("sort_order", { ascending: true });

  const firstPhotoByReport = new Map<string, string>();
  for (const photo of photos ?? []) {
    if (!firstPhotoByReport.has(photo.report_id)) {
      const { data: signed } = await admin.storage
        .from("report-photos")
        .createSignedUrl(photo.storage_path, 60 * 10);
      if (signed?.signedUrl) {
        firstPhotoByReport.set(photo.report_id, signed.signedUrl);
      }
    }
  }

  return reports.map((report) => ({
    ...report,
    image_url: firstPhotoByReport.get(report.id),
  }));
}

export function filterPublicReports(
  reports: PublicReport[],
  category: string,
  status: string,
  search: string,
) {
  const normalizedSearch = search.trim().toLocaleLowerCase("id-ID");
  return reports.filter((report) => {
    const matchesCategory = !category || report.category === category;
    const matchesStatus = !status || PUBLIC_STATUSES.includes(status as (typeof PUBLIC_STATUSES)[number]) && report.status === status;
    const matchesSearch = !normalizedSearch
      || `${report.title} ${report.detail_location}`.toLocaleLowerCase("id-ID").includes(normalizedSearch);
    return matchesCategory && matchesStatus && matchesSearch;
  });
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
