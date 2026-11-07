import type { Metadata } from "next";
import {
  IconArrowRight,
  IconBuildings,
  IconCalendar,
  IconChartBar,
  IconFileText,
  IconInfo,
  IconWarningCircle,
} from "@/components/shared/icons";
import { createClient } from "@/lib/supabase/server";
import { buildRevenueFlowCategories } from "@/features/apbd/revenue-flow";
import { BudgetOverview } from "./budget-overview";
import { RevenueFlow } from "./revenue-flow";

export const metadata: Metadata = {
  title: "Transparansi Anggaran APBD · Noto PATI",
  description:
    "Data APBD Kabupaten Pati dari snapshot resmi DJPK, lengkap dengan pagu, realisasi, periode, dan sumber.",
};

type ApbdReport = {
  id: string;
  budget_year: number;
  period_month: number;
  period_name: string;
  pemda_name: string;
  source_url: string;
  download_url: string;
  fetched_at: string;
  keterangan_portal: string | null;
  raw_row_count: number;
  total_pendapatan_anggaran: number | string | null;
  total_pendapatan_realisasi: number | string | null;
  total_belanja_anggaran: number | string | null;
  total_belanja_realisasi: number | string | null;
  total_pembiayaan_anggaran: number | string | null;
  total_pembiayaan_realisasi: number | string | null;
};

type ApbdAccount = {
  row_index: number;
  akun: string;
  anggaran: number | string;
  realisasi: number | string;
  persentase: number | string;
  is_total_row: boolean;
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  notation: "compact",
  maximumFractionDigits: 1,
});

function toAmount(value: number | string | null | undefined): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function formatCurrency(value: number | string | null | undefined): string {
  return currencyFormatter.format(toAmount(value));
}

function formatCompactCurrency(value: number | string | null | undefined): string {
  return compactCurrencyFormatter.format(toAmount(value));
}

