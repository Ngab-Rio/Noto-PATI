import type { Metadata } from "next";
import {
  IconArrowRight,
  IconBuildings,
  IconCalendar,
  IconChartBar,
  IconCheckCircle,
  IconFileText,
  IconInfo,
  IconWarningCircle,
} from "@/components/shared/icons";
import { createClient } from "@/lib/supabase/server";

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

async function getApbdData(): Promise<{
  report: ApbdReport | null;
  reports: ApbdReport[];
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
      accounts: [],
      error: `Data APBD belum dapat dimuat: ${reportError.message}`,
    };
  }

  const report = (reports?.[0] ?? null) as ApbdReport | null;

  if (!report) {
    return { report: null, reports: [], accounts: [], error: null };
  }

  const { data: accounts, error: accountError } = await supabase
    .from("apbd_accounts")
    .select("row_index, akun, anggaran, realisasi, persentase, is_total_row")
    .eq("report_id", report.id)
    .order("row_index", { ascending: true });

  if (accountError) {
    return {
      report: null,
      reports: reports as ApbdReport[],
      accounts: [],
      error: `Ringkasan tersedia, tetapi rincian akun gagal dimuat: ${accountError.message}`,
    };
  }

  return {
    report,
    reports: (reports ?? []) as ApbdReport[],
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

function SummaryMetric({
  label,
  budget,
  realized,
  tone = "text-text",
}: {
  label: string;
  budget: number | string | null;
  realized: number | string | null;
  tone?: string;
}) {
  const budgetAmount = toAmount(budget);
  const realizedAmount = toAmount(realized);
  const progress = budgetAmount > 0 ? (realizedAmount / budgetAmount) * 100 : 0;

  return (
    <div className="group relative isolate overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-xs">
      <span
        className="pointer-events-none absolute -right-2 -top-3 z-0 select-none text-[clamp(5rem,10vw,8rem)] font-black leading-none tracking-[-0.09em] text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-60 group-focus-within:opacity-60 [-webkit-text-stroke:1px_var(--color-primary)]"
        aria-hidden="true"
      >
        {formatPercent(progress)}
      </span>
      <div className="relative z-10">
      <p className="text-sm font-semibold text-text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${tone}`}>
        {formatCompactCurrency(budget)}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-text-muted">Pagu anggaran</dt>
          <dd className="mt-1 font-semibold tabular-nums text-text">{formatCurrency(budget)}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Realisasi</dt>
          <dd className="mt-1 font-semibold tabular-nums text-text">{formatCurrency(realized)}</dd>
        </div>
      </dl>
      <div className="mt-4" aria-label={`${label} terealisasi ${formatPercent(progress)}`}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Sudah terealisasi</span>
          <span className="font-semibold tabular-nums text-text">{formatPercent(progress)}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-soft" aria-hidden="true">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
      </div>
      </div>
    </div>
  );
}

function AccountStrip({
  account,
  total,
}: {
  account: ApbdAccount;
  total: number;
}) {
  const budget = toAmount(account.anggaran);
  const share = total > 0 ? (budget / total) * 100 : 0;

  return (
    <div className="group relative isolate overflow-hidden rounded-2xl border border-border bg-surface p-4">
      <span
        className="pointer-events-none absolute -right-2 -top-2 z-0 select-none text-[clamp(4rem,8vw,6rem)] font-black leading-none tracking-[-0.09em] text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-60 group-focus-within:opacity-60 [-webkit-text-stroke:1px_var(--color-primary)]"
        aria-hidden="true"
      >
        {formatCompactCurrency(budget)}
      </span>
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
        <p className="font-semibold text-text">{account.akun}</p>
        <p className="shrink-0 text-right text-sm font-bold tabular-nums text-primary">
          {formatCompactCurrency(budget)}
        </p>
        </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-soft" aria-hidden="true">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(Math.max(share, 0), 100)}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between gap-3 text-xs text-text-muted">
        <span>{formatPercent(share)} dari total pendapatan</span>
        <span>Realisasi {formatPercent(account.persentase)}</span>
      </div>
      </div>
    </div>
  );
}

export default async function BudgetPage() {
  const { report, reports, accounts, error } = await getApbdData();
  const budgetProgress =
    report && toAmount(report.total_belanja_anggaran) > 0
      ? (toAmount(report.total_belanja_realisasi) / toAmount(report.total_belanja_anggaran)) * 100
      : 0;

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="border-b border-border pb-6">
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Uang kota untuk siapa?
          </h1>
          <p className="mt-3 max-w-[68ch] text-pretty text-sm leading-6 text-text-muted sm:text-base">
            Mari telusuri dari mana pendapatan Kabupaten Pati berasal, ke mana anggaran diarahkan,
            dan berapa yang sudah terealisasi. Angka disajikan apa adanya dari sumber resmi.
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
            <section aria-labelledby="origin-heading" className="space-y-4">
              <div>
                <h2 id="origin-heading" className="text-xl font-bold text-text">
                  Dari mana uang kota berasal?
                </h2>
                <p className="mt-1 max-w-[68ch] text-pretty text-sm leading-6 text-text-muted">
                  Berikut beberapa sumber pendapatan yang tercatat dalam snapshot APBD ini.
                  Bar menunjukkan bagian pagu setiap akun dibandingkan total pendapatan daerah.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {accounts
                  .filter((account) =>
                    ["PAD", "Pajak Daerah", "Retribusi Daerah", "TKDD", "Pendapatan Lainnya"].some(
                      (name) => account.akun === name,
                    ),
                  )
                  .slice(0, 4)
                  .map((account) => (
                    <AccountStrip
                      key={account.row_index}
                      account={account}
                      total={toAmount(report.total_pendapatan_anggaran)}
                    />
                  ))}
              </div>
              <p className="text-xs leading-5 text-text-muted">
                Tidak semua sumber pendapatan ditampilkan di bagian ringkas ini. Lihat rincian
                akun di bawah untuk data lengkap dari dokumen sumber.
              </p>
            </section>

            <section aria-labelledby="snapshot-heading" className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 id="snapshot-heading" className="text-xl font-bold text-text">
                    Ringkasan APBD {report.budget_year}
                  </h2>
                  <p className="mt-1 text-sm text-text-muted">
                    {report.pemda_name} · laporan sampai {report.period_name}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <IconCalendar className="h-4 w-4" aria-hidden="true" />
                  <span>Diperbarui {formatDate(report.fetched_at)}</span>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                <SummaryMetric
                  label="Pendapatan daerah"
                  budget={report.total_pendapatan_anggaran}
                  realized={report.total_pendapatan_realisasi}
                  tone="text-primary"
                />
                <SummaryMetric
                  label="Belanja daerah"
                  budget={report.total_belanja_anggaran}
                  realized={report.total_belanja_realisasi}
                />
                <SummaryMetric
                  label="Pembiayaan daerah"
                  budget={report.total_pembiayaan_anggaran}
                  realized={report.total_pembiayaan_realisasi}
                  tone="text-accent"
                />
              </div>
              <div className="group relative isolate overflow-hidden border-y border-primary/20 bg-primary-soft/35 px-5 py-6 sm:px-6">
                <p
                  className="pointer-events-none absolute -right-3 -top-5 z-0 select-none text-[clamp(7rem,22vw,15rem)] font-black leading-none tracking-[-0.09em] text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-60 group-focus-within:opacity-60 [-webkit-text-stroke:1px_var(--color-primary)]"
                  aria-hidden="true"
                >
                  {formatPercent(budgetProgress)}
                </p>
                <div className="relative z-10 max-w-[68ch]">
                  <p className="text-sm font-semibold text-text">APBD dalam 30 detik</p>
                  <p className="mt-2 max-w-[58ch] text-pretty text-sm leading-6 text-text-muted">
                  Sampai <strong className="text-text">{report.period_name}</strong>, belanja
                  daerah yang sudah tercatat adalah{" "}
                  <strong className="text-text">
                    {formatCurrency(report.total_belanja_realisasi)}
                  </strong>{" "}
                  dari pagu{" "}
                  <strong className="text-text">
                    {formatCurrency(report.total_belanja_anggaran)}
                  </strong>
                  . Artinya, sekitar{" "}
                  <strong className="text-primary">
                    {formatPercent(budgetProgress)}
                  </strong>{" "}
                  dari rencana belanja sudah terealisasi. Ini adalah posisi pencatatan pada
                  periode tersebut, bukan penilaian baik atau buruknya program.
                  </p>
                </div>
              </div>
            </section>

            {reports.length > 1 && (
              <section aria-labelledby="timeline-heading" className="space-y-4">
                <div>
                  <h2 id="timeline-heading" className="flex items-center gap-2 text-xl font-bold text-text">
                    <IconCalendar className="h-5 w-5 text-primary" aria-hidden="true" />
                    Perkembangan laporan bulanan
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-text-muted">
                    Ikuti perubahan realisasi belanja dari periode ke periode. Angka ini hanya
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
                          Realisasi {formatCompactCurrency(period.total_belanja_realisasi)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-5 sm:p-6" aria-labelledby="guide-heading">
              <div className="flex gap-3">
                <IconCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h2 id="guide-heading" className="font-bold text-text">Cara membaca angka di sini</h2>
                  <p className="mt-1 max-w-[68ch] text-pretty text-sm leading-6 text-text-muted">
                    <strong className="text-text">Pagu/anggaran</strong> adalah rencana maksimal
                    yang ditetapkan. <strong className="text-text">Realisasi</strong> adalah jumlah
                    yang sudah tercatat sampai periode laporan. Persentase menunjukkan perbandingan
                    realisasi terhadap pagu—bukan penilaian kualitas program.
                  </p>
                </div>
              </div>
            </section>

            <section aria-labelledby="near-heading" className="space-y-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 id="near-heading" className="text-xl font-bold text-text">
                    Anggaran yang dekat denganmu
                  </h2>
                  <p className="mt-2 max-w-[68ch] text-pretty text-sm leading-6 text-text-muted">
                    Nama akun di bawah membantu menghubungkan angka APBD dengan layanan publik
                    yang sehari-hari kita rasakan. Namun data ini masih berada pada tingkat
                    Kabupaten Pati—belum menunjukkan desa, kecamatan, lokasi proyek, atau penerima
                    manfaat tertentu.
                  </p>
                </div>
                <div className="max-w-sm rounded-xl bg-primary-soft/60 p-4 text-sm leading-6 text-text">
                  <p className="font-semibold">Yang bisa kita pastikan</p>
                  <p className="mt-1 text-text-muted">
                    Ini adalah pagu dan realisasi akun resmi, bukan bukti bahwa satu proyek tertentu
                    dibiayai dari akun tersebut.
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
                        Realisasi {formatPercent(account.persentase)} dari pagu
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
                    Rincian pos dalam laporan
                  </h2>
                  <p className="mt-1 max-w-[68ch] text-pretty text-sm leading-6 text-text-muted">
                    {accounts.length} baris akun dari dokumen sumber. Gunakan total ringkasan di atas
                    untuk melihat jumlah keseluruhan.
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
                <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-xs">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <caption className="sr-only">
                      Rincian akun APBD {report.budget_year} sampai {report.period_name}
                    </caption>
                    <thead className="border-b border-border bg-primary-soft/35 text-xs uppercase tracking-wide text-text">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-semibold">Pos anggaran</th>
                        <th scope="col" className="px-4 py-3 text-right font-semibold">Pagu</th>
                        <th scope="col" className="px-4 py-3 text-right font-semibold">Realisasi</th>
                        <th scope="col" className="px-4 py-3 text-right font-semibold">Capaian</th>
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
          </>
        )}
      </div>
    </div>
  );
}
