"use client";

/**
 * Public Map Section Component
 * Embedded map section for dashboard/landing page
 * Shows interactive map of report locations
 */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";

const PublicReportsMap = dynamic(
  () => import("@/components/map/PublicReportsMap"),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        className="flex h-full items-center justify-center bg-background text-sm text-text-muted"
      >
        Menyiapkan peta laporan...
      </div>
    ),
  },
);

type ReportStatus = "diterima" | "diverifikasi" | "diproses" | "selesai" | "ditolak";

interface PublicMapSectionProps {
  /**
   * Height of the map container
   * @default "500px"
   */
  height?: string;
  /**
   * Show filter controls
   * @default true
   */
  showFilters?: boolean;
  /**
   * Initial filter statuses
   */
  initialStatuses?: ReportStatus[];
}

export function PublicMapSection({
  height = "500px",
  showFilters = true,
  initialStatuses = [],
}: PublicMapSectionProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<ReportStatus[]>(initialStatuses);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = mapSectionRef.current;
    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoadMap(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const toggleStatus = (status: ReportStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
  };

  const hasActiveFilters = selectedStatuses.length > 0;

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-2">
            <MapPin className="h-3.5 w-3.5" />
            <span>Peta Interaktif</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-text">
            Sebaran Laporan Warga
          </h2>
          <p className="text-sm text-text-muted mt-1 leading-relaxed">
            Lihat sebaran laporan infrastruktur di Kabupaten Pati. Laporan yang berdekatan dikelompokkan pada peta.
          </p>
        </div>
      </div>

      {/* Filters Bar (Optional) */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 p-4 bg-surface border border-border rounded-xl">
          <span className="text-xs font-semibold text-text mr-1">Filter Status:</span>

          <button
            type="button"
            onClick={() => toggleStatus("diterima")}
            aria-pressed={selectedStatuses.includes("diterima")}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 ${
              selectedStatuses.includes("diterima")
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-surface border border-border text-text hover:border-primary"
            }`}
          >
            Diterima
          </button>

          <button
            type="button"
            onClick={() => toggleStatus("diverifikasi")}
            aria-pressed={selectedStatuses.includes("diverifikasi")}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 ${
              selectedStatuses.includes("diverifikasi")
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-surface border border-border text-text hover:border-primary"
            }`}
          >
            Diverifikasi
          </button>

          <button
            type="button"
            onClick={() => toggleStatus("diproses")}
            aria-pressed={selectedStatuses.includes("diproses")}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 ${
              selectedStatuses.includes("diproses")
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-surface border border-border text-text hover:border-primary"
            }`}
          >
            Diproses
          </button>

          <button
            type="button"
            onClick={() => toggleStatus("selesai")}
            aria-pressed={selectedStatuses.includes("selesai")}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 ${
              selectedStatuses.includes("selesai")
                ? "bg-green-600 text-white shadow-sm"
                : "bg-surface border border-border text-text hover:border-primary"
            }`}
          >
            Selesai
          </button>

          <button
            type="button"
            onClick={() => toggleStatus("ditolak")}
            aria-pressed={selectedStatuses.includes("ditolak")}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 ${
              selectedStatuses.includes("ditolak")
                ? "bg-red-600 text-white shadow-sm"
                : "bg-surface border border-border text-text hover:border-primary"
            }`}
          >
            Ditolak
          </button>

          {hasActiveFilters && (
            <>
              <div className="w-px h-5 bg-border mx-1" />
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs px-2.5 py-1.5 rounded-lg font-medium text-text-muted hover:text-text hover:bg-surface border border-transparent hover:border-border transition-all"
              >
                <span className="inline-flex items-center gap-1.5">
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Reset filter
                </span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Map Container */}
      <div className="overflow-hidden rounded-2xl border-2 border-border bg-surface shadow-sm">
        <div ref={mapSectionRef} style={{ height }}>
          {shouldLoadMap ? (
            <PublicReportsMap
              adminMode={false}
              filters={{
                statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
              }}
            />
          ) : (
            <div
              role="status"
              className="flex h-full flex-col items-center justify-center gap-2 bg-background px-6 text-center text-sm text-text-muted"
            >
              <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
              <span>Peta dimuat saat bagian ini terlihat.</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 p-4 bg-surface border border-border rounded-xl text-xs">
        <span className="font-semibold text-text">Legenda:</span>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          <span className="text-text-muted">Diterima</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-purple-600" />
          <span className="text-text-muted">Diverifikasi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-600" />
          <span className="text-text-muted">Diproses</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
          <span className="text-text-muted">Selesai</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-600" />
          <span className="text-text-muted">Ditolak</span>
        </div>
      </div>
    </section>
  );
}
