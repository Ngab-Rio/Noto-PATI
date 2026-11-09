"use client";

import * as React from "react";
import Link from "@/components/shared/route-link";
import Image from "next/image";
import {
  IconGitMerge,
  IconCalendar,
  IconArrowRight,
  IconCaretDown,
  IconCaretUp,
  IconImage,
} from "@/components/shared/icons";
import { Button } from "@/components/ui/button";

export interface RelatedReportItem {
  id: string;
  ticketNumber: string;
  title: string;
  createdAt: string;
  detailLocation?: string | null;
  photoUrl?: string | null;
}

export function getDisplayedReports(
  reports: RelatedReportItem[],
  isExpanded: boolean,
  initialLimit = 3
): { displayedReports: RelatedReportItem[]; hasMore: boolean; hiddenCount: number } {
  if (!reports || reports.length === 0) {
    return { displayedReports: [], hasMore: false, hiddenCount: 0 };
  }
  const safeInitialLimit = Math.max(1, Math.floor(initialLimit));
  const hasMore = reports.length > safeInitialLimit;
  const displayedReports = isExpanded ? reports : reports.slice(0, safeInitialLimit);
  const hiddenCount = Math.max(0, reports.length - safeInitialLimit);
  return { displayedReports, hasMore, hiddenCount };
}

interface RelatedReportsThreadProps {
  parentTicketNumber: string;
  reports: RelatedReportItem[];
  initialLimit?: number;
}

export function RelatedReportsThread({
  parentTicketNumber,
  reports,
  initialLimit = 3,
}: RelatedReportsThreadProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!reports || reports.length === 0) {
    return null;
  }

  const { displayedReports, hasMore } = getDisplayedReports(
    reports,
    isExpanded,
    initialLimit
  );

  return (
    <section
      aria-labelledby="related-reports-thread-title"
      className="rounded-2xl border-2 border-purple-200/90 bg-purple-50/30 p-4 sm:p-6 space-y-4 shadow-2xs"
    >
      {/* Thread Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-purple-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700 shadow-2xs">
            <IconGitMerge className="h-4 w-4" weight="bold" />
          </div>
          <div>
            <h2 id="related-reports-thread-title" className="text-sm sm:text-base font-bold text-text">
              Laporan Terkait
            </h2>
            <p className="text-xs text-text-muted">
              Laporan warga yang digabungkan ke tiket utama #{parentTicketNumber}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          +{reports.length} Digabung
        </span>
      </div>

      {/* Vertical Thread Connector */}
      <div className="relative pl-3 sm:pl-4">
        {/* Continuous Connecting Line */}
        <div className="absolute left-[19px] sm:left-[23px] top-3 bottom-5 w-0.5 bg-purple-300" aria-hidden="true" />

        <div className="space-y-3.5">
          {displayedReports.map((item) => {
            const formattedDate = new Intl.DateTimeFormat("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(item.createdAt));

            return (
              <div key={item.id} className="relative flex items-start gap-3 sm:gap-4 group">
                {/* Thread Node / Bullet Dot */}
                <div className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface border-2 border-purple-500 shadow-2xs mt-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                </div>

                {/* Compact Clickable Card */}
                <Link
                  href={`/reports/${item.id}`}
                  className="flex-1 overflow-hidden rounded-xl border border-purple-200/80 bg-surface p-3 sm:p-3.5 shadow-2xs transition-all hover:border-purple-400 hover:shadow-xs hover:translate-x-0.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail Photo or Fallback */}
                    <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-lg border border-purple-100 bg-purple-50 flex items-center justify-center text-purple-400">
                      {item.photoUrl ? (
                        <Image
                          src={item.photoUrl}
                          alt={`Foto laporan ${item.title}`}
                          fill
                          sizes="64px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <IconImage className="h-6 w-6 opacity-60" />
                      )}
                    </div>

                    {/* Report Information */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-text truncate">
                          {item.ticketNumber}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">
                          Digabung
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-semibold text-text group-hover:text-purple-700 transition-colors line-clamp-1">
                        {item.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
                        <span className="flex items-center gap-1">
                          <IconCalendar className="h-3 w-3 shrink-0" />
                          <time dateTime={item.createdAt}>{formattedDate}</time>
                        </span>
                        {item.detailLocation && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[150px] sm:max-w-[220px]">
                              {item.detailLocation}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Arrow Indicator */}
                    <div className="shrink-0 text-text-muted group-hover:text-purple-700 pl-1">
                      <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expand / Collapse "Lihat Semua" Button */}
      {hasMore && (
        <div className="pt-1 text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            className="text-xs font-semibold text-purple-800 hover:text-purple-950 hover:bg-purple-100/70 gap-1.5 h-8"
          >
            <span>
              {isExpanded
                ? "Tampilkan Lebih Sedikit"
                : `Lihat Semua (+${reports.length - initialLimit} laporan lainnya)`}
            </span>
            {isExpanded ? (
              <IconCaretUp className="h-3.5 w-3.5" />
            ) : (
              <IconCaretDown className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      )}
    </section>
  );
}
