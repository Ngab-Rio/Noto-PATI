import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import {
  IconBuildings,
  IconChartBar,
  IconInfo,
  IconWarning,
} from "@/components/shared/icons";
import { getApbdDashboard } from "@/features/apbd/dashboard-data";
import {
  calculateShare,
  clampPercentage,
  formatPercentage,
  formatRupiah,
  formatRupiahCompact,
} from "@/features/apbd/dashboard";

export const metadata: Metadata = {
  title: "Transparansi APBD Kabupaten Pati · Noto PATI",
  description:
    "Ringkasan pagu, realisasi, sisa, dan distribusi belanja APBD Kabupaten Pati berdasarkan data DJPK Kementerian Keuangan.",
};

interface BudgetPageProps {
  searchParams: Promise<{ snapshot?: string }>;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tidak diketahui";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const params = await searchParams;
  const [year, period] = params.snapshot?.split("-") ?? [];
  const data = await getApbdDashboard({ year, period });

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="border-b border-border pb-5">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-dark">
            <IconChartBar className="h-3.5 w-3.5" />
            <span>Transparansi Publik APBD</span>
          </div>
          <h1 className="text-2xl font-bold text-text sm:text-3xl">
            Uang APBD Kabupaten Pati Dipakai untuk Apa?
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-text-muted">
            Ringkasan sederhana pagu, realisasi, dan sisa anggaran berdasarkan
            data resmi DJPK Kementerian Keuangan.
          </p>
        </header>

