"use client";

import { useState } from "react";

export interface BudgetOverviewSnapshot {
  budgetYear: number;
  periodName: string;
  totalPendapatanAnggaran: number;
  totalPendapatanRealisasi: number;
  totalBelanjaAnggaran: number;
  totalBelanjaRealisasi: number;
}

type BudgetLaneProps = {
  label: string;
  realizedLabel: string;
  budgetLabel: string;
  remainingLabel: string;
  budget: number;
  realized: number;
  tone: "primary" | "accent";
  displayMode: "nominal" | "persentase";
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

const compactCurrencyUnits: Record<string, string> = {
  T: "triliun",
  M: "miliar",
  jt: "juta",
  rb: "ribu",
};

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(value);
}

function formatReadableCompactCurrency(value: number): string {
  return compactCurrencyFormatter
    .formatToParts(value)
    .map((part) =>
      part.type === "compact" ? compactCurrencyUnits[part.value] ?? part.value : part.value,
    )
    .join("");
}

function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value)}%`;
}

function BudgetLane({
  label,
  realizedLabel,
  budgetLabel,
  remainingLabel,
  budget,
  realized,
  tone,
  displayMode,
}: BudgetLaneProps) {
  const progress = budget > 0 ? (realized / budget) * 100 : 0;
  const remaining = budget - realized;
  const fillWidth = Math.min(Math.max(progress, 0), 100);
  const toneClass = tone === "primary" ? "bg-primary" : "bg-accent";
  const differenceLabel =
    remaining >= 0
      ? remainingLabel
      : `Melebihi ${budgetLabel.toLocaleLowerCase("id-ID")}`;

  return (
    <article className="min-w-0 px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-text">{label}</h3>
        <span
          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${toneClass}`}
          aria-hidden="true"
        />
      </div>

      <p className="mt-5 text-2xl font-bold tracking-tight tabular-nums text-text sm:text-3xl">
        {displayMode === "nominal" ? formatCompactCurrency(realized) : formatPercent(progress)}
      </p>
      <p className="mt-1 text-xs text-text-muted">
        {displayMode === "nominal" ? realizedLabel : "dari rencana"}
      </p>

      <div className="mt-5">
        <div
          className="h-3 overflow-hidden rounded-full bg-primary-soft"
          role="meter"
          aria-label={`Realisasi ${label.toLocaleLowerCase("id-ID")}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={fillWidth}
          aria-valuetext={`${formatPercent(progress)} terealisasi`}
          title={`Rencana ${formatCurrency(budget)}. Uang yang sudah tercatat ${formatCurrency(realized)} (${formatPercent(progress)}). ${differenceLabel} ${formatCurrency(Math.abs(remaining))}.`}
        >
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${toneClass}`}
            style={{ width: `${fillWidth}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
          <span className="text-text-muted">0%</span>
          <span className="font-semibold tabular-nums text-text">{formatPercent(progress)}</span>
          <span className="text-text-muted">100%</span>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
        <div className="min-w-0">
          <dt className="text-text-muted">{budgetLabel}</dt>
          <dd className="mt-1 break-words font-semibold tabular-nums text-text">
            {formatCurrency(budget)}
          </dd>
        </div>
        <div className="min-w-0 text-right">
          <dt className="text-text-muted">{differenceLabel}</dt>
          <dd className="mt-1 break-words font-semibold tabular-nums text-text">
            {displayMode === "nominal"
              ? formatCurrency(Math.abs(remaining))
              : formatPercent(budget > 0 ? (Math.abs(remaining) / budget) * 100 : 0)}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function BudgetOverview({
  snapshot,
  availableYears,
}: {
  snapshot: BudgetOverviewSnapshot;
  availableYears: number[];
}) {
  const [displayMode, setDisplayMode] = useState<"nominal" | "persentase">("nominal");
  const incomeProgress =
    snapshot.totalPendapatanAnggaran > 0
      ? (snapshot.totalPendapatanRealisasi / snapshot.totalPendapatanAnggaran) * 100
      : 0;
  const spendingProgress =
    snapshot.totalBelanjaAnggaran > 0
      ? (snapshot.totalBelanjaRealisasi / snapshot.totalBelanjaAnggaran) * 100
      : 0;

  return (
    <section aria-labelledby="snapshot-heading" className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="snapshot-heading" className="text-xl font-bold text-text">
            Keuangan Pati, singkatnya
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Data {snapshot.budgetYear}, tercatat sampai {snapshot.periodName}
          </p>
          <div className="mt-3 grid max-w-[68ch] gap-1 text-sm leading-6 text-text sm:grid-cols-2 sm:gap-x-5">
            <p>
              <strong>Pendapatan:</strong> dari rencana{" "}
              {formatReadableCompactCurrency(snapshot.totalPendapatanAnggaran)},{" "}
              {formatReadableCompactCurrency(snapshot.totalPendapatanRealisasi)} sudah tercatat
              masuk ({formatPercent(incomeProgress)}).
            </p>
            <p>
              <strong>Belanja:</strong> dari rencana{" "}
              {formatReadableCompactCurrency(snapshot.totalBelanjaAnggaran)},{" "}
              {formatReadableCompactCurrency(snapshot.totalBelanjaRealisasi)} sudah tercatat
              dibelanjakan ({formatPercent(spendingProgress)}).
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          {availableYears.length > 1 && (
            <form action="/budget" method="get" className="flex items-end gap-2">
              <div>
                <label htmlFor="budget-year" className="mb-1 block text-xs font-medium text-text-muted">
                  Tahun anggaran
                </label>
                <select
                  id="budget-year"
                  name="tahun"
                  defaultValue={snapshot.budgetYear}
                  className="min-h-11 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="min-h-11 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-text transition-colors hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-primary-soft"
              >
                Tampilkan
              </button>
            </form>
          )}
          <fieldset className="min-w-0 border-0 p-0">
            <legend className="mb-1 text-xs font-medium text-text-muted">
              Tampilkan angka sebagai
            </legend>
            <div className="inline-flex min-h-11 rounded-lg border border-border bg-surface p-1">
              {(["nominal", "persentase"] as const).map((mode) => {
                const isSelected = displayMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setDisplayMode(mode)}
                    className={`min-h-9 cursor-pointer rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary active:bg-primary-soft ${
                      isSelected
                        ? "bg-primary-soft text-text"
                        : "text-text-muted hover:bg-primary-soft/60 hover:text-text"
                    }`}
                  >
                    {mode === "nominal" ? "Nominal" : "Persentase"}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
          <BudgetLane
            label="Uang masuk"
            realizedLabel="sudah tercatat masuk"
            budgetLabel="Rencana pendapatan"
            remainingLabel="Belum tercatat masuk"
            budget={snapshot.totalPendapatanAnggaran}
            realized={snapshot.totalPendapatanRealisasi}
            tone="primary"
            displayMode={displayMode}
          />
          <BudgetLane
            label="Uang dibelanjakan"
            realizedLabel="sudah tercatat dibelanjakan"
            budgetLabel="Rencana belanja"
            remainingLabel="Belum dibelanjakan"
            budget={snapshot.totalBelanjaAnggaran}
            realized={snapshot.totalBelanjaRealisasi}
            tone="accent"
            displayMode={displayMode}
          />
        </div>
        <p className="border-t border-border bg-primary-soft/20 px-4 py-3 text-xs leading-5 text-text-muted sm:px-6">
          Angka besar menunjukkan jumlah yang sudah tercatat masuk atau dibelanjakan. Jumlah di bawah
          adalah rencana awal, dan garis menunjukkan bagian rencana yang sudah tercatat. Selisihnya
          bukan ukuran keberhasilan program.
        </p>
      </div>
    </section>
  );
}
