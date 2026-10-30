"use client";

/**
 * Client-side Map Page Component
 * Handles filters and map interaction
 */

import { useState } from "react";
import Link from "next/link";
import { PublicReportsMap } from "@/components/map/PublicReportsMap";
import { IconMapPin, IconPlusCircle } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";

type ReportStatus = "diterima" | "diverifikasi" | "diproses" | "selesai" | "ditolak";

export function MapPageClient() {
  const [selectedStatuses, setSelectedStatuses] = useState<ReportStatus[]>([]);

  const toggleStatus = (status: ReportStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
  };

  const hasActiveFilters = selectedStatuses.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary-dark text-xs font-semibold mb-2">
                <IconMapPin className="h-3.5 w-3.5" />
                <span>Peta Interaktif Warga</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text">
                Peta Sebaran Laporan Infrastruktur
              </h1>
              <p className="text-sm text-text-muted mt-1">
                Pantau laporan masalah fasilitas publik di 21 kecamatan se-Kabupaten Pati secara transparan.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link href="/report/new">
                <Button variant="accent" className="gap-2">
                  <IconPlusCircle className="h-4 w-4" />
                  <span>Buat Laporan Baru</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Filter Status:</span>

            <button
              onClick={() => toggleStatus("diterima")}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedStatuses.includes("diterima")
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Diterima
            </button>

            <button
              onClick={() => toggleStatus("diverifikasi")}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedStatuses.includes("diverifikasi")
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Diverifikasi
            </button>

            <button
              onClick={() => toggleStatus("diproses")}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedStatuses.includes("diproses")
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Diproses
            </button>

            <button
              onClick={() => toggleStatus("selesai")}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedStatuses.includes("selesai")
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Selesai
            </button>

            <button
              onClick={() => toggleStatus("ditolak")}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedStatuses.includes("ditolak")
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Ditolak
            </button>

            {hasActiveFilters && (
              <>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  onClick={clearFilters}
                  className="text-xs px-3 py-1.5 rounded-md font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  ✕ Reset Filter
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[calc(100vh-280px)] min-h-[500px]">
        <PublicReportsMap
          filters={{
            statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
          }}
          onMarkerClick={(reportId) => {
            console.log("Marker clicked:", reportId);
          }}
        />
      </div>

      {/* Map Legend */}
      <div className="border-t border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Legenda:</span>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-600"></div>
              <span className="text-xs text-gray-600">Diterima</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-600"></div>
              <span className="text-xs text-gray-600">Diverifikasi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-600"></div>
              <span className="text-xs text-gray-600">Diproses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-600"></div>
              <span className="text-xs text-gray-600">Selesai</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-600"></div>
              <span className="text-xs text-gray-600">Ditolak</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
