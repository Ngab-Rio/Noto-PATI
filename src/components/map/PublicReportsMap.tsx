
"use client";

/**
 * Public Reports Map Component
 *
 * Features:
 * - MapLibre GL JS
 * - OpenStreetMap raster tiles
 * - GeoJSON native clustering
 * - Status-based pin markers
 * - Rich report popup
 * - Filter by category, status, kecamatan, and date
 * - Responsive map legend
 * - Automatic map bounds
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { ReportFeatureCollection } from "@/types/map";
import { PATI_CENTER } from "@/types/map";

// ============================================================
// TYPES
// ============================================================

interface PublicReportsMapProps {
  onMarkerClick?: (reportId: string) => void;

  filters?: {
    categories?: string[];
    statuses?: string[];
    kecamatan?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

type ReportProperties = Record<string, unknown>;

type BasemapMode = "streets" | "satellite";

type LayerEventHandler = {
  event: "click" | "mouseenter" | "mouseleave";
  layerId: string;
  handler: (event: maplibregl.MapLayerMouseEvent) => void;
};

// ============================================================
// CONSTANTS
// ============================================================

const CATEGORY_LABELS: Record<string, string> = {
  jalan: "Jalan Berlubang / Rusak",
  lampu: "PJU (Penerangan)",
  drainase: "Saluran Air / Drainase",
  jembatan: "Jembatan Rusak",
  tanggul: "Tanggul / Penahan Banjir",
  trotoar: "Trotoar Rusak",
  rambu: "Rambu / Marka Jalan",
  lainnya: "Fasilitas Lainnya",
};

const STATUS_COLORS: Record<string, string> = {
  diterima: "#2C6A93",
  diverifikasi: "#2F6568",
  diproses: "#7A5A12",
  selesai: "#2E6B45",
  ditolak: "#8F3A3A",
};

const STATUS_BG_COLORS: Record<string, string> = {
  diterima: "#E1F0F8",
  diverifikasi: "#DDEFEF",
  diproses: "#FBF0D2",
  selesai: "#DDEFE2",
  ditolak: "#F7DEDE",
};

const STATUS_LABELS: Record<string, string> = {
  diterima: "Diterima",
  diverifikasi: "Diverifikasi",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

/**
 * Status-specific glyphs.
 *
 * These paths are rendered inside the pin marker.
 */
const STATUS_MARKER_PATHS: Record<string, string> = {
  diterima: `
    <path
      d="M5.5 12l4.2 4.2L18.5 7"
      fill="none"
      stroke="#fff"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  `,

  diverifikasi: `
    <path
      d="M12 2.5l7 3v5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5v-5l7-3Z"
      fill="none"
      stroke="#fff"
      stroke-width="4"
    />

    <path
      d="m8.5 11.5 2.5 2.5 4.8-5"
      fill="none"
      stroke="#fff"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  `,

  diproses: `
    <path
      d="m15 4.5 4.5 4.5-8.5 8.5-4.5-4.5L15 4.5Z"
      fill="none"
      stroke="#fff"
      stroke-width="4"
      stroke-linejoin="round"
    />

    <path
      d="m6.5 16.5-1 3 3-1"
      fill="none"
      stroke="#fff"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  `,

  selesai: `
    <path
      d="M5.5 12l4.2 4.2L18.5 7"
      fill="none"
      stroke="#fff"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  `,

  ditolak: `
    <path
      d="m7 7 10 10m0-10L7 17"
      fill="none"
      stroke="#fff"
      stroke-width="4"
      stroke-linecap="round"
    />
  `,
};

// ============================================================
// HELPERS
// ============================================================

/**
 * Escape HTML to prevent HTML injection in popup content.
 */
function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Only allow HTTP and HTTPS URLs for report photos.
 */
function getSafePhotoUrl(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const url = value.trim();

  if (!/^https?:\/\//i.test(url)) {
    return "";
  }

  return escapeHtml(url);
}

/**
 * Validate GeoJSON Point coordinates.
 *
 * GeoJSON coordinate order:
 * [longitude, latitude]
 */
function isValidCoordinate(
  coordinates: unknown
): coordinates is [number, number] {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return false;
  }

  const [longitude, latitude] = coordinates;

  return (
    typeof longitude === "number" &&
    typeof latitude === "number" &&
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
}

