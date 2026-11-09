import type { Metadata } from "next";
import Link from "@/components/shared/route-link";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Compass,
  MapPin,
  MapPinned,
} from "lucide-react";

import { REPORT_STATUS_CONFIG } from "@/config/theme";
import {
  ADMIN_MAP_STATUSES,
  getAdminMapSummary,
} from "@/features/admin/server-data";
import { PublicReportsMap } from "@/components/map/PublicReportsMap";

export const metadata: Metadata = {
  title: "Peta Laporan · Admin Noto PATI",
  description: "Peta interaktif dan ringkasan sebaran laporan infrastruktur warga Kabupaten Pati.",
  robots: { index: false, follow: false },
};

function formatCount(count: number) {
  return count.toLocaleString("id-ID");
}

export default async function AdminMapPage() {
  const summary = await getAdminMapSummary();
  const countsByStatus = new Map(
    summary.statusCounts.map(({ status, count }) => [status, count]),
  );
  const metrics = [
    {
      label: "Total laporan",
      value: summary.totalCount,
      icon: ClipboardList,
    },
    {
      label: "Titik di peta",
      value: summary.locatedCount,
      icon: MapPinned,
    },
    {
      label: "Masih ditangani",
      value: summary.activeCount,
      icon: Activity,
    },
    {
      label: "Selesai",
      value: summary.completedCount,
      icon: CheckCircle2,
    },
  ];

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-background">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="flex flex-col gap-2 border-b border-border/70 pb-5">
          <div className="flex items-center gap-2 text-primary">
            <MapPin className="h-5 w-5" aria-hidden="true" />
            <h1 className="text-xl font-bold text-text sm:text-2xl">
              Peta Laporan Infrastruktur
            </h1>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-text-muted">
            Pantau lokasi dan perkembangan laporan warga di Kabupaten Pati. Peta
            ini mencakup semua status, termasuk laporan yang selesai, ditolak,
            atau digabung.
          </p>
        </header>

        <section
          aria-label="Peta seluruh laporan warga"
          className="rounded-2xl border border-border bg-surface p-2 shadow-sm sm:p-3"
        >
          <div className="h-[min(64vh,640px)] min-h-96 overflow-hidden rounded-xl">
            <PublicReportsMap
              adminMode
              filters={{ statuses: [...ADMIN_MAP_STATUSES] }}
            />
          </div>
        </section>

        <section aria-labelledby="map-summary-title" className="space-y-4">
          <div>
            <h2 id="map-summary-title" className="text-lg font-bold text-text">
              Ringkasan sebaran laporan
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Hitungan diperbarui dari data laporan saat halaman dibuka.
            </p>
          </div>

          <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface sm:grid-cols-4">
            {metrics.map(({ label, value, icon: Icon }, index) => (
              <div
                key={label}
                className={`flex items-center gap-3 p-4 sm:p-5 ${
                  index % 2 === 0 ? "border-r border-border" : ""
                } ${
                  index < 2 ? "border-b border-border sm:border-b-0" : ""
                } ${
                  index === 1 ? "sm:border-r" : ""
                } ${
                  index === 2 ? "sm:border-r" : ""
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <dt className="truncate text-xs font-medium text-text-muted sm:text-sm">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-xl font-bold tabular-nums text-text">
                    {formatCount(value)}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-text">Jumlah menurut status</h3>
                  <p className="mt-1 text-xs text-text-muted">
                    Perbandingan jumlah laporan pada setiap tahap penanganan.
                  </p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-text-muted">
                  {formatCount(summary.totalCount)} laporan
                </span>
              </div>

              {summary.totalCount > 0 ? (
                <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  {ADMIN_MAP_STATUSES.map((status) => {
                    const config = REPORT_STATUS_CONFIG[status];
                    const count = countsByStatus.get(status) ?? 0;
                    const percentage = (count / summary.totalCount) * 100;

                    return (
                      <li key={status} className="min-w-0">
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                          <span className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: config.textColor }}
                              aria-hidden="true"
                            />
                            <span className="truncate text-text">{config.label}</span>
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums text-text">
                            {formatCount(count)}
                          </span>
                        </div>
                        <div
                          className="h-1.5 overflow-hidden rounded-full bg-background"
                          role="progressbar"
                          aria-label={`Proporsi laporan ${config.label}`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(percentage)}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: config.textColor,
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="rounded-lg bg-background px-4 py-6 text-center text-sm text-text-muted">
                  Belum ada laporan yang tercatat.
                </p>
              )}
            </div>

            <aside className="flex flex-col rounded-xl border border-primary/20 bg-primary-soft/40 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="font-semibold text-text">Cara membaca peta</h3>
              </div>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-text-muted">
                <li>
                  Gunakan kontrol peta untuk memperbesar area atau berpindah
                  antara tampilan kepadatan dan titik laporan.
                </li>
                <li>
                  Pilih titik laporan untuk melihat ringkasan dan membuka
                  detailnya.
                </li>
                <li>
                  Warna status dan jumlah laporan per tahap dirangkum pada
                  legenda dan panel di samping.
                </li>
              </ul>
              <div className="mt-auto pt-5">
                <Link
                  href="/admin/reports"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-text transition-colors hover:bg-primary-soft hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Kelola seluruh laporan
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
