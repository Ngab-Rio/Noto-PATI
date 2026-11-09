"use client";

import dynamic from "next/dynamic";
import Link from "@/components/shared/route-link";
import { useEffect, useState } from "react";
import { Home, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supportsReportDevice } from "@/features/report/device-support";

const ReportForm = dynamic(
  () => import("./ReportForm").then((module) => module.ReportForm),
  {
    ssr: false,
    loading: () => (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <p role="status" className="text-sm text-text-muted">
          Menyiapkan formulir laporan...
        </p>
      </main>
    ),
  },
);

type DeviceState = "checking" | "supported" | "unsupported";

function getDeviceState(): Exclude<DeviceState, "checking"> {
  const isSupported = supportsReportDevice({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    hasCoarsePointer: window.matchMedia("(pointer: coarse)").matches,
  });

  return isSupported ? "supported" : "unsupported";
}

export function ReportDeviceGate() {
  const [deviceState, setDeviceState] = useState<DeviceState>("checking");

  useEffect(() => {
    const updateDeviceState = () => setDeviceState(getDeviceState());
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    updateDeviceState();
    coarsePointer.addEventListener("change", updateDeviceState);
    window.addEventListener("resize", updateDeviceState);

    return () => {
      coarsePointer.removeEventListener("change", updateDeviceState);
      window.removeEventListener("resize", updateDeviceState);
    };
  }, []);

  if (deviceState === "checking") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <p role="status" className="text-sm text-text-muted">
          Memeriksa perangkat...
        </p>
      </main>
    );
  }

  if (deviceState === "supported") {
    return <ReportForm />;
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <section
        aria-labelledby="device-notice-heading"
        className="w-full max-w-lg space-y-5 text-center"
      >
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary"
          aria-hidden="true"
        >
          <Smartphone className="h-7 w-7" />
        </div>
        <p className="font-mono text-sm font-semibold text-text-muted">404</p>
        <div className="space-y-2">
          <h1 id="device-notice-heading" className="text-2xl font-bold text-text">
            Buka halaman ini dari ponsel atau tablet
          </h1>
          <p className="text-sm leading-6 text-text-muted">
            Laporan perlu menyertakan foto kondisi terkini yang diambil langsung dengan kamera.
            Buka tautan ini di ponsel atau tablet yang memiliki kamera untuk mulai melapor.
          </p>
        </div>
        <Link href="/" className="inline-flex">
          <Button type="button" variant="outline" className="min-h-11 gap-2">
            <Home className="h-4 w-4" aria-hidden="true" />
            Kembali ke beranda
          </Button>
        </Link>
      </section>
    </main>
  );
}
