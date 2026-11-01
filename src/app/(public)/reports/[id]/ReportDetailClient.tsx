"use client";

import { StatusBadgeClient } from "@/components/shared/status-badge-client";
import type { ReportStatusKey } from "@/config/theme";

interface ReportHeaderClientProps {
  status: ReportStatusKey | string;
  category: string;
  createdAt: string;
  IconCalendar: React.ComponentType<{ className?: string }>;
}

export function ReportHeaderClient({ 
  status, 
  category, 
  createdAt,
  IconCalendar 
}: ReportHeaderClientProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div className="flex items-center gap-2.5">
        <StatusBadgeClient status={status} size="md" showIcon={true} />
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary-soft text-primary-dark">
          {category}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-text-muted">
        <IconCalendar className="h-4 w-4" />
        <span>Dilaporkan: {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(createdAt))}</span>
      </div>
    </div>
  );
}

interface StatusHistoryItemProps {
  status: ReportStatusKey | string;
  note?: string;
  createdAt: string;
}

export function StatusHistoryItem({ status, note, createdAt }: StatusHistoryItemProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3 text-sm">
      <div>
        <StatusBadgeClient status={status} size="sm" showIcon={true} />
        {note && <p className="mt-1 text-text-muted">{note}</p>}
      </div>
      <time className="text-xs text-text-muted whitespace-nowrap">
        {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(createdAt))}
      </time>
    </div>
  );
}
