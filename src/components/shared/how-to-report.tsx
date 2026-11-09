"use client";

import Link from "@/components/shared/route-link";
import {
  ArrowRight,
  Camera,
  Check,
  FileText,
  MapPin,
  Send,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const reportSteps = [
  {
    number: "01",
    icon: Camera,
    title: "Buktikan kerusakan",
    shortTitle: "Foto",
    description:
      "Ambil hingga tiga foto yang jelas agar kondisi fasilitas mudah dipahami petugas.",
    output: "Preview foto kerusakan",
    accent: "bg-accent-soft text-accent",
  },
  {
    number: "02",
    icon: MapPin,
    title: "Tentukan lokasi",
    shortTitle: "Lokasi",
    description:
      "Lokasi perangkat membantu memastikan laporan berada di wilayah Kabupaten Pati.",
    output: "Titik lokasi tervalidasi",
    accent: "bg-primary-soft text-primary",
  },
  {
    number: "03",
    icon: FileText,
    title: "Jelaskan masalah",
    shortTitle: "Detail",
    description:
      "Pilih kategori, tulis judul, dan ceritakan kondisi kerusakan secara singkat.",
    output: "Ringkasan laporan",
    accent: "bg-primary-soft text-primary",
  },
  {
    number: "04",
    icon: Send,
    title: "Review dan kirim",
    shortTitle: "Kirim",
    description:
      "Periksa kembali detailnya, lalu kirim sebagai pengguna terdaftar atau anonim.",
    output: "Nomor tiket laporan",
    accent: "bg-accent-soft text-accent",
  },
  {
    number: "05",
    icon: Sparkles,
    title: "Pantau perubahan",
    shortTitle: "Pantau",
    description:
      "Ikuti perkembangan laporan dari diterima, diverifikasi, diproses, hingga selesai.",
    output: "Status dan catatan publik",
    accent: "bg-primary-soft text-primary",
  },
] as const;

export function HowToReport() {
  const [activeStep, setActiveStep] = useState(0);
  const step = reportSteps[activeStep];
  const StepIcon = step.icon;

  return (
    <section
      className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      aria-labelledby="how-to-report-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl sm:mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Dari temuan ke perubahan
          </p>
          <h2
            id="how-to-report-heading"
            className="max-w-2xl text-2xl font-bold tracking-tight text-text sm:text-3xl lg:text-4xl"
          >
            Laporkan kerusakan. Pantau perubahannya.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
            Lima langkah sederhana untuk mengirim laporan yang dapat ditindaklanjuti,
            lalu melihat jejak penanganannya secara transparan.
          </p>
        </div>

        <div>
          <div className="max-w-5xl">
            <ol className="relative grid gap-5 sm:grid-cols-5 sm:gap-0" aria-label="Tahapan membuat laporan">
              <div
                className="absolute left-[10%] right-[10%] top-9 hidden h-1 rounded-full bg-border sm:block"
                aria-hidden="true"
              />
              <div
                className="absolute left-[10%] top-9 hidden h-1 rounded-full bg-primary transition-[width] duration-300 sm:block"
                style={{ width: `${activeStep * 20}%` }}
                aria-hidden="true"
              />
              {reportSteps.map((item, index) => {
                const Icon = item.icon;
                const isActive = index === activeStep;
                const isComplete = index < activeStep;

                return (
                  <li
                    key={item.number}
                    className={cn(
                      "relative z-10",
                      index < reportSteps.length - 1 &&
                        cn(
                          "after:absolute after:left-8 after:top-14 after:h-9 after:w-1.5 after:rounded-full sm:after:hidden",
                          index < activeStep ? "after:bg-primary" : "after:bg-border",
                        ),
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveStep(index)}
                      aria-current={isActive ? "step" : undefined}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-col sm:gap-2 sm:text-center",
                        isActive ? "text-text" : "text-text-muted hover:text-text",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-12 shrink-0 items-center justify-center rounded-full border-2 bg-surface transition-all sm:size-14",
                          isActive
                            ? "border-primary bg-primary text-text-on-primary shadow-md shadow-primary/20"
                            : isComplete
                              ? "border-primary/50 text-primary"
                              : "border-border group-hover:border-primary/50",
                        )}
                      >
                        {isComplete ? <Check className="size-5 sm:size-6" /> : <Icon className="size-5 sm:size-6" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold tracking-[0.14em] text-text-muted">
                          {item.number}
                        </span>
                        <span className="block text-base font-semibold sm:mt-1 sm:text-lg">{item.shortTitle}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-4">
                <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", step.accent)}>
                  <StepIcon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                    Langkah {step.number}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-text">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted">
                    {step.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs font-medium text-text">
                    <Check className="size-3.5 text-primary" />
                    {step.output}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:px-5">
          <p className="text-sm text-text-muted">
            Tidak harus login. Pelapor anonim tetap menerima nomor tiket.
          </p>
          <Link href="/report/new">
            <Button className="gap-2">
              Mulai buat laporan
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
