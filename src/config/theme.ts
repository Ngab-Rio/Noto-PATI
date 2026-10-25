/**
 * NOTO PATI · Style Guide Configuration & Theme Tokens
 *
 * Sesuai dengan spesifikasi Design System & Style Guide Figma Noto PATI:
 * - Brand: Biru soft (#3B6EA5) & Terracotta hangat (#A8532E)
 * - Neutral: Page background (#F6F9FC), Surface (#FFFFFF), Border (#DCE5EE), Text (#1F2D3D, #556577)
 * - Status Laporan: WCAG AA Compliant (minimal 4,5:1 contrast)
 */

export const THEME_COLORS = {
  brand: {
    primary: {
      name: "Primary/Default",
      hex: "#3B6EA5",
      cssVar: "--color-primary",
      description: "Biru soft sebagai warna utama identitas Noto PATI",
    },
    primaryDark: {
      name: "Primary/Dark",
      hex: "#2F5F95",
      cssVar: "--color-primary-dark",
      description: "Biru pekat untuk state hover tombol dan penekanan aksi",
    },
    primarySoft: {
      name: "Primary/Soft",
      hex: "#E3EEF8",
      cssVar: "--color-primary-soft",
      description: "Latar informasi, chip sekunder, dan blok sorotan",
    },
    accent: {
      name: "Accent/Default",
      hex: "#A8532E",
      cssVar: "--color-accent",
      description: "Terracotta hangat sebagai aksen hemat dan fokus perhatian",
    },
    accentSoft: {
      name: "Accent/Soft",
      hex: "#FCEBDF",
      cssVar: "--color-accent-soft",
      description: "Aksen lembut untuk background alert atau chip aksen",
    },
  },
  neutral: {
    background: {
      name: "Background/Page",
      hex: "#F6F9FC",
      cssVar: "--color-background",
      description: "Latar utama halaman",
    },
    surface: {
      name: "Background/Surface",
      hex: "#FFFFFF",
      cssVar: "--color-surface",
      description: "Permukaan kartu, dialog, dan panel",
    },
    border: {
      name: "Border/Default",
      hex: "#DCE5EE",
      cssVar: "--color-border",
      description: "Garis pemisah kartu, tabel, dan input",
    },
    text: {
      name: "Text/Primary",
      hex: "#1F2D3D",
      cssVar: "--color-text",
      description: "Teks judul dan isi utama dengan keterbacaan tinggi",
    },
    textMuted: {
      name: "Text/Secondary",
      hex: "#556577",
      cssVar: "--color-text-muted",
      description: "Teks sekunder, label tanggal, dan keterangan pendukung",
    },
    textOnPrimary: {
      name: "Text/On-Primary",
      hex: "#FFFFFF",
      cssVar: "--color-text-on-primary",
      description: "Teks di atas elemen berwarna primary",
    },
  },
} as const;

export type ReportStatusKey =
  | "diterima"
  | "diverifikasi"
  | "diproses"
  | "selesai"
  | "dibuka_kembali"
  | "ditolak"
  | "digabung"
  | "ditutup";

export interface StatusStyleConfig {
  key: ReportStatusKey;
  label: string;
  category: "utama" | "lainnya";
  styleText: string;
  textColor: string;
  styleBg: string;
  bgColor: string;
  textClass: string;
  bgClass: string;
  borderClass?: string;
  badgeClass: string;
}

