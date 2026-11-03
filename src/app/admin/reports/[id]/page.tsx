import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportActionView } from "./report-action-view";
import { getAdminReport } from "@/features/admin/server-data";

interface ReportDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ReportDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const report = await getAdminReport(id);

  if (!report) {
    return {
      title: "Laporan Tidak Ditemukan · Admin Noto PATI",
    };
  }

  return {
    title: `Tinjau ${report.ticketNumber} · Admin Noto PATI`,
    description: report.title,
    robots: { index: false, follow: false },
  };
}

export default async function AdminReportDetailPage({
  params,
}: ReportDetailPageProps) {
  const { id } = await params;
  const report = await getAdminReport(id);

  if (!report) {
    notFound();
  }

  return (
    <div className="py-8 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ReportActionView report={report} />
      </div>
    </div>
  );
}
