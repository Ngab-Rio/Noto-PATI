"use client";

import Link from "@/components/shared/route-link";
import Image from "next/image";
import {
  MapPin,
  RotateCcw,
  Star,
  Calendar,
  Building2,
  ChevronRight,
  GitMerge,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadgeClient } from "@/components/shared/status-badge-client";
import { Button } from "@/components/ui/button";
import { ReportSupportButton } from "@/features/reports/components/ReportSupportButton";
import type { ReportStatusKey } from "@/config/theme";

export interface ReportItemData {
  id: string;
  ticketNumber?: string;
  title: string;
  description: string;
  category: string;
  status: ReportStatusKey;
  location: string;
  date: string;
  supportCount: number;
  hasSupported: boolean;
  isOwner: boolean;
  canSupport: boolean;
  isAuthenticated: boolean;
  rating?: {
    reviewCount: number;
    averageRating: number;
  };
  engagement?: {
    groupSupportCount: number;
    mergedReportCount: number;
  };
  dinasTerkait?: string;
  officialNote?: string;
  imageUrl?: string;
}

export interface ReportCardProps {
  report: ReportItemData;
  className?: string;
  onViewMap?: (id: string) => void;
  onReopen?: (id: string) => void;
}

/**
 * ReportCard · Noto PATI
 * Menerapkan spesifikasi Style Guide PDF:
 * - Permukaan kartu: Background/Surface (#FFFFFF) dengan Border/Default (#DCE5EE)
 * - Teks judul: Text/Primary (#1F2D3D)
 * - Teks sekunder: Text/Secondary (#556577)
 * - Status laporan: StatusBadge WCAG AA
 * - Blok informasi: Primary/Soft (#E3EEF8)
 * - Tombol aksi: Dukung laporan, Lihat di peta, Buka kembali; rating hanya ditampilkan sebagai ringkasan.
 */
export function ReportCard({
  report,
  className,
  onViewMap,
  onReopen,
}: ReportCardProps) {
  const formattedRating = report.rating
    ? new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(report.rating.averageRating)
    : null;
  const hasRating = Boolean(report.rating && report.rating.reviewCount > 0);
  const canReopen = report.status === "selesai" || report.status === "ditutup";

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-sm hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
        className
      )}
    >
      <div className="space-y-4">
        {report.imageUrl && (
          <Link href={`/reports/${report.id}`} className="block overflow-hidden rounded-lg border border-border">
            <Image
              src={report.imageUrl}
              alt={`Foto dokumentasi ${report.title}`}
              width={800}
              height={450}
              unoptimized
              className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        )}
        {/* Header: Status & Nomor Tiket / Kategori */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <StatusBadgeClient status={report.status} showIcon={true} size="sm" />
            <span className="text-xs font-medium text-text-muted">
              {report.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Calendar className="h-3.5 w-3.5" />
            <time dateTime={report.date}>{report.date}</time>
          </div>
        </div>

        {/* Judul & Deskripsi Masalah */}
        <div>
          <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors duration-300 line-clamp-2">
            <Link href={`/reports/${report.id}`} className="hover:underline">
              {report.title}
            </Link>
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-text-muted line-clamp-3">
            {report.description}
          </p>
        </div>

        {/* Lokasi / Kecamatan di Pati */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
          <MapPin className="h-4 w-4 shrink-0 text-accent" />
          <span className="truncate">{report.location}</span>
        </div>

        {report.engagement && (
          <dl
            aria-label="Ringkasan perhatian warga"
            className="space-y-1.5 text-xs font-medium text-text-muted"
          >
            <div className="flex items-center gap-2">
              <dt className="sr-only">Pendukung unik dalam kelompok laporan</dt>
              <dd className="flex items-center gap-1.5">
                <UsersRound aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>
                  {new Intl.NumberFormat("id-ID").format(report.engagement.groupSupportCount)} warga mendukung
                </span>
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Laporan serupa yang digabung</dt>
              <dd className="flex items-center gap-1.5">
                <GitMerge aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>
                  {new Intl.NumberFormat("id-ID").format(report.engagement.mergedReportCount)} laporan serupa digabung
                </span>
              </dd>
            </div>
          </dl>
        )}

        {/* Blok Informasi Menggunakan Primary/Soft (#E3EEF8) sesuai Style Guide */}
        {report.officialNote && (
          <div className="rounded-lg bg-primary-soft p-3.5 text-xs text-text border border-primary/20">
            <div className="flex items-center gap-1.5 font-semibold text-primary-dark mb-1">
              <Building2 className="h-4 w-4 shrink-0" />
              <span>Tindak Lanjut {report.dinasTerkait ?? "Dinas Terkait"}:</span>
            </div>
            <p className="text-text-muted leading-relaxed pl-5.5">
              {report.officialNote}
            </p>
          </div>
        )}
      </div>

      {/* Baris Tombol Aksi - Mobile Optimized */}
      <div className="mt-5 pt-4 border-t border-border space-y-3">
        {/* Primary Actions Row */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
          {/* Tombol Dukung Laporan */}
          <ReportSupportButton
            reportId={report.id}
            supportCount={report.supportCount}
            hasSupported={report.hasSupported}
            isOwner={report.isOwner}
            canSupport={report.canSupport}
            isAuthenticated={report.isAuthenticated}
            returnTo={`/reports/${report.id}`}
            showCount={!report.engagement}
            size="sm"
            buttonClassName="hover:scale-105 active:scale-95 transition-transform"
          />

          {/* Tombol Lihat di Peta */}
          {onViewMap ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onViewMap(report.id)}
              className="gap-1.5 hover:scale-105 active:scale-95 transition-transform w-full sm:w-auto justify-center"
            >
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>Lihat di peta</span>
            </Button>
          ) : (
            <Link href={`/map?reportId=${report.id}`} className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="gap-1.5 hover:scale-105 active:scale-95 transition-transform w-full justify-center">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>Lihat di peta</span>
              </Button>
            </Link>
          )}

          {/* Tombol Detail (Primary / Primary Dark) - Mobile Prominent */}
          <Link href={`/reports/${report.id}`} className="w-full sm:w-auto sm:ml-auto">
            <Button
              variant="primaryDark"
              size="sm"
              className="gap-1 font-medium group-hover:bg-primary hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center"
            >
              <span>Lihat Detail</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Secondary Actions Row (Conditional) */}
        {((hasRating && report.status === "selesai") || (canReopen && onReopen)) && (
          <div className="flex flex-col sm:flex-row gap-2">
            {hasRating && report.status === "selesai" && report.rating && formattedRating && (
              <div
                role="img"
                aria-label={`Rating rata-rata ${formattedRating} dari 5 berdasarkan ${report.rating.reviewCount} penilaian`}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 text-sm font-medium text-text-muted"
              >
                <Star aria-hidden="true" className="h-4 w-4 fill-current text-accent" />
                <span className="tabular-nums text-text">{formattedRating}</span>
                <span>
                  · {new Intl.NumberFormat("id-ID").format(report.rating.reviewCount)} penilaian
                </span>
              </div>
            )}

            {onReopen && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onReopen(report.id)}
                className="gap-1.5 text-text-muted hover:text-accent w-full sm:w-auto justify-center"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Buka kembali</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
