"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Timer,
  ChevronRight,
  Download,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import type { AdminReportItem } from "@/features/admin/types";

interface ReportsViewProps {
  initialReports: AdminReportItem[];
  defaultStatus?: string;
  defaultOverdue?: boolean;
}

export function ReportsView({
  initialReports,
  defaultStatus,
  defaultOverdue,
}: ReportsViewProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(
    defaultStatus || "all"
  );
  const [onlyOverdue, setOnlyOverdue] = useState<boolean>(
    Boolean(defaultOverdue)
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "supports" | "due">("newest");

  const categories = useMemo(() => {
    return Array.from(new Set(initialReports.map((r) => r.category)));
  }, [initialReports]);

  const filteredReports = useMemo(() => {
    return initialReports
      .filter((report) => {
        // Status filter
        if (selectedStatus !== "all" && report.status !== selectedStatus) {
          return false;
        }

        // Overdue filter
        if (onlyOverdue && !report.isOverdue) {
          return false;
        }

        // Category filter
        if (selectedCategory !== "all" && report.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = report.title.toLowerCase().includes(q);
          const matchTicket = report.ticketNumber.toLowerCase().includes(q);
          const matchLocation = report.location.toLowerCase().includes(q);
          const matchReporter = report.reporterName.toLowerCase().includes(q);
          if (!matchTitle && !matchTicket && !matchLocation && !matchReporter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "supports") {
          return b.supportCount - a.supportCount;
        }
        if (sortBy === "due") {
          if (a.isOverdue && !b.isOverdue) return -1;
          if (!a.isOverdue && b.isOverdue) return 1;
          return 0;
        }
        // Default: newest
        return b.id.localeCompare(a.id);
      });
  }, [
    initialReports,
    selectedStatus,
    onlyOverdue,
    selectedCategory,
    searchQuery,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSelectedStatus("all");
    setOnlyOverdue(false);
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("newest");
  };

  return (
    <div className="space-y-6">
      {/* ── Filters Bar ── */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor tiket (NP-2026-...), judul laporan, kecamatan, nama pelapor..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="diterima">Diterima</option>
              <option value="diverifikasi">Diverifikasi</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="ditolak">Ditolak</option>
              <option value="digabung">Digabung</option>
            </select>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "supports" | "due")}
              className="h-9 px-3 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="newest">Terbaru</option>
              <option value="supports">Dukungan Terbanyak</option>
              <option value="due">Urgensi / Batas SLA</option>
            </select>

            {/* Overdue Checkbox Toggle */}
            <button
              type="button"
              onClick={() => setOnlyOverdue(!onlyOverdue)}
              className={`h-9 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                onlyOverdue
                  ? "bg-status-ditolak-bg border-status-ditolak-text/40 text-status-ditolak-text"
                  : "bg-surface border-border text-text-muted hover:text-text"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Hanya Melewati SLA</span>
            </button>

            {/* Reset button */}
            {(selectedStatus !== "all" ||
              onlyOverdue ||
              selectedCategory !== "all" ||
              searchQuery) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-9 px-2.5 rounded-lg text-xs text-text-muted hover:text-text hover:bg-background transition-colors flex items-center gap-1"
                title="Reset filter"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border/50">
          <div>
            Menampilkan <strong>{filteredReports.length}</strong> dari{" "}
            {initialReports.length} laporan
          </div>
          <button
            type="button"
            onClick={() => alert("Fitur ekspor CSV/Rekapitulasi laporan demo")}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor Rekap Laporan</span>
          </button>
        </div>
      </div>

      {/* ── Reports List ── */}
      <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="h-12 w-12 mx-auto rounded-full bg-primary-soft flex items-center justify-center text-primary mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-text">Tidak ada laporan ditemukan</h3>
            <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
              Tidak ada data laporan yang cocok dengan kombinasi filter dan kata kunci saat ini.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="mt-4 text-xs font-semibold"
            >
              Reset Semua Filter
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-primary-soft/15 transition-colors ${
                  report.isOverdue ? "bg-status-ditolak-bg/25" : ""
                }`}
              >
                {/* Left col: Ticket, Title, Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="shrink-0 mt-0.5">
                    <StatusBadge status={report.status} size="sm" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-semibold text-text-muted">
                        {report.ticketNumber}
                      </span>
                      {report.priority === "tinggi" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-status-ditolak-bg text-status-ditolak-text">
                          Urgensi Tinggi
                        </span>
                      )}
                      <span className="text-xs text-text-muted">
                        Pelapor: <strong>{report.reporterName}</strong>
                      </span>
                    </div>

                    <Link
                      href={`/admin/reports/${report.id}`}
                      className="text-sm sm:text-base font-bold text-text hover:text-primary transition-colors block line-clamp-1"
                    >
                      {report.title}
                    </Link>

                    <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted mt-2">
                      <span className="font-medium text-text">{report.category}</span>
                      <span>·</span>
                      <span>{report.location}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-text">
                        <Users className="h-3 w-3 text-primary" />
                        {report.supportCount} warga mendukung
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right col: SLA info & action button */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/60">
                  <div className="text-left md:text-right">
                    {report.dueDateLabel && (
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          report.isOverdue
                            ? "bg-status-ditolak-bg text-status-ditolak-text"
                            : "bg-status-diverifikasi-bg text-status-diverifikasi-text"
                        }`}
                      >
                        <Timer className="h-3 w-3" />
                        {report.dueDateLabel}
                      </span>
                    )}
                    <div className="text-[11px] text-text-muted mt-1">
                      Diterima: {report.submittedAt}
                    </div>
                  </div>

                  <Link href={`/admin/reports/${report.id}`}>
                    <Button size="sm" className="gap-1 text-xs font-semibold h-9">
                      <span>Kelola & Tinjau</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