export const REPORT_STATUS_CONFIG: Record<ReportStatusKey, StatusStyleConfig> = {
  // Status Utama
  diterima: {
    key: "diterima",
    label: "Diterima",
    category: "utama",
    styleText: "Status/Diterima/Text",
    textColor: "#2C6A93",
    styleBg: "Status/Diterima/Bg",
    bgColor: "#E1F0F8",
    textClass: "text-status-diterima-text",
    bgClass: "bg-status-diterima-bg",
    badgeClass: "bg-status-diterima-bg text-status-diterima-text border-status-diterima-text/15",
  },
  diverifikasi: {
    key: "diverifikasi",
    label: "Diverifikasi",
    category: "utama",
    styleText: "Status/Diverifikasi/Text",
    textColor: "#2F6568",
    styleBg: "Status/Diverifikasi/Bg",
    bgColor: "#DDEFEF",
    textClass: "text-status-diverifikasi-text",
    bgClass: "bg-status-diverifikasi-bg",
    badgeClass: "bg-status-diverifikasi-bg text-status-diverifikasi-text border-status-diverifikasi-text/15",
  },
  diproses: {
    key: "diproses",
    label: "Diproses",
    category: "utama",
    styleText: "Status/Diproses/Text",
    textColor: "#7A5A12",
    styleBg: "Status/Diproses/Bg",
    bgColor: "#FBF0D2",
    textClass: "text-status-diproses-text",
    bgClass: "bg-status-diproses-bg",
    badgeClass: "bg-status-diproses-bg text-status-diproses-text border-status-diproses-text/15",
  },
  selesai: {
    key: "selesai",
    label: "Selesai",
    category: "utama",
    styleText: "Status/Selesai/Text",
    textColor: "#2E6B45",
    styleBg: "Status/Selesai/Bg",
    bgColor: "#DDEFE2",
    textClass: "text-status-selesai-text",
    bgClass: "bg-status-selesai-bg",
    badgeClass: "bg-status-selesai-bg text-status-selesai-text border-status-selesai-text/15",
  },

  // Status Lainnya
  dibuka_kembali: {
    key: "dibuka_kembali",
    label: "Dibuka Kembali",
    category: "lainnya",
    styleText: "Status/Dibuka-Kembali/Text",
    textColor: "#9A4D22",
    styleBg: "Status/Dibuka-Kembali/Bg",
    bgColor: "#FBE6D6",
    textClass: "text-status-dibuka-kembali-text",
    bgClass: "bg-status-dibuka-kembali-bg",
    badgeClass: "bg-status-dibuka-kembali-bg text-status-dibuka-kembali-text border-status-dibuka-kembali-text/15",
  },
  ditolak: {
    key: "ditolak",
    label: "Ditolak",
    category: "lainnya",
    styleText: "Status/Ditolak/Text",
    textColor: "#8F3A3A",
    styleBg: "Status/Ditolak/Bg",
    bgColor: "#F7DEDE",
    textClass: "text-status-ditolak-text",
    bgClass: "bg-status-ditolak-bg",
    badgeClass: "bg-status-ditolak-bg text-status-ditolak-text border-status-ditolak-text/15",
  },
  digabung: {
    key: "digabung",
    label: "Digabung",
    category: "lainnya",
    styleText: "Status/Digabung/Text",
    textColor: "#594B86",
    styleBg: "Status/Digabung/Bg",
    bgColor: "#E9E5F3",
    textClass: "text-status-digabung-text",
    bgClass: "bg-status-digabung-bg",
    badgeClass: "bg-status-digabung-bg text-status-digabung-text border-status-digabung-text/15",
  },
  ditutup: {
    key: "ditutup",
    label: "Ditutup",
    category: "lainnya",
    styleText: "Status/Ditutup/Text",
    textColor: "#5A5953",
    styleBg: "Status/Ditutup/Bg",
    bgColor: "#ECEBE8",
    textClass: "text-status-ditutup-text",
    bgClass: "bg-status-ditutup-bg",
    badgeClass: "bg-status-ditutup-bg text-status-ditutup-text border-status-ditutup-text/15",
  },
};

/**
 * Normalisasi status input string menjadi ReportStatusKey yang valid
 */
export function normalizeReportStatus(raw: string): ReportStatusKey {
  const clean = raw.toLowerCase().replace(/[-\s]+/g, "_");
  if (clean in REPORT_STATUS_CONFIG) {
    return clean as ReportStatusKey;
  }
  // Alternatif alias
  if (clean === "verified") return "diverifikasi";
  if (clean === "in_progress" || clean === "proses") return "diproses";
  if (clean === "resolved" || clean === "done") return "selesai";
  if (clean === "reopened") return "dibuka_kembali";
  if (clean === "rejected") return "ditolak";
  if (clean === "merged") return "digabung";
  if (clean === "closed") return "ditutup";
  return "diterima";
}
