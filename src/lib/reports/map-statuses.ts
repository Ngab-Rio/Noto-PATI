/**
 * Status laporan yang tampil di peta publik secara default.
 * Hanya laporan aktif; selesai/ditolak/ditutup/digabung tidak ikut
 * kecuali diminta eksplisit lewat filter status.
 *
 * Catatan: `dibuka_kembali` dan `ditutup` belum ada di enum
 * `report_status` database saat ini, jadi tidak boleh masuk query.
 * Tambahkan kembali setelah migrasi enum tersedia.
 */
export const DEFAULT_MAP_STATUSES = [
  "diterima",
  "diverifikasi",
  "diproses",
] as const;

/** Status yang boleh tampil hanya saat difilter eksplisit. */
export const OPTIONAL_MAP_STATUSES = ["selesai", "ditolak"] as const;

export type MapStatus =
  | (typeof DEFAULT_MAP_STATUSES)[number]
  | (typeof OPTIONAL_MAP_STATUSES)[number];

const ALLOWED_STATUSES: readonly string[] = [
  ...DEFAULT_MAP_STATUSES,
  ...OPTIONAL_MAP_STATUSES,
];

export function isMapStatus(value: string): value is MapStatus {
  return ALLOWED_STATUSES.includes(value);
}

/**
 * Menyaring status yang diminta; tanpa filter valid, pakai status aktif.
 */
export function resolveMapStatuses(requested: readonly string[]): MapStatus[] {
  const valid = requested.filter(isMapStatus);
  return valid.length > 0 ? valid : [...DEFAULT_MAP_STATUSES];
}
