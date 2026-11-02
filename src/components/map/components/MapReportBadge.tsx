"use client";

interface MapReportBadgeProps {
  count: number;
}

export function MapReportBadge({ count }: MapReportBadgeProps) {
  return (
    <div className="absolute left-4 top-4 z-20 rounded-xl border border-gray-200/80 bg-white/95 px-3.5 py-2 shadow-md backdrop-blur-md">
      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
        Total Titik
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-extrabold text-blue-600 tabular-nums">
          {count}
        </span>
        <span className="text-[11px] text-gray-500 font-medium">laporan</span>
      </div>
    </div>
  );
}
