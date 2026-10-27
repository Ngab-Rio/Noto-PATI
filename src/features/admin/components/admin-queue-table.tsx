"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Timer,
  ChevronRight,
  Filter,
  AlertTriangle,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import type { AdminReportItem } from "../types";

interface AdminQueueTableProps {
  initialReports: AdminReportItem[];
}

type TabKey = "all" | "pending" | "processing" | "overdue";

export function AdminQueueTable({ initialReports }: AdminQueueTableProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set(initialReports.map((r) => r.category));
    return Array.from(set);
  }, [initialReports]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: initialReports.length,
      pending: initialReports.filter((r) => r.status === "diterima").length,
      processing: initialReports.filter(
        (r) => r.status === "diverifikasi" || r.status === "diproses"
      ).length,
      overdue: initialReports.filter((r) => r.isOverdue).length,
    };
  }, [initialReports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return initialReports.filter((report) => {
      // Tab filter
      if (activeTab === "pending" && report.status !== "diterima") return false;
      if (
        activeTab === "processing" &&
        report.status !== "diverifikasi" &&
        report.status !== "diproses"
      )
        return false;
      if (activeTab === "overdue" && !report.isOverdue) return false;

      // Category filter
      if (selectedCategory !== "all" && report.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = report.title.toLowerCase().includes(query);
        const matchTicket = report.ticketNumber.toLowerCase().includes(query);
        const matchLocation = report.location.toLowerCase().includes(query);
        const matchReporter = report.reporterName.toLowerCase().includes(query);
        if (!matchTitle && !matchTicket && !matchLocation && !matchReporter) {
          return false;
        }
      }

      return true;
    });
  }, [initialReports, activeTab, selectedCategory, searchQuery]);

  return (
    <div className="space-y-4">
      {/* ── Tabs & Search Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-lg overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "all"
                ? "bg-primary text-text-on-primary shadow-2xs"
                : "text-text-muted hover:text-text"
            }`}
          >
            <span>Semua</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "all"
                  ? "bg-white/20 text-white"
                  : "bg-primary-soft text-primary"
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "pending"
                ? "bg-status-diterima-text text-white shadow-2xs"
                : "text-text-muted hover:text-text"
            }`}
          >
            <span>Perlu Verifikasi</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "pending"
                  ? "bg-white/20 text-white"
                  : "bg-status-diterima-bg text-status-diterima-text"
              }`}
            >
              {counts.pending}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("processing")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "processing"
                ? "bg-status-diproses-text text-white shadow-2xs"
                : "text-text-muted hover:text-text"
            }`}
          >
            <span>Diproses</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "processing"
                  ? "bg-white/20 text-white"
                  : "bg-status-diproses-bg text-status-diproses-text"
              }`}
            >
              {counts.processing}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("overdue")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "overdue"
                ? "bg-status-ditolak-text text-white shadow-2xs"
                : "text-text-muted hover:text-text"
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Terlambat SLA</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "overdue"
                  ? "bg-white/20 text-white"
                  : "bg-status-ditolak-bg text-status-ditolak-text"
              }`}
            >
              {counts.overdue}
            </span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tiket, judul, lokasi..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 pl-2.5 pr-6 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Table / Queue List ── */}
      <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="h-10 w-10 mx-auto rounded-full bg-primary-soft flex items-center justify-center text-primary mb-3">
              <Search className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-text">
              Tidak ada laporan yang sesuai kriteria
            </p>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau ubah tab status di atas.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveTab("all");
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-3 text-xs text-primary hover:underline font-semibold"
            >
              Reset semua filter
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:px-5 hover:bg-primary-soft/15 transition-colors ${
                  report.isOverdue ? "bg-status-ditolak-bg/25" : ""
                }`}
              >
                {/* Left side: status & title */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="shrink-0 mt-0.5">
                    <StatusBadge status={report.status} size="sm" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-mono font-medium text-text-muted">
                        {report.ticketNumber}
                      </span>
                      {report.priority === "tinggi" && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-status-ditolak-bg text-status-ditolak-text">
                          Prioritas Tinggi
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/admin/reports/${report.id}`}
                      className="text-sm font-semibold text-text hover:text-primary transition-colors line-clamp-1"
                    >
                      {report.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted mt-1.5">
                      <span>{report.category}</span>
                      <span>·</span>
                      <span>{report.location}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {report.supportCount} warga
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: SLA & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                  <div className="text-left sm:text-right">
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
                    <div className="text-[11px] text-text-muted mt-0.5">
                      Masuk: {report.submittedAt}
                    </div>
                  </div>

                  <Link href={`/admin/reports/${report.id}`}>
                    <Button variant="outline" size="sm" className="gap-1 h-8 text-xs font-medium">
                      <span>Tinjau</span>
                      <ChevronRight className="h-3 w-3" />
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
