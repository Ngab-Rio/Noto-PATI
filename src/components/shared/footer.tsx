import Link from "next/link";
import { Info, Sparkles } from "lucide-react";
import { APP_CONFIG, DISCLAIMERS } from "@/config/labels";

/**
 * Footer Noto PATI
 * Menampilkan disclaimer prototipe kompetisi dan informasi penting lainnya
 * sesuai requirement Landing Page Poin 8
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Disclaimer Section */}
        <div className="space-y-4 pb-6 border-b border-border">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100">
                Informasi Prototipe Kompetisi
              </p>
              <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                {DISCLAIMERS.notOfficialGovernment}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                {DISCLAIMERS.dataSimulation}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Sumber Data Anggaran
              </p>
              <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                {DISCLAIMERS.budgetSourceNotice}
              </p>
            </div>
          </div>
        </div>

        {/* Links & Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 pb-6 border-b border-border">
          {/* About */}
          <div>
            <h3 className="font-semibold text-sm text-text mb-3">
              Tentang {APP_CONFIG.name}
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {APP_CONFIG.tagline}
            </p>
            <p className="text-xs text-text-muted leading-relaxed mt-2">
              Platform pelaporan infrastruktur dan transparansi anggaran {APP_CONFIG.region}.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm text-text mb-3">Tautan Cepat</h3>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-primary transition-colors">
                  Peta Laporan
                </Link>
              </li>
              <li>
                <Link href="/budget" className="hover:text-primary transition-colors">
                  Transparansi APBD
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Masuk / Daftar
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Info */}
          <div>
            <h3 className="font-semibold text-sm text-text mb-3">Legal & Informasi</h3>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>
                <Link href="/kebijakan-privasi" className="hover:text-primary transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/syarat-ketentuan" className="hover:text-primary transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>Wilayah: {APP_CONFIG.region}</li>
              <li>Tahun Anggaran: {APP_CONFIG.budgetYear}</li>
              <li>
                <a
                  href="https://github.com/Ngab-Rio/Noto-PATI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  GitHub Repository
                  <span className="text-[10px]">↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 text-center">
          <p className="text-xs text-text-muted">
            © {currentYear} {APP_CONFIG.name}. Prototipe Kompetisi Civic Tech Indonesia.
          </p>
        </div>
      </div>
    </footer>
  );
}
