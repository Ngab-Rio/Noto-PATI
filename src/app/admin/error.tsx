'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text">
            Kesalahan Dashboard Admin
          </h1>
          <p className="text-text-muted">
            Terjadi kesalahan saat memuat halaman admin. 
            Silakan coba lagi atau kembali ke dashboard.
          </p>
        </div>

        {error.digest && (
          <p className="text-xs text-text-muted font-mono bg-surface px-3 py-2 rounded border border-border">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={reset}
            variant="default"
            className="gap-2 w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Coba Lagi</span>
          </Button>
          <Link href="/admin" className="w-full sm:w-auto">
            <Button variant="outline" className="gap-2 w-full">
              <LayoutDashboard className="h-4 w-4" />
              <span>Kembali ke Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
