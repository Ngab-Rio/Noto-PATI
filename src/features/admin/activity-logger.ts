"use server";

/**
 * Admin Activity Logging System
 * 
 * Tracks all admin actions for audit trail and compliance
 * Separate from report_status_history (which is public)
 * This is internal admin audit log
 */

import { createClient } from "@/lib/supabase/server";

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

export type AdminActionType =
  | "verify_report"
  | "reject_report"
  | "update_status"
  | "upload_evidence"
  | "delete_evidence"
  | "merge_reports"
  | "assign_dinas"
  | "update_sla";

export interface AdminActivityLog {
  id: string;
  admin_user_id: string;
  action_type: AdminActionType;
  target_report_id: string;
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Logger Functions
// ─────────────────────────────────────────────────────────────────────────

/**
 * Log admin action to database
 * Non-blocking - won't fail parent operation if logging fails
 */
export async function logAdminActivity(params: {
  adminUserId: string;
  actionType: AdminActionType;
  targetReportId: string;
  details?: Record<string, unknown>;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  };
}): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("admin_activity_logs").insert({
      admin_user_id: params.adminUserId,
      action_type: params.actionType,
      target_report_id: params.targetReportId,
      details: params.details || {},
      ip_address: params.metadata?.ipAddress || null,
      user_agent: params.metadata?.userAgent || null,
    });

    if (error) {
      console.error("[Activity Logger] Failed to log action:", error);
      // Don't throw - logging is non-critical
    }
  } catch (error) {
    console.error("[Activity Logger] Exception:", error);
    // Don't throw - logging is non-critical
  }
}

/**
 * Get activity logs for a specific report
 */
export async function getReportActivityLogs(
  reportId: string
): Promise<AdminActivityLog[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("admin_activity_logs")
      .select("*")
      .eq("target_report_id", reportId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Activity Logger] Failed to fetch logs:", error);
      return [];
    }

    return (data as AdminActivityLog[]) || [];
  } catch (error) {
    console.error("[Activity Logger] Exception:", error);
    return [];
  }
}

/**
 * Get recent admin activities (for dashboard overview)
 */
export async function getRecentAdminActivities(
  limit = 50
): Promise<AdminActivityLog[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("admin_activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Activity Logger] Failed to fetch activities:", error);
      return [];
    }

    return (data as AdminActivityLog[]) || [];
  } catch (error) {
    console.error("[Activity Logger] Exception:", error);
    return [];
  }
}

/**
 * Get activity statistics for admin dashboard
 */
export async function getAdminActivityStats(timeRange: "today" | "week" | "month" = "today") {
  try {
    const supabase = await createClient();

    let startDate: Date;
    const now = new Date();

    switch (timeRange) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
    }

    const { data, error } = await supabase
      .from("admin_activity_logs")
      .select("action_type")
      .gte("created_at", startDate.toISOString());

    if (error) {
      console.error("[Activity Logger] Failed to fetch stats:", error);
      return null;
    }

    // Count by action type
    const stats = data.reduce(
      (acc, log) => {
        acc[log.action_type] = (acc[log.action_type] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      { total: 0 } as Record<string, number>
    );

    return stats;
  } catch (error) {
    console.error("[Activity Logger] Exception:", error);
    return null;
  }
}
