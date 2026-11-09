"use client";

import * as React from "react";
import { IconSearch, IconBookOpen } from "@/components/shared/icons";
import type { CareArticle } from "@/features/care/types";
import { CARE_CATEGORIES } from "@/features/care/types";
import { CareCard } from "@/features/care/components/CareCard";

interface CareDirectoryClientProps {
  initialArticles: CareArticle[];
}

export function CareDirectoryClient({ initialArticles }: CareDirectoryClientProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const filteredArticles = React.useMemo(() => {
    return initialArticles.filter((article) => {
      const matchCategory =
        selectedCategory === "all" || article.category === selectedCategory;

      const query = searchQuery.trim().toLowerCase();
      const categoryMeta = CARE_CATEGORIES[article.category];
      const searchableContent = [
        article.title,
        article.summary,
        article.content,
        categoryMeta.label,
        categoryMeta.dinas,
        ...article.causes,
        ...article.impacts,
        ...article.safetyActions,
        ...article.preventionSteps,
        ...article.references.flatMap((reference) => [
          reference.title,
          reference.source,
        ]),
      ]
        .join(" ")
        .toLowerCase();
      const matchSearch = !query || searchableContent.includes(query);

      return matchCategory && matchSearch;
    });
  }, [initialArticles, selectedCategory, searchQuery]);

  const categoryOptions = [
    { key: "all", label: "Semua Kategori" },
    ...Object.values(CARE_CATEGORIES).map((cat) => ({
      key: cat.key,
      label: cat.label,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Controls: Search and Category Pills */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Cari topik, gejala kerusakan, atau keselamatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text"
            >
              Reset
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {categoryOptions.map((opt) => {
            const isActive = selectedCategory === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSelectedCategory(opt.key)}
                className={[
                  "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border",
                  isActive
                    ? "bg-primary text-white border-primary shadow-2xs"
                    : "bg-surface text-text-muted border-border hover:border-primary/50 hover:text-text",
                ].join(" ")}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3 bg-surface/50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary-dark">
            <IconBookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-text">
            Materi edukasi tidak ditemukan
          </h3>
          <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto">
            Tidak ada materi yang sesuai dengan pencarian atau filter yang dipilih. Coba gunakan kata kunci lain atau pilih &apos;Semua Kategori&apos;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Hapus filter pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredArticles.map((article) => (
            <CareCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
