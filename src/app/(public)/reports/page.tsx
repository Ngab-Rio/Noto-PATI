import Link from "next/link";
import { FileText, Layers, MapPin, Plus } from "lucide-react";

import { ReportCard } from "@/components/shared/report-card";
import { Button } from "@/components/ui/button";
import { getPublicReportStats, getPublicReports, toReportItem } from "@/lib/reports/public";

const LATEST_REPORT_COUNT = 6;

export default async function ReportsPage() {
  const [{ reports: latestReports, total }, stats] = await Promise.all([
    getPublicReports({ limit: LATEST_REPORT_COUNT }),
    getPublicReportStats(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-3">
            <FileText className="h-3.5 w-3.5" />
            <span>Laporan Warga</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text">Laporan Infrastruktur Terbaru</h1>
              <p className="text-sm text-text-muted mt-1.5 leading-relaxed">
                Enam laporan terbaru dari seluruh warga Kabupaten Pati
              </p>
            </div>
            <Link href="/report/new">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                <span>Buat Laporan Baru</span>
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<FileText className="h-4 w-4 text-blue-600" />} value={stats.total} label="Total Laporan" />
          <StatCard icon={<Layers className="h-4 w-4 text-yellow-600" />} value={stats.diproses} label="Sedang Diproses" />
          <StatCard icon={<FileText className="h-4 w-4 text-green-600" />} value={stats.selesai} label="Selesai" />
          <StatCard icon={<MapPin className="h-4 w-4 text-primary" />} value={stats.lokasi} label="Lokasi" />
        </div>

        {latestReports.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {latestReports.map((report) => <ReportCard key={report.id} report={toReportItem(report)} />)}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-12 text-center">
            <FileText className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-text">Belum ada laporan</h2>
            <p className="text-sm text-text-muted mt-2">Jadilah warga pertama yang melaporkan kerusakan.</p>
          </div>
        )}

        {total > LATEST_REPORT_COUNT && (
          <div className="mt-8 flex justify-center">
            <Link href="/reports/list">
              <Button variant="outline" size="lg">Lihat lebih banyak laporan</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <div className="text-2xl font-bold text-text">{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  );
}
