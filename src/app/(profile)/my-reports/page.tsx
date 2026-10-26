import Link from "next/link";
import { Suspense } from "react";
import { 
  Plus,
  FileText,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { ReportCard, type ReportItemData } from "@/components/shared/report-card";
import { Button } from "@/components/ui/button";
import { DataSimulationBadge } from "@/components/shared/data-simulation-badge";

// Mock data - user's own reports
// TODO: Replace with actual data fetching from Supabase filtered by user_id
const MOCK_USER_REPORTS: ReportItemData[] = [
  {
    id: "1",
    ticketNumber: "NP-2026-1001",
    title: "Jalan berlubang di depan SDN 01 Pati Kota",
    description: "Lubang dengan diameter sekitar 1 meter di tengah jalan, berbahaya untuk pengendara motor terutama saat hujan. Sudah ada sejak 2 minggu yang lalu.",
    category: "Infrastruktur Jalan",
    status: "diproses",
    location: "Jl. Raya Pati-Kudus KM 5, Kec. Pati, Pati Kota",
    date: "24 Okt 2026",
    supportCount: 47,
    dinasTerkait: "Dinas PUPR",
    officialNote: "Tim sudah melakukan survei lapangan. Perbaikan dijadwalkan minggu depan sesuai anggaran tersedia.",
  },
  {
    id: "3",
    ticketNumber: "NP-2026-1003",
    title: "Drainase tersumbat sampah dan lumpur",
    description: "Saluran air penuh dengan sampah plastik dan lumpur sehingga air menggenang saat hujan. Bau tidak sedap dan berpotensi jadi sarang nyamuk.",
    category: "Drainase",
    status: "diterima",
    location: "Jl. Pemuda No. 45, Kec. Pati, Pati Kidul",
    date: "23 Okt 2026",
    supportCount: 12,
  },
  {
    id: "8",
    ticketNumber: "NP-2026-0987",
    title: "Trotoar rusak di depan pasar tradisional",
    description: "Paving block trotoar banyak yang lepas dan berlubang. Berbahaya untuk pejalan kaki terutama ibu-ibu yang belanja.",
    category: "Infrastruktur Jalan",
    status: "selesai",
    location: "Jl. Pasar Pati No. 12, Kec. Pati",
    date: "15 Okt 2026",
    supportCount: 28,
    dinasTerkait: "Dinas PUPR",
    officialNote: "Perbaikan trotoar telah selesai dilakukan. Terima kasih atas laporannya.",
  },
];

const STATUS_FILTERS = [
  { value: "all", label: "Semua Laporan", count: 3 },
  { value: "diterima", label: "Diterima", count: 1 },
  { value: "diproses", label: "Diproses", count: 1 },
  { value: "selesai", label: "Selesai", count: 1 },
];

function UserReportsSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-surface p-6 animate-pulse"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UserReportsList() {
  // TODO: Fetch from Supabase
  // const { data: { user } } = await supabase.auth.getUser()
  // const reports = await fetchReportsByUser(user.id)
  
  return (
    <div className="space-y-5">
      {MOCK_USER_REPORTS.map((report) => (
        <ReportCard 
          key={report.id} 
          report={report}
          className="lg:col-span-1" 
        />
      ))}
    </div>
  );
}

export default function MyReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold mb-3">
          <FileText className="h-3.5 w-3.5" />
          <span>Laporan Saya</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text">
              Laporan Saya
            </h1>
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

        {/* Data Simulation Badge */}
        <div className="mt-4">
          <DataSimulationBadge />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary-soft flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text">3</div>
          <div className="text-xs text-text-muted">Total Laporan</div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text">1</div>
          <div className="text-xs text-text-muted">Diproses</div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text">1</div>
          <div className="text-xs text-text-muted">Selesai</div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text">87</div>
          <div className="text-xs text-text-muted">Total Dukungan</div>
        </div>
      </div>

      {/* 2 Column Layout: Filters (Left) + Reports (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Filters */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-text-muted" />
              <h3 className="font-semibold text-text text-sm">Filter Status</h3>
            </div>

            <div className="space-y-1">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    filter.value === "all"
                      ? "bg-primary-soft text-primary-dark font-medium"
                      : "text-text-muted hover:bg-surface hover:text-text"
                  }`}
                >
                  <span>{filter.label}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      filter.value === "all"
                        ? "bg-primary/20 text-primary-dark"
                        : "bg-background text-text-muted"
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Info Card */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                    <strong className="font-semibold">Tips:</strong> Semakin banyak dukungan, semakin cepat laporan Anda ditindaklanjuti
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content: Reports */}
        <div className="lg:col-span-3">
          <Suspense fallback={<UserReportsSkeleton />}>
            <UserReportsList />
          </Suspense>

          {/* Empty State */}
          {MOCK_USER_REPORTS.length === 0 && (
            <div className="rounded-xl border border-border bg-surface p-12 text-center">
              <div className="inline-flex h-16 w-16 rounded-full bg-primary-soft items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">
                Belum ada laporan
              </h3>
              <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
                Anda belum pernah membuat laporan. Laporkan kerusakan infrastruktur di sekitar Anda sekarang
              </p>
              <Link href="/report/new">
                <Button size="lg" className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Buat Laporan Pertama</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
