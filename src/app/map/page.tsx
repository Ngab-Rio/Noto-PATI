import type { Metadata } from "next";
import { PublicMapSection } from "@/components/map/PublicMapSection";

export const metadata: Metadata = {
  title: "Peta Laporan Warga · Noto PATI",
  description:
    "Pantau sebaran laporan infrastruktur warga Kabupaten Pati melalui peta interaktif.",
};

export default function MapPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PublicMapSection height="min(70vh, 680px)" showFilters />
      </div>
    </main>
  );
}
