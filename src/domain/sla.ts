import type { ReportStatusKey } from "@/config/theme";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * SLA state untuk laporan yang sedang berjalan:
 * - `in_target`         : Dalam tenggat, belum selesai
 * - `overdue`           : Telah melewati tenggat, belum selesai
 * - `completed_on_time` : Diselesaikan sebelum atau tepat tenggat
 * - `completed_late`    : Diselesaikan setelah melewati tenggat
 * - `not_applicable`    : SLA tidak berlaku (ditolak, digabung, atau data tidak lengkap)
 */
export type SlaState =
  | "in_target"
  | "overdue"
  | "completed_on_time"
  | "completed_late"
  | "not_applicable";

export interface SlaStage {
  kind: "verification" | "handling";
  dueAt: string | null;
  state: SlaState;
  /** Milidetik sisa waktu (positif = belum lewat, negatif = sudah lewat). null jika tidak berlaku. */
  remainingMs: number | null;
}

/** Parameter laporan yang dibutuhkan untuk menghitung SLA. */
export interface SlaInput {
  status: ReportStatusKey;
  /** Tenggat verifikasi — dihitung dari `created_at` + `verification_hours`. */
  verificationDueAt: string | null | undefined;
  /** Tenggat penyelesaian — dihitung dari `verified_at` + `handling_days`. */
  handlingDueAt: string | null | undefined;
  /**
   * Waktu pertama kali laporan berstatus `selesai` dari `report_status_history`.
   * Digunakan untuk menentukan apakah laporan diselesaikan tepat waktu atau terlambat.
   */
  completedAt: string | null | undefined;
}

// ---------------------------------------------------------------------------
// Core Calculation
// ---------------------------------------------------------------------------

function toTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

/**
 * Menghitung tahap SLA aktif berdasarkan status laporan.
 *
 * Aturan:
 * - `diterima`                 → SLA verifikasi aktif
 * - `diverifikasi` / `diproses` → SLA penyelesaian aktif
 * - `selesai`                  → Cek apakah selesai tepat waktu atau terlambat
 * - `ditolak` / `digabung`     → Tidak berlaku
 *
 * @param status         Status laporan saat ini
 * @param dueAt          Tenggat SLA yang relevan
 * @param now            Waktu referensi (ISO 8601, dari server)
 * @param completedAt    Waktu selesai (hanya relevan jika status = 'selesai')
 */
export function calculateSlaStage(
  status: ReportStatusKey,
  dueAt: string | null | undefined,
  now: string,
  completedAt?: string | null,
): SlaStage {
  const kind = status === "diterima" ? "verification" : "handling";

  if (status === "selesai") {
    const dueMs = toTime(dueAt);
    const completedMs = toTime(completedAt);
    if (dueMs === null || completedMs === null) {
      return { kind, dueAt: dueAt ?? null, state: "not_applicable", remainingMs: null };
    }
    return {
      kind,
      dueAt: dueAt ?? null,
      state: completedMs <= dueMs ? "completed_on_time" : "completed_late",
      remainingMs: null,
    };
  }

  if (status === "ditolak" || status === "digabung") {
    return { kind, dueAt: dueAt ?? null, state: "not_applicable", remainingMs: null };
  }

  const dueMs = toTime(dueAt);
  const nowMs = toTime(now);
  if (dueMs === null || nowMs === null) {
    return { kind, dueAt: dueAt ?? null, state: "not_applicable", remainingMs: null };
  }

  const remainingMs = dueMs - nowMs;
  return {
    kind,
    dueAt: dueAt ?? null,
    state: remainingMs < 0 ? "overdue" : "in_target",
    remainingMs,
  };
}

/**
 * Menghitung seluruh informasi SLA dari data laporan lengkap.
 * Memilih `dueAt` yang tepat berdasarkan status laporan.
 *
 * Untuk laporan `digabung`, selalu kembalikan `not_applicable`.
 * SLA laporan duplikat diikutkan ke laporan utama.
 */
export function calculateReportSla(input: SlaInput, now: string): SlaStage {
  const { status, verificationDueAt, handlingDueAt, completedAt } = input;

  if (status === "diterima") {
    return calculateSlaStage(status, verificationDueAt, now);
  }

  if (status === "diverifikasi" || status === "diproses") {
    return calculateSlaStage(status, handlingDueAt, now);
  }

  if (status === "selesai") {
    // Gunakan handlingDueAt sebagai tenggat penyelesaian
    return calculateSlaStage(status, handlingDueAt, now, completedAt);
  }

  // ditolak, digabung
  return calculateSlaStage(status, null, now);
}

// ---------------------------------------------------------------------------
// Formatting Helpers
// ---------------------------------------------------------------------------

/**
 * Format milidetik menjadi label waktu yang dapat dibaca.
 * Menggunakan nilai absolut; penanda positif/negatif ditangani di UI.
 */
export function formatRemainingTime(remainingMs: number | null): string {
  if (remainingMs === null) return "Belum tersedia";
  const absoluteMs = Math.abs(remainingMs);
  const totalMinutes = Math.floor(absoluteMs / 60_000);
  const totalHours = Math.floor(absoluteMs / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days} hari${hours ? ` ${hours} jam` : ""}`;
  if (totalHours > 0) return `${totalHours} jam${minutes ? ` ${minutes} mnt` : ""}`;
  return `${minutes} menit`;
}

/**
 * Format tanggal tenggat menjadi label yang dapat dibaca.
 * @param dueAt    ISO 8601 timestamp
 * @param locale   Locale BCP 47, default id-ID
 */
export function formatDueDate(dueAt: string | null, locale = "id-ID"): string {
  const time = toTime(dueAt);
  if (time === null) return "Tidak diketahui";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(time);
}
