"use client";

import { useState } from "react";
import { DENSITY_COLORS } from "@/config/theme";
import { STATUS_COLORS, STATUS_LABELS } from "../map-constants";
import type { MapMode } from "../map-density";

interface MapLegendProps {
  reportCount: number;
  mode: MapMode;
  statuses: readonly string[];
}

const CLUSTER_RANGES = [
  { color: DENSITY_COLORS.low.hex, label: "2-5 laporan" },
  { color: DENSITY_COLORS.mid.hex, label: "6-20 laporan" },
  { color: DENSITY_COLORS.high.hex, label: "21+ laporan" },
];

export function MapLegend({ reportCount, mode, statuses }: MapLegendProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (reportCount === 0) return null;

  return (
    <div className="absolute bottom-4 left-4 z-20">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur-md transition-all">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="flex min-h-11 w-full cursor-pointer items-center gap-2 px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
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
          <div className="min-w-[180px] space-y-3 border-t border-gray-100 p-3">
            {mode === "heatmap" ? (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  Kepadatan Laporan
                </p>
                <div
                  className="h-2.5 w-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${DENSITY_COLORS.low.hex} 0%, ${DENSITY_COLORS.mid.hex} 55%, ${DENSITY_COLORS.high.hex} 100%)`,
                  }}
                />
                <div className="mt-1 flex justify-between text-[11px] text-gray-600">
                  <span>{DENSITY_COLORS.low.label}</span>
                  <span>{DENSITY_COLORS.mid.label}</span>
                  <span>{DENSITY_COLORS.high.label}</span>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  Kepadatan Klaster
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
            )}

            <div className="border-t border-gray-100 pt-2">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                Status Titik
              </p>
              <div className="space-y-1">
                {statuses.map((status) => {
                  const color = STATUS_COLORS[status];
                  if (!color) return null;
                  return (
                    <div key={status} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[11px] text-gray-600">
                        {STATUS_LABELS[status] ?? status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
