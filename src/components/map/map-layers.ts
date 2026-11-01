import maplibregl from "maplibre-gl";
import type { ReportFeatureCollection } from "@/types/map";
import {
  CLUSTER_COLOR_STOPS,
  CLUSTER_RADIUS_STOPS,
  STATUS_COLORS,
} from "./map-constants";
import type { LayerEventHandler } from "./map-types";

const REPORT_LAYER_IDS = [
  "clusters",
  "cluster-count",
  "unclustered-point-halo",
  "unclustered-point",
  "unclustered-point-dot",
  "unclustered-point-icon",
  "unclustered-point-stroke",
  "reports-layer",
];

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
}

/**
 * Configures the GeoJSON source and renders native WebGL cluster and marker layers.
 * Using native circle layers ensures 100% reliable rendering without reliance on
 * external images or font glyph loading.
 */
export function addReportLayers(
  map: maplibregl.Map,
  geojson: ReportFeatureCollection
): void {
  // Add clustered GeoJSON source
  map.addSource("reports", {
    type: "geojson",
    data: geojson,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
    clusterMinPoints: 2,
  });

  // Layer 1: Cluster circles with dynamic size & color
  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "reports",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": CLUSTER_COLOR_STOPS as unknown as maplibregl.ExpressionSpecification,
      "circle-radius": CLUSTER_RADIUS_STOPS as unknown as maplibregl.ExpressionSpecification,
      "circle-stroke-width": 3,
      "circle-stroke-color": "#FFFFFF",
      "circle-opacity": 0.9,
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
        "text-size": [
          "step",
          ["get", "point_count"],
          12,
          10,
          13,
          50,
          14,
          100,
          16,
        ],
        "text-allow-overlap": true,
      },
      paint: {
        "text-color": "#FFFFFF",
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
      "circle-color": [
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
      ],
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
      "circle-color": [
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
      ],
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
}

/**
 * Registers click and hover interactions for clusters and unclustered points.
 */
export function setupMapInteractions({
  map,
  onMarkerClick,
  onClusterClick,
}: {
  map: maplibregl.Map;
  onMarkerClick: (e: maplibregl.MapLayerMouseEvent) => void;
  onClusterClick: (e: maplibregl.MapLayerMouseEvent) => void;
}): LayerEventHandler[] {
  const setPointer = () => {
    map.getCanvas().style.cursor = "pointer";
  };
  const resetPointer = () => {
    map.getCanvas().style.cursor = "";
  };

  const handlers: LayerEventHandler[] = [
    { event: "click", layerId: "clusters", handler: onClusterClick },
    { event: "click", layerId: "unclustered-point", handler: onMarkerClick },
    { event: "click", layerId: "unclustered-point-halo", handler: onMarkerClick },
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
