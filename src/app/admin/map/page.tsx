import type { Metadata } from "next";
import { MapPageClient } from "@/app/(public)/map/MapPageClient";

export const metadata: Metadata = {
  title: "Peta Laporan · Admin Noto PATI",
  description: "Peta interaktif laporan infrastruktur warga Kabupaten Pati.",
  robots: { index: false, follow: false },
};

export default function AdminMapPage() {
  return <MapPageClient adminMode showCreateReportCta={false} />;
}
