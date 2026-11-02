import Link from "next/link";
import {
  Plus,
  FileText,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

import { ReportCard, type ReportItemData } from "@/components/shared/report-card";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { normalizeReportStatus } from "@/config/theme";

const CATEGORY_LABELS: Record<string, string> = {
  jalan: "Jalan Berlubang / Rusak",
  lampu: "Penerangan Jalan Umum (PJU)",
  drainase: "Saluran Air / Drainase",
  jembatan: "Jembatan Rusak / Retak",
  tanggul: "Tanggul Sungai / Penahan Banjir",
  trotoar: "Trotoar / Pedestrian Rusak",
  rambu: "Rambu / Marka Jalan",
  lainnya: "Fasilitas Publik Lainnya",
};

const STATUS_FILTERS = [
  { value: "all", label: "Semua Laporan" },
  { value: "diterima", label: "Diterima" },
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
];

type StoredReport = {
  id: string;
  ticket_number: string;
  category: string;
  title: string;
  description: string;
  detail_location: string;
  status: string;
  created_at: string;
};

async function getUserReports(): Promise<StoredReport[]> {
  const user = await requireUser("/my-reports");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("id, ticket_number, category, title, description, detail_location, status, created_at")
    .eq("reporter_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch user reports", error);
    return [];
  }

  return (data ?? []) as StoredReport[];
}

function formatReportDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function toReportItem(report: StoredReport): ReportItemData {
  return {
    id: report.id,
    ticketNumber: report.ticket_number,
    title: report.title,
    description: report.description,
    category: CATEGORY_LABELS[report.category] ?? report.category,
    status: normalizeReportStatus(report.status),
    location: report.detail_location,
    date: formatReportDate(report.created_at),
    supportCount: 0,
  };
}

export default async function MyReportsPage() {
  const reports = await getUserReports();
  const reportItems = reports.map(toReportItem);
  const statusCount = (status: string) => reports.filter((report) => report.status === status).length;

  return (
    <div className="space-y-6">
      <header>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold mb-3">
          <FileText className="h-3.5 w-3.5" />
          <span>Laporan Saya</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text">Laporan Saya</h1>
            <p className="text-sm text-text-muted mt-1.5 leading-relaxed">
              Pantau status dan perkembangan laporan yang Anda kirimkan
            </p>
          </div>
          <Link href="/report/new">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span>Lapor Baru</span>
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FileText className="h-4 w-4 text-primary" />} value={reports.length} label="Total Laporan" />
        <StatCard icon={<Clock className="h-4 w-4 text-yellow-600" />} value={statusCount("diproses")} label="Diproses" />
        <StatCard icon={<CheckCircle className="h-4 w-4 text-green-600" />} value={statusCount("selesai")} label="Selesai" />
        <StatCard icon={<TrendingUp className="h-4 w-4 text-blue-600" />} value={0} label="Total Dukungan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 rounded-xl border border-border bg-surface p-5 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-text-muted" />
            <h2 className="font-semibold text-text text-sm">Filter Status</h2>
          </div>
          <div className="space-y-1">
            {STATUS_FILTERS.map((filter) => (
              <div key={filter.value} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm">
                <span>{filter.label}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-background text-text-muted">
                  {filter.value === "all" ? reports.length : statusCount(filter.value)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-border">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                  Riwayat ini hanya menampilkan laporan yang dibuat oleh akun Anda.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section className="lg:col-span-3">
          {reportItems.length > 0 ? (
            <div className="space-y-5">
              {reportItems.map((report) => <ReportCard key={report.id} report={report} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-12 text-center">
              <div className="inline-flex h-16 w-16 rounded-full bg-primary-soft items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Belum ada laporan</h3>
              <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
                Anda belum pernah membuat laporan. Laporkan kerusakan infrastruktur di sekitar Anda sekarang.
              </p>
              <Link href="/report/new">
                <Button size="lg" className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Buat Laporan Pertama</span>
                </Button>
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <div className="text-2xl font-bold text-text">{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  );
}
