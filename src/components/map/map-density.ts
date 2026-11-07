import type { ExpressionSpecification } from "maplibre-gl";

import { DENSITY_COLORS } from "@/config/theme";

export type MapMode = "heatmap" | "cluster";

/** Batas bawah klaster sedang dan tinggi. */
export const CLUSTER_DENSITY_THRESHOLDS = {
  mid: 6,
  high: 21,
} as const;

export const CLUSTER_TEXT_COLORS = {
  low: "#FFFFFF",
  mid: "#1F2D3D",
  high: "#FFFFFF",
} as const;

export const HEATMAP_TUNING = {
  radius: [
    [9, 18],
    [12, 30],
    [15, 48],
  ],
  intensity: [
    [9, 0.6],
    [12, 1],
    [15, 1.6],
  ],
  // Memudar 13-15 agar titik status mengambil alih di zoom dekat.
  opacity: [
    [11, 0.8],
    [13, 0.6],
    [15, 0],
  ],
  colorStops: [
    [0, "rgba(0, 0, 0, 0)"],
    [0.2, DENSITY_COLORS.low.hex],
    [0.5, DENSITY_COLORS.mid.hex],
    [0.8, DENSITY_COLORS.high.hex],
    [1, DENSITY_COLORS.high.hex],
  ],
} as const;

/** Konstan sekarang, siap diganti bobot dukungan efektif nanti. */
export const HEATMAP_WEIGHT_EXPRESSION = ["literal", 1] as const;

function zoomInterpolation(
  stops: readonly (readonly [number, number])[]
): ExpressionSpecification {
  const flattened = stops.flatMap(([zoom, value]) => [zoom, value]);
  return [
    "interpolate",
    ["linear"],
    ["zoom"],
    ...flattened,
  ] as unknown as ExpressionSpecification;
}

export function buildClusterColorExpression(): ExpressionSpecification {
  return [
    "step",
    ["get", "point_count"],
    DENSITY_COLORS.low.hex,
    CLUSTER_DENSITY_THRESHOLDS.mid,
    DENSITY_COLORS.mid.hex,
    CLUSTER_DENSITY_THRESHOLDS.high,
    DENSITY_COLORS.high.hex,
  ] as unknown as ExpressionSpecification;
}

export function buildClusterTextColorExpression(): ExpressionSpecification {
  return [
    "step",
    ["get", "point_count"],
    CLUSTER_TEXT_COLORS.low,
    CLUSTER_DENSITY_THRESHOLDS.mid,
    CLUSTER_TEXT_COLORS.mid,
    CLUSTER_DENSITY_THRESHOLDS.high,
    CLUSTER_TEXT_COLORS.high,
  ] as unknown as ExpressionSpecification;
}

export function buildClusterRadiusExpression(): ExpressionSpecification {
  return [
    "step",
    ["get", "point_count"],
    18,
    CLUSTER_DENSITY_THRESHOLDS.mid,
    23,
    CLUSTER_DENSITY_THRESHOLDS.high,
    28,
  ] as unknown as ExpressionSpecification;
}

export function buildClusterTextSizeExpression(): ExpressionSpecification {
  return [
    "step",
    ["get", "point_count"],
    13,
    CLUSTER_DENSITY_THRESHOLDS.high,
    15,
  ] as unknown as ExpressionSpecification;
}

export function buildHeatmapRadiusExpression(): ExpressionSpecification {
  return zoomInterpolation(HEATMAP_TUNING.radius);
}

export function buildHeatmapIntensityExpression(): ExpressionSpecification {
  return zoomInterpolation(HEATMAP_TUNING.intensity);
}

export function buildHeatmapOpacityExpression(): ExpressionSpecification {
  return zoomInterpolation(HEATMAP_TUNING.opacity);
}

export function buildHeatmapColorExpression(): ExpressionSpecification {
  const flattened = HEATMAP_TUNING.colorStops.flatMap(
    ([density, color]) => [density, color]
  );
  return [
    "interpolate",
    ["linear"],
    ["heatmap-density"],
    ...flattened,
  ] as unknown as ExpressionSpecification;
}
