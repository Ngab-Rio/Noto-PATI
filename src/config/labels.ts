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
  notOfficialGovernment:
    "Noto PATI adalah inisiatif independen kompetisi civic tech, bukan kanal aduan resmi Pemerintah Kabupaten Pati.",
  budgetSourceNotice:
    "Data anggaran bersumber dari dokumen resmi APBD Kabupaten Pati T.A. 2025 yang telah diverifikasi.",
  dataSimulation:
    "Data laporan dan tindak lanjut yang ditampilkan adalah data simulasi untuk keperluan demonstrasi.",
} as const;
