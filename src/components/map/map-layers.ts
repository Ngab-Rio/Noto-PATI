import maplibregl from "maplibre-gl";
import type { ReportFeatureCollection } from "@/types/map";
import { STATUS_COLORS } from "./map-constants";
import {
  HEATMAP_WEIGHT_EXPRESSION,
  buildClusterColorExpression,
  buildClusterRadiusExpression,
  buildClusterTextColorExpression,
  buildClusterTextSizeExpression,
  buildHeatmapColorExpression,
  buildHeatmapIntensityExpression,
  buildHeatmapOpacityExpression,
  buildHeatmapRadiusExpression,
  type MapMode,
} from "./map-density";
import type { LayerEventHandler } from "./map-types";

const REPORT_LAYER_IDS = [
  "heatmap",
  "clusters",
  "cluster-count",
  "unclustered-point-halo",
  "unclustered-point",
  "unclustered-point-dot",
  "reports-layer",
];

const STATUS_COLOR_EXPRESSION = [
  "match",
  ["get", "status"],
  "diterima",
  STATUS_COLORS.diterima,
  "diverifikasi",
  STATUS_COLORS.diverifikasi,
  "diproses",
  STATUS_COLORS.diproses,
  "selesai",
  STATUS_COLORS.selesai,
  "ditolak",
  STATUS_COLORS.ditolak,
  "#4B5563",
] as unknown as maplibregl.ExpressionSpecification;

function fadeInNearZoom(value: number): maplibregl.ExpressionSpecification {
  return [
    "interpolate",
    ["linear"],
    ["zoom"],
    13,
    0,
    15,
    value,
  ] as unknown as maplibregl.ExpressionSpecification;
}

/**
 * Removes all report marker and cluster layers and source safely.
 */
export function removeReportLayers(map: maplibregl.Map): void {
  for (const layerId of REPORT_LAYER_IDS) {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  }
  if (map.getSource("reports")) {
    map.removeSource("reports");
  }
  if (map.getSource("reports-heat")) {
    map.removeSource("reports-heat");
  }
}

function setLayerVisibility(
  map: maplibregl.Map,
  layerId: string,
  visible: boolean
): void {
  if (!map.getLayer(layerId)) return;
  map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
}

/**
 * Applies mode-specific layer visibility and point opacity.
 * Heatmap fades out near zoom 15 while status points fade in.
 */
export function applyMapMode(map: maplibregl.Map, mode: MapMode): void {
  const isHeatmap = mode === "heatmap";

  setLayerVisibility(map, "heatmap", isHeatmap);
  setLayerVisibility(map, "clusters", !isHeatmap);
  setLayerVisibility(map, "cluster-count", !isHeatmap);

  const haloOpacity = isHeatmap ? fadeInNearZoom(0.28) : 0.28;
  const pointOpacity = isHeatmap ? fadeInNearZoom(1) : 1;
  const dotOpacity = isHeatmap ? fadeInNearZoom(0.95) : 0.95;

  if (map.getLayer("unclustered-point-halo")) {
    map.setPaintProperty(
      "unclustered-point-halo",
      "circle-opacity",
      haloOpacity
    );
  }
  if (map.getLayer("unclustered-point")) {
    map.setPaintProperty("unclustered-point", "circle-opacity", pointOpacity);
  }
  if (map.getLayer("unclustered-point-dot")) {
    map.setPaintProperty("unclustered-point-dot", "circle-opacity", dotOpacity);
  }
}

/**
 * Configures the GeoJSON sources and renders native WebGL heatmap, cluster,
 * and marker layers. Using native layers keeps rendering reliable without
 * external images or font glyph loading.
 */
