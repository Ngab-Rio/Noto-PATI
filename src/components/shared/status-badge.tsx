import * as React from "react";
import { cn } from "@/lib/utils";
import {
  REPORT_STATUS_CONFIG,
  normalizeReportStatus,
  type ReportStatusKey,
} from "@/config/theme";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: ReportStatusKey | string;
  showDot?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * StatusBadge · Noto PATI Design System
 * Memenuhi standar WCAG AA (kontras minimal 4.5:1) sesuai spesifikasi PDF Style Guide.
 * Mendukung status utama (Diterima, Diverifikasi, Diproses, Selesai)
 * dan status lainnya (Dibuka Kembali, Ditolak, Digabung, Ditutup).
 */
export function StatusBadge({
  status,
  showDot = true,
  size = "md",
  className,
  ...props
}: StatusBadgeProps) {
  const normalizedKey = normalizeReportStatus(status);
  const config = REPORT_STATUS_CONFIG[normalizedKey] ?? REPORT_STATUS_CONFIG.diterima;

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  }[size];

  const dotSizeClasses = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  }[size];

  return (
    <span
      data-status={normalizedKey}
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-colors select-none",
        config.badgeClass,
        sizeClasses,
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          className={cn(
            "rounded-full shrink-0",
            dotSizeClasses,
            // Menggunakan warna text sebagai fill dot agar harmonis dan ber-kontras tinggi
            config.textClass.replace("text-", "bg-")
          )}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
