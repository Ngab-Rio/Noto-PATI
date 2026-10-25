"use client";

import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  ThumbsUp,
  RotateCcw,
  Star,
  Calendar,
  Building2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
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
  dinasTerkait?: string;
  officialNote?: string;
  imageUrl?: string;
}

export interface ReportCardProps {
  report: ReportItemData;
  className?: string;
  onSupport?: (id: string) => void;
  onViewMap?: (id: string) => void;
  onRate?: (id: string) => void;
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
 * - Tombol aksi: Dukung laporan, Lihat di peta, Beri penilaian, Buka kembali (Primary/Dark, Default, Soft, Accent)
 */
export function ReportCard({
  report,
  className,
  onSupport,
  onViewMap,
  onRate,
  onReopen,
}: ReportCardProps) {
  const [supported, setSupported] = React.useState(false);
  const [likes, setLikes] = React.useState(report.supportCount);

  const handleSupport = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!supported) {
      setSupported(true);
      setLikes((prev) => prev + 1);
      onSupport?.(report.id);
    }
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-md",
        className
      )}
    >
      <div className="space-y-4">
        {/* Header: Status & Nomor Tiket / Kategori */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <StatusBadge status={report.status} />
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
          <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors line-clamp-2">
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

      {/* Baris Tombol Aksi sesuai Mockup PDF */}
      <div className="mt-5 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Dukung Laporan */}
          <Button
            type="button"
            variant={supported ? "accent" : "outline"}
            size="sm"
            onClick={handleSupport}
            className="gap-1.5"
            aria-label={`Dukung laporan ini. Saat ini ${likes} dukungan`}
          >
            <ThumbsUp className={cn("h-3.5 w-3.5", supported && "fill-current")} />
            <span>{supported ? "Didukung" : "Dukung laporan"}</span>
            <span className="ml-1 rounded-full bg-black/10 dark:bg-white/10 px-1.5 py-0.2 text-[10px] font-bold">
              {likes}
            </span>
          </Button>

          {/* Tombol Lihat di Peta */}
          {onViewMap ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onViewMap(report.id)}
              className="gap-1.5"
            >
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>Lihat di peta</span>
            </Button>
          ) : (
            <Link href={`/map?reportId=${report.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>Lihat di peta</span>
              </Button>
            </Link>
          )}

          {/* Tombol Khusus berdasarkan Status (Beri penilaian saat Selesai, Buka kembali bila perlu) */}
          {report.status === "selesai" && (
            <Button
              type="button"
              variant="accentSoft"
              size="sm"
              onClick={() => onRate?.(report.id)}
              className="gap-1.5 text-accent font-semibold"
            >
              <Star className="h-3.5 w-3.5" />
              <span>Beri penilaian</span>
            </Button>
          )}

          {(report.status === "selesai" || report.status === "ditutup") && onReopen && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onReopen(report.id)}
              className="gap-1.5 text-text-muted hover:text-accent"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Buka kembali</span>
            </Button>
          )}
        </div>

        {/* Tombol Detail (Primary / Primary Dark) */}
        <Link href={`/reports/${report.id}`}>
          <Button
            variant="primaryDark"
            size="sm"
            className="gap-1 font-medium group-hover:bg-primary transition-colors"
          >
            <span>Detail</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </article>
  );
}
