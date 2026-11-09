"use client";

import * as React from "react";
import Link from "@/components/shared/route-link";
import {
  IconArrowRight,
  IconCheckCircle,
  IconShieldWarning,
  IconWarning,
  IconBookOpen,
} from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  getVisualEducationForCategory,
  trackCareEvent,
  type VisualActionItem,
} from "../visual-education";

interface VisualEducationCardProps {
  category: string;
  reportId?: string;
  ticketNumber?: string;
}

function ActionIcon({ type }: { type: VisualActionItem["iconType"] }) {
  switch (type) {
    case "avoid":
      return <IconWarning className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />;
    case "flag":
      return <IconShieldWarning className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />;
    default:
      return <IconCheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />;
  }
}

export function VisualEducationCard({
  category,
  reportId,
  ticketNumber,
}: VisualEducationCardProps) {
  const data = React.useMemo(() => getVisualEducationForCategory(category), [category]);

  React.useEffect(() => {
    if (data) {
      trackCareEvent("card_viewed", data.category, reportId);
    }
  }, [data, reportId]);

  if (!data) return null;

  const { Illustration } = data;

  return (
    <section
      aria-labelledby="care-card-title"
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs transition-all hover:shadow-md"
    >
      {/* Top Banner & Header */}
      <div className="border-b border-border bg-primary-soft/40 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-white text-xs font-bold">
            <IconBookOpen className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-bold text-primary-dark tracking-wide uppercase">
            Edukasi Kontekstual · {data.categoryLabel}
          </span>
        </div>
        <span className="text-[11px] text-text-muted">
          Relevan dengan laporan {ticketNumber ? `#${ticketNumber}` : "Anda"}
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Visual-First Grid: Illustration + Short Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Informative SVG Illustration */}
          <div
            className={`md:col-span-5 overflow-hidden rounded-xl border border-border bg-background shadow-2xs ${
              data.visualKind === "icon"
                ? "flex aspect-[4/3] items-center justify-center bg-primary-soft/30"
                : ""
            }`}
          >
            {data.visualKind === "icon" ? (
              <Illustration
                role="img"
                aria-label={data.illustrationAlt}
                className="h-16 w-16 text-primary-dark"
              />
            ) : (
              <Illustration className="w-full h-auto object-cover" />
            )}
          </div>

          {/* Title, Summary & Impact */}
          <div className="md:col-span-7 space-y-2.5">
            <h2 id="care-card-title" className="text-lg sm:text-xl font-extrabold text-text tracking-tight">
              {data.title}
            </h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              {data.summary}
            </p>
            <div className="rounded-lg border border-red-200/70 bg-red-50/50 p-2.5 text-xs text-red-950 flex items-start gap-2">
              <IconWarning className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed"><strong>Dampak:</strong> {data.impact}</span>
            </div>
          </div>
        </div>

        {/* Actionable & Prevention 2-Column Grid (Max 3 items each) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Safe Actions */}
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 space-y-2">
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
              <IconCheckCircle className="h-4 w-4 text-emerald-700" />
              Tindakan Aman Warga
            </h3>
            <ul className="space-y-1.5 text-xs text-emerald-950">
              {data.safeActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <ActionIcon type={action.iconType} />
                  <span>{action.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prevention Steps */}
          <div className="rounded-xl border border-border bg-surface/70 p-4 space-y-2">
            <h3 className="text-xs font-bold text-text uppercase tracking-wide flex items-center gap-1.5">
              <IconShieldWarning className="h-4 w-4 text-primary" />
              Langkah Pencegahan Bersama
            </h3>
            <ul className="space-y-1.5 text-xs text-text-muted">
              {data.prevention.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <ActionIcon type={item.iconType} />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Primary CTA Action Row */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Link
              href={`/care/${data.fullArticleSlug}`}
              onClick={() => trackCareEvent("click_learn_more", data.category, reportId)}
            >
              <Button size="sm" className="gap-1.5 text-xs font-semibold shadow-2xs">
                <span>Pelajari Selengkapnya</span>
                <IconArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {reportId && (
            <Link
              href={`/reports/${reportId}`}
              onClick={() => trackCareEvent("click_view_report", data.category, reportId)}
            >
              <Button variant="ghost" size="sm" className="text-xs text-text-muted hover:text-text">
                <span>Lihat Detail Laporan</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export function VisualEducationCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-surface p-6 space-y-4">
      <div className="h-5 w-40 rounded bg-border/60" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-5 h-36 rounded-xl bg-border/40" />
        <div className="md:col-span-7 space-y-2">
          <div className="h-6 w-3/4 rounded bg-border/60" />
          <div className="h-4 w-full rounded bg-border/40" />
          <div className="h-4 w-5/6 rounded bg-border/40" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="h-24 rounded-xl bg-border/30" />
        <div className="h-24 rounded-xl bg-border/30" />
      </div>
    </div>
  );
}
