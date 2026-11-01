import Link from "next/link";
import { APP_CONFIG } from "@/config/labels";

/**
 * Footer Noto PATI
 * Menampilkan informasi penting dan tautan navigasi
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Links & Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-6 border-b border-border">
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
            © {currentYear} {APP_CONFIG.name}. 
          </p>
        </div>
      </div>
    </footer>
  );
}
