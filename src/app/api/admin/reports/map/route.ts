import { NextRequest, NextResponse } from "next/server";

import { getCurrentRole, getCurrentUser } from "@/lib/auth/guards";
import { getSignedPhotoUrls } from "@/lib/reports/signed-urls";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ReportFeature, ReportFeatureCollection, ReportStatus } from "@/types/map";

export const dynamic = "force-dynamic";

const REPORT_STATUSES: readonly ReportStatus[] = [
  "diterima",
  "diverifikasi",
  "diproses",
  "selesai",
  "ditolak",
  "digabung",
];
const REPORT_CATEGORIES = [
  "jalan",
  "lampu",
  "drainase",
  "jembatan",
  "tanggul",
  "trotoar",
  "rambu",
  "lainnya",
] as const;
const PAGE_SIZE = 1000;

type AdminMapReport = {
  id: string;
  ticket_number: string;
  title: string;
  category: ReportFeature["properties"]["category"];
  status: ReportStatus;
  detail_location: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

type AdminMapReportWithCoordinates = AdminMapReport & {
  latitude: number;
  longitude: number;
};

function hasValidCoordinates(
  report: AdminMapReport,
): report is AdminMapReportWithCoordinates {
  return report.latitude !== null
    && report.longitude !== null
    && Number.isFinite(report.latitude)
    && Number.isFinite(report.longitude)
    && report.latitude >= -90
    && report.latitude <= 90
    && report.longitude >= -180
    && report.longitude <= 180;
}

export async function GET(request: NextRequest) {
  const { user } = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (await getCurrentRole(user.id) !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const requestedStatuses = searchParams.get("statuses")?.split(",") ?? [];
  const statuses = requestedStatuses.filter(
    (status): status is ReportStatus => REPORT_STATUSES.includes(status as ReportStatus),
  );
  const requestedCategories = searchParams.get("categories")?.split(",") ?? [];
  const categories = requestedCategories.filter(
    (category): category is (typeof REPORT_CATEGORIES)[number] =>
      REPORT_CATEGORIES.includes(category as (typeof REPORT_CATEGORIES)[number]),
  );

  try {
    const admin = createAdminClient();
    const reports: AdminMapReport[] = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
      let query = admin
        .from("reports")
        .select(
          "id, ticket_number, title, category, status, detail_location, latitude, longitude, created_at",
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (statuses.length > 0) query = query.in("status", statuses);
      if (categories.length > 0) query = query.in("category", categories);

      const dateFrom = searchParams.get("dateFrom");
      const dateTo = searchParams.get("dateTo");
      if (dateFrom) query = query.gte("created_at", dateFrom);
      if (dateTo) query = query.lte("created_at", dateTo);

      const { data, error } = await query;
      if (error) {
        console.error("[Admin Map API] Failed to fetch reports:", error);
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
      }

      const batch = (data ?? []) as AdminMapReport[];
      reports.push(...batch);
      if (batch.length < PAGE_SIZE) break;
    }

    const visibleReports = reports.filter(hasValidCoordinates);
    const reportIds = visibleReports.map((report) => report.id);
    const photoByReport = new Map<string, string>();

    if (reportIds.length > 0) {
      const { data: photos, error: photosError } = await admin
        .from("report_photos")
        .select("report_id, storage_path")
        .in("report_id", reportIds)
        .eq("sort_order", 0);

      if (photosError) {
        console.error("[Admin Map API] Failed to fetch report photos:", photosError);
        return NextResponse.json({ error: "Failed to fetch report photos" }, { status: 500 });
      }

      const pathByReport = new Map(
        (photos ?? []).map((photo) => [photo.report_id, photo.storage_path]),
      );
      const signedUrls = await getSignedPhotoUrls([...pathByReport.values()]);
      for (const [reportId, path] of pathByReport) {
        const signedUrl = signedUrls.get(path);
        if (signedUrl) photoByReport.set(reportId, signedUrl);
      }
    }

    const features: ReportFeature[] = visibleReports.map((report) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [report.longitude, report.latitude],
      },
      properties: {
        id: report.id,
        ticketNumber: report.ticket_number,
        title: report.title,
        category: report.category,
        status: report.status,
        detailLocation: report.detail_location,
        createdAt: report.created_at,
        photoUrl: photoByReport.get(report.id),
      },
    }));

    const collection: ReportFeatureCollection = {
      type: "FeatureCollection",
      features,
    };

    return NextResponse.json(collection, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("[Admin Map API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
