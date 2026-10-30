/**
 * API endpoint for fetching report markers for public map
 * GET /api/reports/map
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  ReportFeatureCollection,
  ReportFeature,
  MapFilters,
} from "@/types/map";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from query params
    const filters: MapFilters = {
      categories: searchParams.get("categories")?.split(",") as
        | ReportFeature["properties"]["category"][]
        | undefined,
      statuses: searchParams.get("statuses")?.split(",") as
        | ReportFeature["properties"]["status"][]
        | undefined,
      kecamatan: searchParams.get("kecamatan") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
    };

    // Build query
    let query = supabase
      .from("reports")
      .select(
        `
        id,
        ticket_number,
        title,
        category,
        status,
        latitude,
        longitude,
        created_at
      `
      )
      .not("latitude", "is", null)
      .not("longitude", "is", null)
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

    // Transform to GeoJSON
    const features: ReportFeature[] = reports.map((report) => ({
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
        createdAt: report.created_at,
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
