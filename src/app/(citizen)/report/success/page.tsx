import { Suspense } from "react";
import Link from "@/components/shared/route-link";
import {
  IconCheckCircle,
  IconHouse,
  IconFileText,
  IconMapPin,
  IconBookOpen,
  IconEnvelope,
} from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { isMissingAuthSessionError } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  VisualEducationCard,
  VisualEducationCardSkeleton,
} from "@/features/care/components/VisualEducationCard";

export const metadata = {
  title: "Laporan Berhasil Terkirim · Noto PATI",
  description:
    "Konfirmasi keberhasilan pengiriman laporan infrastruktur publik Kabupaten Pati beserta panduan edukasi keselamatan.",
};

interface ReportSuccessPageProps {
  searchParams: Promise<{
    reportId?: string;
    ticket?: string;
    category?: string;
  }>;
}

export default async function ReportSuccessPage({
  searchParams,
}: ReportSuccessPageProps) {
  const { reportId, ticket, category } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError && !isMissingAuthSessionError(authError)) {
    throw new Error(`Gagal memeriksa sesi pengguna: ${authError.message}`);
  }

  const ticketNumber =
    ticket || (reportId ? `NP-${reportId.slice(0, 8).toUpperCase()}` : "NP-PATI-BARU");

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Main Success Confirmation Card */}
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-10 shadow-xs text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 shadow-2xs">
              <IconCheckCircle className="h-10 w-10 sm:h-12 sm:w-12" weight="fill" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
              Laporan Berhasil Terkirim!
            </h1>
            <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
              Terima kasih atas kepedulian Anda. Laporan ini telah tercatat dalam sistem dan segera memasuki tahap verifikasi dinas.
            </p>
          </div>

          {/* Ticket Number Highlight */}
          <div className="rounded-2xl bg-primary-soft/50 border border-primary/20 p-5 sm:p-6 space-y-1.5">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Nomor Tiket Pemantauan:
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-primary font-mono tracking-wide">
              {ticketNumber}
            </p>
            <p className="text-[11px] text-text-muted pt-1">
              Simpan nomor tiket ini untuk memantau pembaruan status dan SLA penanganan di lapangan.
            </p>
          </div>

          <section className="border-t border-border pt-5 text-left">
            <div className="flex items-start gap-3">
              <IconEnvelope
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                weight="regular"
              />
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-text">
                  Notifikasi perubahan status lewat email
                </h2>
                {user ? (
                  <p className="text-sm leading-relaxed text-text-muted">
                    Rancangan ini menyiapkan pembaruan status laporan ke email akun Anda.
                    Pengiriman email belum aktif di prototipe ini.
                  </p>
                ) : (
                  <p className="text-sm leading-relaxed text-text-muted">
                    Laporan ini dikirim tanpa akun, jadi belum terhubung ke notifikasi email.
                    Masuk atau daftar agar laporan berikutnya tersimpan di akun dan dapat
                    disiapkan untuk menerima pembaruan status. Pantau laporan ini dengan
                    nomor tiket di atas.
                  </p>
                )}
              </div>
            </div>

            {!user && (
              <div className="mt-4 flex flex-col gap-2 pl-8 sm:flex-row">
                <Link href="/login?next=%2Fmy-reports">
                  <Button variant="default" size="sm" className="w-full font-semibold sm:w-auto">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register?next=%2Fmy-reports">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Daftar
                  </Button>
                </Link>
              </div>
            )}
          </section>

          {/* Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {reportId && (
              <Link href={`/reports/${reportId}`}>
                <Button variant="default" size="sm" className="gap-2 shadow-2xs font-semibold">
                  <IconFileText className="h-4 w-4" />
                  <span>Lihat Detail Laporan</span>
                </Button>
              </Link>
            )}

            <Link href="/my-reports">
              <Button variant="outline" size="sm" className="gap-2">
                <IconFileText className="h-4 w-4 text-primary" />
                <span>Lihat Laporan Saya</span>
              </Button>
            </Link>

            <Link href="/map">
              <Button variant="outline" size="sm" className="gap-2">
                <IconMapPin className="h-4 w-4 text-primary" />
                <span>Pantau di Peta</span>
              </Button>
            </Link>

            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <IconHouse className="h-4 w-4" />
                <span>Kembali ke Beranda</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Visual-First Contextual Education Section */}
        {category ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-text uppercase tracking-wider flex items-center gap-2">
                <IconBookOpen className="h-4 w-4 text-primary" />
                <span>Edukasi Keselamatan Infrastruktur</span>
              </h2>
              <span className="text-xs text-text-muted">Visual-First Panduan Warga</span>
            </div>

            <Suspense fallback={<VisualEducationCardSkeleton />}>
              <VisualEducationCard
                category={category}
                reportId={reportId}
                ticketNumber={ticketNumber}
              />
            </Suspense>
          </div>
        ) : null}

        {/* Simulation Notice Disclaimer */}
        <div className="rounded-xl border border-border bg-surface/50 p-4 text-center">
          <p className="text-[11px] text-text-muted leading-relaxed">
            Noto PATI merupakan prototipe platform partisipasi publik Kabupaten Pati. Seluruh SLA dan edukasi ditujukan untuk literasi dan demonstrasi simulasi.
          </p>
        </div>
      </div>
    </div>
  );
}
