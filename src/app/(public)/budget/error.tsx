"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function BudgetError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Budget page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text">
            Data APBD gagal dimuat
          </h1>
          <p className="text-text-muted">
            Terjadi kesalahan saat mengambil data anggaran. Silakan coba lagi.
          </p>
        </div>

        {error.digest ? (
          <p className="rounded border border-border bg-surface px-3 py-2 font-mono text-xs text-text-muted">
            Error ID: {error.digest}
          </p>
        ) : null}

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={reset} variant="default" className="w-full gap-2 sm:w-auto">
            <RefreshCw className="h-4 w-4" />
            <span>Coba Lagi</span>
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full gap-2">
              <Home className="h-4 w-4" />
              <span>Kembali ke Beranda</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
