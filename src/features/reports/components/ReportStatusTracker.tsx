"use client";

import { useEffect, useState } from "react";

import { StatusBadgeClient } from "@/components/shared/status-badge-client";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type ReportStatus = Database["public"]["Enums"]["report_status"];
type PublicStatusUpdate = Pick<
  Database["public"]["Tables"]["public_report_status_updates"]["Row"],
  "id" | "report_id" | "status" | "note" | "created_at"
>;
type LiveState = "connecting" | "live" | "unavailable";

const REPORT_STATUSES = new Set<ReportStatus>([
  "diterima",
  "diverifikasi",
  "diproses",
  "selesai",
  "ditolak",
  "digabung",
]);

const STATUS_DESCRIPTIONS: Record<ReportStatus, string> = {
  diterima: "Laporan sudah tercatat dan menunggu verifikasi petugas.",
  diverifikasi: "Petugas sudah memeriksa laporan dan menentukan tindak lanjut.",
  diproses: "Penanganan laporan sedang berlangsung.",
  selesai: "Penanganan laporan telah ditandai selesai.",
  ditolak: "Laporan tidak dapat dilanjutkan. Baca catatan petugas pada riwayat.",
  digabung: "Pembaruan selanjutnya tersedia pada laporan utama.",
};

function parseStatusUpdate(value: Record<string, unknown>): PublicStatusUpdate | null {
  if (
    typeof value.id !== "string"
    || typeof value.report_id !== "string"
    || typeof value.status !== "string"
    || !REPORT_STATUSES.has(value.status as ReportStatus)
    || typeof value.created_at !== "string"
    || (value.note !== null && typeof value.note !== "string")
  ) {
    return null;
  }

  return {
    id: value.id,
    report_id: value.report_id,
    status: value.status as ReportStatus,
    note: value.note,
    created_at: value.created_at,
  };
}

function mergeUpdates(
  current: PublicStatusUpdate[],
  incoming: PublicStatusUpdate[],
): PublicStatusUpdate[] {
  const updatesById = new Map(current.map((update) => [update.id, update]));
  for (const update of incoming) {
    updatesById.set(update.id, update);
  }

  return [...updatesById.values()].sort(
    (first, second) =>
      first.created_at.localeCompare(second.created_at)
      || first.id.localeCompare(second.id),
  );
}

export function ReportStatusTracker({
  reportId,
  initialStatus,
  initialUpdates,
}: {
  reportId: string;
  initialStatus: ReportStatus;
  initialUpdates: PublicStatusUpdate[];
}) {
  const [updates, setUpdates] = useState(initialUpdates);
  const [liveState, setLiveState] = useState<LiveState>("connecting");
  const currentStatus = updates.at(-1)?.status ?? initialStatus;

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`public-report-status:${reportId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "public_report_status_updates",
          filter: `report_id=eq.${reportId}`,
        },
        (payload) => {
          const update = parseStatusUpdate(payload.new);
          if (update?.report_id === reportId) {
            setUpdates((current) => mergeUpdates(current, [update]));
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setLiveState("live");
          void supabase
            .from("public_report_status_updates")
            .select("id, report_id, status, note, created_at")
            .eq("report_id", reportId)
            .order("created_at", { ascending: true })
            .then(({ data, error }) => {
              if (error) {
                console.error("Failed to refresh live public report status", error);
                setLiveState("unavailable");
                return;
              }

              setUpdates((current) =>
                mergeUpdates(current, (data ?? []) as PublicStatusUpdate[]),
              );
            });
        } else if (
          status === "CHANNEL_ERROR"
          || status === "TIMED_OUT"
          || status === "CLOSED"
        ) {
          setLiveState("unavailable");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [reportId]);

  return (
    <section
      aria-labelledby="report-status-heading"
      className="space-y-4 border-t border-border pt-5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 id="report-status-heading" className="text-base font-semibold text-text">
            Pelacakan status
          </h2>
          <p className="text-sm leading-relaxed text-text-muted" aria-live="polite">
            {STATUS_DESCRIPTIONS[currentStatus]}
          </p>
        </div>
        <StatusBadgeClient status={currentStatus} size="sm" />
      </div>

      <p
        className="text-xs text-text-muted"
        role={liveState === "unavailable" ? "status" : undefined}
        aria-live="polite"
      >
        {liveState === "live"
          ? "Pembaruan status langsung aktif."
          : liveState === "connecting"
            ? "Menghubungkan pembaruan status..."
            : "Pembaruan langsung tidak tersedia. Muat ulang halaman untuk memeriksa status terbaru."}
      </p>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text">Riwayat perubahan</h3>
        {updates.length > 0 ? (
          <ol className="space-y-3">
            {updates.map((update, index) => (
              <li key={update.id} className="flex gap-3">
                <div className="flex flex-col items-center" aria-hidden="true">
                  <span className="mt-1 h-3 w-3 rounded-full border-2 border-primary bg-primary-soft" />
                  {index < updates.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <StatusBadgeClient
                      status={update.status}
                      size="sm"
                      className="w-fit"
                    />
                    <time
                      className="text-xs text-text-muted"
                      dateTime={update.created_at}
                    >
                      {new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(update.created_at))}
                    </time>
                  </div>
                  {update.note && (
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">
                      {update.note}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-text-muted">Belum ada riwayat perubahan status.</p>
        )}
      </div>
    </section>
  );
}
