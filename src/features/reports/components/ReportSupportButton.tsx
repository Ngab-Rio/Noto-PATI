"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supportReport } from "@/features/reports/actions";

interface ReportSupportButtonProps {
  reportId: string;
  supportCount: number;
  hasSupported: boolean;
  isOwner: boolean;
  canSupport: boolean;
  isAuthenticated: boolean;
  returnTo: string;
  showCount?: boolean;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "accent";
  className?: string;
  buttonClassName?: string;
}

export function ReportSupportButton({
  reportId,
  supportCount: initialSupportCount,
  hasSupported: initialHasSupported,
  isOwner,
  canSupport,
  isAuthenticated,
  returnTo,
  showCount = true,
  size = "sm",
  variant,
  className,
  buttonClassName,
}: ReportSupportButtonProps) {
  const router = useRouter();
  const [supportCount, setSupportCount] = useState(initialSupportCount);
  const [hasSupported, setHasSupported] = useState(initialHasSupported);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginUrl = `/login?next=${encodeURIComponent(returnTo)}`;
  const label = isPending
    ? "Menyimpan..."
    : hasSupported
      ? "Didukung"
      : !isAuthenticated
        ? "Masuk untuk dukung"
        : isOwner
          ? "Laporan Anda"
          : canSupport
            ? "Dukung"
            : "Khusus akun warga";

  async function handleSupport() {
    if (!isAuthenticated) {
      router.push(loginUrl);
      return;
    }

    if (!canSupport || hasSupported || isPending) return;

    setErrorMessage(null);
    setIsPending(true);

    try {
      const result = await supportReport({ reportId });
      if (!result.ok) {
        if (result.reason === "unauthenticated") {
          router.push(loginUrl);
          return;
        }
        setErrorMessage(result.message);
        return;
      }

      setSupportCount(result.supportCount);
      setHasSupported(result.hasSupported);
      if (!showCount) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to submit report support", error);
      setErrorMessage("Dukungan gagal disimpan. Periksa koneksi lalu coba lagi.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className={cn("flex w-full flex-col gap-1 sm:w-auto", className)}>
      <Button
        type="button"
        variant={variant ?? (hasSupported ? "accent" : "outline")}
        size={size}
        onClick={handleSupport}
        disabled={isPending || hasSupported || (isAuthenticated && !canSupport)}
        aria-label={showCount ? `${label}. Saat ini ${supportCount} dukungan` : label}
        className={cn(
          "w-full cursor-pointer justify-center gap-1.5 disabled:cursor-not-allowed sm:w-auto",
          buttonClassName,
        )}
      >
        <ThumbsUp className={cn("h-3.5 w-3.5", hasSupported && "fill-current")} />
        <span>{label}</span>
        {showCount && (
          <span className="ml-1 rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-bold">
            {new Intl.NumberFormat("id-ID").format(supportCount)}
          </span>
        )}
      </Button>
      {errorMessage && (
        <p role="alert" className="text-xs text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
