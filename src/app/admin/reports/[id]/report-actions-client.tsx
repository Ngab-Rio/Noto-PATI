"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  verifyReport,
  rejectReport,
  updateReportStatus,
} from "@/features/admin/actions";
import type { ReportStatusKey } from "@/config/theme";

interface ReportActionsClientProps {
  reportId: string;
  currentStatus: ReportStatusKey;
}

export function ReportActionsClient({
  reportId,
  currentStatus,
}: ReportActionsClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!confirm("Verifikasi laporan ini? Laporan akan masuk ke tahap pemrosesan.")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyReport(reportId);

      if (result.ok) {
        alert("✅ " + result.message);
        router.refresh();
      } else {
        setError(result.message);
        alert("❌ " + result.message);
      }
    } catch {
      setError("Terjadi kesalahan tidak terduga");
      alert("❌ Terjadi kesalahan tidak terduga");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError("Alasan penolakan wajib diisi");
      return;
    }

    if (rejectReason.length < 10) {
      setError("Alasan penolakan minimal 10 karakter");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await rejectReport(reportId, rejectReason);

      if (result.ok) {
        alert("✅ " + result.message);
        setShowRejectDialog(false);
        setRejectReason("");
        router.refresh();
      } else {
        setError(result.message);
        alert("❌ " + result.message);
      }
    } catch {
      setError("Terjadi kesalahan tidak terduga");
      alert("❌ Terjadi kesalahan tidak terduga");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (
    newStatus: "diverifikasi" | "diproses" | "selesai"
  ) => {
    const statusLabel = {
      diverifikasi: "diverifikasi",
      diproses: "diproses",
      selesai: "selesai",
    }[newStatus];

    if (
      !confirm(
        `Ubah status laporan menjadi "${statusLabel}"? Tindakan ini akan tercatat dalam riwayat.`
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateReportStatus(reportId, newStatus);

      if (result.ok) {
        alert("✅ " + result.message);
        router.refresh();
      } else {
        setError(result.message);
        alert("❌ " + result.message);
      }
    } catch {
      setError("Terjadi kesalahan tidak terduga");
      alert("❌ Terjadi kesalahan tidak terduga");
    } finally {
      setIsLoading(false);
    }
  };

  // Terminal statuses - no actions allowed
  if (["selesai", "ditolak", "digabung", "ditutup"].includes(currentStatus)) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-selesai-bg shrink-0">
            <CheckCircle2 className="h-5 w-5 text-status-selesai-text" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text">Status Terminal</h3>
            <p className="text-sm text-text-muted mt-1">
              Laporan dengan status <strong>{currentStatus}</strong> tidak dapat diubah lagi.
              Jika fasilitas kembali rusak, buat laporan baru.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-5">
      <div>
        <h3 className="text-base font-bold text-text mb-1">Tindakan Admin</h3>
        <p className="text-xs text-text-muted">
          Kelola status laporan sesuai alur yang ditentukan
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-status-ditolak-text/30 bg-status-ditolak-bg/50 p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-status-ditolak-text shrink-0 mt-0.5" />
          <p className="text-sm text-status-ditolak-text">{error}</p>
        </div>
      )}

      {/* Diterima → Verifikasi/Tolak */}
      {currentStatus === "diterima" && (
        <div className="space-y-3">
          <Button
            onClick={handleVerify}
            disabled={isLoading}
            className="w-full gap-2"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
            <span>Verifikasi Laporan</span>
          </Button>

          {!showRejectDialog ? (
            <Button
              onClick={() => setShowRejectDialog(true)}
              disabled={isLoading}
              variant="destructive"
              className="w-full gap-2"
              size="lg"
            >
              <XCircle className="h-5 w-5" />
              <span>Tolak Laporan</span>
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border border-status-ditolak-text/30 bg-status-ditolak-bg/20 p-4">
              <div>
                <label className="text-sm font-semibold text-text block mb-2">
                  Alasan Penolakan <span className="text-status-ditolak-text">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Jelaskan alasan penolakan secara jelas (minimal 10 karakter)"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={4}
                  disabled={isLoading}
                />
                <p className="text-xs text-text-muted mt-1">
                  {rejectReason.length}/500 karakter
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleReject}
                  disabled={isLoading || !rejectReason.trim()}
                  variant="destructive"
                  size="sm"
                  className="flex-1 gap-1.5"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span>Konfirmasi Penolakan</span>
                </Button>
                <Button
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectReason("");
                    setError(null);
                  }}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Diverifikasi → Diproses */}
      {currentStatus === "diverifikasi" && (
        <Button
          onClick={() => handleUpdateStatus("diproses")}
          disabled={isLoading}
          className="w-full gap-2"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowRight className="h-5 w-5" />
          )}
          <span>Mulai Pemrosesan Lapangan</span>
        </Button>
      )}

      {/* Diproses → Selesai */}
      {currentStatus === "diproses" && (
        <Button
          onClick={() => handleUpdateStatus("selesai")}
          disabled={isLoading}
          className="w-full gap-2 bg-status-selesai-text hover:bg-status-selesai-text/90"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
          <span>Tandai Selesai</span>
        </Button>
      )}

      <div className="border-t border-border pt-4">
        <p className="text-xs text-text-muted leading-relaxed">
          <strong>Catatan:</strong> Setiap perubahan status akan dicatat dalam riwayat
          dan ditampilkan kepada warga. Pastikan tindakan sesuai dengan kondisi
          lapangan.
        </p>
      </div>
    </div>
  );
}
