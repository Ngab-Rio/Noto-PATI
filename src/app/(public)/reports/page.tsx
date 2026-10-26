import Link from "next/link";
import { Suspense } from "react";
import { 
  Filter, 
  Search, 
  Plus,
  FileText,
  Layers,
  MapPin
} from "lucide-react";
import { ReportCard, type ReportItemData } from "@/components/shared/report-card";
import { Button } from "@/components/ui/button";
import { DataSimulationBadge } from "@/components/shared/data-simulation-badge";

// Mock data for demonstration
// TODO: Replace with actual data fetching from Supabase
const MOCK_REPORTS: ReportItemData[] = [
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
    imageUrl: "/placeholder-road.jpg"
  },
  {
    id: "2",
    ticketNumber: "NP-2026-1002",
    title: "Lampu penerangan jalan mati total",
    description: "Seluruh lampu PJU di sepanjang 500 meter tidak menyala sejak 3 hari yang lalu. Kondisi sangat gelap dan rawan kecelakaan pada malam hari.",
    category: "Infrastruktur Penerangan",
    status: "diverifikasi",
    location: "Jl. Ahmad Yani, Kec. Gabus, Desa Tanjang",
    date: "23 Okt 2026",
    supportCount: 89,
    imageUrl: "/placeholder-light.jpg"
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
    imageUrl: "/placeholder-drain.jpg"
  },
  {
    id: "4",
    ticketNumber: "NP-2026-0998",
    title: "Perbaikan jalan selesai dengan baik",
    description: "Pengaspalan jalan sudah selesai dilakukan. Kondisi jalan sekarang sangat baik dan halus. Terima kasih kepada Dinas PUPR yang cepat merespons.",
    category: "Infrastruktur Jalan",
    status: "selesai",
    location: "Jl. Kolonel Sugiyono, Kec. Juwana",
    date: "20 Okt 2026",
    supportCount: 156,
    dinasTerkait: "Dinas PUPR",
    officialNote: "Pekerjaan pengaspalan selesai 100%. Terima kasih atas laporannya.",
    imageUrl: "/placeholder-fixed.jpg"
  },
  {
    id: "5",
    ticketNumber: "NP-2026-0995",
    title: "Gorong-gorong rusak perlu penggantian",
    description: "Gorong-gorong di bawah jalan retak dan mulai runtuh. Air tidak bisa mengalir dengan lancar sehingga sering terjadi genangan.",
    category: "Drainase",
    status: "diproses",
    location: "Jl. Raya Tayu-Juwana KM 8, Kec. Tayu",
    date: "19 Okt 2026",
    supportCount: 34,
    dinasTerkait: "Dinas PUPR",
    imageUrl: "/placeholder-culvert.jpg"
  },
  {
    id: "6",
    ticketNumber: "NP-2026-0992",
    title: "Rambu lalu lintas rusak dan miring",
    description: "Rambu peringatan hati-hati di tikungan sudah rusak dan miring sejak kecelakaan minggu lalu. Perlu diganti agar pengendara waspada.",
    category: "Infrastruktur Jalan",
    status: "diverifikasi",
    location: "Jl. Raya Pati-Rembang KM 15, Kec. Sukolilo",
    date: "18 Okt 2026",
    supportCount: 23,
    imageUrl: "/placeholder-sign.jpg"
  }
];

const CATEGORIES = [
  { value: "all", label: "Semua Kategori" },
  { value: "jalan", label: "Infrastruktur Jalan" },
  { value: "penerangan", label: "Infrastruktur Penerangan" },
  { value: "drainase", label: "Drainase" },
  { value: "fasilitas", label: "Fasilitas Umum" },
];

const STATUSES = [
  { value: "all", label: "Semua Status" },
  { value: "diterima", label: "Diterima" },
  { value: "diverifikasi", label: "Diverifikasi" },
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
];

function ReportListSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
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
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportList() {
  // TODO: Fetch from Supabase with filters
  // const reports = await fetchReports({ category, status, search });
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {MOCK_REPORTS.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-3">
            <FileText className="h-3.5 w-3.5" />
            <span>Laporan Warga</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text">
                Daftar Laporan Infrastruktur
              </h1>
              <p className="text-sm text-text-muted mt-1.5 leading-relaxed">
                Pantau laporan kerusakan infrastruktur dari seluruh warga Kabupaten Pati
              </p>
            </div>

            <Link href="/report/new">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                <span>Buat Laporan Baru</span>
              </Button>
            </Link>
          </div>

          {/* Data Simulation Badge */}
          <div className="mt-4">
            <DataSimulationBadge />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-text">156</div>
            <div className="text-xs text-text-muted">Total Laporan</div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 flex items-center justify-center">
                <Layers className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-text">42</div>
            <div className="text-xs text-text-muted">Sedang Diproses</div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-text">98</div>
            <div className="text-xs text-text-muted">Selesai</div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-text">21</div>
            <div className="text-xs text-text-muted">Kecamatan</div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Cari judul atau lokasi laporan..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-text"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                <select className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-text appearance-none">
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <select className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-text appearance-none">
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Report List */}
        <Suspense fallback={<ReportListSkeleton />}>
          <ReportList />
        </Suspense>

        {/* Empty State (jika tidak ada data) */}
        {/* {MOCK_REPORTS.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 rounded-full bg-primary-soft items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">
              Belum ada laporan
            </h3>
            <p className="text-sm text-text-muted mb-6">
              Jadilah yang pertama melaporkan kerusakan infrastruktur di daerah Anda
            </p>
            <Link href="/report/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                <span>Buat Laporan Pertama</span>
              </Button>
            </Link>
          </div>
        )} */}

        {/* Pagination Placeholder */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Sebelumnya
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="primary" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <span className="px-2 text-text-muted">...</span>
            <Button variant="outline" size="sm">10</Button>
          </div>
          <Button variant="outline" size="sm">
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
