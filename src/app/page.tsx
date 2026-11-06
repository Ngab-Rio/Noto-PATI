import Link from "next/link";
import { ArrowRight, MapPin, PlusCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/guards";
import { HowToReport } from "@/components/shared/how-to-report";
import { PatiHeroVisual } from "@/components/shared/pati-hero-visual";
import { PublicMapSection } from "@/components/map/PublicMapSection";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { user } = await getCurrentUser();

  return (
    <main className="landing-shell max-w-7xl mx-auto space-y-20">
      {/* Hero Section */}
      <section className="hero-section animate-fade-in-up">
        <div className="hero-copy">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-soft text-primary text-xs font-semibold uppercase tracking-wide mb-5 border border-primary/20 animate-slide-down animation-delay-200">
            <span>Portal Warga Kabupaten Pati</span>
          </div>
          <h1 className="hero-headline animation-delay-400">
            Perhatian kecil, <br className="hidden sm:block" />
            <span className="text-primary">perubahan yang terasa.</span>
          </h1>
          <p className="hero-description animation-delay-600">
            Noto PATI membantu warga menyampaikan kebutuhan fasilitas publik dengan jelas, aman,
            dan dapat ditindaklanjuti secara transparan.
          </p>
          <div className="hero-actions animation-delay-800">
            <Link href="/report/new">
              <Button size="lg" variant="default" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.05] active:scale-95 transition-all duration-300">
                <PlusCircle className="h-5 w-5" />
                <span className="font-semibold">{user ? "Buat Laporan Baru" : "Lapor Masalah Sekarang"}</span>
                {!user && <ArrowRight className="h-4 w-4" />}
              </Button>
            </Link>
            <a href="#peta-laporan">
              <Button size="lg" variant="outline" className="gap-2 border-2 hover:border-primary hover:scale-[1.05] active:scale-95 transition-all duration-300">
                <MapPin className="h-5 w-5" />
                <span className="font-semibold">Lihat Peta Laporan</span>
              </Button>
            </a>
          </div>
        </div>

        <PatiHeroVisual />
      </section>

      {/* How to Report Section */}
      <div className="animate-on-scroll">
        <HowToReport />
      </div>

      {/* Map Section - Interactive Report Locations */}
      <div id="peta-laporan" className="animate-on-scroll scroll-mt-20">
        <PublicMapSection 
          height="600px"
          showFilters={true}
        />
      </div>

      {/* Public Strip */}
      <section className="public-strip animate-on-scroll">
        <div>
          <span className="eyebrow">Terbuka untuk semua</span>
          <h2>Informasi publik tetap bisa diakses tanpa login.</h2>
        </div>
        <div className="space-y-4">
          <p>
            Warga dapat menjelajahi peta sebaran laporan infrastruktur dan alokasi anggaran APBD
            Kabupaten Pati 2025 secara bebas tanpa memerlukan akun.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <a href="#peta-laporan">
              <Button variant="outline" size="sm" className="gap-1.5 hover:scale-[1.02] active:scale-95 transition-transform">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>Buka Peta Publik</span>
              </Button>
            </a>
            <Link href="/budget">
              <Button variant="outline" size="sm" className="gap-1.5 hover:scale-[1.02] active:scale-95 transition-transform">
                <span>Lihat Transparansi APBD</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
