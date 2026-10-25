import type { Metadata } from "next";
import Link from "next/link";
import {
  IconMapPin,
  IconSearch,
  IconPlusCircle,
  IconSparkle,
} from "@/components/shared/icons";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataSimulationBadge } from "@/components/shared/data-simulation-badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Peta Laporan Infrastruktur Warga · Noto PATI",
  description:
    "Peta sebaran laporan fasilitas publik, jalan berlubang, dan drainase di Kabupaten Pati.",
};

const SAMPLE_MAP_POINTS = [
  {
    id: "rep-001",
    title: "Penerangan Jalan Rusak di Lingkar Selatan",
    kecamatan: "Gabus",
    status: "diproses",
    category: "Lampu Jalan",
    reports: 42,
  },
  {
    id: "rep-002",
    title: "Perbaikan Tanggul Sungai Juwana",
    kecamatan: "Juwana",
    status: "selesai",
    category: "Sumber Daya Air",
    reports: 128,
  },
  {
    id: "rep-003",
    title: "Jalan Berlubang Depan Pasar Puri",
    kecamatan: "Pati Kota",
    status: "diverifikasi",
    category: "Bina Marga / Jalan",
    reports: 19,
  },
  {
    id: "rep-004",
    title: "Drainase Mampet Ruas Margorejo",
    kecamatan: "Margorejo",
    status: "diterima",
    category: "Drainase",
    reports: 11,
  },
  {
    id: "rep-005",
    title: "Jembatan Rusak Penghubung Desa Tayu",
    kecamatan: "Tayu",
    status: "diproses",
    category: "Jembatan",
    reports: 35,
  },
];

export default function MapPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary-dark text-xs font-semibold mb-2">
              <IconMapPin className="h-3.5 w-3.5" />
              <span>Peta Interaktif Warga</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text">
              Peta Sebaran Laporan Infrastruktur
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Pantau laporan masalah fasilitas publik di 21 kecamatan se-Kabupaten Pati secara transparan.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/report/new">
              <Button variant="accent" className="gap-2">
                <IconPlusCircle className="h-4 w-4" />
                <span>Buat Laporan Baru</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 rounded-xl border border-border bg-surface p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Cari kecamatan, jalan, atau kata kunci..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-text"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-text-muted">Status:</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-primary-soft text-primary-dark font-medium cursor-pointer">
                Semua
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-background text-text-muted border border-border hover:bg-surface cursor-pointer">
                Diproses
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-background text-text-muted border border-border hover:bg-surface cursor-pointer">
                Selesai
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-text-muted block">Laporan Terpetakan</span>
              <strong className="text-xl font-bold text-primary">235 Titik</strong>
              <div className="mt-1.5">
                <DataSimulationBadge size="sm" />
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary-soft flex items-center justify-center text-primary-dark">
              <IconMapPin className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Map Container Placeholder */}
        <div className="relative rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
          <div className="h-[460px] w-full bg-linear-to-br from-primary-soft/40 via-surface to-background flex flex-col items-center justify-center p-6 text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary-soft flex items-center justify-center text-primary-dark mb-4 shadow-xs">
              <IconMapPin className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-text">Peta Digital Kabupaten Pati</h2>
            <p className="text-sm text-text-muted max-w-md mt-1.5 leading-relaxed">
              Modul peta OpenStreetMap / Leaflet siap dimuat untuk visualisasi klaster koordinat laporan per desa dan kecamatan.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-text-muted bg-surface/80 border border-border px-3.5 py-1.5 rounded-full">
              <IconSparkle className="h-3.5 w-3.5 text-accent" />
              <span>Koordinat Titik: -6.7558° S, 111.0379° E (Pati, Jawa Tengah)</span>
            </div>
          </div>

          {/* Quick List under the map */}
          <div className="border-t border-border p-5 bg-surface">
            <h3 className="text-sm font-semibold text-text mb-3">
              Titik Laporan Aktif di Sekitar Wilayah Pati
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SAMPLE_MAP_POINTS.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border p-3 hover:border-primary/50 transition-colors bg-background/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <StatusBadge status={item.status} size="sm" />
                      <span className="text-[11px] font-medium text-text-muted">
                        Kec. {item.kecamatan}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-text line-clamp-1">{item.title}</h4>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between text-xs text-text-muted">
                    <span>{item.category}</span>
                    <span className="font-semibold text-primary">{item.reports} warga</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
