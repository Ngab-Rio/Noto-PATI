import { AlertTriangle } from "lucide-react";
import { DISCLAIMERS } from "@/config/labels";

/**
 * Komponen Banner Prototipe Lomba
 * Memenuhi Prinsip Arsitektur P6: Label prototipe wajib tampil terpusat
 * dan tidak boleh bisa terlupa di aplikasi.
 */
export function DemoBanner() {
  return (
    <aside
      aria-label="Informasi Status Prototipe"
      className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs md:text-sm font-medium"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span>
          <strong className="font-semibold uppercase tracking-wider text-[11px] bg-amber-500/20 px-1.5 py-0.5 rounded mr-1">
            Demo
          </strong>
          {DISCLAIMERS.prototypeBanner}
        </span>
      </div>
    </aside>
  );
}
