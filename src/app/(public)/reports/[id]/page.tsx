import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import {
  IconMapPin,
  IconCalendar,
  IconThumbsUp,
  IconBuildings,
  IconGitMerge,
  IconArrowRight,
  IconShare2,
} from "@/components/shared/icons";
import { StatusBadgeClient } from "@/components/shared/status-badge-client";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getSignedCompletionEvidenceUrls,
  getSignedPhotoUrls,
} from "@/lib/reports/signed-urls";
import { notFound } from "next/navigation";
import { normalizeReportStatus } from "@/config/theme";

export const metadata: Metadata = {
  title: "Detail Laporan Infrastruktur · Noto PATI",
  description: "Rincian status penanganan, riwayat SLA, dan tindak lanjut laporan dinas di Kabupaten Pati.",
};

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  // Query data laporan, status history, foto, dan relasi duplikat
  const [
    { data: report, error: reportError },
    { data: history, error: historyError },
    { data: photos },
    { data: duplicateReports },
  ] = await Promise.all([
    supabase
      .from("reports")
      .select(
        "id, ticket_number, category, title, description, detail_location, status, created_at, latitude, longitude, location_accuracy_m, merged_into_report_id"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("report_status_history")
      .select("status, note, created_at, proof_image_url")
      .eq("report_id", id)
      .order("created_at", { ascending: true }),
    admin
      .from("report_photos")
      .select("id, storage_path, sort_order")
      .eq("report_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("reports")
      .select("id, ticket_number, created_at, detail_location, title")
      .eq("merged_into_report_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (reportError || !report) {
    notFound();
  }
  if (historyError) {
    throw new Error(`Gagal memuat riwayat laporan: ${historyError.message}`);
  }

  // Jika laporan ini digabung ke laporan lain, ambil informasi laporan utama
  let parentReport: { id: string; ticket_number: string; title: string; status: string } | null = null;
  if (report.merged_into_report_id) {
    const { data: parent } = await supabase
      .from("reports")
      .select("id, ticket_number, title, status")
      .eq("id", report.merged_into_report_id)
      .maybeSingle();
    parentReport = parent;
  }

  let signedPhotos: { id: string; signedUrl: string }[] = [];
  if (photos && photos.length > 0) {
    const signedUrlByPath = await getSignedPhotoUrls(photos.map((p) => p.storage_path));

    signedPhotos = photos
      .map((p) => {
        const url = signedUrlByPath.get(p.storage_path);
        return url ? { id: p.id, signedUrl: url } : null;
      })
      .filter((p): p is { id: string; signedUrl: string } => p !== null);
  }

  const completionPaths = (history ?? [])
    .filter((item) => item.status === "selesai" && item.proof_image_url)
    .map((item) => item.proof_image_url as string);
  const completionUrlByPath = await getSignedCompletionEvidenceUrls(completionPaths);
  const completionEvidence = (history ?? [])
    .filter((item) => item.status === "selesai" && item.proof_image_url)
    .map((item) => ({
      createdAt: item.created_at,
      note: item.note,
      signedUrl: completionUrlByPath.get(item.proof_image_url as string),
    }))
    .filter((item): item is { createdAt: string; note: string | null; signedUrl: string } => !!item.signedUrl);

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb - Enhanced */}
        <nav className="flex items-center gap-3 text-sm text-text-muted mb-4 sm:mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-text transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/reports" className="hover:text-text transition-colors">
            Laporan
          </Link>
          <span>/</span>
          <span className="text-text font-semibold font-mono">#{report.ticket_number}</span>
        </nav>

        {/* Two-Column Layout: Main Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Merged Report Warning */}
            {parentReport && (
              <div className="rounded-xl border-2 border-purple-300 bg-purple-50 p-4 sm:p-5 text-purple-950">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-200 text-purple-700">
                    <IconGitMerge className="h-4 w-4" weight="bold" />
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">Laporan Digabung</span>
                      <span className="inline-flex items-center rounded-md bg-purple-200 px-2 py-0.5 text-[11px] font-medium text-purple-800">
                        Duplikat
                      </span>
                    </div>
                    <p className="text-sm text-purple-900 leading-relaxed">
                      Laporan ini digabung karena lokasi dan jenis masalahnya sama dengan laporan lain yang sudah ada. 
                      Semua update akan diberikan di laporan utama <span className="font-semibold">{parentReport.ticket_number}</span>.
                    </p>
                    <div className="pt-1">
                      <Link href={`/reports/${parentReport.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-purple-300 bg-white hover:bg-purple-100 text-purple-900 gap-1.5 text-xs font-medium"
                        >
                          <span>Buka Laporan Utama</span>
                          <IconArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Report Card */}
            <article className="rounded-2xl border-2 border-border bg-surface p-5 sm:p-6 lg:p-8 shadow-sm space-y-6">
              {/* Header: Status + Date */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
                <div className="flex flex-wrap items-center gap-2.5">
                  <StatusBadgeClient status={normalizeReportStatus(report.status)} size="md" showIcon={true} />
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary-soft text-primary-dark">
                    {report.category}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <IconCalendar className="h-4 w-4" />
                  <time dateTime={report.created_at}>
                    {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(report.created_at))}
                  </time>
                </div>
              </div>

              {/* Title - Enhanced Size */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text leading-tight">
                  {report.title}
                </h1>
                <div className="mt-3 flex items-start gap-2 text-sm text-text-muted">
                  <IconMapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span>{report.detail_location}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-text">Deskripsi Masalah</h2>
                <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                  {report.description}
                </p>
              </div>

              {/* Photos Section - Enhanced Grid */}
              {signedPhotos.length > 0 && (
                <Suspense fallback={<PhotosSkeleton count={signedPhotos.length} />}>
                  <div className="space-y-3">
                    <h2 className="text-base font-semibold text-text">Foto Laporan</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {signedPhotos.map((photo, index) => (
                        <a 
                          key={photo.id} 
                          href={photo.signedUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="block overflow-hidden rounded-lg border-2 border-border hover:border-primary transition-all hover:shadow-md group"
                        >
                          <Image 
                            src={photo.signedUrl} 
                            alt={`Foto laporan ${report.title} (${index + 1} dari ${signedPhotos.length})`}
                            width={400} 
                            height={300} 
                            className="aspect-video w-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            priority={index === 0}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                </Suspense>
              )}

              {/* Completion Evidence - Keep, but cleaner */}
              {completionEvidence.length > 0 && (
                <section className="space-y-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 sm:p-5">
                  <div>
                    <h2 className="text-base font-semibold text-emerald-950">
                      Bukti Penyelesaian
                    </h2>
                    <p className="mt-1 text-sm text-emerald-900">
                      Foto ini diunggah oleh Admin sebagai dokumentasi penyelesaian laporan.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {completionEvidence.map((evidence, index) => (
                      <div key={`${evidence.signedUrl}-${evidence.createdAt}`} className="overflow-hidden rounded-lg border-2 border-emerald-300 bg-white group">
                        <a href={evidence.signedUrl} target="_blank" rel="noreferrer">
                          <Image
                            src={evidence.signedUrl}
                            alt={`Bukti penyelesaian laporan ${report.title} (${index + 1})`}
                            width={400}
                            height={300}
                            className="aspect-video w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </a>
                        {evidence.note && (
                          <p className="p-3 text-sm leading-relaxed text-text-muted border-t border-emerald-200">{evidence.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Related Duplicate Reports - Simplified */}
              {duplicateReports && duplicateReports.length > 0 && (
                <section className="space-y-3 rounded-xl border-2 border-purple-200 bg-white p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100 text-purple-700">
                        <IconGitMerge className="h-3.5 w-3.5" weight="bold" />
                      </div>
                      <h2 className="text-base font-semibold text-text">Laporan Terkait</h2>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                      {duplicateReports.length} laporan serupa
                    </span>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">
                    Laporan berikut di lokasi berdekatan digabungkan ke tiket ini.
                  </p>
                  <div className="divide-y divide-border border-t border-border">
                    {duplicateReports.map((dup) => (
                      <div key={dup.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-mono text-text-muted min-w-0 flex-1">
                          <span className="font-semibold text-text">{dup.ticket_number}</span>
                          <span className="text-border">·</span>
                          <span className="text-xs truncate">
                            {new Intl.DateTimeFormat("id-ID", { dateStyle: "short" }).format(new Date(dup.created_at))}
                          </span>
                        </div>
                        <Link
                          href={`/reports/${dup.id}`}
                          className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-medium text-sm hover:underline shrink-0"
                        >
                          <span className="hidden sm:inline">Lihat</span>
                          <IconArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Status History - Enhanced Timeline */}
              <div className="space-y-3">
                <h2 className="text-base font-semibold text-text">Riwayat Status</h2>
                <div className="space-y-3">
                  {(history ?? []).map((item, index) => (
                    <div key={`${item.status}-${item.created_at}`} className="flex gap-4">
                      {/* Timeline Indicator */}
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft border-2 border-primary">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                        {index < (history?.length ?? 0) - 1 && (
                          <div className="w-0.5 h-full bg-border mt-1" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <StatusBadgeClient status={normalizeReportStatus(item.status)} size="sm" showIcon={true} />
                          <time className="text-xs text-text-muted">
                            {new Intl.DateTimeFormat("id-ID", { 
                              dateStyle: "medium", 
                              timeStyle: "short" 
                            }).format(new Date(item.created_at))}
                          </time>
                        </div>
                        {item.note && (
                          <p className="text-sm text-text-muted leading-relaxed mt-1">{item.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar Column */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Quick Info Card */}
            <div className="rounded-xl border-2 border-border bg-surface p-4 sm:p-5 space-y-4 sticky top-4">
              <h2 className="text-base font-semibold text-text">Informasi Laporan</h2>
              
              {/* Metadata Grid */}
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-text-muted mb-1">Nomor Tiket</dt>
                  <dd className="font-semibold text-text font-mono">{report.ticket_number}</dd>
                </div>
                <div>
                  <dt className="text-text-muted mb-1">Status Saat Ini</dt>
                  <dd>
                    <StatusBadgeClient status={normalizeReportStatus(report.status)} size="sm" showIcon={true} />
                  </dd>
                </div>
                <div>
                  <dt className="text-text-muted mb-1">Kategori</dt>
                  <dd className="font-medium text-text">{report.category}</dd>
                </div>
                <div>
                  <dt className="text-text-muted mb-1">Dilaporkan</dt>
                  <dd className="font-medium text-text">
                    {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(report.created_at))}
                  </dd>
                </div>
                {report.location_accuracy_m && (
                  <div>
                    <dt className="text-text-muted mb-1">Akurasi Lokasi</dt>
                    <dd className="font-medium text-text">±{report.location_accuracy_m} meter</dd>
                  </div>
                )}
              </dl>

              {/* Action Buttons - Stacked */}
              <div className="pt-4 border-t border-border space-y-2">
                <Button variant="default" size="default" className="w-full gap-2 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all">
                  <IconThumbsUp className="h-4 w-4" />
                  <span>Dukung Laporan Ini</span>
                  <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                    42
                  </span>
                </Button>
                
                <Link href={`/map?reportId=${report.id}`} className="block">
                  <Button variant="outline" size="default" className="w-full gap-2 hover:scale-[1.02] active:scale-95 transition-all">
                    <IconMapPin className="h-4 w-4" />
                    <span>Lihat di Peta</span>
                  </Button>
                </Link>

                <Button variant="ghost" size="default" className="w-full gap-2 hover:scale-[1.02] active:scale-95 transition-all">
                  <IconShare2 className="h-4 w-4" />
                  <span>Bagikan Laporan</span>
                </Button>
              </div>

              {/* Official Response - Integrated */}
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex items-center gap-2 text-primary-dark">
                  <IconBuildings className="h-4 w-4" />
                  <span className="text-sm font-semibold">Tindak Lanjut Dinas</span>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">
                  Informasi tindak lanjut akan diperbarui setelah proses verifikasi laporan.
                </p>
              </div>

              {/* Back Link */}
              <div className="pt-4 border-t border-border">
                <Link href="/reports">
                  <Button variant="ghost" size="sm" className="w-full">
                    ← Kembali ke Daftar Laporan
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/**
 * Photos Loading Skeleton
 */
function PhotosSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      <div className="h-6 w-32 bg-border rounded animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="aspect-video bg-border rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
