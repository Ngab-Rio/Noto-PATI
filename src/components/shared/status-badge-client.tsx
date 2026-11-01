"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  REPORT_STATUS_CONFIG,
  normalizeReportStatus,
  type ReportStatusKey,
} from "@/config/theme";
import {
  CheckCircle,
  ClipboardText,
  Eye,
  Hammer,
  ArrowClockwise,
  XCircle,
  GitMerge,
  LockSimple,
} from "@phosphor-icons/react";

// Status icon mapping
const STATUS_ICONS = {
  diterima: ClipboardText,        // Diterima - clipboard with checkmark
  diverifikasi: Eye,              // Diverifikasi - eye (reviewed)
  diproses: Hammer,               // Diproses - hammer (work in progress)
  selesai: CheckCircle,           // Selesai - check circle (completed)
  dibuka_kembali: ArrowClockwise, // Dibuka Kembali - arrow clockwise (reopened)
  ditolak: XCircle,               // Ditolak - X circle (rejected)
  digabung: GitMerge,             // Digabung - git merge (merged)
  ditutup: LockSimple,            // Ditutup - lock (closed)
} as const;

export interface StatusBadgeClientProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: ReportStatusKey | string;
  showDot?: boolean;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * StatusBadgeClient · Noto PATI Design System (Client Component)
 * Client-side version with Phosphor icons
 * Memenuhi standar WCAG AA (kontras minimal 4.5:1)
 */
export function StatusBadgeClient({
  status,
  showDot = false,
  showIcon = true,
  size = "md",
  className,
  ...props
}: StatusBadgeClientProps) {
  const normalizedKey = normalizeReportStatus(status);
  const config = REPORT_STATUS_CONFIG[normalizedKey] ?? REPORT_STATUS_CONFIG.diterima;
  const Icon = STATUS_ICONS[normalizedKey];

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  }[size];

  const iconSizeClasses = {
    sm: 12,
    md: 14,
    lg: 16,
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
      {showIcon && Icon && (
        <Icon 
          size={iconSizeClasses} 
          weight="bold"
          className="shrink-0"
          aria-hidden="true"
        />
      )}
      {showDot && !showIcon && (
        <span
          className={cn(
            "rounded-full shrink-0",
            dotSizeClasses,
            config.textClass.replace("text-", "bg-")
          )}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
