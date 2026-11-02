import type { Metadata } from "next";
import { MapPageClient } from "./MapPageClient";

export const metadata: Metadata = {
  title: "Peta Laporan Infrastruktur Warga · Noto PATI",
  description:
    "Peta sebaran laporan fasilitas publik, jalan berlubang, dan drainase di Kabupaten Pati.",
};

export default function MapPage() {
  return <MapPageClient />;
}
