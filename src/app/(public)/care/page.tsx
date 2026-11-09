import type { Metadata } from "next";
import Link from "@/components/shared/route-link";
import { IconBookOpen, IconPlusCircle } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { getCareArticles } from "@/features/care/server-data";
import { CareSafetyNotice } from "@/features/care/components/CareSafetyNotice";
import { CareDirectoryClient } from "./CareDirectoryClient";

export const metadata: Metadata = {
  title: "Noto PATI Care · Pusat Edukasi Infrastruktur Publik",
  description:
    "Panduan keselamatan warga untuk jalan, drainase, PJU, jembatan, tanggul, rambu, trotoar, dan vandalisme fasilitas publik di Kabupaten Pati.",
  openGraph: {
    title: "Noto PATI Care · Pusat Edukasi Infrastruktur Publik",
    description:
      "Kenali tanda kerusakan fasilitas publik dan langkah aman untuk melaporkannya di Kabupaten Pati.",
  },
};

export default async function CarePage() {
  const articles = await getCareArticles();

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-text">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-text font-medium">Noto PATI Care</span>
        </div>

        {/* Hero Header */}
        <div className="rounded-3xl border border-border bg-gradient-to-br from-surface to-primary-soft/30 p-6 sm:p-10 shadow-xs space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-dark">
            <IconBookOpen className="h-4 w-4" />
            <span>Pusat Pengetahuan & Literasi Fasilitas Publik</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text">
            Noto PATI Care: Pahami Kerusakan, Utamakan Keselamatan
          </h1>

          <p className="max-w-3xl text-sm sm:text-base text-text-muted leading-relaxed">
            Noto PATI tidak hanya sekadar wadah mengirimkan laporan, tetapi juga sarana bersama untuk memahami siklus infrastruktur kota. Pelajari faktor penyebab kerusakan, kenali tanda-tanda bahaya dini, serta ketahui batasan tindakan aman yang dapat dilakukan warga sekitar.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link href="/report/new">
              <Button size="sm" className="gap-2">
                <IconPlusCircle className="h-4 w-4" />
                <span>Laporkan Kerusakan Baru</span>
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" size="sm">
                Lihat Pantauan Laporan
              </Button>
            </Link>
          </div>
        </div>

        {/* Safety Disclaimer Notice */}
        <CareSafetyNotice />

        {/* Directory Listing with Category Filter */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-text">
                Katalog Materi Edukasi
              </h2>
              <p className="text-xs sm:text-sm text-text-muted">
                Cari kondisi yang Anda temui untuk memahami risikonya dan langkah aman pelaporannya.
              </p>
            </div>
            <span className="text-xs font-mono text-text-muted bg-surface px-2.5 py-1 rounded-md border border-border">
              {articles.length} Topik Tersedia
            </span>
          </div>

          <CareDirectoryClient initialArticles={articles} />
        </div>
      </div>
    </div>
  );
}
