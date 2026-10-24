/**
 * SATU tempat untuk seluruh teks wajib terkait prototipe, simulasi, dan identitas aplikasi.
 * Sesuai Prinsip Arsitektur P6: Teks tidak boleh diketik ulang per halaman.
 */

export const APP_CONFIG = {
  name: "Noto PATI",
  tagline: "Pelaporan Infrastruktur & Transparansi Anggaran Kabupaten Pati",
  region: "Kabupaten Pati",
  budgetYear: 2025,
} as const;

export const DISCLAIMERS = {
  prototypeBanner:
    "Prototipe Lomba: Data laporan, simulasi SLA, dan tindak lanjut dinas disimulasikan untuk keperluan pengujian dan demonstrasi lomba.",
  notOfficialGovernment:
    "Noto PATI adalah inisiatif independen kompetisi civic tech, bukan kanal aduan resmi Pemerintah Kabupaten Pati.",
  budgetSourceNotice:
    "Data anggaran bersumber dari dokumen resmi APBD Kabupaten Pati T.A. 2025 yang telah diverifikasi.",
  slaTargetNote:
    "Target SLA dihitung berdasarkan standar pelayanan simulasi prototipe.",
} as const;
