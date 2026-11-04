import type { ReportStatusKey } from "@/config/theme";

export type SlaState = "in_target" | "overdue" | "completed" | "not_applicable";

export interface SlaStage {
  kind: "verification" | "handling";
  dueAt: string | null;
  state: SlaState;
  remainingMs: number | null;
}

export function calculateSlaStage(
  status: ReportStatusKey,
  dueAt: string | null | undefined,
  now: string,
): SlaStage {
  const kind = status === "diterima" ? "verification" : "handling";
  if (status === "selesai") {
    return { kind, dueAt: dueAt ?? null, state: "completed", remainingMs: null };
  }
  if (status === "ditolak" || status === "digabung") {
    return { kind, dueAt: dueAt ?? null, state: "not_applicable", remainingMs: null };
  }
  if (!dueAt) {
    return { kind, dueAt: null, state: "not_applicable", remainingMs: null };
  }
  const remainingMs = new Date(dueAt).getTime() - new Date(now).getTime();
  return {
    kind,
    dueAt,
    state: remainingMs < 0 ? "overdue" : "in_target",
    remainingMs,
  };
}

export function formatRemainingTime(remainingMs: number | null): string {
  if (remainingMs === null) return "Belum tersedia";
  const absoluteHours = Math.max(0, Math.round(Math.abs(remainingMs) / 3_600_000));
  const days = Math.floor(absoluteHours / 24);
  const hours = absoluteHours % 24;
  if (days > 0) return `${days} hari${hours ? ` ${hours} jam` : ""}`;
  return `${hours} jam`;
}
