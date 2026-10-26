import type { Metadata } from "next";
import { ReportForm } from "./ReportForm";

export const metadata: Metadata = {
  title: "Buat Laporan Infrastruktur · Noto PATI",
  description: "Formulir penyampaikan laporan fasilitas publik untuk warga Kabupaten Pati.",
};

export default function NewReportPage() {
  return <ReportForm />;
}
