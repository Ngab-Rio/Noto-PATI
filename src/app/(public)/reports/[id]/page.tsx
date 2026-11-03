import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  IconMapPin,
  IconCalendar,
  IconThumbsUp,
  IconBuildings,
  IconGitMerge,
  IconArrowRight,
} from "@/components/shared/icons";
import { StatusBadgeClient } from "@/components/shared/status-badge-client";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSignedPhotoUrls } from "@/lib/reports/signed-urls";
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
    { data: history },
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
      .select("status, note, created_at")
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

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-text">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/map" className="hover:text-text">
            Laporan
          </Link>
          <span>/</span>
          <span className="text-text font-mono font-medium">#{report.id}</span>
        </div>

        {/* Main Report Card */}
        <article className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6">
          {parentReport && (
            <div className="rounded-xl border border-purple-200/90 bg-purple-50/60 p-4 sm:p-5 text-purple-950">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <IconGitMerge className="h-4 w-4" weight="bold" />
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-purple-950">Laporan Ini Telah Digabung Otomatis</span>
                    <span className="inline-flex items-center rounded-md bg-purple-150 px-2 py-0.5 text-[11px] font-medium text-purple-800 bg-purple-200/60">
                      Duplikat
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-purple-900/80 leading-relaxed">
                    Sistem mendeteksi kategori dan koordinat lokasi kerusakan ini serupa dengan laporan yang telah masuk terlebih dahulu.
                    Seluruh penanganan, progres lapangan, dan SLA dipusatkan pada laporan utama{" "}
                    <span className="font-mono font-semibold text-purple-950">{parentReport.ticket_number}</span>.
                  </p>
                  <div className="pt-1.5">
                    <Link href={`/reports/${parentReport.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-purple-200 bg-white hover:bg-purple-100/70 text-purple-900 hover:text-purple-950 gap-1.5 text-xs font-medium shadow-2xs"
                      >
                        <span>Buka Laporan Utama ({parentReport.ticket_number})</span>
                        <IconArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <StatusBadgeClient status={normalizeReportStatus(report.status)} size="md" showIcon={true} />
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary-soft text-primary-dark">
                {report.category}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <IconCalendar className="h-4 w-4" />
              <span>Dilaporkan: {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(report.created_at))}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-mono text-text-muted block mb-1">
              Tiket: {report.ticket_number} · ID: {report.id}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-text">
              {report.title}
            </h1>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-text-muted">
              <IconMapPin className="h-4 w-4 text-accent" />
              <span>{report.detail_location}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-text">Deskripsi Masalah:</h2>
            <p className="text-sm text-text-muted leading-relaxed">
              {report.description}
            </p>
          </div>

          {signedPhotos.some(Boolean) && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-text">Foto Laporan:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {signedPhotos.filter((photo): photo is { id: string; signedUrl: string } => photo !== null).map((photo) => (
                  <a key={photo.id} href={photo.signedUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-border">
                    <Image src={photo.signedUrl} alt="Foto kerusakan fasilitas publik" width={800} height={450} unoptimized className="aspect-video w-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {duplicateReports && duplicateReports.length > 0 && (
            <section className="rounded-xl border border-purple-200/70 bg-purple-50/40 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-150 text-purple-700 bg-purple-100">
                    <IconGitMerge className="h-3.5 w-3.5" weight="bold" />
                  </div>
                  <h2 className="text-sm font-semibold text-text">Laporan Terkait dari Warga Sekitar</h2>
                </div>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200/50">
                  +{duplicateReports.length} digabung
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Terdapat {duplicateReports.length} laporan serupa di lokasi berdekatan yang otomatis digabungkan ke tiket ini sebagai informasi penguat.
              </p>
              <div className="divide-y divide-purple-100/80 border-t border-purple-100/80 pt-1">
                {duplicateReports.map((dup) => (
                  <div key={dup.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2 font-mono text-text-muted">
                      <span className="font-semibold text-text">{dup.ticket_number}</span>
                      <span className="text-border">·</span>
                      <span className="text-[11px] font-sans text-text-muted">
                        {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(dup.created_at))}
                      </span>
                    </div>
                    <Link
                      href={`/reports/${dup.id}`}
                      className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 font-medium text-xs hover:underline"
                    >
                      <span>Lihat detail</span>
                      <IconArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-text">Riwayat Status:</h2>
            <div className="space-y-2">
              {(history ?? []).map((item) => (
                <div key={`${item.status}-${item.created_at}`} className="flex items-start justify-between gap-4 rounded-lg border border-border p-3 text-sm">
                  <div>
                    <StatusBadgeClient status={normalizeReportStatus(item.status)} size="sm" showIcon={true} />
                    {item.note && <p className="mt-1 text-text-muted">{item.note}</p>}
                  </div>
                  <time className="text-xs text-text-muted whitespace-nowrap">
                    {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at))}
                  </time>
                </div>
              ))}
            </div>
          </div>

          {/* Blok Tindak Lanjut Dinas (Primary/Soft) */}
          <div className="rounded-xl bg-primary-soft p-5 border border-primary/20 text-text space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold text-primary-dark">
                <IconBuildings className="h-5 w-5" />
                <span className="text-sm">Tindak Lanjut Dinas Teknis Terkait</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                Status laporan: {normalizeReportStatus(report.status)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed pl-7">
              Informasi tindak lanjut akan diperbarui setelah proses verifikasi laporan.
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="accent" size="sm" className="gap-1.5">
                <IconThumbsUp className="h-4 w-4" />
                <span>Dukung Laporan Ini</span>
                <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-bold">
                  42
                </span>
              </Button>
              <Link href="/map">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <IconMapPin className="h-4 w-4 text-primary" />
                  <span>Lihat di Peta</span>
                </Button>
              </Link>
            </div>

            <Link href="/">
              <Button variant="ghost" size="sm">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
