import Link from "next/link";
import {
  IconArrowRight,
  IconClock,
  IconCalendar,
  IconBuildings,
  IconBookOpen,
} from "@/components/shared/icons";
import type { CareArticle } from "../types";
import { CARE_CATEGORIES } from "../types";

interface CareCardProps {
  article: CareArticle;
  compact?: boolean;
}

export function CareCard({ article, compact = false }: CareCardProps) {
  const categoryMeta = CARE_CATEGORIES[article.category] ?? {
    label: article.category,
    dinas: "Dinas Terkait",
  };

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(article.reviewedAt));

  if (compact) {
    return (
      <article className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/40 hover:shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-dark bg-primary-soft px-2 py-0.5 rounded">
              <IconBookOpen className="h-3 w-3" />
              {categoryMeta.label}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-text-muted">
              <IconClock className="h-3 w-3" />
              {article.readTimeMinutes} menit baca
            </span>
          </div>

          <h3 className="text-sm font-semibold text-text group-hover:text-primary transition-colors line-clamp-2">
            <Link href={`/care/${article.slug}`}>{article.title}</Link>
          </h3>

          <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-xs">
          <span className="text-[11px] text-text-muted flex items-center gap-1">
            <IconBuildings className="h-3 w-3" />
            {categoryMeta.dinas}
          </span>
          <Link
            href={`/care/${article.slug}`}
            className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-dark transition-colors"
          >
            <span>Pelajari</span>
            <IconArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-md">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-dark bg-primary-soft px-2.5 py-1 rounded-md">
              <IconBookOpen className="h-3.5 w-3.5" />
              {categoryMeta.label}
            </span>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <IconBuildings className="h-3.5 w-3.5" />
              {categoryMeta.dinas}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <IconClock className="h-3.5 w-3.5" />
            {article.readTimeMinutes} menit
          </span>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-text group-hover:text-primary transition-colors">
          <Link href={`/care/${article.slug}`}>{article.title}</Link>
        </h2>

        <p className="text-sm text-text-muted leading-relaxed line-clamp-3">
          {article.summary}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-text-muted flex items-center gap-1.5">
          <IconCalendar className="h-3.5 w-3.5" />
          Ditinjau: {formattedDate}
        </span>
        <Link
          href={`/care/${article.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          <span>Baca Panduan</span>
          <IconArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
}

