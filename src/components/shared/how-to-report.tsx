import { Camera, MapPin, FileText, Send, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepCardProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

function StepCard({ number, icon, title, description, className }: StepCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center text-center p-6 rounded-xl border border-border bg-surface hover:border-primary/40 hover:shadow-md transition-all group",
        className
      )}
    >
      {/* Step Number Badge */}
      <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-text-on-primary flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
        {number}
      </div>

      {/* Icon */}
      <div className="h-16 w-16 rounded-2xl bg-primary-soft flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-text-on-primary transition-colors">
        {icon}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-base text-text mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-text-muted leading-relaxed">{description}</p>
    </div>
  );
}

/**
 * HowToReport Component
 * Section penjelasan alur pelaporan kerusakan fasilitas publik
 * Requirement Landing Page Poin 4
 */
export function HowToReport() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold uppercase tracking-wider mb-3">
            <Send className="h-3.5 w-3.5" />
            <span>Mudah & Cepat</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text mb-3">
            Cara Melaporkan Kerusakan Fasilitas Publik
          </h2>
          <p className="text-text-muted text-sm sm:text-base max-w-2xl mx-auto">
            Hanya 5 langkah sederhana untuk membuat laporan infrastruktur yang dapat ditindaklanjuti
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StepCard
            number={1}
            icon={<Camera className="h-8 w-8" />}
            title="Ambil Foto"
            description="Foto kerusakan menggunakan kamera ponsel Anda. Maksimal 3 foto per laporan."
          />

          <StepCard
            number={2}
            icon={<MapPin className="h-8 w-8" />}
            title="Tandai Lokasi"
            description="Sistem otomatis mendeteksi koordinat GPS lokasi Anda saat ini."
          />

          <StepCard
            number={3}
            icon={<FileText className="h-8 w-8" />}
            title="Isi Detail"
            description="Pilih kategori kerusakan dan tulis deskripsi singkat masalah yang terjadi."
          />

          <StepCard
            number={4}
            icon={<Send className="h-8 w-8" />}
            title="Kirim Laporan"
            description="Sistem memverifikasi lokasi untuk pemetaan publik. (Dalam prototipe, tidak terhubung langsung dengan dinas pemerintah)"
          />

          <StepCard
            number={5}
            icon={<Bell className="h-8 w-8" />}
            title="Pantau Status"
            description="Lihat progres tindak lanjut secara real-time dari diterima hingga selesai."
          />
        </div>

        {/* Additional Info */}
        <div className="rounded-xl bg-primary-soft/50 border border-primary/20 p-6 text-center">
          <p className="text-sm text-text-muted mb-3">
            <span className="font-semibold text-text">Catatan Penting:</span> Pastikan foto tidak
            mengandung wajah, plat nomor kendaraan, atau informasi pribadi lainnya untuk menjaga privasi.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Gratis & Transparan
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Tanpa Biaya Administrasi
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Status Terlacak
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
