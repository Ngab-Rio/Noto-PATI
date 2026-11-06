export const DJPK_CONSTANTS = {
  PORTAL_BASE_URL: "https://djpk.kemenkeu.go.id/portal/data/apbd",
  DOWNLOAD_CSV_URL: "https://djpk.kemenkeu.go.id/portal/csv_apbd",
  DEFAULT_PROVINSI: "11", // Jawa Tengah
  DEFAULT_PROVINSI_NAME: "Provinsi Jawa Tengah",
  DEFAULT_PEMDA: "17", // Kab. Pati
  DEFAULT_PEMDA_NAME: "Kab. Pati",
  DEFAULT_TAHUN: 2026,
  DEFAULT_PERIODE: 1, // Januari
  USER_AGENT: "Mozilla/5.0 (compatible; NotoPati-ApbdScraper/1.0; +https://github.com/Ngab-Rio/Noto-PATI)",
} as const;

export const MONTH_NAMES: Record<number, string> = {
  1: "Januari",
  2: "Februari",
  3: "Maret",
  4: "April",
  5: "Mei",
  6: "Juni",
  7: "Juli",
  8: "Agustus",
  9: "September",
  10: "Oktober",
  11: "November",
  12: "Desember",
};

