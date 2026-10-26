import Link from "next/link";
import { CheckCircle, Home, FileText, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Laporan Berhasil Dikirim · Noto PATI",
};

export default function ReportSuccessPage({
  searchParams,
}: {
  searchParams: { ticket?: string };
}) {
  const ticketNumber = searchParams.ticket || `NP-${new Date().getFullYear()}-XXXX`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="rounded-2xl border border-border bg-surface p-8 sm:p-12 shadow-lg text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          {/* Success Message */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">
              Laporan Berhasil Dikirim!
            </h1>
            <p className="text-text-muted">
              Terima kasih atas kontribusi Anda untuk Kabupaten Pati yang lebih baik.
            </p>
          </div>

          {/* Ticket Number */}
          <div className="rounded-lg bg-primary-soft border border-primary/25 p-6">
            <p className="text-sm text-text-muted mb-2">Nomor Tiket Laporan Anda:</p>
            <p className="text-3xl font-bold text-primary font-mono">{ticketNumber}</p>
            <p className="text-xs text-text-muted mt-3">
              Simpan nomor ini untuk memantau progres laporan Anda
            </p>
          </div>

          {/* What's Next */}
          <div className="rounded-lg bg-surface border border-border p-6 text-left">
            <h2 className="text-sm font-semibold text-text mb-3">Langkah Selanjutnya:</h2>
            <ul className="space-y-2 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">1.</span>
                <span>
                  Tim verifikasi akan memeriksa laporan Anda dalam <strong>1-2 hari kerja</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">2.</span>
                <span>
                  Setelah diverifikasi, laporan akan diteruskan ke <strong>dinas terkait</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">3.</span>
                <span>
                  Anda dapat memantau status melalui <strong>Peta Laporan</strong> atau{" "}
                  <strong>Dashboard Profil</strong>
                </span>
              </li>
            </ul>
          </div>

          {/* Info Note */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4">
            <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
              <strong>Catatan:</strong> Untuk prototipe ini, data laporan adalah simulasi dan tidak
              terhubung dengan sistem pemerintahan resmi. Target SLA respons dinas adalah 3-7 hari kerja.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="gap-2 w-full">
                <Home className="h-4 w-4" />
                <span>Kembali ke Beranda</span>
              </Button>
            </Link>

            <Link href="/my-reports" className="w-full sm:w-auto">
              <Button variant="outline" className="gap-2 w-full">
                <FileText className="h-4 w-4" />
                <span>Lihat Laporan Saya</span>
              </Button>
            </Link>

            <Link href="/map" className="w-full sm:w-auto">
              <Button variant="default" className="gap-2 w-full">
                <MapPin className="h-4 w-4" />
                <span>Lihat di Peta</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
