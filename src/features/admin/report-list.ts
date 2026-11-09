import type { AdminReportItem } from "./types";

export type AdminReportSort = "newest" | "supports" | "due";

export function sortAdminReports(
  reports: AdminReportItem[],
  sortBy: AdminReportSort,
): AdminReportItem[] {
  return [...reports].sort((a, b) => {
    if (sortBy === "supports") {
      return b.supportCount - a.supportCount
        || b.submittedAtRaw.localeCompare(a.submittedAtRaw);
    }

    if (sortBy === "due") {
      const aDue = a.slaDueAt ? Date.parse(a.slaDueAt) : Number.POSITIVE_INFINITY;
      const bDue = b.slaDueAt ? Date.parse(b.slaDueAt) : Number.POSITIVE_INFINITY;
      return aDue - bDue || b.submittedAtRaw.localeCompare(a.submittedAtRaw);
    }

    return b.submittedAtRaw.localeCompare(a.submittedAtRaw);
  });
}

function protectCsvCell(value: string | number | undefined): string {
  const text = String(value ?? "");
  const safeText = /^[\t\r\n ]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

export function buildAdminReportsCsv(reports: AdminReportItem[]): string {
  const columns: [string, (report: AdminReportItem) => string | number | undefined][] = [
    ["Nomor Tiket", (report) => report.ticketNumber],
    ["Judul", (report) => report.title],
    ["Kategori", (report) => report.category],
    ["Status", (report) => report.status],
    ["Lokasi", (report) => report.location],
    ["Pelapor", (report) => report.reporterName],
    ["Jumlah Dukungan", (report) => report.supportCount],
    ["Waktu Laporan", (report) => report.submittedAtRaw],
    ["Tenggat SLA", (report) => report.slaDueAt],
    ["Status SLA", (report) => report.slaState],
  ];

  return [
    columns.map(([label]) => protectCsvCell(label)).join(","),
    ...reports.map((report) =>
      columns.map(([, value]) => protectCsvCell(value(report))).join(","),
    ),
  ].join("\r\n");
}
