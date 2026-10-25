import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ComingSoonBannerProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

/**
 * ComingSoonBanner - Noto PATI
 * Displayed on pages that are under development
 * Provides clear messaging and navigation back to working features
 */
export function ComingSoonBanner({
  title = 'Fitur Segera Hadir',
  message = 'Halaman ini sedang dalam pengembangan. Kembali lagi nanti untuk melihat pembaruan.',
  showBackButton = true,
  backUrl = '/',
}: ComingSoonBannerProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary-soft/20 p-8 text-center space-y-4">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-soft border border-primary/30">
            <Construction className="h-7 w-7 text-primary" />
          </div>

          {/* Title & Message */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-text">
              {title}
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              {message}
            </p>
          </div>

          {/* Back Button */}
          {showBackButton && (
            <div className="pt-2">
              <Link href={backUrl}>
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali ke Beranda</span>
                </Button>
              </Link>
            </div>
          )}

          {/* Additional Info */}
          <p className="text-xs text-text-muted pt-2 border-t border-primary/20">
            Kami sedang bekerja keras untuk meluncurkan fitur ini. 
            Terima kasih atas kesabaran Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
