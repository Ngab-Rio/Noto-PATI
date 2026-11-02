"use client";

interface MapResetButtonProps {
  onReset: () => void;
}

export function MapResetButton({ onReset }: MapResetButtonProps) {
  return (
    <button
      type="button"
      onClick={onReset}
      aria-label="Kembali ke pusat peta laporan"
      title="Kembali ke pusat peta laporan"
      className="absolute bottom-20 right-3 z-10 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 text-xs font-semibold text-gray-700 shadow-md backdrop-blur-md transition-all hover:bg-gray-50 active:scale-95"
    >
      <span role="img" aria-hidden="true">
        🎯
      </span>
      <span>Reset View</span>
    </button>
  );
}
