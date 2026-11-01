"use client";

import { useState } from "react";
import { STATUS_COLORS, STATUS_LABELS } from "../map-constants";

interface MapLegendProps {
  reportCount: number;
}

const CLUSTER_RANGES = [
  { color: "#3B82F6", label: "2–9 laporan" },
  { color: "#2563EB", label: "10–49 laporan" },
  { color: "#D97706", label: "50–99 laporan" },
  { color: "#DC2626", label: "100+ laporan" },
];

export function MapLegend({ reportCount }: MapLegendProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (reportCount === 0) return null;

  return (
    <div className="absolute bottom-4 left-4 z-20">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur-md transition-all">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50/80 transition-colors"
        >
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span>Legenda Peta</span>
          <svg
            className={`h-3.5 w-3.5 text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m5 7 5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="min-w-[160px] space-y-3 border-t border-gray-100 p-3">
            {/* Cluster Range section */}
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Klaster Laporan
              </p>
              <div className="space-y-1">
                {CLUSTER_RANGES.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[11px] text-gray-600">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status section */}
            <div className="border-t border-gray-100 pt-2">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Status Titik
              </p>
              <div className="space-y-1">
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[11px] capitalize text-gray-600">
                      {STATUS_LABELS[status] ?? status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
