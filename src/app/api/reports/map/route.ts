/**
 * API endpoint for fetching report markers for public map
 * GET /api/reports/map
 *
 * Privacy & Publication Rules:
 * - Never expose reporter_id or any personal identity fields
 * - Exclude reports with status "digabung" (merged into another report)
 * - Only return reports with valid coordinates (non-null lat/lng)
 * - Include first photo signed URL for popup display
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ReportFeatureCollection,
  ReportFeature,
  MapFilters,
} from "@/types/map";

export const dynamic = "force-dynamic";

/**
 * Statuses that should NOT appear on the public map.
 * "digabung" reports are folded into their parent — showing them
 * would create a duplicate damage point on the map.
 */
const EXCLUDED_STATUSES = ["digabung"] as const;

/**
 * Statuses eligible for the public map.
 */
const PUBLISHABLE_STATUSES = [
  "diterima",
  "diverifikasi",
  "diproses",
  "selesai",
  "ditolak",
] as const;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from query params
    const rawStatuses = searchParams.get("statuses")?.split(",") ?? [];
    const requestedStatuses = rawStatuses.filter(
      (s) =>
        PUBLISHABLE_STATUSES.includes(s as (typeof PUBLISHABLE_STATUSES)[number]) &&
        !EXCLUDED_STATUSES.includes(s as (typeof EXCLUDED_STATUSES)[number])
    ) as MapFilters["statuses"];

    const filters: MapFilters = {
      categories: searchParams.get("categories")?.split(",") as
        | ReportFeature["properties"]["category"][]
        | undefined,
      statuses:
        requestedStatuses && requestedStatuses.length > 0
          ? requestedStatuses
          : undefined,
      kecamatan: searchParams.get("kecamatan") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
    };

    // Build query — only select public-safe columns (no reporter_id)
    let query = supabase
      .from("reports")
      .select(
        `
        id,
        ticket_number,
        title,
        category,
        status,
        detail_location,
        latitude,
        longitude,
        created_at
      `
      )
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .in("status", PUBLISHABLE_STATUSES)
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters.categories && filters.categories.length > 0) {
      query = query.in("category", filters.categories);
    }

    if (filters.statuses && filters.statuses.length > 0) {
      query = query.in("status", filters.statuses);
    }

    if (filters.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }

    // Execute query with limit
    const { data: reports, error } = await query.limit(1000);

    if (error) {
      console.error("[Map API] Failed to fetch reports:", error);
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 }
      );
    }

    // Fetch first photo for each report to display in popup
    const reportIds = reports.map((r) => r.id);
    const firstPhotoByReport = new Map<string, string>();

    if (reportIds.length > 0) {
      try {
        const admin = createAdminClient();
        const { data: photos } = await admin
          .from("report_photos")
          .select("report_id, storage_path, sort_order")
          .in("report_id", reportIds)
          .order("sort_order", { ascending: true });

        if (photos && photos.length > 0) {
          // Group by report_id, take only the first photo
          const seenReports = new Set<string>();
          const photosToSign: { report_id: string; storage_path: string }[] = [];

          for (const photo of photos) {
            if (!seenReports.has(photo.report_id)) {
              seenReports.add(photo.report_id);
              photosToSign.push(photo);
            }
          }

          // Batch sign URLs
          const signResults = await Promise.all(
            photosToSign.map(async (photo) => {
              const { data: signed } = await admin.storage
                .from("report-photos")
                .createSignedUrl(photo.storage_path, 60 * 30); // 30 min expiry
              return {
                reportId: photo.report_id,
                url: signed?.signedUrl ?? null,
              };
            })
          );

          for (const result of signResults) {
            if (result.url) {
              firstPhotoByReport.set(result.reportId, result.url);
            }
          }
        }
      } catch (photoError) {
        // Non-fatal: continue without photos
        console.warn("[Map API] Failed to fetch report photos:", photoError);
      }
    }

    // Transform to GeoJSON — never include reporter identity
    const features: ReportFeature[] = reports
      .filter((report) => {
        // Double-check: skip reports with invalid coordinates
        const lat = report.latitude!;
        const lng = report.longitude!;
        return (
          typeof lat === "number" &&
          typeof lng === "number" &&
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        );
      })
      .map((report) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [report.longitude!, report.latitude!], // [lng, lat]
        },
        properties: {
          id: report.id,
          ticketNumber: report.ticket_number,
          title: report.title,
          category: report.category,
          status: report.status,
          detailLocation: report.detail_location,
          createdAt: report.created_at,
          photoUrl: firstPhotoByReport.get(report.id),
        },
      }));

    const featureCollection: ReportFeatureCollection = {
      type: "FeatureCollection",
      features,
    };

    return NextResponse.json(featureCollection);
  } catch (error) {
    console.error("[Map API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
