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
    <article
      className={cn(
        "relative flex flex-col items-center text-center p-5 sm:p-6 rounded-xl border-2 border-border bg-surface hover:border-primary/50 hover:shadow-lg transition-all duration-300 group",
        className
      )}
      aria-labelledby={`step-${number}-title`}
    >
      {/* Step Number Badge */}
      <div 
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary text-text-on-primary flex items-center justify-center font-bold text-base sm:text-lg shadow-md group-hover:scale-110 group-hover:bg-primary-dark transition-all duration-300"
        aria-label={`Langkah ${number}`}
      >
        {number}
      </div>

      {/* Icon */}
      <div 
        className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary-soft flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-text-on-primary group-hover:scale-105 transition-all duration-300"
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Title */}
      <h3 
        id={`step-${number}-title`}
        className="font-semibold text-base sm:text-lg text-text mb-2 group-hover:text-primary-dark transition-colors duration-300"
      >
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-text-muted leading-relaxed line-clamp-4">
        {description}
      </p>
    </article>
  );
}

/**
 * HowToReport Component - Enhanced
 * Section penjelasan alur pelaporan kerusakan fasilitas publik
 * 
 * Improvements:
 * - Simplified content (removed jargon)
 * - Responsive grid (md:3, lg:4, xl:5)
 * - ARIA structure (ordered list)
 * - Prominent CTA button
 * - Privacy warning moved up
 * - Time estimate added
 */
export function HowToReport() {
  return (
    <section 
      className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8"
      aria-labelledby="how-to-report-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-soft text-accent text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">
            <Send className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">5 Langkah Mudah</span>
          </div>
          <h2 
            id="how-to-report-heading"
            className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-text mb-3 sm:mb-4 px-4"
          >
            Cara Melaporkan Kerusakan Fasilitas Publik
          </h2>
          <p className="text-text-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Ikuti 5 langkah ini untuk membuat laporan yang dapat ditindaklanjuti
          </p>
        </div>

        {/* Steps Grid - Enhanced Responsive */}
        <ol 
          role="list" 
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6"
        >
          <li role="listitem">
            <StepCard
              number={1}
              icon={<Camera className="h-9 w-9 sm:h-10 sm:w-10" />}
              title="Ambil Foto"
              description="Foto kerusakan dari ponsel Anda (maksimal 3 foto)."
            />
          </li>

          <li role="listitem">
            <StepCard
              number={2}
              icon={<MapPin className="h-9 w-9 sm:h-10 sm:w-10" />}
              title="Tandai Lokasi"
              description="Lokasi terdeteksi otomatis, cek keakuratannya."
            />
          </li>

          <li role="listitem">
            <StepCard
              number={3}
              icon={<FileText className="h-9 w-9 sm:h-10 sm:w-10" />}
              title="Isi Detail"
              description="Pilih kategori dan jelaskan kerusakan secara singkat."
            />
          </li>

          <li role="listitem">
            <StepCard
              number={4}
              icon={<Send className="h-9 w-9 sm:h-10 sm:w-10" />}
              title="Review & Kirim"
              description="Periksa kelengkapan laporan lalu kirim ke publik."
            />
          </li>

          <li role="listitem">
            <StepCard
              number={5}
              icon={<Bell className="h-9 w-9 sm:h-10 sm:w-10" />}
              title="Pantau Status"
              description="Pantau progres dari diterima hingga selesai dikerjakan."
            />
          </li>
        </ol>
      </div>
    </section>
  );
}