function formatPercent(value: number | string | null | undefined): string {
  const percentage = toAmount(value);
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(percentage)}%`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

async function getApbdData(budgetYear?: number): Promise<{
  report: ApbdReport | null;
  reports: ApbdReport[];
  availableYears: number[];
  accounts: ApbdAccount[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data: reports, error: reportError } = await supabase
    .from("apbd_reports")
    .select(
      "id, budget_year, period_month, period_name, pemda_name, source_url, download_url, fetched_at, keterangan_portal, raw_row_count, total_pendapatan_anggaran, total_pendapatan_realisasi, total_belanja_anggaran, total_belanja_realisasi, total_pembiayaan_anggaran, total_pembiayaan_realisasi",
    )
    .order("budget_year", { ascending: false })
    .order("period_month", { ascending: false })
    .limit(12);

  if (reportError) {
    return {
      report: null,
      reports: [],
      availableYears: [],
      accounts: [],
      error: `Data APBD belum dapat dimuat: ${reportError.message}`,
    };
  }

  const allReports = (reports ?? []) as ApbdReport[];
  const availableYears = [...new Set(allReports.map((item) => item.budget_year))].sort(
    (a, b) => b - a,
  );
  const selectedReports =
    budgetYear && availableYears.includes(budgetYear)
      ? allReports.filter((item) => item.budget_year === budgetYear)
      : allReports;
  const report = selectedReports[0] ?? null;

  if (!report) {
    return { report: null, reports: allReports, availableYears, accounts: [], error: null };
  }

  const { data: accounts, error: accountError } = await supabase
    .from("apbd_accounts")
    .select("row_index, akun, anggaran, realisasi, persentase, is_total_row")
    .eq("report_id", report.id)
    .order("row_index", { ascending: true });

  if (accountError) {
    return {
      report: null,
      reports: selectedReports,
      availableYears,
      accounts: [],
      error: `Ringkasan tersedia, tetapi rincian akun gagal dimuat: ${accountError.message}`,
    };
  }

  return {
    report,
    reports: selectedReports,
    availableYears,
    accounts: accounts ?? [],
    error: null,
  };
}

function DataState({
  title,
  description,
  warning = false,
}: {
  title: string;
  description: string;
  warning?: boolean;
}) {
  const Icon = warning ? IconWarningCircle : IconInfo;
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8" role={warning ? "alert" : "status"}>
      <Icon className="h-6 w-6 text-primary mb-3" aria-hidden="true" />
      <h2 className="text-lg font-bold text-text">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">{description}</p>
    </div>
  );
}

function BudgetAccountsChart({ accounts }: { accounts: ApbdAccount[] }) {
  return (
    <section aria-labelledby="accounts-chart-heading" className="space-y-4">
      <div>
        <h3 id="accounts-chart-heading" className="text-lg font-bold text-text">
          Perbandingan rencana dan uang tercatat
        </h3>
        <p className="mt-1 max-w-[68ch] text-sm leading-6 text-text-muted">
          Setiap batang membandingkan satu kelompok dengan rencananya sendiri. Batang penuh berarti
          100% rencana; warna menunjukkan bagian yang sudah tercatat.
        </p>
      </div>

      <ul className="grid gap-x-8 divide-y divide-border border-y border-border sm:grid-cols-2 sm:divide-y-0">
        {accounts.map((account) => {
          const budget = toAmount(account.anggaran);
          const realized = toAmount(account.realisasi);
          const progress = budget > 0 ? (realized / budget) * 100 : null;
          const fillWidth = progress === null ? 0 : Math.min(Math.max(progress, 0), 100);
          const progressLabel =
            progress === null
              ? "Belum ada rencana"
              : `${formatPercent(progress)}${progress > 100 ? ", melebihi rencana" : ""}`;

          return (
            <li
              key={account.row_index}
              className={`min-w-0 py-3 ${
                account.is_total_row ? "bg-primary-soft/30 px-2 font-semibold" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm text-text">{account.akun}</span>
                <span className="shrink-0 text-right text-xs font-semibold tabular-nums text-text">
                  {progressLabel}
                </span>
              </div>
              <p className="mt-1 flex flex-wrap gap-x-3 text-xs tabular-nums text-text-muted">
                <span>Rencana {formatCompactCurrency(budget)}</span>
                <span>Tercatat {formatCompactCurrency(realized)}</span>
              </p>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-primary-soft"
                role="meter"
                aria-label={`Bagian rencana yang sudah tercatat untuk ${account.akun}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={fillWidth}
                aria-valuetext={`${progressLabel}. Rencana ${formatCurrency(budget)}. Tercatat ${formatCurrency(realized)}.`}
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${fillWidth}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-xs leading-5 text-text-muted">
        Batang menunjukkan perbandingan, bukan bagian dari satu total bersama. Baris total merangkum
        rincian di bawahnya, jadi jangan menjumlahkan keduanya. Nominal lengkap ada di tabel.
      </p>
    </section>
  );
}

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedYearValue = Array.isArray(params.tahun) ? params.tahun[0] : params.tahun;
  const requestedYear =
    requestedYearValue && /^\d{4}$/.test(requestedYearValue)
      ? Number(requestedYearValue)
      : undefined;
  const { report, reports, availableYears, accounts, error } =
    await getApbdData(requestedYear);
  const revenueCategories = buildRevenueFlowCategories(accounts);

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="border-b border-border pb-6">
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Uang daerah: dari mana dan untuk apa?
          </h1>
          <p className="mt-3 max-w-[68ch] text-pretty text-sm leading-6 text-text-muted sm:text-base">
            Lihat dari mana uang daerah berasal, rencana penggunaannya, dan berapa yang sudah
            tercatat masuk atau dibelanjakan. Angka diambil dari laporan resmi.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-text-muted">
            <span className="inline-flex items-center gap-2">
              <IconChartBar className="h-4 w-4 text-primary" aria-hidden="true" />
              Transparansi APBD Kabupaten Pati
            </span>
            {report && (
              <span className="inline-flex items-center gap-2 text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                Data resmi DJPK
              </span>
            )}
          </div>
        </header>

        {error ? (
          <DataState title="Data APBD belum dapat ditampilkan" description={error} warning />
        ) : !report ? (
          <DataState
            title="Belum ada data APBD yang dipublikasikan"
            description="Data akan muncul setelah snapshot APBD Kabupaten Pati selesai diverifikasi dan diimpor ke sistem."
          />
        ) : (
          <>
            <BudgetOverview
              snapshot={{
                budgetYear: report.budget_year,
                periodName: report.period_name,
                totalPendapatanAnggaran: toAmount(report.total_pendapatan_anggaran),
                totalPendapatanRealisasi: toAmount(report.total_pendapatan_realisasi),
                totalBelanjaAnggaran: toAmount(report.total_belanja_anggaran),
                totalBelanjaRealisasi: toAmount(report.total_belanja_realisasi),
              }}
              availableYears={availableYears}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
              <span>{report.pemda_name}</span>
              <span className="inline-flex items-center gap-2">
                <IconCalendar className="h-4 w-4" aria-hidden="true" />
                <span>Diperbarui {formatDate(report.fetched_at)}</span>
              </span>
            </div>

            <details className="group border-y border-border">
              <summary className="cursor-pointer py-4 text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                Lihat diagram sumber pendapatan dan rincian APBD
              </summary>
              <div className="space-y-8 pb-6">
                <RevenueFlow
                  total={toAmount(report.total_pendapatan_anggaran)}
                  categories={revenueCategories}
                />

                {reports.length > 1 && (
                  <section aria-labelledby="timeline-heading" className="space-y-4">
                <div>
                  <h2 id="timeline-heading" className="flex items-center gap-2 text-xl font-bold text-text">
                    <IconCalendar className="h-5 w-5 text-primary" aria-hidden="true" />
                    Perkembangan laporan bulanan
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-text-muted">
                    Ikuti perubahan jumlah belanja yang tercatat dari periode ke periode. Angka ini hanya
                    membandingkan snapshot yang tersedia di database.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[...reports].reverse().map((period) => {
                    const budget = toAmount(period.total_belanja_anggaran);
                    const realized = toAmount(period.total_belanja_realisasi);
                    const progress = budget > 0 ? (realized / budget) * 100 : 0;

                    return (
                      <div key={`${period.budget_year}-${period.period_month}`} className="rounded-2xl border border-border bg-surface p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-text">{period.period_name}</span>
                          <span className="text-xs tabular-nums text-text-muted">{formatPercent(progress)}</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-soft" aria-hidden="true">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }} />
                        </div>
                        <p className="mt-3 text-xs text-text-muted">
                          Tercatat {formatCompactCurrency(period.total_belanja_realisasi)} dibelanjakan
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
                )}

            <section className="border-y border-border py-5" aria-labelledby="guide-heading">
              <h2 id="guide-heading" className="font-bold text-text">Arti istilah dalam laporan</h2>
              <dl className="mt-3 grid gap-x-8 gap-y-4 text-sm leading-6 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-text">Pos atau akun</dt>
                  <dd className="text-text-muted">
                    Nama kelompok dalam laporan, misalnya pajak atau belanja pegawai. Bukan nama
                    proyek atau lokasi tertentu.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-text">Pagu atau rencana dana</dt>
                  <dd className="text-text-muted">
                    Batas dana yang direncanakan untuk suatu kelompok.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-text">Realisasi atau sudah tercatat</dt>
                  <dd className="text-text-muted">
                    Jumlah yang tercatat sudah diterima atau dibelanjakan sampai {report.period_name}.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-text">Capaian atau bagian dari rencana</dt>
                  <dd className="text-text-muted">
                    Persentase realisasi dibanding pagu. Ini bukan nilai keberhasilan program.
                  </dd>
                </div>
              </dl>
                </section>

            <section aria-labelledby="near-heading" className="space-y-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 id="near-heading" className="text-xl font-bold text-text">
                    Anggaran yang dekat denganmu
                  </h2>
                  <p className="mt-2 max-w-[68ch] text-pretty text-sm leading-6 text-text-muted">
                    Nama kelompok di bawah membantu menghubungkan angka APBD dengan layanan publik
                    yang sehari-hari kita rasakan. Namun data ini masih berada pada tingkat
                    Kabupaten Pati, dan belum menunjukkan desa, kecamatan, lokasi proyek, atau penerima
                    manfaat tertentu.
                  </p>
                </div>
                <div className="max-w-sm rounded-xl bg-primary-soft/60 p-4 text-sm leading-6 text-text">
                  <p className="font-semibold">Yang bisa kita pastikan</p>
                  <p className="mt-1 text-text-muted">
                    Angka ini adalah rencana dan catatan resmi per kelompok, bukan bukti bahwa satu
                    proyek tertentu dibiayai dari kelompok tersebut.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {accounts
                  .filter((account) => account.is_total_row)
                  .map((account) => (
                    <div key={account.row_index} className="rounded-xl border border-border p-4">
                      <p className="font-semibold text-text">{account.akun}</p>
                      <p className="mt-2 text-lg font-bold tabular-nums text-primary">
                        {formatCompactCurrency(account.anggaran)}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {formatPercent(account.persentase)} dari rencana sudah tercatat
                      </p>
                    </div>
                  ))}
              </div>
                </section>

            <section aria-labelledby="detail-heading" className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 id="detail-heading" className="flex items-center gap-2 text-xl font-bold text-text">
                    <IconBuildings className="h-5 w-5 text-primary" aria-hidden="true" />
                    Rincian kelompok anggaran
                  </h2>
                  <p className="mt-1 max-w-[68ch] text-pretty text-sm leading-6 text-text-muted">
                    {accounts.length} kelompok dari laporan resmi. Total keseluruhan ada di ringkasan
                    atas.
                  </p>
                </div>
                <a
                  href={report.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
                >
                  <IconFileText className="h-4 w-4" aria-hidden="true" />
                  Buka sumber DJPK
                  <IconArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>

              {accounts.length === 0 ? (
                <DataState
                  title="Rincian akun belum tersedia"
                  description="Ringkasan APBD sudah tersedia, tetapi baris akun belum tersimpan untuk periode ini."
                />
              ) : (
                <>
                  <BudgetAccountsChart accounts={accounts} />
                  <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-xs">
                    <table className="w-full min-w-[680px] text-left text-sm">
                      <caption className="sr-only">
                        Rincian akun APBD {report.budget_year} sampai {report.period_name}
                      </caption>
                      <thead className="border-b border-border bg-primary-soft/35 text-xs uppercase tracking-wide text-text">
                        <tr>
                          <th scope="col" className="px-4 py-3 font-semibold">Kelompok anggaran</th>
                          <th scope="col" className="px-4 py-3 text-right font-semibold">Rencana dana</th>
                          <th scope="col" className="px-4 py-3 text-right font-semibold">Sudah tercatat</th>
                          <th scope="col" className="px-4 py-3 text-right font-semibold">Bagian rencana</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {accounts.map((account) => (
                          <tr key={account.row_index} className={account.is_total_row ? "bg-primary-soft/20" : "hover:bg-primary-soft/10"}>
                            <th scope="row" className={`px-4 py-3.5 text-text ${account.is_total_row ? "font-bold" : "font-medium"}`}>
                              {account.akun}
                              {account.is_total_row && (
                                <span className="ml-2 inline-flex items-center rounded-full border border-primary/20 px-2 py-0.5 text-[11px] font-medium text-primary">
                                  Total utama
                                </span>
                              )}
                            </th>
                            <td className="px-4 py-3.5 text-right tabular-nums text-text">{formatCurrency(account.anggaran)}</td>
                            <td className="px-4 py-3.5 text-right tabular-nums text-text">{formatCurrency(account.realisasi)}</td>
                            <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-primary">{formatPercent(account.persentase)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
                </section>

            <footer className="border-t border-border pt-5 text-xs leading-5 text-text-muted">
              <p>
                Sumber data:{" "}
                <a className="font-semibold text-primary underline underline-offset-2" href={report.source_url} target="_blank" rel="noreferrer">
                  Portal DJPK Kementerian Keuangan
                </a>
                . File diambil {formatDate(report.fetched_at)} dan memuat {report.raw_row_count} baris sumber.
              </p>
              {report.keterangan_portal && <p className="mt-1">{report.keterangan_portal}</p>}
              <p className="mt-2">
                Catatan: baris induk dan anak berasal dari sumber yang sama, sehingga jangan menjumlahkan seluruh baris tabel.
              </p>
                </footer>
              </div>
            </details>
          </>
        )}
      </div>
    </div>
  );
}
