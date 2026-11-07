"use client";

import { useRef, useState, type PointerEvent } from "react";
import type {
  RevenueCategoryId,
  RevenueFlowCategory,
  RevenueFlowChild,
} from "@/features/apbd/revenue-flow";

const categoryColors: Record<RevenueCategoryId, string> = {
  pad: "var(--primary)",
  transfer: "var(--accent)",
  other: "var(--status-selesai-text)",
};

const chart = {
  width: 1040,
  height: 430,
  top: 38,
  flowHeight: 310,
  categoryGap: 14,
  childGap: 6,
  sourceX: 28,
  categoryX: 320,
  childX: 650,
};

type Flow = {
  id: string;
  categoryId: RevenueCategoryId;
  label: string;
  amount: number;
  path: string;
};

type Tooltip = {
  label: string;
  amount: number;
  x: number;
  y: number;
};

function currency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function percentage(value: number, total: number): string {
  const amount = total > 0 ? (value / total) * 100 : 0;
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(amount)}%`;
}

function ribbonPath(
  startX: number,
  endX: number,
  startY: number,
  endY: number,
  height: number,
): string {
  const middleX = (startX + endX) / 2;
  return [
    `M ${startX} ${startY}`,
    `C ${middleX} ${startY}, ${middleX} ${endY}, ${endX} ${endY}`,
    `L ${endX} ${endY + height}`,
    `C ${middleX} ${endY + height}, ${middleX} ${startY + height}, ${startX} ${startY + height}`,
    "Z",
  ].join(" ");
}

function getChildLabel(child: RevenueFlowChild): string {
  return child.label
    .replace(/^Pendapatan Transfer /, "Transfer ")
    .replace(/^Hasil Pengelolaan Kekayaan Daerah yang Dipisahkan$/, "Hasil pengelolaan kekayaan")
    .replace(/^Lain-Lain PAD yang Sah$/, "Lain-lain PAD");
}

function FlowPath({
  flow,
  selectedCategoryId,
  hoveredFlowId,
  total,
  onHover,
  onLeave,
}: {
  flow: Flow;
  selectedCategoryId: RevenueCategoryId | null;
  hoveredFlowId: string | null;
  total: number;
  onHover: (flow: Flow, event: PointerEvent<SVGPathElement>) => void;
  onLeave: () => void;
}) {
  const isMuted = selectedCategoryId !== null && selectedCategoryId !== flow.categoryId;
  const isHighlighted = hoveredFlowId === flow.id;
  const description = `${flow.label}: ${currency(flow.amount)}, ${percentage(flow.amount, total)} dari total pendapatan.`;

  return (
    <path
      d={flow.path}
      fill={categoryColors[flow.categoryId]}
      fillOpacity={isHighlighted ? 0.88 : isMuted ? 0.1 : 0.42}
      stroke="transparent"
      strokeWidth="10"
      role="img"
      aria-label={description}
      onPointerEnter={(event) => onHover(flow, event)}
      onPointerMove={(event) => onHover(flow, event)}
      onPointerLeave={onLeave}
    >
      <title>{description}</title>
    </path>
  );
}

export function RevenueFlow({
  total,
  categories,
}: {
  total: number;
  categories: RevenueFlowCategory[];
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<RevenueCategoryId | null>(null);
  const [hoveredFlowId, setHoveredFlowId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const chartFrameRef = useRef<HTMLDivElement>(null);

  const drawableTotal = total > 0 ? total : 0;
  const scale = drawableTotal > 0 ? chart.flowHeight / drawableTotal : 0;
  let sourceOffset = 0;
  let visibleCategoryCount = 0;
  const flows: Flow[] = [];
  const categoryLayouts = categories.map((category) => {
    const amount = category.amount ?? 0;
    const height = amount * scale;
    const sourceY = chart.top + sourceOffset;
    const y = sourceY + visibleCategoryCount * chart.categoryGap;
    sourceOffset += height;

    if (amount > 0) {
      visibleCategoryCount += 1;
      flows.push({
        id: category.id,
        categoryId: category.id,
        label: category.label,
        amount,
        path: ribbonPath(
          chart.sourceX + 12,
          chart.categoryX,
          sourceY,
          y,
          height,
        ),
      });
    }

    const childTotal = category.children.reduce((sum, child) => sum + child.amount, 0);
    let childOffset = 0;
    let visibleChildCount = 0;
    const children = category.children.map((child) => {
      const childHeight = childTotal > 0 ? (height * child.amount) / childTotal : 0;
      const sourceChildY = y + childOffset;
      const childY = sourceChildY + visibleChildCount * chart.childGap;
      childOffset += childHeight;

      if (child.amount > 0 && height > 0) {
        visibleChildCount += 1;
        const childLabel = getChildLabel(child);
        flows.push({
          id: child.id,
          categoryId: category.id,
          label: childLabel,
          amount: child.amount,
          path: ribbonPath(
            chart.categoryX + 14,
            chart.childX,
            sourceChildY,
            childY,
            childHeight,
          ),
        });
      }

      return { child, y: childY, height: childHeight };
    });

    return { category, y, height, children };
  });

  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? null;

  function showTooltip(
    flow: Flow,
    x: number,
    y: number,
  ) {
    setHoveredFlowId(flow.id);
    setTooltip({
      label: flow.label,
      amount: flow.amount,
      x,
      y,
    });
  }

  function handlePointerHover(flow: Flow, event: PointerEvent<SVGPathElement>) {
    const frame = chartFrameRef.current?.getBoundingClientRect();
    if (!frame) return;
    showTooltip(flow, event.clientX - frame.left, event.clientY - frame.top);
  }

  return (
    <section aria-labelledby="origin-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="origin-heading" className="text-xl font-bold text-text">
            Dari mana uang daerah berasal?
          </h2>
          <p className="mt-1 max-w-[68ch] text-pretty text-sm leading-6 text-text-muted">
            Lebar aliran menunjukkan besar rencana pendapatan. Arahkan penunjuk ke aliran atau pilih
            sumber untuk melihat rincian dan bagiannya dari total.
          </p>
        </div>
        <div className="shrink-0 border-l border-primary pl-3 sm:text-right sm:border-l-0 sm:border-r sm:pr-3 sm:pl-0">
          <p className="text-xs font-medium text-text-muted">Total pendapatan</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-text">{compactCurrency(total)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div
          ref={chartFrameRef}
          className="relative"
          onPointerLeave={() => {
            setHoveredFlowId(null);
            setTooltip(null);
          }}
        >
          <div className="overflow-x-auto px-3 pt-4 sm:px-5">
            <svg
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              className="h-auto min-w-[820px] w-full"
              role="group"
              aria-label="Diagram Sankey pendapatan Kabupaten Pati. Pilih kategori atau aliran untuk melihat rincian."
            >
              <text x="28" y="20" className="fill-text-muted text-[11px] font-semibold">
                TOTAL
              </text>
              <text x={chart.categoryX} y="20" className="fill-text-muted text-[11px] font-semibold">
                SUMBER
              </text>
              <text x={chart.childX} y="20" className="fill-text-muted text-[11px] font-semibold">
                RINCIAN
              </text>

              {flows.map((flow) => (
                <FlowPath
                  key={flow.id}
                  flow={flow}
                  selectedCategoryId={selectedCategoryId}
                  hoveredFlowId={hoveredFlowId}
                  total={total}
                  onHover={handlePointerHover}
                  onLeave={() => {
                    setHoveredFlowId(null);
                    setTooltip(null);
                  }}
                />
              ))}

              <rect
                x={chart.sourceX}
                y={chart.top}
                width="12"
                height={chart.flowHeight}
                rx="6"
                fill="var(--primary)"
              />
              {categoryLayouts
                .filter((layout) => layout.height > 0)
                .map(({ category, y, height }) => (
                  <rect
                    key={category.id}
                    x={chart.categoryX}
                    y={y}
                    width="14"
                    height={height}
                    rx="7"
                    fill={categoryColors[category.id]}
                    fillOpacity={
                      selectedCategoryId && selectedCategoryId !== category.id ? 0.25 : 1
                    }
                  />
                ))}
              {categoryLayouts.flatMap(({ category, children }) =>
                children
                  .filter(({ height }) => height > 0)
                  .map(({ child, y, height }) => (
                    <rect
                      key={child.id}
                      x={chart.childX}
                      y={y}
                      width="10"
                      height={height}
                      rx="5"
                      fill={categoryColors[category.id]}
                      fillOpacity={
                        selectedCategoryId && selectedCategoryId !== category.id ? 0.25 : 1
                      }
                    />
                  )),
              )}
              <text x={chart.sourceX} y="410" className="fill-text text-[12px] font-semibold">
                Pendapatan daerah
              </text>
              <text x={chart.sourceX} y="426" className="fill-text-muted text-[11px]">
                {compactCurrency(total)}
              </text>
            </svg>
          </div>

          <p className="px-4 pb-3 pt-1 text-xs text-text-muted sm:hidden">
            Geser diagram ke samping untuk melihat seluruh aliran.
          </p>

          {tooltip && (
            <div
              role="tooltip"
              className="pointer-events-none absolute z-10 max-w-[min(18rem,calc(100%-1rem))] rounded-lg border border-border bg-surface px-3 py-2 shadow-md"
              style={{
                left: `min(${Math.max(8, tooltip.x + 12)}px, calc(100% - 18rem))`,
                top: Math.max(8, tooltip.y - 72),
              }}
            >
              <p className="text-xs font-semibold text-text">{tooltip.label}</p>
              <p className="mt-1 text-xs tabular-nums text-text-muted">
                {currency(tooltip.amount)} · {percentage(tooltip.amount, total)} dari total
              </p>
            </div>
          )}
        </div>

        <div className="grid border-t border-border sm:grid-cols-3">
          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id;
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectedCategoryId(isSelected ? null : category.id);
                  setHoveredFlowId(null);
                  setTooltip(null);
                }}
                className={`min-h-16 cursor-pointer border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-primary-soft/35 active:bg-primary-soft/60 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:border-b-0 sm:border-r sm:last:border-r-0 ${
                  isSelected ? "bg-primary-soft/45" : "bg-surface"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-text">{category.label}</span>
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: categoryColors[category.id] }}
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-1 block text-xs tabular-nums text-text-muted">
                  {category.amount === null
                    ? "Tidak tercantum terpisah"
                    : `${compactCurrency(category.amount)} · ${percentage(category.amount, total)}`}
                </span>
              </button>
            );
          })}
        </div>

        <div
          aria-live="polite"
          className="min-h-32 border-t border-border bg-primary-soft/20 px-4 py-4 sm:px-5"
        >
          {selectedCategory ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-semibold text-text">
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: categoryColors[selectedCategory.id] }}
                    aria-hidden="true"
                  />
                  {selectedCategory.label}
                </h3>
                <p className="text-sm font-semibold tabular-nums text-text">
                  {selectedCategory.amount === null
                    ? "Belum tercatat terpisah"
                    : `${currency(selectedCategory.amount)} · ${percentage(selectedCategory.amount, total)} dari total`}
                </p>
              </div>
              <p className="mt-1 max-w-[68ch] text-sm leading-6 text-text-muted">
                {selectedCategory.description}
                {selectedCategory.amount === null &&
                  " Karena tidak ada nilai terpisah di snapshot ini, aliran kategori ini tidak ditampilkan."}
              </p>
              {selectedCategory.children.length > 0 && (
                <ul className="mt-3 divide-y divide-border">
                  {selectedCategory.children.map((child) => (
                    <li
                      key={child.id}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2 text-sm"
                    >
                      <span className="text-text">{getChildLabel(child)}</span>
                      <span className="tabular-nums text-text-muted">
                        {currency(child.amount)} · {percentage(child.amount, total)} dari total
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {selectedCategory.amount !== null && selectedCategory.children.length === 0 && (
                <p className="mt-3 text-sm text-text-muted">
                  Rincian subkategori belum tersedia pada snapshot ini.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm leading-6 text-text-muted" aria-live="polite">
              Pilih salah satu sumber pendapatan untuk membaca penjelasan dan rincian subkategorinya.
              Aliran yang dipilih akan disorot pada diagram.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
