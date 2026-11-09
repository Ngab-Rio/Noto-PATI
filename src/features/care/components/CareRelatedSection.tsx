import Link from "@/components/shared/route-link";
import { IconLightbulb, IconArrowRight, IconSparkle } from "@/components/shared/icons";
import { getCareRecommendationsForCategory } from "../server-data";
import { CareCard } from "./CareCard";

interface CareRelatedSectionProps {
  category: string;
  isJustSubmitted?: boolean;
}

export async function CareRelatedSection({
  category,
  isJustSubmitted = false,
}: CareRelatedSectionProps) {
  const recommendations = await getCareRecommendationsForCategory(category, 2);

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-5 sm:p-6 space-y-4 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-2xs">
            {isJustSubmitted ? (
              <IconSparkle className="h-4 w-4" weight="fill" />
            ) : (
              <IconLightbulb className="h-4 w-4" weight="bold" />
            )}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text">
              {isJustSubmitted
                ? "Laporan Diterima! Pelajari Kondisi Infrastruktur Ini"
                : "Noto PATI Care: Edukasi Infrastruktur Terkait"}
            </h3>
            <p className="text-xs text-text-muted">
              {isJustSubmitted
                ? "Sambil menunggu verifikasi dinas, kenali penyebab, dampak, dan tindakan aman di sekitar lokasi."
                : "Panduan edukasi warga mengenali penyebab kerusakan dan langkah keselamatan awal."}
            </p>
          </div>
        </div>

        <Link
          href="/care"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          <span>Pusat Edukasi Care</span>
          <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {recommendations.map((article) => (
          <CareCard key={article.id} article={article} compact={true} />
        ))}
      </div>
    </section>
  );
}
