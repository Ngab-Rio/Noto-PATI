import type { Metadata } from "next";
import Link from "@/components/shared/route-link";
import { redirect } from "next/navigation";
import { FileText, Filter, Plus, X } from "lucide-react";

import { ReportCard } from "@/components/shared/report-card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  CATEGORY_LABELS,
  ACTIVE_PUBLIC_STATUSES,
  PUBLIC_STATUSES,
  getPublicReports,
  toReportItem,
} from "@/lib/reports/public";
import { Suspense } from "react";
import { ReportFilters } from "./report-filters";

const PAGE_SIZE = 6;

export const metadata: Metadata = {
  title: "Daftar Laporan Infrastruktur · Noto PATI",
  description: "Jelajahi semua laporan kerusakan infrastruktur publik dari warga Kabupaten Pati. Filter berdasarkan kategori, status, dan lokasi.",
};

export default async function ReportsListPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    status?: string;
    search?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const category = params.category ?? "";
  const sort = params.sort === "attention" ? "attention" : "recent";
  const requestedStatus = params.status ?? "";
  const search = params.search ?? "";

  if (
    sort === "attention"
    && requestedStatus
    && !ACTIVE_PUBLIC_STATUSES.includes(
      requestedStatus as (typeof ACTIVE_PUBLIC_STATUSES)[number],
    )
  ) {
    const cleanParams = new URLSearchParams({ sort });
    if (category) cleanParams.set("category", category);
    if (search) cleanParams.set("search", search);
    redirect(`/reports/list?${cleanParams.toString()}`);
  }

  const status = requestedStatus;
  const requestedPage = Number.parseInt(params.page ?? "1", 10);

  const loadPage = (pageNumber: number) =>
    getPublicReports({
      category,
      status,
      search,
      sort,
      limit: PAGE_SIZE,
      offset: (pageNumber - 1) * PAGE_SIZE,
    });

  let page = Number.isFinite(requestedPage) ? Math.max(requestedPage, 1) : 1;
  let { reports: visibleReports, total } = await loadPage(page);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Halaman di luar rentang (mis. hasil filter menyusut) → tampilkan halaman terakhir.
  if (page > totalPages && total > 0) {
    page = totalPages;
    ({ reports: visibleReports, total } = await loadPage(page));
  }

  const hasActiveFilters = !!(search || category || status);
  const activeFilterCount = [search, category, status].filter(Boolean).length;

  const query = (nextPage: number) => {
    const values = new URLSearchParams();
    if (search) values.set("search", search);
    if (category) values.set("category", category);
    if (status) values.set("status", status);
    if (sort === "attention") values.set("sort", sort);
    values.set("page", String(nextPage));
    return `/reports/list?${values.toString()}`;
  };

  const clearFiltersUrl = sort === "attention"
    ? "/reports/list?sort=attention"
    : "/reports/list";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <Link href="/reports" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-3 sm:mb-4 hover:gap-1.5 transition-all">
            ← Kembali ke laporan terbaru
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-3">
                <FileText className="h-3.5 w-3.5" />
                <span>Semua Laporan</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text">Daftar Laporan Infrastruktur</h1>
              <p className="text-sm text-text-muted mt-1.5">
                {total} laporan {hasActiveFilters ? "sesuai filter" : "terdaftar"}
              </p>
            </div>
            <Link href="/report/new" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 w-full sm:w-auto shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all">
                <Plus className="h-4 w-4" />
                <span>Buat Laporan Baru</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Filter Section - Enhanced */}
        <section className="rounded-2xl border-2 border-border bg-surface p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm" aria-label="Filter laporan">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-text">Filter & Pencarian</h2>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <Link href={clearFiltersUrl}>
                <Button variant="ghost" size="sm" className="gap-1.5 text-text-muted hover:text-text">
                  <X className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Hapus filter</span>
                  <span className="sm:hidden">Hapus</span>
                </Button>
              </Link>
            )}
          </div>

          <ReportFilters
            category={category}
            status={status}
            search={search}
            sort={sort}
            categoryOptions={[
              { value: "", label: "Semua Kategori" },
              ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
            ]}
            statusOptions={[
              { value: "", label: sort === "attention" ? "Semua Status Aktif" : "Semua Status" },
              ...(sort === "attention" ? ACTIVE_PUBLIC_STATUSES : PUBLIC_STATUSES)
                .map((value) => ({ value, label: value })),
            ]}
          />
        </section>

        {sort === "attention" && (
          <section
            aria-labelledby="engagement-ranking-explanation"
            className="mb-6 rounded-xl border border-primary/20 bg-primary-soft/50 p-4 sm:p-5"
          >
            <h2
              className="text-sm font-bold text-text"
              id="engagement-ranking-explanation"
            >
              Bagaimana urutan ini dihitung?
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
              Urutan menyeimbangkan jumlah warga pendukung unik dan jumlah laporan serupa
              yang digabung, masing-masing dengan bobot 50%. Keduanya dinormalisasi dengan
              logaritma agar jumlah yang sangat besar tidak mendominasi sendiri. Hanya
              laporan aktif yang ditampilkan. Ini menunjukkan perhatian warga, bukan
              tingkat bahaya atau prioritas penanganan resmi.
            </p>
          </section>
        )}

        {/* Results Section */}
        <Suspense fallback={<ReportListSkeleton />}>
          {visibleReports.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {visibleReports.map((report) => (
                <ReportCard key={report.id} report={toReportItem(report)} />
              ))}
            </div>
          ) : (
            <EmptyState
              hasFilters={hasActiveFilters}
              clearFiltersUrl={clearFiltersUrl}
              isAttentionRanking={sort === "attention"}
            />
          )}
        </Suspense>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-8" aria-label="Pagination laporan">
            <PaginationContent className="flex-wrap justify-center">
              <PaginationItem>
                <PaginationPrevious
                  href={query(page - 1)}
                  aria-disabled={page === 1}
                  tabIndex={page === 1 ? -1 : undefined}
                  className={page === 1 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>

              {getPaginationItems(page, totalPages).map((item, index) => (
                <PaginationItem key={`${item}-${index}`}>
                  {item === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink href={query(item)} isActive={item === page}>
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href={query(page + 1)}
                  aria-disabled={page === totalPages}
                  tabIndex={page === totalPages ? -1 : undefined}
                  className={page === totalPages ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}

type PaginationItemValue = number | "ellipsis";

function getPaginationItems(currentPage: number, totalPages: number): PaginationItemValue[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

/**
 * Empty State Component - Enhanced
 */
function EmptyState({
  hasFilters,
  clearFiltersUrl,
  isAttentionRanking,
}: {
  hasFilters: boolean;
  clearFiltersUrl: string;
  isAttentionRanking: boolean;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-surface p-8 sm:p-12 text-center">
      <div className="max-w-md mx-auto space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-soft text-primary mb-2">
          <FileText className="h-8 w-8" />
        </div>
        
        <h2 className="text-lg sm:text-xl font-bold text-text">
          {hasFilters
            ? "Tidak Ada Laporan yang Cocok"
            : isAttentionRanking
              ? "Belum Ada Laporan Aktif"
              : "Belum Ada Laporan"}
        </h2>
        
        <p className="text-sm sm:text-base text-text-muted leading-relaxed">
          {hasFilters
            ? isAttentionRanking
              ? "Tidak ditemukan laporan aktif yang sesuai dengan filter Anda. Coba sesuaikan pencarian atau hapus filter."
              : "Tidak ditemukan laporan yang sesuai dengan filter Anda. Coba sesuaikan kriteria pencarian atau hapus filter."
            : isAttentionRanking
              ? "Saat ini belum ada laporan aktif untuk ditampilkan dalam urutan Perhatian warga."
              : "Jadilah warga pertama yang melaporkan kerusakan infrastruktur di wilayah Anda."
          }
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {hasFilters ? (
            <>
              <Link href={clearFiltersUrl} className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                  <X className="h-4 w-4" />
                  <span>Hapus Semua Filter</span>
                </Button>
              </Link>
              <Link href="/reports" className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                  Lihat Semua Laporan
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/report/new" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                <span>Buat Laporan Pertama</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton Component
 */
function ReportListSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6" role="status" aria-label="Memuat laporan...">
      {[...Array(6)].map((_, i) => (
        <div 
          key={i} 
          className="rounded-xl border border-border bg-surface p-5 sm:p-6 space-y-4 animate-pulse"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 bg-border rounded-full" />
            <div className="h-4 w-20 bg-border rounded" />
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-border rounded" />
            <div className="h-4 w-full bg-border rounded" />
            <div className="h-4 w-5/6 bg-border rounded" />
          </div>
          
          {/* Location */}
          <div className="h-4 w-48 bg-border rounded" />
          
          {/* Actions */}
          <div className="pt-4 border-t border-border flex gap-2">
            <div className="h-9 w-32 bg-border rounded-lg" />
            <div className="h-9 w-28 bg-border rounded-lg" />
          </div>
        </div>
      ))}
      <span className="sr-only">Memuat daftar laporan...</span>
    </div>
  );
}
