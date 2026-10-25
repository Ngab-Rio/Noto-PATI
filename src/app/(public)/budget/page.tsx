import type { Metadata } from "next";
import {
  IconChartBar,
  IconBuildings,
  IconSparkle,
} from "@/components/shared/icons";
import { DataSimulationBadge } from "@/components/shared/data-simulation-badge";

export const metadata: Metadata = {
  title: "Transparansi Anggaran APBD 2025 · Noto PATI",
  description:
    "Transparansi data alokasi APBD Kabupaten Pati T.A. 2025 untuk belanja infrastruktur publik.",
};

const BUDGET_BREAKDOWN = [
  {
    opd: "DPUTR Bidang Bina Marga",
    program: "Penyelenggaraan Jalan & Jembatan Kabupaten",
    anggaran: "Rp 148,5 Miliar",
    realisasi: "64%",
    laporanTerkait: "98 Laporan",
  },
  {
    opd: "DPUTR Bidang Sumber Daya Air",
    program: "Pengendalian Banjir, Normalisasi Sungai & Drainase",
    anggaran: "Rp 54,2 Miliar",
    realisasi: "52%",
    laporanTerkait: "47 Laporan",
  },
  {
    opd: "Dinas Perhubungan (Dishub)",
    program: "Penerangan Jalan Umum (PJU) & Rambu Keselamatan",
    anggaran: "Rp 21,8 Miliar",
    realisasi: "71%",
    laporanTerkait: "34 Laporan",
  },
  {
    opd: "Dinas Perumahan dan Kawasan Permukiman (Disperkim)",
    program: "Peningkatan Kualitas Permukiman & Sanitasi Warga",
    anggaran: "Rp 38,4 Miliar",
    realisasi: "58%",
    laporanTerkait: "26 Laporan",
  },
];

export default function BudgetPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary-dark text-xs font-semibold mb-2">
            <IconChartBar className="h-3.5 w-3.5" />
            <span>Transparansi Publik APBD 2025</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">
            Alokasi Anggaran Belanja Infrastruktur Pati
          </h1>
          <p className="text-sm text-text-muted mt-1 max-w-3xl leading-relaxed">
            Menghubungkan masalah infrastruktur yang dilaporkan warga dengan pos anggaran belanja
            resmi Pemerintah Kabupaten Pati T.A. 2025 berdasarkan Perda No. 12/2024 dan Perda No. 2/2025.
          </p>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
            <span className="text-xs text-text-muted font-medium">Total Belanja APBD Pati 2025</span>
            <div className="mt-1 flex items-baseline gap-2">
              <strong className="text-2xl sm:text-3xl font-bold text-text">Rp 3,12 T</strong>
              <span className="text-xs text-text-muted">(Perda 2/2025)</span>
            </div>
            <p className="text-xs text-text-muted mt-2">
              Total belanja daerah Kabupaten Pati setelah penetapan perubahan anggaran.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
            <span className="text-xs text-text-muted font-medium">Pos Infrastruktur & Fasilitas</span>
            <div className="mt-1 flex items-baseline gap-2">
              <strong className="text-2xl sm:text-3xl font-bold text-primary">Rp 262,9 M</strong>
              <span className="text-xs text-text-muted font-medium">(Pagu, bukan realisasi)</span>
              <span className="text-xs text-emerald-600 font-semibold">Aktif Berjalan</span>
            </div>
            <p className="text-xs text-text-muted mt-2">
              Alokasi perbaikan jalan, jembatan, lampu penerangan, dan tanggul sungai.
            </p>
            <div className="mt-2">
              <DataSimulationBadge size="sm" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
            <span className="text-xs text-text-muted font-medium">Laporan Warga Terhubung</span>
            <div className="mt-1 flex items-baseline gap-2">
              <strong className="text-2xl sm:text-3xl font-bold text-accent">205 Laporan</strong>
              <span className="text-xs text-text-muted">ke OPD</span>
            </div>
            <p className="text-xs text-text-muted mt-2">
              Laporan terverifikasi yang langsung dikaitkan dengan dinas teknis terkait.
            </p>
            <div className="mt-2">
              <DataSimulationBadge size="sm" />
            </div>
          </div>
        </div>

        {/* AI Explainer Callout (Primary/Soft block) */}
        <div className="rounded-xl bg-primary-soft border border-primary/25 p-5 text-text">
          <div className="flex items-center gap-2 font-semibold text-primary-dark mb-1.5">
            <IconSparkle className="h-4 w-4 text-accent" />
            <span className="text-sm">Penjelasan Sederhana Anggaran (AI Assistant Noto PATI)</span>
          </div>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed pl-6">
            &ldquo;Dari total anggaran belanja infrastruktur Kabupaten Pati Rp 262,9 Miliar, porsi terbesar
            dialokasikan pada pemeliharaan berkala jalan kabupaten dan jembatan (56%), disusul normalisasi
            saluran air untuk antisipasi banjir tahunan di DAS Juwana (21%). Setiap warga berhak memantau
            realisasi fisik di lapangan lewat foto laporan.&rdquo;
          </p>
          <p className="text-[11px] text-text-muted mt-2 pl-6 italic">
            Sumber analisis: Perda APBD Kabupaten Pati No. 12/2024 (hal. 23-28), Perda Perubahan APBD No. 2/2025 (hal. 15-19). 
            Ringkasan dihasilkan oleh AI untuk memudahkan pemahaman publik.
          </p>
        </div>

        {/* Table of Budget Allocation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <IconBuildings className="h-5 w-5 text-primary" />
              <span>Daftar Alokasi per Dinas Teknis (OPD)</span>
            </h2>
            <div className="text-xs text-text-muted">
              Sumber: Lampiran Perda APBD Pati No. 12/2024 (Bagian III, hal. 45-52) dan Perda No. 2/2025 (hal. 23-26)
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary-soft/30 border-b border-border text-xs uppercase tracking-wider text-text">
                <tr>
                  <th className="py-3 px-4 font-semibold">Organisasi Perangkat Daerah</th>
                  <th className="py-3 px-4 font-semibold">Program Kerja Utama</th>
                  <th className="py-3 px-4 font-semibold">Alokasi Dana</th>
                  <th className="py-3 px-4 font-semibold">Realisasi</th>
                  <th className="py-3 px-4 font-semibold">Laporan Terkait</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {BUDGET_BREAKDOWN.map((item, idx) => (
                  <tr key={idx} className="hover:bg-primary-soft/10 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-text">{item.opd}</td>
                    <td className="py-3.5 px-4 text-text-muted">{item.program}</td>
                    <td className="py-3.5 px-4 font-semibold text-primary">{item.anggaran}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {item.realisasi}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-accent flex items-center gap-2">
                      {item.laporanTerkait}
                      <DataSimulationBadge size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
