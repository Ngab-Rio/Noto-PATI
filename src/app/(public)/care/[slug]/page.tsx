import type { Metadata } from "next";
import Link from "@/components/shared/route-link";
import { notFound } from "next/navigation";
import {
  IconArrowRight,
  IconBookOpen,
  IconBuildings,
  IconCalendar,
  IconClock,
  IconFileText,
  IconFirstAid,
  IconPlusCircle,
  IconShieldCheck,
  IconWarning,
} from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { getCareArticleBySlug, getCareRecommendationsForCategory } from "@/features/care/server-data";
import { CARE_CATEGORIES } from "@/features/care/types";
import { CareSafetyNotice } from "@/features/care/components/CareSafetyNotice";
import { CareCard } from "@/features/care/components/CareCard";

interface CareArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CareArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getCareArticleBySlug(slug);

  if (!article) {
    return {
      title: "Materi Edukasi Tidak Ditemukan · Noto PATI Care",
    };
  }

  return {
    title: `${article.title} · Noto PATI Care`,
    description: article.summary,
    openGraph: {
      title: `${article.title} · Noto PATI Care`,
      description: article.summary,
      type: "article",
    },
  };
}

export default async function CareArticleDetailPage({
  params,
}: CareArticlePageProps) {
  const { slug } = await params;
  const article = await getCareArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const categoryMeta = CARE_CATEGORIES[article.category] ?? {
    label: article.category,
    dinas: "Dinas Teknis Terkait",
  };

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(new Date(article.reviewedAt));

  // Ambil rekomendasi artikel terkait
  const relatedArticles = (await getCareRecommendationsForCategory(article.category, 3))
    .filter((a) => a.id !== article.id)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-text">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/care" className="hover:text-text">
            Noto PATI Care
          </Link>
          <span>/</span>
          <span className="text-text font-medium truncate max-w-[200px] sm:max-w-xs">
            {article.title}
          </span>
        </div>

        {/* Article Header Card */}
        <article className="rounded-3xl border border-border bg-surface p-6 sm:p-10 shadow-xs space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-dark">
                  <IconBookOpen className="h-3.5 w-3.5" />
                  {categoryMeta.label}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                  <IconBuildings className="h-3.5 w-3.5" />
                  {categoryMeta.dinas}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <IconClock className="h-3.5 w-3.5" />
                  {article.readTimeMinutes} menit baca
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <IconCalendar className="h-3.5 w-3.5" />
                  Ditinjau {formattedDate}
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-text leading-snug">
              {article.title}
            </h1>

            <p className="text-base sm:text-lg text-text-muted leading-relaxed font-normal">
              {article.summary}
            </p>
          </div>

          {/* Safety Notice Banner */}
          <CareSafetyNotice />

          {/* Content Body: Mengenal Kondisi Kerusakan */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-soft text-primary text-xs font-bold">
                1
              </span>
              Mengenal Kondisi Kerusakan
            </h2>
            <div className="rounded-2xl border border-border bg-surface/50 p-5 text-sm sm:text-base text-text-muted leading-relaxed">
              {article.content}
            </div>
          </section>

          {/* Causes: Penyebab Umum Kerusakan */}
          {article.causes.length > 0 && (
            <section className="space-y-3 pt-2">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-soft text-primary text-xs font-bold">
                  2
                </span>
                Faktor Penyebab Umum
              </h2>
              <ul className="grid grid-cols-1 gap-2.5">
                {article.causes.map((cause, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5 text-xs sm:text-sm text-text leading-relaxed"
                  >
                    <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Impacts: Dampak terhadap Masyarakat & Lingkungan */}
          {article.impacts.length > 0 && (
            <section className="space-y-3 pt-2">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-soft text-primary text-xs font-bold">
                  3
                </span>
                Dampak terhadap Masyarakat & Lingkungan
              </h2>
              <ul className="grid grid-cols-1 gap-2.5">
                {article.impacts.map((impact, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-red-200/70 bg-red-50/40 p-3.5 text-xs sm:text-sm text-red-950 leading-relaxed"
                  >
                    <IconWarning className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                    <span>{impact}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Safety Actions: Tindakan Pengamanan yang Aman */}
          {article.safetyActions.length > 0 && (
            <section className="space-y-3 pt-2">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                  4
                </span>
                Tindakan Aman & Prosedur Warga
              </h2>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                  <IconFirstAid className="h-4 w-4 text-emerald-700" />
                  <span>Langkah Aman yang Dapat Dilakukan Masyarakat:</span>
                </div>
                <ul className="space-y-2.5">
                  {article.safetyActions.map((action, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-emerald-950 leading-relaxed"
                    >
                      <IconShieldCheck className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" weight="bold" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Prevention: Langkah Pencegahan Lingkungan */}
          {article.preventionSteps.length > 0 && (
            <section className="space-y-3 pt-2">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-soft text-primary text-xs font-bold">
                  5
                </span>
                Langkah Pencegahan Bersama
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {article.preventionSteps.map((step, idx) => (
                  <li
                    key={idx}
                    className="rounded-xl border border-border bg-surface p-4 text-xs sm:text-sm text-text-muted leading-relaxed"
                  >
                    <div className="font-semibold text-text mb-1 flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft text-[10px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      Pencegahan {idx + 1}
                    </div>
                    {step}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* References: Rujukan Sumber Informasi Resmi */}
          {article.references.length > 0 && (
            <section className="pt-4 border-t border-border space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <IconFileText className="h-4 w-4" />
                Referensi Sumber Informasi & Dokumen Teknis
              </h3>
              <div className="divide-y divide-border rounded-xl border border-border bg-surface">
                {article.references.map((ref, idx) => (
                  <div key={idx} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-medium text-text">{ref.title}</span>
                    <span className="text-text-muted italic">{ref.source}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Call to Action: Laporkan Jika Menemukan Serupa */}
          <div className="rounded-2xl border border-primary/20 bg-primary-soft/50 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-text">
                Menemukan Kerusakan Seperti Ini di Sekitar Anda?
              </h4>
              <p className="text-xs text-text-muted">
                Kirimkan foto dan lokasi presisi ke Noto PATI agar segera diverifikasi oleh tim dinas terkait.
              </p>
            </div>
            <Link href="/report/new">
              <Button size="sm" className="gap-2 whitespace-nowrap shadow-2xs">
                <IconPlusCircle className="h-4 w-4" />
                <span>Buat Laporan</span>
              </Button>
            </Link>
          </div>
        </article>

        {/* Related Care Articles */}
        {relatedArticles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text">
                Materi Terkait Lainnya
              </h3>
              <Link
                href="/care"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark"
              >
                <span>Lihat Semua Materi</span>
                <IconArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedArticles.map((rel) => (
                <CareCard key={rel.id} article={rel} compact={true} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
