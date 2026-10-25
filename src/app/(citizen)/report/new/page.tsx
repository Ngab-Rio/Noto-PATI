import type { Metadata } from "next";
import Link from "next/link";
import { IconPlusCircle, IconSparkle } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Buat Laporan Infrastruktur · Noto PATI",
  description: "Formulir penyampaian laporan fasilitas publik untuk warga Kabupaten Pati.",
};

const KECAMATAN_PATI = [
  "Pati Kota",
  "Juwana",
  "Gabus",
  "Margorejo",
  "Tayu",
  "Kayen",
  "Sukolilo",
  "Batangan",
  "Wedarijaksa",
  "Trangkil",
  "Tlogowungu",
  "Gembong",
  "Gunungwungkal",
  "Cluwak",
  "Dukuhseti",
  "Jaken",
  "Jakenan",
  "Pucakwangi",
  "Winong",
  "Tambakromo",
];

export default function NewReportPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-border pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold mb-2">
            <IconPlusCircle className="h-3.5 w-3.5" />
            <span>Kanal Warga Pati</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">
            Sampaikan Laporan Fasilitas Publik
          </h1>
          <p className="text-sm text-text-muted mt-1 leading-relaxed">
            Laporkan jalan rusak, lampu penerangan mati, saluran air tersumbat, atau fasilitas umum lainnya
            untuk ditindaklanjuti dinas terkait dengan SLA terukur.
          </p>
        </div>

        {/* Form Container */}
        <form className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6">
          {/* Judul Laporan */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text block">
              Judul Masalah / Laporan <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Lampu penerangan jalan mati di ruas Tanjang - Gabus"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-text"
              defaultValue="Lampu penerangan jalan mati di ruas Tanjang - Gabus"
            />
          </div>

          {/* Kategori & Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text block">
                Kategori Masalah <span className="text-accent">*</span>
              </label>
              <select
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-text"
                defaultValue="lampu"
              >
                <option value="jalan">Jalan Berlubang / Rusak (Bina Marga)</option>
                <option value="lampu">Penerangan Jalan Umum (Dishub)</option>
                <option value="drainase">Saluran Air / Tanggul (SDA)</option>
                <option value="jembatan">Jembatan Rusak</option>
                <option value="lainnya">Fasilitas Publik Lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text block">
                Kecamatan di Pati <span className="text-accent">*</span>
              </label>
              <select
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-text"
                defaultValue="Gabus"
              >
                {KECAMATAN_PATI.map((kec) => (
                  <option key={kec} value={kec}>
                    Kecamatan {kec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deskripsi Lengkap */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text block">
              Deskripsi Detail Lokasi & Masalah <span className="text-accent">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Jelaskan kondisi kerusakan, patokan jalan atau bangunan terdekat, dan dampak bagi warga..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-text leading-relaxed"
              defaultValue="Sudah 4 hari lampu padam dari jembatan Tanjang sampai gapura masuk desa. Saat malam kondisi gelap gulita dan rawan kecelakaan bagi pengendara motor."
            />
          </div>

          {/* AI Assistance Box (Primary/Soft block) */}
          <div className="rounded-xl bg-primary-soft p-4 border border-primary/20 flex items-start gap-3 text-xs text-text">
            <IconSparkle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-primary-dark block mb-0.5">
                Bantuan AI Noto PATI Aktif
              </span>
              <p className="text-text-muted leading-relaxed">
                Sistem akan memverifikasi duplikasi laporan di lokasi yang sama dan meneruskan tiket ke dinas teknis
                Kabupaten Pati yang berwenang dengan target SLA respons 1-3 hari kerja.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border">
            <Link href="/" className="text-sm text-text-muted hover:text-text">
              Batal dan kembali ke Beranda
            </Link>
            <Button type="button" variant="primary" size="lg" className="w-full sm:w-auto gap-2">
              <IconPlusCircle className="h-4 w-4" />
              <span>Kirim Laporan Warga</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
