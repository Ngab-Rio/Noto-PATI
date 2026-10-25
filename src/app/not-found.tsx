import Link from 'next/link';
import { Home, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Custom 404 Not Found Page - Noto PATI
 * Displayed when users navigate to non-existent routes
 * Provides clear navigation back to working features
 */
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-600">
          <Search className="h-8 w-8" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-text-muted">
            Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
          </p>
        </div>

        {/* Error Code */}
        <p className="text-xs text-text-muted font-mono bg-surface px-3 py-2 rounded border border-border inline-block">
          Error 404 - Not Found
        </p>

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="default" className="gap-2 w-full">
              <Home className="h-4 w-4" />
              <span>Kembali ke Beranda</span>
            </Button>
          </Link>
          <Link href="/map" className="w-full sm:w-auto">
            <Button variant="outline" className="gap-2 w-full">
              <MapPin className="h-4 w-4" />
              <span>Lihat Peta Laporan</span>
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-text-muted">
            Jika Anda yakin halaman ini seharusnya ada, silakan{' '}
            <a 
              href="https://github.com/Ngab-Rio/Noto-PATI/issues" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              laporkan masalah ini
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
