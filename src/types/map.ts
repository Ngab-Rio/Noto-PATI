/**
 * Map and geolocation types for Public Map feature
 */

import type { Database } from "./supabase";

export type ReportStatus = Database["public"]["Enums"]["report_status"];
export type ReportCategory = Database["public"]["Enums"]["report_category"];

/**
 * Map marker data for displaying reports on the map
 */
export interface ReportMapMarker {
  id: string;
  ticketNumber: string;
  title: string;
  category: ReportCategory;
  status: ReportStatus;
  latitude: number;
  longitude: number;
  createdAt: string;
  photoUrl?: string;
}

/**
 * GeoJSON Feature for MapLibre
 */
export interface ReportFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    id: string;
    ticketNumber: string;
    title: string;
    category: ReportCategory;
    status: ReportStatus;
    createdAt: string;
    photoUrl?: string;
  };
}

/**
 * GeoJSON FeatureCollection
 */
export interface ReportFeatureCollection {
  type: "FeatureCollection";
  features: ReportFeature[];
}

/**
 * Map filter options
 */
export interface MapFilters {
  categories?: ReportCategory[];
  statuses?: ReportStatus[];
  kecamatan?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Map bounds for viewport-based queries
 */
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Kabupaten Pati center coordinates
 */
export const PATI_CENTER: [number, number] = [111.0379, -6.7558]; // [lng, lat]

/**
 * Kabupaten Pati bounding box (approximate)
 */
export const PATI_BOUNDS: MapBounds = {
  north: -6.55,
  south: -6.95,
  east: 111.25,
  west: 110.85,
};