export function addReportLayers(
  map: maplibregl.Map,
  geojson: ReportFeatureCollection,
  mode: MapMode
): void {
  // Clustered source for cluster mode
  map.addSource("reports", {
    type: "geojson",
    data: geojson,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
    clusterMinPoints: 2,
  });

  // Unclustered source so the heatmap reads individual reports
  map.addSource("reports-heat", {
    type: "geojson",
    data: geojson,
  });

  // Layer 0: Native GPU heatmap
  map.addLayer({
    id: "heatmap",
    type: "heatmap",
    source: "reports-heat",
    paint: {
      "heatmap-weight":
        HEATMAP_WEIGHT_EXPRESSION as unknown as maplibregl.ExpressionSpecification,
      "heatmap-intensity": buildHeatmapIntensityExpression(),
      "heatmap-radius": buildHeatmapRadiusExpression(),
      "heatmap-opacity": buildHeatmapOpacityExpression(),
      "heatmap-color": buildHeatmapColorExpression(),
    },
  });

  // Layer 1: Cluster circles with density-based size & color
  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "reports",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": buildClusterColorExpression(),
      "circle-radius": buildClusterRadiusExpression(),
      "circle-stroke-width": 3,
      "circle-stroke-color": "#FFFFFF",
      "circle-opacity": 1,
    },
  });

  // Layer 2: Cluster count labels
  try {
    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "reports",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count}",
        "text-font": ["Noto Sans Regular"],
        "text-size": buildClusterTextSizeExpression(),
        "text-allow-overlap": true,
      },
      paint: {
        "text-color": buildClusterTextColorExpression(),
      },
    });
  } catch (err) {
    console.warn("Cluster count symbol layer unavailable, showing circles only:", err);
  }

  // Layer 3: Unclustered point outer halo / aura
  map.addLayer({
    id: "unclustered-point-halo",
    type: "circle",
    source: "reports",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8,
        10,
        14,
        13,
        18,
        16,
      ],
      "circle-color": STATUS_COLOR_EXPRESSION,
      "circle-opacity": 0.28,
    },
  });

  // Layer 4: Unclustered point main marker (colored by status with solid white border)
  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "reports",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8,
        6,
        14,
        8,
        18,
        10,
      ],
      "circle-color": STATUS_COLOR_EXPRESSION,
      "circle-stroke-width": 2.5,
      "circle-stroke-color": "#FFFFFF",
      "circle-opacity": 1,
    },
  });

  // Layer 5: Inner center dot for crisp pin appearance
  map.addLayer({
    id: "unclustered-point-dot",
    type: "circle",
    source: "reports",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8,
        1.8,
        14,
        2.5,
        18,
        3.5,
      ],
      "circle-color": "#FFFFFF",
      "circle-opacity": 0.95,
    },
  });

  applyMapMode(map, mode);
}

/**
 * Registers click and hover interactions for heatmap, clusters, and points.
 */
export function setupMapInteractions({
  map,
  onMarkerClick,
  onClusterClick,
  onHeatmapClick,
}: {
  map: maplibregl.Map;
  onMarkerClick: (e: maplibregl.MapLayerMouseEvent) => void;
  onClusterClick: (e: maplibregl.MapLayerMouseEvent) => void;
  onHeatmapClick: (e: maplibregl.MapLayerMouseEvent) => void;
}): LayerEventHandler[] {
  const setPointer = () => {
    map.getCanvas().style.cursor = "pointer";
  };
  const resetPointer = () => {
    map.getCanvas().style.cursor = "";
  };

  const handlers: LayerEventHandler[] = [
    { event: "click", layerId: "heatmap", handler: onHeatmapClick },
    { event: "click", layerId: "clusters", handler: onClusterClick },
    { event: "click", layerId: "unclustered-point", handler: onMarkerClick },
    { event: "click", layerId: "unclustered-point-halo", handler: onMarkerClick },
    { event: "mouseenter", layerId: "heatmap", handler: setPointer },
    { event: "mouseleave", layerId: "heatmap", handler: resetPointer },
    { event: "mouseenter", layerId: "clusters", handler: setPointer },
    { event: "mouseleave", layerId: "clusters", handler: resetPointer },
    { event: "mouseenter", layerId: "unclustered-point", handler: setPointer },
    { event: "mouseleave", layerId: "unclustered-point", handler: resetPointer },
    { event: "mouseenter", layerId: "unclustered-point-halo", handler: setPointer },
    { event: "mouseleave", layerId: "unclustered-point-halo", handler: resetPointer },
  ];

  for (const h of handlers) {
    map.on(h.event, h.layerId, h.handler);
  }

  return handlers;
}

/**
 * Unbinds all registered layer mouse event handlers.
 */
export function teardownMapInteractions(
  map: maplibregl.Map,
  handlers: LayerEventHandler[]
): void {
  for (const h of handlers) {
    map.off(h.event, h.layerId, h.handler);
  }
}
