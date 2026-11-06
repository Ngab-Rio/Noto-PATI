import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { PublicReportsMap } from "@/components/map/PublicReportsMap";

export const metadata: Metadata = {
  title: "Peta Laporan · Admin Noto PATI",
  description: "Peta interaktif laporan infrastruktur warga Kabupaten Pati.",
  robots: { index: false, follow: false },
};

/**
 * Admin Map Page
 * Full-page interactive map for admin to view all reports with admin mode enabled
 */
export default function AdminMapPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="bg-surface border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-text">Peta Laporan Admin</h1>
        </div>
        <p className="text-sm text-text-muted mt-1">
          Pantau sebaran dan status seluruh laporan warga di Kabupaten Pati
        </p>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <PublicReportsMap adminMode />
      </div>
    </div>
  );
}
