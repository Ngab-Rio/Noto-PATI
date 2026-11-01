"use client";

import type { BasemapMode } from "../map-types";

interface MapBasemapControlProps {
  currentMode: BasemapMode;
  onChange: (mode: BasemapMode) => void;
}

export function MapBasemapControl({
  currentMode,
  onChange,
}: MapBasemapControlProps) {
  return (
    <div
      className="absolute right-3 top-3 z-20 flex overflow-hidden rounded-lg border border-gray-200 bg-white/95 p-1 shadow-md backdrop-blur-md"
      role="group"
      aria-label="Pilihan tampilan basemap"
    >
      <button
        type="button"
        onClick={() => onChange("streets")}
        aria-pressed={currentMode === "streets"}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
          currentMode === "streets"
            ? "bg-gray-800 text-white shadow-xs"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        Peta
      </button>

      <button
        type="button"
        onClick={() => onChange("satellite")}
        aria-pressed={currentMode === "satellite"}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
          currentMode === "satellite"
            ? "bg-gray-800 text-white shadow-xs"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        Satelit
      </button>
    </div>
  );
}
