import { Loader2 } from "lucide-react";

export default function BudgetLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-text">Memuat data APBD…</p>
        <p className="text-xs text-text-muted">
          Mengambil snapshot DJPK dan rincian belanja daerah.
        </p>
      </div>
    </div>
  );
}
