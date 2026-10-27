import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { ReportsView } from "./reports-view";
import { MOCK_ADMIN_REPORTS } from "@/features/admin/mock-data";

export const metadata: Metadata = {
  title: "Kelola Seluruh Laporan · Admin Noto PATI",
  description: "Daftar lengkap dan filter seluruh laporan infrastruktur masyarakat Kabupaten Pati.",
  robots: { index: false, follow: false },
};

interface ReportsPageProps {
  searchParams: Promise<{
    status?: string;
    overdue?: string;
  }>;
}

export default async function AdminReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const defaultStatus = params.status;
  const defaultOverdue = params.overdue === "true";

  return (
    <div className="py-8 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ── Breadcrumb & Title ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
              <Link href="/admin" className="hover:text-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali ke Dashboard</span>
              </Link>
              <span>/</span>
              <span className="text-text font-medium">Kelola Laporan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight flex items-center gap-2.5">
              <ClipboardList className="h-7 w-7 text-primary" />
              <span>Daftar Seluruh Laporan Warga</span>
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Pusat filter, pencarian, dan penanganan berkas pengaduan infrastruktur publik Kabupaten Pati.
            </p>
          </div>
        </div>

        {/* ── Client View with Filters ── */}
        <ReportsView
          initialReports={MOCK_ADMIN_REPORTS}
          defaultStatus={defaultStatus}
          defaultOverdue={defaultOverdue}
        />
      </div>
    </div>
  );
}
