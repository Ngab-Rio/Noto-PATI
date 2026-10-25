import type { Metadata } from "next";
import Link from "next/link";
import {
  IconMapPin,
  IconCalendar,
  IconThumbsUp,
  IconBuildings,
} from "@/components/shared/icons";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";

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
          <span className="text-text font-mono font-medium">#{id}</span>
        </div>

        {/* Main Report Card */}
        <article className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <StatusBadge status="diproses" size="md" />
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary-soft text-primary-dark">
                Infrastruktur Penerangan
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <IconCalendar className="h-4 w-4" />
              <span>Dilaporkan: 24 Oktober 2026</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-mono text-text-muted block mb-1">
              Tiket: NP-2025-0104 · ID: {id}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-text">
              Penerangan Jalan Umum Rusak di Jalur Lingkar Selatan Pati
            </h1>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-text-muted">
              <IconMapPin className="h-4 w-4 text-accent" />
              <span>Ruas Tanjang - Sukolilo, Kecamatan Gabus, Kabupaten Pati</span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-text">Deskripsi Masalah:</h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Tiga tiang lampu penerangan jalan mati berturut-turut di ruas Tanjang menuju Sukolilo.
              Kondisi gelap gulita rawan memicu kecelakaan lalu lintas serta potensi tindak kejahatan
              pada malam hari bagi warga dan pengendara roda dua.
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
                SLA Respons: &lt; 24 Jam
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed pl-7">
              Tim lapangan Dishub Kabupaten Pati telah melakukan verifikasi dan inspeksi trafo daya.
              Komponen pengganti sedang dipasang hari ini dengan estimasi perbaikan tuntas dalam 1 hari kerja.
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
