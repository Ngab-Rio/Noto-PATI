import Link from "next/link";
import { FileText, Filter, Plus, Search } from "lucide-react";

import { ReportCard } from "@/components/shared/report-card";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_LABELS,
  PUBLIC_STATUSES,
  filterPublicReports,
  getPublicReports,
  toReportItem,
} from "@/lib/reports/public";

const PAGE_SIZE = 6;

export default async function ReportsListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const category = params.category ?? "";
  const status = params.status ?? "";
  const search = params.search ?? "";
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const reports = filterPublicReports(await getPublicReports(), category, status, search);
  const totalPages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE));
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), totalPages) : 1;
  const visibleReports = reports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const query = (nextPage: number) => {
    const values = new URLSearchParams();
    if (search) values.set("search", search);
    if (category) values.set("category", category);
    if (status) values.set("status", status);
    values.set("page", String(nextPage));
    return `/reports/list?${values.toString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <Link href="/reports" className="text-sm text-primary hover:underline">Kembali ke laporan terbaru</Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-3">
                <FileText className="h-3.5 w-3.5" />
                <span>Semua Laporan</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text">Daftar Laporan Infrastruktur</h1>
              <p className="text-sm text-text-muted mt-1.5">{reports.length} laporan sesuai filter</p>
            </div>
            <Link href="/report/new">
              <Button size="lg" className="gap-2 w-full sm:w-auto"><Plus className="h-4 w-4" />Buat Laporan Baru</Button>
            </Link>
          </div>
        </header>

        <form method="get" className="rounded-xl border border-border bg-surface p-4 sm:p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <label className="relative flex-1">
              <span className="sr-only">Cari laporan</span>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input name="search" defaultValue={search} placeholder="Cari judul atau lokasi laporan..." className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background text-text" />
            </label>
            <label className="relative w-full lg:w-56">
              <span className="sr-only">Filter kategori</span>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
              <select name="category" defaultValue={category} className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background text-text appearance-none">
                <option value="">Semua Kategori</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="w-full lg:w-48">
              <span className="sr-only">Filter status</span>
              <select name="status" defaultValue={status} className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background text-text appearance-none">
                <option value="">Semua Status</option>
                {PUBLIC_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <Button type="submit">Terapkan</Button>
          </div>
        </form>

        {visibleReports.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {visibleReports.map((report) => <ReportCard key={report.id} report={toReportItem(report)} />)}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-12 text-center">
            <FileText className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-text">Laporan tidak ditemukan</h2>
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination laporan">
            <Link href={query(page - 1)} aria-disabled={page === 1} className={page === 1 ? "pointer-events-none opacity-50" : ""}>
              <Button variant="outline" disabled={page === 1}>Sebelumnya</Button>
            </Link>
            <span className="px-3 text-sm text-text-muted">Halaman {page} dari {totalPages}</span>
            <Link href={query(page + 1)} aria-disabled={page === totalPages} className={page === totalPages ? "pointer-events-none opacity-50" : ""}>
              <Button variant="outline" disabled={page === totalPages}>Selanjutnya</Button>
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
}
