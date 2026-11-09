const RESERVED_CHARS = /[,()*"\\]/g;

/**
 * Nilai di dalam `or=` PostgREST dipisah koma dan rusak oleh karakter khusus,
 * jadi dibersihkan dulu. Null berarti pencarian kosong → tanpa filter.
 */
export function buildSearchOrFilter(search: string): string | null {
  const term = normalizeSearchTerm(search);
  if (!term) return null;

  return `title.ilike.%${term}%,detail_location.ilike.%${term}%`;
}

export function normalizeSearchTerm(search: string): string | null {
  const term = search.trim().replace(RESERVED_CHARS, " ").trim();
  return term || null;
}
