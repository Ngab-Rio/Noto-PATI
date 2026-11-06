import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  IconMapPin,
  IconCalendar,
  IconThumbsUp,
  IconBuildings,
  IconInfo,
  IconGitMerge,
  IconArrowRight,
  IconClock,
  IconClockCountdown,
  IconWarning,
  IconCheckFat,
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
import { calculateReportSla, formatRemainingTime, formatDueDate } from "@/domain/sla";

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
        "id, ticket_number, category, title, description, detail_location, status, created_at, latitude, longitude, location_accuracy_m, merged_into_report_id, verification_due_at, handling_due_at"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("report_status_history")
      .select("id, status, note, created_at, proof_image_url")
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

  if (reportError) {
    throw new Error(`Gagal memuat laporan: ${reportError.message}`);
  }
  if (!report) {
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
  const completionEvidence = (history ?? []).flatMap((item) => {
    if (item.status !== "selesai" || !item.proof_image_url) return [];
    const signedUrl = completionUrlByPath.get(item.proof_image_url);
    return signedUrl
      ? [{ createdAt: item.created_at, note: item.note, signedUrl }]
      : [];
  });

  // Hitung SLA — gunakan waktu server sebagai acuan
  const now = new Date().toISOString();
  const completedAt = (history ?? []).find((h) => h.status === "selesai")?.created_at ?? null;
  const slaStage = calculateReportSla(
    {
      status: report.status as Parameters<typeof calculateReportSla>[0]["status"],
      verificationDueAt: report.verification_due_at ?? null,
      handlingDueAt: report.handling_due_at ?? null,
      completedAt,
    },
    now,
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

          {completionEvidence.length > 0 && (
            <section className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
              <div>
                <h2 className="text-sm font-semibold text-emerald-950">
                  Bukti Penyelesaian
                </h2>
                <p className="mt-1 text-xs text-emerald-900/75">
                  Foto ini diunggah oleh Admin sebagai dokumentasi penyelesaian laporan.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {completionEvidence.map((evidence) => (
                  <div key={`${evidence.signedUrl}-${evidence.createdAt}`} className="overflow-hidden rounded-lg border border-emerald-200 bg-white">
                    <a href={evidence.signedUrl} target="_blank" rel="noreferrer">
                      <Image
                        src={evidence.signedUrl}
                        alt="Foto bukti penyelesaian laporan"
                        width={800}
                        height={450}
                        unoptimized
                        className="aspect-video w-full object-cover transition-opacity hover:opacity-90"
                      />
                    </a>
                    {evidence.note && (
                      <p className="p-3 text-xs leading-relaxed text-text-muted">{evidence.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
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
            {(history ?? []).length === 0 ? (
              <p className="text-xs text-text-muted py-2">Belum ada riwayat perubahan status.</p>
            ) : (
              <ol className="relative border-l border-border ml-2 space-y-0">
                {(history ?? []).map((item, idx) => {
                  const isLast = idx === (history ?? []).length - 1;
                  return (
                    <li
                      key={item.id}
                      className="ml-4 pb-4 last:pb-0"
                    >
                      {/* Dot on timeline */}
                      <span
                        className={[
                          "absolute -left-[7px] flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-background",
                          isLast
                            ? "bg-primary"
                            : "bg-border",
                        ].join(" ")}
                      />
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadgeClient
                              status={normalizeReportStatus(item.status)}
                              size="sm"
                              showIcon={true}
                            />
                            {isLast && (
                              <span className="text-[11px] font-medium text-primary">
                                Status terkini
                              </span>
                            )}
                          </div>
                          {item.note && (
                            <p className="text-xs text-text-muted leading-relaxed max-w-prose">
                              {item.note}
                            </p>
                          )}
                        </div>
                        <time
                          dateTime={item.created_at}
                          className="text-xs text-text-muted whitespace-nowrap"
                        >
                          {new Intl.DateTimeFormat("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "Asia/Jakarta",
                          }).format(new Date(item.created_at))}
                        </time>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* SLA Indicator */}
          {slaStage.state !== "not_applicable" && (
            <div
              className={[
                "rounded-xl border p-4 sm:p-5 space-y-3",
                slaStage.state === "in_target"
                  ? "border-sky-200 bg-sky-50/60"
                  : slaStage.state === "overdue"
                    ? "border-red-200 bg-red-50/60"
                    : slaStage.state === "completed_on_time"
                      ? "border-emerald-200 bg-emerald-50/60"
                      : "border-amber-200 bg-amber-50/60",
              ].join(" ")}
            >
              <div className="flex items-center gap-2.5">
                {slaStage.state === "in_target" && (
                  <IconClockCountdown className="h-4 w-4 text-sky-600 shrink-0" />
                )}
                {slaStage.state === "overdue" && (
                  <IconWarning className="h-4 w-4 text-red-600 shrink-0" />
                )}
                {slaStage.state === "completed_on_time" && (
                  <IconCheckFat className="h-4 w-4 text-emerald-600 shrink-0" weight="fill" />
                )}
                {slaStage.state === "completed_late" && (
                  <IconClock className="h-4 w-4 text-amber-600 shrink-0" />
                )}
                <span
                  className={[
                    "text-sm font-semibold",
                    slaStage.state === "in_target"
                      ? "text-sky-900"
                      : slaStage.state === "overdue"
                        ? "text-red-900"
                        : slaStage.state === "completed_on_time"
                          ? "text-emerald-900"
                          : "text-amber-900",
                  ].join(" ")}
                >
                  {slaStage.state === "in_target" &&
                    (slaStage.kind === "verification"
                      ? "Dalam Target Verifikasi"
                      : "Dalam Target Penyelesaian")}
                  {slaStage.state === "overdue" &&
                    (slaStage.kind === "verification"
                      ? "Melewati Tenggat Verifikasi"
                      : "Melewati Tenggat Penyelesaian")}
                  {slaStage.state === "completed_on_time" && "Diselesaikan Tepat Waktu"}
                  {slaStage.state === "completed_late" && "Diselesaikan Melebihi Tenggat"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-text-muted">Tenggat:</span>{" "}
                  <span className="font-medium text-text">
                    {formatDueDate(slaStage.dueAt)}
                  </span>
                </div>
                {(slaStage.state === "in_target" || slaStage.state === "overdue") &&
                  slaStage.remainingMs !== null && (
                    <div>
                      <span className="text-text-muted">
                        {slaStage.state === "overdue" ? "Keterlambatan:" : "Sisa waktu:"}
                      </span>{" "}
                      <span
                        className={[
                          "font-semibold",
                          slaStage.state === "overdue"
                            ? "text-red-700"
                            : "text-sky-700",
                        ].join(" ")}
                      >
                        {formatRemainingTime(slaStage.remainingMs)}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          )}

          {slaStage.state === "not_applicable" &&
            report.status !== "ditolak" &&
            report.status !== "digabung" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5">
                <div className="flex items-start gap-2.5">
                  <IconInfo className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-amber-900">
                      SLA Belum Dapat Dihitung
                    </p>
                    <p className="text-xs text-amber-900/80 leading-relaxed">
                      Data tenggat verifikasi atau penyelesaian belum lengkap, sehingga
                      status SLA tidak dapat ditampilkan.
                    </p>
                  </div>
                </div>
              </div>
            )}

          <div className="flex items-start gap-1.5 rounded-lg border border-border bg-surface px-3 py-2">
            <IconInfo className="h-3.5 w-3.5 shrink-0 mt-px text-text-muted" />
            <p className="text-[11px] text-text-muted leading-relaxed">
              SLA merupakan simulasi untuk kebutuhan demonstrasi prototipe, bukan
              standar pelayanan resmi Pemerintah Kabupaten Pati.
            </p>
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
