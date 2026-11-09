"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import type { ComboboxOption } from "@/components/ui/combobox";

interface ReportFiltersProps {
  category: string;
  status: string;
  search: string;
  sort: "recent" | "attention";
  categoryOptions: ComboboxOption[];
  statusOptions: ComboboxOption[];
}

export function ReportFilters({
  category,
  status,
  search,
  sort,
  categoryOptions,
  statusOptions,
}: ReportFiltersProps) {
  return (
    <form method="get" className="space-y-3 sm:space-y-0">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="w-full sm:w-48">
          <span className="sr-only">Urutkan laporan</span>
          <select
            aria-label="Urutkan laporan"
            className="w-full cursor-pointer rounded-lg border-2 border-border bg-background px-3 py-3 text-base text-text transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            defaultValue={sort}
            name="sort"
          >
            <option value="recent">Terbaru</option>
            <option value="attention">Perhatian warga</option>
          </select>
        </label>

        <label className="relative flex-1">
          <span className="sr-only">Cari laporan</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Cari judul atau lokasi laporan..."
            className="w-full rounded-lg border-2 border-border bg-background py-3 pl-9 pr-4 text-base text-text transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="relative w-full sm:w-56">
          <span className="sr-only">Filter kategori</span>
          <Combobox
            name="category"
            value={category}
            onValueChange={() => {}}
            aria-label="kategori laporan"
            placeholder="Semua Kategori"
            searchPlaceholder="Cari kategori..."
            options={categoryOptions}
          />
        </label>

        <label className="w-full sm:w-48">
          <span className="sr-only">Filter status</span>
          <Combobox
            name="status"
            value={status}
            onValueChange={() => {}}
            aria-label="status laporan"
            placeholder="Semua Status"
            searchPlaceholder="Cari status..."
            options={statusOptions}
          />
        </label>

        <Button
          type="submit"
          size="lg"
          className="w-full whitespace-nowrap shadow-sm transition-all hover:scale-[1.02] hover:shadow-md active:scale-95 sm:w-auto"
        >
          Terapkan Filter
        </Button>
      </div>

      <p className="mt-2 text-xs text-text-muted">
        Tip: gunakan filter untuk mempersempit pencarian berdasarkan kategori dan status.
      </p>
    </form>
  );
}
