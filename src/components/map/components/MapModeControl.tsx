"use client";

import type { MapMode } from "../map-density";

interface MapModeControlProps {
  currentMode: MapMode;
  onChange: (mode: MapMode) => void;
}

const MODES: { value: MapMode; label: string }[] = [
  { value: "heatmap", label: "Heatmap" },
  { value: "cluster", label: "Klaster" },
];

export function MapModeControl({
  currentMode,
  onChange,
}: MapModeControlProps) {
  return (
    <div
      className="absolute left-4 top-20 z-20 flex overflow-hidden rounded-lg border border-gray-200 bg-white/95 p-1 shadow-md backdrop-blur-md"
      role="group"
      aria-label="Pilihan mode tampilan peta"
    >
      {MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          onClick={() => onChange(mode.value)}
          aria-pressed={currentMode === mode.value}
          className={`min-h-11 cursor-pointer rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
            currentMode === mode.value
              ? "bg-gray-800 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