/**
 * Get cluster circle radius based on point_count.
 */
function getClusterRadiusStops(): maplibregl.ExpressionSpecification {
  return [
    "step",
    ["get", "point_count"],
    17,
    10, 21,
    50, 26,
    100, 32,
  ];
}

/**
 * Get cluster color based on point_count.
 */
function getClusterColorStops(): maplibregl.ExpressionSpecification {
  return [
    "step",
    ["get", "point_count"],
    "#3B82F6",
    10, "#2563EB",
    50, "#D97706",
    100, "#DC2626",
  ];
}

// ============================================================
// MARKER IMAGE GENERATOR
// ============================================================

async function addStatusMarkerImages(
  mapInstance: maplibregl.Map
): Promise<void> {
  const entries: [string, string][] = [
    ...Object.entries(STATUS_MARKER_PATHS),
    [
      "default",
      `<circle cx="12" cy="12" r="3" fill="#fff"/>`,
    ],
  ];

  await Promise.all(
    entries.map(async ([status, iconPath]) => {
      const imageId = `status-marker-${status}`;

      if (mapInstance.hasImage(imageId)) {
        return;
      }

      const color = STATUS_COLORS[status] ?? "#6B7280";

      const svg = `
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="56"
          viewBox="0 0 48 56"
        >
          <path
            d="M24 54S5 32 5 21a19 19 0 1 1 38 0c0 11-19 33-19 33Z"
            fill="${color}"
            stroke="#FFFFFF"
            stroke-width="2.5"
          />

          <circle
            cx="24"
            cy="21"
            r="12"
            fill="none"
            stroke="#FFFFFF"
            stroke-opacity=".3"
            stroke-width="1"
          />

          <g transform="translate(12 9)">
            ${iconPath}
          </g>
        </svg>
      `;

      const image = new Image();

      image.decoding = "async";
      image.src =
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();

        image.onerror = () => {
          reject(
            new Error(`Gagal memuat ikon ${status}`)
          );
        };
      });

      if (!mapInstance.hasImage(imageId)) {
        mapInstance.addImage(imageId, image, {
          pixelRatio: 2,
        });
      }
    })
  );
}

// ============================================================
// COMPONENT
// ============================================================

