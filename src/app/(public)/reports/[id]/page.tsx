import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  IconMapPin,
  IconCalendar,
  IconThumbsUp,
  IconBuildings,
} from "@/components/shared/icons";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("id, ticket_number, category, title, description, detail_location, status, created_at, latitude, longitude, location_accuracy_m")
    .eq("id", id)
    .maybeSingle();

  if (reportError || !report) {
    notFound();
  }

  const { data: history } = await supabase
    .from("report_status_history")
    .select("status, note, created_at")
    .eq("report_id", report.id)
    .order("created_at", { ascending: true });

  const admin = createAdminClient();
  const { data: photos } = await admin
    .from("report_photos")
    .select("id, storage_path, sort_order")
    .eq("report_id", report.id)
    .order("sort_order", { ascending: true });

  const signedPhotos = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data } = await admin.storage
        .from("report-photos")
        .createSignedUrl(photo.storage_path, 60 * 10);

      return data?.signedUrl ? { id: photo.id, signedUrl: data.signedUrl } : null;
    }),
  );

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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <StatusBadge status={normalizeReportStatus(report.status)} size="md" />
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

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-text">Riwayat Status:</h2>
            <div className="space-y-2">
              {(history ?? []).map((item) => (
                <div key={`${item.status}-${item.created_at}`} className="flex items-start justify-between gap-4 rounded-lg border border-border p-3 text-sm">
                  <div>
                    <StatusBadge status={normalizeReportStatus(item.status)} size="sm" />
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
