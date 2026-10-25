import Link from "next/link";
import { ArrowRight, MapPin, Sparkles, PlusCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/guards";
import { ReportCard, type ReportItemData } from "@/components/shared/report-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { HowToReport } from "@/components/shared/how-to-report";
import { DataSimulationBadge } from "@/components/shared/data-simulation-badge";
import { Button } from "@/components/ui/button";

const FEATURED_REPORTS: ReportItemData[] = [
  {
    id: "rep-001",
    ticketNumber: "NP-2025-0104",
    title: "Penerangan Jalan Umum Rusak di Jalur Lingkar Selatan Pati",
    description:
      "Tiga tiang lampu penerangan jalan mati berturut-turut di ruas Tanjang menuju Sukolilo. Kondisi gelap rawan kecelakaan dan tindak kriminal saat malam hari.",
    category: "Infrastruktur Penerangan",
    status: "diproses",
    location: "Kecamatan Gabus, Kab. Pati",
    date: "24 Okt 2026",
    supportCount: 42,
    dinasTerkait: "Dishub & DPUTR Pati",
    officialNote:
      "Tim teknis Dishub telah melakukan survei lapangan. Komponen trafo pengganti sedang dipasang hari ini dengan estimasi selesai 24 jam. (Simulasi respon untuk prototipe)",
  },
  {
    id: "rep-002",
    ticketNumber: "NP-2025-0089",
    title: "Perbaikan Tanggul Sungai Juwana Sisi Timur Desa Bendar",
    description:
      "Bronjong penahan tanggul yang sebelumnya tergerus arus kini telah diperkuat dengan batu belah dan bronjong anyam kawat ganda.",
    category: "Sumber Daya Air",
    status: "selesai",
    location: "Kecamatan Juwana, Kab. Pati",
    date: "22 Okt 2026",
    supportCount: 128,
    dinasTerkait: "Balai Besar Wilayah Sungai & BPBD",
    officialNote:
      "Pekerjaan penguatan tanggul sepanjang 45 meter telah tuntas 100%. Telah dilakukan serah terima bersama warga dan kepala desa setempat.",
  },
];

export default async function Home() {
  const { user } = await getCurrentUser();

  return (
    <main className="landing-shell max-w-7xl mx-auto space-y-16">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-copy">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Portal Warga Kabupaten Pati</span>
          </div>
          <h1>Perhatian kecil, perubahan yang terasa.</h1>
          <p>
            Noto PATI membantu warga menyampaikan kebutuhan fasilitas publik dengan jelas, aman,
            dan dapat ditindaklanjuti secara transparan. <span className="text-xs text-text-muted italic">(Platform prototipe untuk demonstrasi konsep)</span>
          </p>
          <div className="hero-actions">
            {user ? (
              <Link href="/report/new">
                <Button size="lg" variant="default" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Buat Laporan Baru</span>
                </Button>
              </Link>
            ) : (
              <Link href="/login?next=/report/new">
                <Button size="lg" variant="default" className="gap-2">
                  <span>Mulai Lapor Masalah</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link href="/map">
              <Button size="lg" variant="outline" className="gap-2">
                <MapPin className="h-4 w-4" />
                <span>Lihat Peta Laporan</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="hero-mark" aria-hidden="true">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
              Kab. Pati · 2025
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
          </div>
          <strong>
            Noto
            <br />
            PATI
          </strong>
          <span className="text-xs text-text-muted font-medium">
            Desain Sistem & Transparansi APBD
          </span>
        </div>
      </section>

      {/* How to Report Section - NEW */}
      <HowToReport />

      {/* Status Showcase Preview */}
      <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-text">
                Status Laporan Warga Real-time
              </h2>
              <DataSimulationBadge size="sm" />
            </div>
            <p className="text-sm text-text-muted">
              Setiap laporan warga diklasifikasikan dengan palet berstandar kontras WCAG AA.
            </p>
          </div>
          <Link href="/map">
            <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:text-primary-dark">
              <span>Lihat di Peta Laporan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-2">
          <StatusBadge status="diterima" size="md" />
          <StatusBadge status="diverifikasi" size="md" />
          <StatusBadge status="diproses" size="md" />
          <StatusBadge status="selesai" size="md" />
          <StatusBadge status="dibuka_kembali" size="md" />
          <StatusBadge status="ditolak" size="md" />
          <StatusBadge status="digabung" size="md" />
          <StatusBadge status="ditutup" size="md" />
        </div>

        {/* Contoh Kartu Laporan */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURED_REPORTS.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </section>

      {/* Public Strip */}
      <section className="public-strip">
        <div>
          <span className="eyebrow">Terbuka untuk semua</span>
          <h2>Informasi publik tetap bisa diakses tanpa login.</h2>
        </div>
        <div className="space-y-4">
          <p>
            Warga dapat menjelajahi peta sebaran laporan infrastruktur dan alokasi anggaran APBD
            Kabupaten Pati 2025 secara bebas tanpa memerlukan akun.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/map">
              <Button variant="outline" size="sm" className="gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>Buka Peta Publik</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
