import type { Metadata } from "next";
import Link from "@/components/shared/route-link";
import { FileText, Layers, MapPin, Plus, TrendingUp } from "lucide-react";

import { ReportCard } from "@/components/shared/report-card";
import { Button } from "@/components/ui/button";
import { getPublicReportStats, getPublicReports, toReportItem } from "@/lib/reports/public";

const LATEST_REPORT_COUNT = 6;

export const metadata: Metadata = {
  title: "Laporan Infrastruktur Warga · Noto PATI",
  description: "Lihat laporan kerusakan infrastruktur terbaru dari warga Kabupaten Pati. Pantau status penanganan dan transparansi pemerintah daerah.",
};

export default async function ReportsPage() {
  const [{ reports: latestReports, total }, stats] = await Promise.all([
    getPublicReports({ limit: LATEST_REPORT_COUNT }),
    getPublicReportStats(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-3">
            <FileText className="h-3.5 w-3.5" />
            <span>Laporan Warga</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text">
                Laporan Infrastruktur Terbaru
              </h1>
              <p className="text-sm sm:text-base text-text-muted mt-2 leading-relaxed max-w-2xl">
                Enam laporan terbaru dari seluruh warga Kabupaten Pati. Pantau status penanganan secara transparan.
              </p>
            </div>
            <Link href="/report/new" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 w-full sm:w-auto shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                <Plus className="h-4 w-4" />
                <span>Buat Laporan Baru</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Stats Cards - Enhanced */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8" aria-label="Statistik laporan">
          <StatCard 
            icon={<FileText className="h-5 w-5 text-blue-600" />} 
            value={stats.total} 
            label="Total Laporan"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
          />
          <StatCard 
            icon={<TrendingUp className="h-5 w-5 text-yellow-600" />} 
            value={stats.diproses} 
            label="Sedang Diproses"
            bgColor="bg-yellow-50"
            borderColor="border-yellow-200"
          />
          <StatCard 
            icon={<Layers className="h-5 w-5 text-green-600" />} 
            value={stats.selesai} 
            label="Selesai"
            bgColor="bg-green-50"
            borderColor="border-green-200"
          />
          <StatCard 
            icon={<MapPin className="h-5 w-5 text-primary" />} 
            value={stats.lokasi} 
            label="Kecamatan Terdampak"
            bgColor="bg-primary-soft"
            borderColor="border-primary/20"
          />
        </section>

        {/* Latest Reports */}
        {latestReports.length > 0 ? (
          <section>
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-lg sm:text-xl font-bold text-text">Laporan Terbaru</h2>
              {total > LATEST_REPORT_COUNT && (
                <Link href="/reports/list" className="text-sm text-primary hover:text-primary-dark font-medium hover:underline">
                  Lihat semua ({total}) →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {latestReports.map((report) => (
                <ReportCard key={report.id} report={toReportItem(report)} />
              ))}
            </div>
          </section>
        ) : (
          <EmptyState />
        )}

        {/* View More Button */}
        {total > LATEST_REPORT_COUNT && (
          <div className="mt-8 flex justify-center">
            <Link href="/reports/list">
              <Button variant="outline" size="lg" className="gap-2 hover:scale-[1.02] active:scale-95 transition-all">
                <Layers className="h-4 w-4" />
                <span>Lihat Semua {total} Laporan</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Enhanced Stat Card with visual improvements
 */
function StatCard({ 
  icon, 
  value, 
  label,
  bgColor = "bg-surface",
  borderColor = "border-border"
}: { 
  icon: React.ReactNode; 
  value: number; 
  label: string;
  bgColor?: string;
  borderColor?: string;
}) {
  return (
    <div className={`rounded-xl border-2 ${borderColor} ${bgColor} p-4 sm:p-5 transition-all hover:shadow-md hover:-translate-y-0.5 duration-300`}>
      <div className="flex items-center gap-2 mb-2.5">{icon}</div>
      <div className="text-2xl sm:text-3xl font-bold text-text tabular-nums">{value}</div>
      <div className="text-xs sm:text-sm text-text-muted font-medium leading-tight mt-1">{label}</div>
    </div>
  );
}

/**
 * Enhanced Empty State
 */
function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-surface p-8 sm:p-12 text-center">
      <div className="max-w-md mx-auto space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-soft text-primary mb-2">
          <FileText className="h-8 w-8" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-text">Belum Ada Laporan</h2>
        <p className="text-sm sm:text-base text-text-muted leading-relaxed">
          Jadilah warga pertama yang melaporkan kerusakan infrastruktur di wilayah Anda. Bersama kita wujudkan Pati yang lebih baik.
        </p>
        <div className="pt-2">
          <Link href="/report/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Buat Laporan Pertama</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