export function PublicReportsMap({
  onMarkerClick,
  filters,
}: PublicReportsMapProps) {
  // ----------------------------------------------------------
  // REFS
  // ----------------------------------------------------------

  const mapContainer = useRef<HTMLDivElement>(null);

  const map = useRef<maplibregl.Map | null>(null);

  const popupRef = useRef<maplibregl.Popup | null>(null);

  const reportBoundsRef =
    useRef<maplibregl.LngLatBounds | null>(null);

  const layerHandlersRef =
    useRef<LayerEventHandler[]>([]);

  const onMarkerClickRef = useRef(onMarkerClick);

  // Keep latest callback without reloading map data.
  onMarkerClickRef.current = onMarkerClick;

  // ----------------------------------------------------------
  // STATES
  // ----------------------------------------------------------

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [reportCount, setReportCount] = useState(0);

  const [showLegend, setShowLegend] = useState(false);

  const [basemapMode, setBasemapMode] =
    useState<BasemapMode>("streets");

  // ==========================================================
  // POPUP HTML
  // ==========================================================

  const buildPopupHTML = useCallback(
    (properties: ReportProperties): string => {
      const status = String(properties.status ?? "");

      const statusColor =
        STATUS_COLORS[status] ?? "#6b7280";

      const statusBg =
        STATUS_BG_COLORS[status] ?? "#f3f4f6";

      const statusLabel =
        STATUS_LABELS[status] ?? status;

      const category =
        String(properties.category ?? "");

      const categoryLabel =
        CATEGORY_LABELS[category] ?? (category || "Lainnya");

      const photoUrl =
        getSafePhotoUrl(properties.photoUrl);

      const reportId = encodeURIComponent(
        String(properties.id ?? "")
      );

      const ticketNumber =
        escapeHtml(properties.ticketNumber);

      const title =
        escapeHtml(properties.title);

      const detailLocation =
        escapeHtml(properties.detailLocation);

      const photoSection = photoUrl
        ? `
          <div
            style="
              width:calc(100% + 24px);
              height:120px;
              overflow:hidden;
              border-radius:8px 8px 0 0;
              margin:-12px -12px 8px -12px;
            "
          >
            <img
              src="${photoUrl}"
              alt="Foto laporan"
              style="
                width:100%;
                height:120px;
                object-fit:cover;
                display:block;
              "
              loading="lazy"
              onerror="this.parentElement.style.display='none'"
            />
          </div>
        `
        : "";

      return `
        <div
          style="
            min-width:240px;
            max-width:280px;
            font-family:system-ui,-apple-system,sans-serif;
          "
        >
          ${photoSection}

          <div
            style="
              display:flex;
              flex-direction:column;
              gap:6px;
            "
          >
            <div
              style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:6px;
              "
            >
              <span
                style="
                  font-size:11px;
                  font-weight:600;
                  color:#556577;
                  font-family:monospace;
                "
              >
                ${ticketNumber}
              </span>

              <span
                style="
                  font-size:10px;
                  font-weight:600;
                  color:${statusColor};
                  background:${statusBg};
                  padding:2px 8px;
                  border-radius:12px;
                  white-space:nowrap;
                "
              >
                ${escapeHtml(statusLabel)}
              </span>
            </div>

            <h3
              style="
                font-size:14px;
                font-weight:700;
                color:#1F2D3D;
                margin:0;
                line-height:1.3;
              "
            >
              ${title}
            </h3>

            <div
              style="
                display:flex;
                flex-wrap:wrap;
                gap:6px;
                align-items:center;
              "
            >
              <span
                style="
                  font-size:10px;
                  font-weight:600;
                  color:#3B6EA5;
                  background:#E3EEF8;
                  padding:2px 8px;
                  border-radius:6px;
                "
              >
                ${escapeHtml(categoryLabel)}
              </span>
            </div>

            <div
              style="
                display:flex;
                align-items:flex-start;
                gap:4px;
                font-size:11px;
                color:#556577;
              "
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 256 256"
                fill="none"
                style="margin-top:1px;flex-shrink:0;"
              >
                <path
                  d="M128 16a88.1 88.1 0 0 0-88 88c0 75.3 80 132.2 83.4 134.3a8 8 0 0 0 9.2 0C136 236.2 216 179.3 216 104a88.1 88.1 0 0 0-88-88Zm0 56a32 32 0 1 1-32 32 32 32 0 0 1 32-32Z"
                  fill="#A8532E"
                />
              </svg>

              <span style="line-height:1.3;">
                ${detailLocation}
              </span>
            </div>

            <a
              href="/reports/${reportId}"
              style="
                display:block;
                text-align:center;
                margin-top:4px;
                padding:7px 12px;
                background:#3B6EA5;
                color:#fff;
                font-size:12px;
                font-weight:600;
                border-radius:8px;
                text-decoration:none;
              "
            >
              Lihat Detail Laporan →
            </a>
          </div>
        </div>
      `;
    },
    []
  );

  // ==========================================================
  // EVENT LISTENER CLEANUP
  // ==========================================================

  const removeLayerHandlers = useCallback(
    (mapInstance: maplibregl.Map) => {
      for (const item of layerHandlersRef.current) {
        mapInstance.off(
          item.event,
          item.layerId,
          item.handler
        );
      }

      layerHandlersRef.current = [];
    },
    []
  );

  // ==========================================================
  // REGISTER MAP EVENTS
  // ==========================================================

  const registerLayerHandlers = useCallback(
    (mapInstance: maplibregl.Map) => {
      // Remove previous listeners first.
      removeLayerHandlers(mapInstance);

      const clusterClick = async (e: maplibregl.MapLayerMouseEvent) => {
        if (!e.features?.length) {
          return;
        }

        const feature = e.features[0];

        const clusterId = feature.properties?.cluster_id;

        if (clusterId == null) {
          return;
        }

        const source = mapInstance.getSource("reports");

        if (!source || source.type !== "geojson") {
          return;
        }

        try {
          const zoom = await (
            source as maplibregl.GeoJSONSource
          ).getClusterExpansionZoom(clusterId);

          if (feature.geometry.type !== "Point") {
            return;
          }

          mapInstance.easeTo({
            center: feature.geometry.coordinates as [
              number,
              number
            ],
            zoom,
            duration: 500,
          });
        } catch (err) {
          console.error(
            "Failed to expand cluster:",
            err
          );
        }
      };

      const markerClick = (e: maplibregl.MapLayerMouseEvent) => {
        if (!e.features?.length) {
          return;
        }

        const feature = e.features[0];

        const properties =
          feature.properties as ReportProperties | undefined;

        if (!properties) {
          return;
        }

        popupRef.current?.remove();

        popupRef.current = new maplibregl.Popup({
          closeButton: true,
          closeOnClick: true,
          offset: 15,
          maxWidth: "300px",
          className: "noto-map-popup",
        })
          .setLngLat(e.lngLat)
          .setHTML(buildPopupHTML(properties))
          .addTo(mapInstance);

        const reportId = properties.id;

        if (
          typeof reportId === "string" &&
          reportId.length > 0
        ) {
          onMarkerClickRef.current?.(reportId);
        }
      };

      const clusterMouseEnter = () => {
        mapInstance.getCanvas().style.cursor = "pointer";
      };

      const clusterMouseLeave = () => {
        mapInstance.getCanvas().style.cursor = "";
      };

      const markerMouseEnter = () => {
        mapInstance.getCanvas().style.cursor = "pointer";
      };

      const markerMouseLeave = () => {
        mapInstance.getCanvas().style.cursor = "";
      };

      const handlers: LayerEventHandler[] = [
        {
          event: "click",
          layerId: "clusters",
          handler: clusterClick,
        },
        {
          event: "click",
          layerId: "unclustered-point-icon",
          handler: markerClick,
        },
        {
          event: "mouseenter",
          layerId: "clusters",
          handler: clusterMouseEnter,
        },
        {
          event: "mouseleave",
          layerId: "clusters",
          handler: clusterMouseLeave,
        },
        {
          event: "mouseenter",
          layerId: "unclustered-point-icon",
          handler: markerMouseEnter,
        },
        {
          event: "mouseleave",
          layerId: "unclustered-point-icon",
          handler: markerMouseLeave,
        },
      ];

      for (const item of handlers) {
        mapInstance.on(
          item.event,
          item.layerId,
          item.handler
        );
      }

      layerHandlersRef.current = handlers;
    },
    [
      buildPopupHTML,
      removeLayerHandlers,
    ]
  );

  // ==========================================================
  // INITIALIZE MAP
  // ==========================================================

  useEffect(() => {
    if (!mapContainer.current || map.current) {
      return;
    }

    try {
      const mapInstance = new maplibregl.Map({
        container: mapContainer.current,

        style: {
          version: 8,

          glyphs:
            "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",

          sources: {
            "osm-tiles": {
              type: "raster",

              tiles: [
                "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
              ],

              tileSize: 256,

              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },

            "satellite-tiles": {
              type: "raster",

              tiles: [
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              ],

              tileSize: 256,

              attribution:
                "Tiles &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community",
            },
          },

          layers: [
            {
              id: "osm-tiles",
              type: "raster",
              source: "osm-tiles",
              minzoom: 0,
              maxzoom: 19,
            },

            {
              id: "satellite-tiles",
              type: "raster",
              source: "satellite-tiles",
              minzoom: 0,
              maxzoom: 19,
              layout: {
                visibility: "none",
              },
            },
          ],
        },

        center: PATI_CENTER,
        zoom: 11,
        minZoom: 8,
        maxZoom: 18,
      });

      map.current = mapInstance;

      mapInstance.addControl(
        new maplibregl.NavigationControl(),
        "top-right"
      );

      mapInstance.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: false,
        }),
        "top-right"
      );

      mapInstance.on("load", () => {
        setIsLoading(false);
      });

      mapInstance.on("error", (e) => {
        console.error("Map error:", e);
      });
    } catch (err) {
      console.error(
        "Failed to initialize map:",
        err
      );

      setError("Gagal menginisialisasi peta");
      setIsLoading(false);
    }

    return () => {
      const mapInstance = map.current;

      if (mapInstance) {
        removeLayerHandlers(mapInstance);

        popupRef.current?.remove();
        popupRef.current = null;

        mapInstance.remove();
        map.current = null;
      }
    };
  }, [removeLayerHandlers]);

  // Switch only the basemap layer; report markers and clusters stay intact.
  useEffect(() => {
    const mapInstance = map.current;

    if (!mapInstance || !mapInstance.isStyleLoaded()) {
      return;
    }

    mapInstance.setLayoutProperty(
      "osm-tiles",
      "visibility",
      basemapMode === "streets" ? "visible" : "none"
    );
    mapInstance.setLayoutProperty(
      "satellite-tiles",
      "visibility",
      basemapMode === "satellite" ? "visible" : "none"
    );
  }, [basemapMode, isLoading]);

  // ==========================================================
  // LOAD REPORTS
  // ==========================================================

  useEffect(() => {
    if (!map.current || isLoading) {
      return;
    }

    const mapInstance = map.current;

    let cancelled = false;

    const controller = new AbortController();

    const loadReports = async () => {
      try {
        setError(null);

        // ----------------------------------------------------
        // Build query parameters
        // ----------------------------------------------------

        const params = new URLSearchParams();

        if (filters?.categories?.length) {
          params.set(
            "categories",
            filters.categories.join(",")
          );
        }

        if (filters?.statuses?.length) {
          params.set(
            "statuses",
            filters.statuses.join(",")
          );
        }

        if (filters?.kecamatan) {
          params.set("kecamatan", filters.kecamatan);
        }

        if (filters?.dateFrom) {
          params.set("dateFrom", filters.dateFrom);
        }

        if (filters?.dateTo) {
          params.set("dateTo", filters.dateTo);
        }

        // ----------------------------------------------------
        // Fetch GeoJSON
        // ----------------------------------------------------

        const response = await fetch(
          `/api/reports/map?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch reports: ${response.status}`
          );
        }

        const geojson: ReportFeatureCollection =
          await response.json();

        if (cancelled) {
          return;
        }

        // ----------------------------------------------------
        // Validate GeoJSON features
        // ----------------------------------------------------

        const validFeatures =
          geojson.features.filter((feature) => {
            return (
              feature.geometry?.type === "Point" &&
              isValidCoordinate(
                feature.geometry.coordinates
              )
            );
          });

        const invalidCount =
          geojson.features.length - validFeatures.length;

        if (invalidCount > 0) {
          console.warn(
            `${invalidCount} laporan memiliki koordinat tidak valid`
          );
        }

        const mapGeoJSON: ReportFeatureCollection = {
          ...geojson,
          features: validFeatures,
        };

        setReportCount(validFeatures.length);

        // ----------------------------------------------------
        // Calculate bounds
        // ----------------------------------------------------

        reportBoundsRef.current = null;

        if (validFeatures.length > 0) {
          const firstCoordinates =
            validFeatures[0].geometry.coordinates;

          const bounds = new maplibregl.LngLatBounds(
            firstCoordinates,
            firstCoordinates
          );

          for (const feature of validFeatures.slice(1)) {
            bounds.extend(
              feature.geometry.coordinates
            );
          }

          reportBoundsRef.current = bounds;

          // Only adjust map if it is not already showing
          // the same data request after cancellation.
          if (!cancelled) {
            mapInstance.fitBounds(bounds, {
              padding: 80,
              maxZoom: 14,
              duration: 500,
            });
          }
        }

        // ----------------------------------------------------
        // Clean up previous popup and listeners
        // ----------------------------------------------------

        popupRef.current?.remove();
        popupRef.current = null;

        removeLayerHandlers(mapInstance);

        // ----------------------------------------------------
        // Remove previous layers
        // ----------------------------------------------------

        const layersToRemove = [
          "clusters",
          "cluster-count",
          "unclustered-point-icon",
          "unclustered-point",
          "unclustered-point-stroke",
          "reports-layer",
        ];

        for (const layerId of layersToRemove) {
          if (mapInstance.getLayer(layerId)) {
            mapInstance.removeLayer(layerId);
          }
        }

        if (mapInstance.getSource("reports")) {
          mapInstance.removeSource("reports");
        }

        if (cancelled) {
          return;
        }

        // ----------------------------------------------------
        // Add status marker images
        // ----------------------------------------------------

        await addStatusMarkerImages(mapInstance);

        if (cancelled) {
          return;
        }

        // ----------------------------------------------------
        // Add GeoJSON source with clustering
        // ----------------------------------------------------

        mapInstance.addSource("reports", {
          type: "geojson",

          data: mapGeoJSON,

          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 48,
          clusterMinPoints: 2,
        });

        // ----------------------------------------------------
        // Layer 1: Cluster circles
        // ----------------------------------------------------

        mapInstance.addLayer({
          id: "clusters",

          type: "circle",

          source: "reports",

          filter: ["has", "point_count"],

          paint: {
            "circle-color": getClusterColorStops(),

            "circle-radius": getClusterRadiusStops(),

            "circle-stroke-width": 3,

            "circle-stroke-color": "#ffffff",

            "circle-opacity": 0.88,
          },
        });

        // ----------------------------------------------------
        // Layer 2: Cluster count labels
        // ----------------------------------------------------

        mapInstance.addLayer({
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
              10, 13,
              50, 14,
              100, 16,
            ],

            "text-allow-overlap": true,
          },

          paint: {
            "text-color": "#ffffff",
          },
        });

        // ----------------------------------------------------
        // Layer 3: Individual report pin markers
        // ----------------------------------------------------

        mapInstance.addLayer({
          id: "unclustered-point-icon",

          type: "symbol",

          source: "reports",

          filter: [
            "!",
            ["has", "point_count"],
          ],

          layout: {
            "icon-image": [
              "match",
              ["get", "status"],

              "diterima",
              "status-marker-diterima",

              "diverifikasi",
              "status-marker-diverifikasi",

              "diproses",
              "status-marker-diproses",

              "selesai",
              "status-marker-selesai",

              "ditolak",
              "status-marker-ditolak",

              "status-marker-default",
            ],

            "icon-size": [
              "interpolate",
              ["linear"],
              ["zoom"],

              8, 0.65,
              12, 0.85,
              16, 1,
            ],

            "icon-anchor": "bottom",

            "icon-allow-overlap": true,

            "icon-ignore-placement": true,
          },
        });

        // ----------------------------------------------------
        // Register interactions
        // ----------------------------------------------------

        registerLayerHandlers(mapInstance);
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load reports:",
          err
        );

        setError("Gagal memuat data laporan");
      }
    };

    loadReports();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    filters,
    isLoading,
    removeLayerHandlers,
    registerLayerHandlers,
  ]);

  // ==========================================================
  // RESET MAP VIEW
  // ==========================================================

  const resetView = useCallback(() => {
    const mapInstance = map.current;

    if (!mapInstance) {
      return;
    }

    const bounds = reportBoundsRef.current;

    if (!bounds) {
      mapInstance.flyTo({
        center: PATI_CENTER,
        zoom: 11,
        duration: 700,
      });

      return;
    }

    const southwest = bounds.getSouthWest();

    const northeast = bounds.getNorthEast();

    const isSinglePoint =
      Math.abs(
        northeast.lng - southwest.lng
      ) < 0.001 &&
      Math.abs(
        northeast.lat - southwest.lat
      ) < 0.001;

    if (isSinglePoint) {
      mapInstance.flyTo({
        center: bounds.getCenter(),
        zoom: 15,
        duration: 700,
      });

      return;
    }

    mapInstance.fitBounds(bounds, {
      padding: {
        top: 80,
        bottom: 100,
        left: 60,
        right: 60,
      },

      maxZoom: 14,
      duration: 700,
    });
  }, []);

  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50">
        <div className="p-6 text-center">
          <div className="mb-2 text-lg font-semibold text-red-600">
            Gagal Memuat Peta
          </div>

          <p className="text-sm text-gray-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="
              mt-4 rounded bg-blue-600
              px-4 py-2 text-sm font-medium
              text-white hover:bg-blue-700
            "
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN RENDER
  // ==========================================================

  return (
    <div className="relative h-full w-full">

      {/* Map container */}
      <div
        ref={mapContainer}
        className="h-full w-full"
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="
          absolute inset-0 z-10
          flex items-center justify-center
          bg-white/80
        ">
          <div className="text-center">
            <div className="
              mx-auto mb-3 h-12 w-12
              animate-spin rounded-full
              border-b-2 border-blue-600
            " />

            <p className="text-sm text-gray-600">
              Memuat peta...
            </p>
          </div>
        </div>
      )}

      {/* Report count badge */}
      {!isLoading && (
        <div className="
          absolute left-4 top-4 z-10
          rounded-lg bg-white
          px-4 py-2 shadow-md
        ">
          <div className="text-xs text-gray-600">
            Total Laporan
          </div>

          <div className="
            text-lg font-bold text-blue-600
          ">
            {reportCount}
          </div>
        </div>
      )}

      {/* Basemap switcher */}
      {!isLoading && (
        <div
          className="absolute right-3 top-3 z-20 flex overflow-hidden rounded-lg border border-gray-200 bg-white/95 p-1 shadow-md backdrop-blur-md"
          role="group"
          aria-label="Mode peta"
        >
          {([
            ["streets", "Peta"],
            ["satellite", "Satelit"],
          ] as const).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setBasemapMode(mode)}
              aria-pressed={basemapMode === mode}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                basemapMode === mode
                  ? "bg-gray-800 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Responsive map legend */}
      {!isLoading && reportCount > 0 && (
        <div className="
          absolute bottom-3 left-3 z-20
        ">
          <div className="
            overflow-hidden rounded-xl
            border border-gray-200
            bg-white/95 shadow-lg
            backdrop-blur-md
          ">

            <button
              type="button"
              onClick={() =>
                setShowLegend((prev) => !prev)
              }
              aria-expanded={showLegend}
              className="
                flex w-full items-center gap-2
                px-3 py-2.5 text-xs
                font-semibold text-gray-700
              "
            >
              <span className="
                h-2 w-2 rounded-full bg-blue-500
              " />

              Legenda Peta

              <svg
                className={`
                  h-3.5 w-3.5 transition-transform
                  ${showLegend ? "rotate-180" : ""}
                `}
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m5 7 5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {showLegend && (
              <div className="
                min-w-[155px] space-y-2
                border-t border-gray-100
                px-3 pb-3 pt-2
              ">

                {/* Cluster legend */}
                <p className="
                  text-[10px] font-semibold
                  uppercase tracking-wide
                  text-gray-400
                ">
                  Jumlah Laporan
                </p>

                {[
                  ["#3B82F6", "2–9 laporan"],
                  ["#2563EB", "10–49 laporan"],
                  ["#D97706", "50–99 laporan"],
                  ["#DC2626", "100+ laporan"],
                ].map(([color, label]) => (
                  <div
                    key={label}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="
                        h-3 w-3 shrink-0
                        rounded-full
                      "
                      style={{
                        backgroundColor: color,
                      }}
                    />

                    <span className="
                      text-[11px] text-gray-600
                    ">
                      {label}
                    </span>
                  </div>
                ))}

                {/* Status legend */}
                <div className="
                  border-t border-gray-100 pt-2
                ">
                  <p className="
                    mb-2 text-[10px]
                    font-semibold uppercase
                    tracking-wide text-gray-400
                  ">
                    Status Laporan
                  </p>

                  {Object.entries(STATUS_COLORS).map(
                    ([status, color]) => (
                      <div
                        key={status}
                        className="
                          mb-1.5 flex items-center gap-2
                        "
                      >
                        <span
                          className="
                            h-2.5 w-2.5 shrink-0
                            rounded-full
                          "
                          style={{
                            backgroundColor: color,
                          }}
                        />

                        <span className="
                          text-[11px] capitalize
                          text-gray-600
                        ">
                          {STATUS_LABELS[status] ?? status}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset view button */}
      <button
        type="button"
        onClick={resetView}
        aria-label="Reset tampilan peta"
        title="Kembali ke tampilan laporan"
        className="
          absolute bottom-24 right-3 z-10
          rounded-lg bg-white
          px-3 py-2 text-sm font-medium
          text-gray-700 shadow-md
          transition-colors hover:bg-gray-50
        "
      >
        🎯 Reset View
      </button>
    </div>
  );
}
