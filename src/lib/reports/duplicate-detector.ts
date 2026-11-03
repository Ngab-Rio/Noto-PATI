import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface DuplicateDetectionResult {
  success: boolean;
  isDuplicate: boolean;
  duplicateReportId?: string;
  duplicateTicketNumber?: string;
  parentReportId?: string;
  parentTicketNumber?: string;
  distanceMeters?: number;
  timeDiffSeconds?: number;
  reason?: string;
}

const DEFAULT_MAX_DISTANCE_M = 50.0;
const DEFAULT_MAX_TIME_DIFF_HOURS = 6.0;
const RULE_VERSION = "v1.0";

/**
 * Calculates great-circle distance between two GPS coordinates using the Haversine formula (in meters).
 */
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Detects if a newly submitted report is a duplicate of an existing active report
 * and merges it atomically.
 *
 * Rules:
 * - Same category
 * - Max distance: 50 meters
 * - Max time window: 6 hours
 * - Active parent status: 'diterima', 'diverifikasi', 'diproses'
 * - Parent report must not already be merged (anti-chain rule)
 * - Oldest active candidate chosen as parent
 * - Non-blocking: failures must never throw or prevent new report creation
 */
export async function detectAndMergeDuplicate(
  reportId: string,
  options?: {
    maxDistanceMeters?: number;
    maxTimeDiffHours?: number;
  }
): Promise<DuplicateDetectionResult> {
  const maxDistance = options?.maxDistanceMeters ?? DEFAULT_MAX_DISTANCE_M;
  const maxHours = options?.maxTimeDiffHours ?? DEFAULT_MAX_TIME_DIFF_HOURS;
  const admin = createAdminClient();

  try {
    // 1. Primary path: Execute database-level atomic RPC function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rpcData, error: rpcError } = await (admin.rpc as any)(
      "detect_and_merge_duplicate_report",
      {
        p_report_id: reportId,
        p_max_distance_m: maxDistance,
        p_max_time_diff_hours: maxHours,
        p_rule_version: RULE_VERSION,
      }
    );

    if (!rpcError && rpcData) {
      const result = rpcData as unknown as {
        success: boolean;
        is_duplicate: boolean;
        duplicate_report_id?: string;
        duplicate_ticket_number?: string;
        parent_report_id?: string;
        parent_ticket_number?: string;
        distance_meters?: number;
        time_diff_seconds?: number;
        reason?: string;
      };

      return {
        success: result.success,
        isDuplicate: result.is_duplicate,
        duplicateReportId: result.duplicate_report_id,
        duplicateTicketNumber: result.duplicate_ticket_number,
        parentReportId: result.parent_report_id,
        parentTicketNumber: result.parent_ticket_number,
        distanceMeters: result.distance_meters,
        timeDiffSeconds: result.time_diff_seconds,
        reason: result.reason,
      };
    }

    // If RPC failed due to missing function in DB, perform resilient TypeScript fallback
    console.warn(
      "[DuplicateDetector] RPC unavailable or error, using application fallback:",
      rpcError?.message
    );

    return await executeFallbackDetection(admin, reportId, maxDistance, maxHours);
  } catch (err) {
    console.error("[DuplicateDetector] Unexpected error during duplicate detection:", err);
    return {
      success: false,
      isDuplicate: false,
      reason: "DETECTION_ERROR",
    };
  }
}

/**
 * Resilient application-level fallback in case RPC is not yet applied in database.
 */
async function executeFallbackDetection(
  admin: ReturnType<typeof createAdminClient>,
  reportId: string,
  maxDistanceMeters: number,
  maxTimeDiffHours: number
): Promise<DuplicateDetectionResult> {
  // 1. Fetch newly submitted report
  const { data: report, error: reportErr } = await admin
    .from("reports")
    .select(
      "id, ticket_number, category, status, created_at, latitude, longitude, location_accuracy_m, merged_into_report_id"
    )
    .eq("id", reportId)
    .maybeSingle();

  if (reportErr || !report) {
    return { success: false, isDuplicate: false, reason: "REPORT_NOT_FOUND" };
  }

  // Skip if already merged or location missing / poor accuracy (> 100m)
  if (
    report.merged_into_report_id ||
    report.latitude == null ||
    report.longitude == null ||
    (report.location_accuracy_m != null && report.location_accuracy_m > 100)
  ) {
    return { success: true, isDuplicate: false, reason: "SKIPPED_INELIGIBLE" };
  }

  // 2. Query candidates: same category, active, not merged, created within time window
  const minCreatedAt = new Date(
    new Date(report.created_at).getTime() - maxTimeDiffHours * 3600 * 1000
  ).toISOString();

  const { data: candidates, error: candErr } = await admin
    .from("reports")
    .select("id, ticket_number, created_at, latitude, longitude")
    .eq("category", report.category)
    .in("status", ["diterima", "diverifikasi", "diproses"])
    .is("merged_into_report_id", null)
    .neq("id", report.id)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .gte("created_at", minCreatedAt)
    .order("created_at", { ascending: true });

  if (candErr || !candidates || candidates.length === 0) {
    return { success: true, isDuplicate: false };
  }

  // 3. Find closest candidate within max distance (oldest first)
  for (const candidate of candidates) {
    const dist = calculateHaversineDistance(
      report.latitude,
      report.longitude,
      candidate.latitude!,
      candidate.longitude!
    );

    if (dist <= maxDistanceMeters) {
      const timeDiffS = Math.round(
        Math.abs(new Date(report.created_at).getTime() - new Date(candidate.created_at).getTime()) /
          1000
      );

      // Perform merge
      await admin
        .from("reports")
        .update({
          status: "digabung",
          merged_into_report_id: candidate.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", report.id);

      // Insert status history
      await admin.from("report_status_history").insert({
        report_id: report.id,
        status: "digabung",
        note: `Laporan digabung otomatis ke laporan utama ${candidate.ticket_number} (jarak ${Math.round(dist)}m).`,
        changed_by: null,
      });

      // Insert merge log
      try {
        await admin.from("report_merge_logs").insert({
          parent_report_id: candidate.id,
          duplicate_report_id: report.id,
          distance_meters: Math.round(dist * 100) / 100,
          time_diff_seconds: timeDiffS,
          rule_version: RULE_VERSION,
          decision: "merged",
          parameters: {
            max_distance_m: maxDistanceMeters,
            max_time_diff_hours: maxTimeDiffHours,
            parent_ticket_number: candidate.ticket_number,
            duplicate_ticket_number: report.ticket_number,
          },
        });
      } catch (logErr) {
        console.warn("[DuplicateDetector] Failed to insert merge log:", logErr);
      }

      return {
        success: true,
        isDuplicate: true,
        duplicateReportId: report.id,
        duplicateTicketNumber: report.ticket_number,
        parentReportId: candidate.id,
        parentTicketNumber: candidate.ticket_number,
        distanceMeters: Math.round(dist * 100) / 100,
        timeDiffSeconds: timeDiffS,
      };
    }
  }

  return { success: true, isDuplicate: false };
}