        {!data ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-14 text-center shadow-xs">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <IconChartBar className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-text">
              Data APBD belum tersedia
            </h2>
            <p className="mt-1 max-w-md text-sm text-text-muted">
              Snapshot APBD Kabupaten Pati belum diimpor ke basis data. Data
              akan tampil setelah proses impor DJPK dijalankan.
            </p>
          </div>
        ) : (
          <>
            <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-xs sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Periode anggaran
                </p>
                <p className="mt-1 text-lg font-bold text-text">
                  {data.selected.period_name} {data.selected.budget_year}
                </p>
                <p className="text-xs text-text-muted">
                  {data.selected.pemda_name} · {data.selected.provinsi_name}
                </p>
              </div>

              <form method="get" className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <label className="flex flex-col gap-1 text-xs font-medium text-text-muted">
                  Pilih periode
                  <select
                    name="snapshot"
                    defaultValue={`${data.selected.budget_year}-${data.selected.period_month}`}
                    className="min-w-44 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-text outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {data.reports.map((report) => (
                      <option
                        key={report.id}
                        value={`${report.budget_year}-${report.period_month}`}
                      >
                        {report.period_name} {report.budget_year}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit" variant="default" className="gap-2">
                  Tampilkan
                </Button>
              </form>
            </section>

            {(() => {
              const usageWidth = clampPercentage(data.summary.persentase);
              const remainingPercent =
                data.summary.persentase === null
                  ? null
                  : Math.max(0, 100 - data.summary.persentase);
              const remainingWidth = clampPercentage(remainingPercent);
              const overBudget =
                data.summary.sisa !== null && data.summary.sisa < 0;
              const perHundredUsed =
                data.summary.persentase === null
                  ? null
                  : Math.round(data.summary.persentase);

              return (
                <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
                  <div className="border-b border-border bg-primary-soft/30 px-5 py-4 sm:px-7">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                          Kondisi uang APBD
                        </p>
                        <h2 className="text-lg font-bold text-text">
                          Ringkasan {data.selected.period_name}{" "}
                          {data.selected.budget_year}
                        </h2>
                      </div>
                      <span className="rounded-full border border-primary/20 bg-surface px-3 py-1 text-xs font-semibold text-primary">
                        Sumber: DJPK
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6 p-5 sm:p-7">
                    <div className="grid gap-5 lg:grid-cols-2 lg:items-end">
                      <div>
                        <p className="text-sm font-medium text-text-muted">
                          Uang yang boleh dibelanjakan (pagu)
                        </p>
                        <p className="mt-1 text-4xl font-bold text-text sm:text-5xl">
                          {formatRupiahCompact(data.summary.pagu)}
                        </p>
                        <p className="mt-1 break-words text-xs text-text-muted">
                          {formatRupiah(data.summary.pagu)}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border bg-background p-4">
                          <p className="text-xs font-medium text-text-muted">
                            Sudah terpakai (realisasi)
                          </p>
                          <p className="mt-1 text-2xl font-bold text-primary">
                            {formatRupiahCompact(data.summary.realisasi)}
                          </p>
                          <p className="mt-1 text-xs text-text-muted">
                            {formatPercentage(data.summary.persentase)} dari
                            pagu
                          </p>
                        </div>

                        <div className="rounded-xl border border-accent/25 bg-accent-soft/50 p-4">
                          <p className="text-xs font-medium text-text-muted">
                            {overBudget ? "Melebihi pagu" : "Masih tersisa"}
                          </p>
                          <p className="mt-1 text-2xl font-bold text-accent">
                            {formatRupiahCompact(
                              overBudget && data.summary.sisa !== null
                                ? Math.abs(data.summary.sisa)
                                : data.summary.sisa,
                            )}
                          </p>
                          <p className="mt-1 text-xs text-text-muted">
                            {remainingPercent === null
                              ? "Belum tersedia"
                              : `${formatPercentage(remainingPercent)} dari pagu`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                        <span className="text-primary">
                          Terpakai {formatPercentage(data.summary.persentase)}
                        </span>
                        <span className="text-accent">
                          {overBudget
                            ? "Melebihi pagu"
                            : `Sisa ${formatPercentage(remainingPercent)}`}
                        </span>
                      </div>

                      <div
                        role="img"
                        aria-label={
                          data.summary.persentase === null
                            ? "Persentase realisasi belum tersedia"
                            : `Terpakai ${formatPercentage(
                                data.summary.persentase,
                              )}, sisa ${formatPercentage(remainingPercent)}`
                        }
                        className="flex h-5 w-full overflow-hidden rounded-full bg-border"
                      >
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${usageWidth}%` }}
                        />
                        <div
                          className="h-full bg-accent/40"
                          style={{ width: `${remainingWidth}%` }}
                        />
                      </div>

                      <p className="text-sm leading-relaxed text-text-muted">
                        {perHundredUsed === null
                          ? "Persentase realisasi belum tersedia."
                          : overBudget
                            ? `Realisasi sudah melebihi pagu sebesar ${formatRupiahCompact(
                                data.summary.sisa === null
                                  ? null
                                  : Math.abs(data.summary.sisa),
                              )}.`
                            : `Dari setiap Rp100 anggaran, sekitar Rp${perHundredUsed} sudah terpakai dan Rp${
                                100 - perHundredUsed
                              } masih tersisa.`}
                      </p>
                    </div>
                  </div>
                </section>
              );
            })()}

            <section className="space-y-4">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-text">
                  <IconBuildings className="h-5 w-5 text-primary" />
                  Uangnya dipakai untuk apa?
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-text-muted">
                  Panjang bar menunjukkan porsi masing-masing kelompok dari
                  total pagu. Bagian biru adalah yang sudah terpakai.
                </p>
                {data.allocation[0] ? (
                  <p className="mt-2 text-sm text-text-muted">
                    Porsi terbesar ada di{" "}
                    <strong className="text-text">
                      {data.allocation[0].label}
                    </strong>
                    , yaitu{" "}
                    {formatPercentage(
                      calculateShare(
                        data.allocation[0].pagu,
                        data.summary.pagu,
                      ),
                    )}{" "}
                    dari total pagu.
                  </p>
                ) : null}
              </div>

              {data.allocation.length > 0 ? (
                <div className="space-y-3">
                  {data.allocation.map((item) => {
                    const share = calculateShare(
                      item.pagu,
                      data.summary.pagu,
                    );
                    const shareWidth = clampPercentage(share);
                    const usedWidth = clampPercentage(item.persentase);
                    const remaining = item.pagu - item.realisasi;

                    return (
                      <article
                        key={item.label}
                        className="rounded-xl border border-border bg-surface p-4 shadow-xs sm:p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-text">
                              {item.label}
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-text-muted">
                              Pagu {formatRupiahCompact(item.pagu)} · terpakai{" "}
                              {formatRupiahCompact(item.realisasi)} ·{" "}
                              {remaining < 0
                                ? `lebih ${formatRupiahCompact(
                                    Math.abs(remaining),
                                  )}`
                                : `sisa ${formatRupiahCompact(remaining)}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              {formatPercentage(item.persentase)}
                            </p>
                            <p className="text-xs text-text-muted">
                              terpakai
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 h-3 w-full">
                          <div
                            className="h-3 overflow-hidden rounded-full bg-border"
                            style={{
                              width: `${shareWidth}%`,
                              minWidth: shareWidth > 0 ? "6px" : 0,
                            }}
                          >
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${usedWidth}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-muted">
                          <span>
                            Porsi {formatPercentage(share)} dari total pagu
                          </span>
                          <span>
                            {formatPercentage(item.persentase)} dari pagu
                            kelompok
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-surface px-6 py-10 text-center shadow-xs">
                  <p className="text-sm font-semibold text-text">
                    Rincian kelompok belanja belum tersedia
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Snapshot ini tidak memuat baris kelompok belanja yang
                    dikenali. Ringkasan total tetap ditampilkan dari laporan
                    resmi.
                  </p>
                </div>
              )}

              <details className="group rounded-xl border border-border bg-surface shadow-xs">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-semibold text-text [&::-webkit-details-marker]:hidden">
                  <span>Lihat rincian angka</span>
                  <span className="text-xs font-normal text-text-muted">
                    Tabel pagu, realisasi, dan persentase
                  </span>
                </summary>
                <div className="overflow-x-auto border-t border-border">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">
                      Pagu dan realisasi belanja daerah per kelompok
                    </caption>
                    <thead className="border-b border-border bg-primary-soft/30 text-xs uppercase tracking-wider text-text">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Kelompok</th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Pagu
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Realisasi
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          % Realisasi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.allocation.map((item) => (
                        <tr
                          key={item.label}
                          className="transition-colors hover:bg-primary-soft/10"
                        >
                          <td className="px-4 py-3 font-semibold text-text">
                            {item.label}
                          </td>
                          <td className="px-4 py-3 text-right text-text">
                            {formatRupiah(item.pagu)}
                          </td>
                          <td className="px-4 py-3 text-right text-primary">
                            {formatRupiah(item.realisasi)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-text">
                            {formatPercentage(item.persentase)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </section>

            <details className="rounded-xl border border-border bg-surface shadow-xs">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-semibold text-text [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <IconInfo className="h-4 w-4 text-primary" />
                  Apa arti pagu, realisasi, dan sisa?
                </span>
                <span className="text-xs font-normal text-text-muted">
                  Penjelasan singkat
                </span>
              </summary>
              <dl className="grid grid-cols-1 gap-4 border-t border-border px-4 py-4 text-xs leading-relaxed text-text-muted sm:grid-cols-3">
                <div>
                  <dt className="font-semibold text-text">Pagu anggaran</dt>
                  <dd>
                    Batas maksimal belanja yang dianggarkan pemerintah daerah.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-text">Realisasi</dt>
                  <dd>
                    Nilai belanja yang sudah dicatat terealisasi sampai periode
                    laporan.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-text">Sisa anggaran</dt>
                  <dd>Pagu dikurangi realisasi pada periode yang sama.</dd>
                </div>
              </dl>
            </details>

            <section className="rounded-xl border border-primary/20 bg-primary-soft/40 p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-primary-dark">
                <IconInfo className="h-4 w-4" />
                Sumber data
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text">
                {data.selected.pemda_name}, {data.selected.provinsi_name} ·{" "}
                {data.selected.period_name} {data.selected.budget_year}
              </p>
              {data.selected.keterangan_portal ? (
                <p className="mt-1 text-xs leading-relaxed text-text-muted">
                  {data.selected.keterangan_portal}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-text-muted">
                Snapshot diambil {formatDateTime(data.selected.fetched_at)}.
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold">
                <a
                  href={data.selected.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline underline-offset-2 hover:text-primary-dark"
                >
                  Portal DJPK
                </a>
                <a
                  href={data.selected.download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline underline-offset-2 hover:text-primary-dark"
                >
                  Unduh CSV DJPK
                </a>
              </div>
            </section>

            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              <div className="flex items-start gap-2">
                <IconWarning className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-1">
                  <p>
                    Realisasi anggaran menunjukkan penyerapan belanja, bukan
                    otomatis penyelesaian pekerjaan fisik di lapangan.
                  </p>
                  <p>
                    Halaman ini tidak mengaitkan laporan warga tertentu dengan
                    pos anggaran ini dan tidak mengklaim bahwa suatu laporan
                    telah memperoleh pendanaan dari pos tersebut.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
