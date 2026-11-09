"use client";

/**
 * Public Reports Map Component
 *
 * Interactive map powered by MapLibre GL JS displaying public damage reports.
 * Features:
 * - Native WebGL clustering & crisp status-coded point markers
 * - Street (OSM) and Satellite basemap toggles
 * - Popup card with photo, status, category, and report detail link
 * - Viewport stays fitted to the full Kabupaten Pati boundary
 */

import { useCallback, useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { ReportFeatureCollection } from "@/types/map";
import { DEFAULT_MAP_STATUSES } from "@/lib/reports/map-statuses";
import { MAP_CONFIG, MAP_INITIAL_STYLE } from "./map-constants";
import type {
  BasemapMode,
  LayerEventHandler,
  PublicReportsMapProps,
  ReportProperties,
} from "./map-types";
import { isValidCoordinate } from "./map-utils";
import { buildPopupHTML } from "./map-popup";
import {
  applyMapMode,
  addBoundaryLayers,
  addReportLayers,
  removeReportLayers,
  setupMapInteractions,
  teardownMapInteractions,
} from "./map-layers";
import type { MapMode } from "./map-density";
import { MapLegend } from "./components/MapLegend";
import { MapBasemapControl } from "./components/MapBasemapControl";
import { MapModeControl } from "./components/MapModeControl";
import { MapReportBadge } from "./components/MapReportBadge";
import { MapResetButton } from "./components/MapResetButton";

export function PublicReportsMap({
  onMarkerClick,
  filters,
  adminMode = false,
}: PublicReportsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const layerHandlersRef = useRef<LayerEventHandler[]>([]);
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportCount, setReportCount] = useState(0);
  const [basemapMode, setBasemapMode] = useState<BasemapMode>("streets");
  const [mapMode, setMapMode] = useState<MapMode>("heatmap");
  const mapModeRef = useRef(mapMode);
  mapModeRef.current = mapMode;

  const legendStatuses =
    filters?.statuses && filters.statuses.length > 0
      ? filters.statuses
      : DEFAULT_MAP_STATUSES;

  // ---------------------------------------------------------------------------
  // 1. Initialize MapLibre GL instance
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    let handleStyleLoad: (() => void) | null = null;

    try {
      const mapInstance = new maplibregl.Map({
        container: mapContainer.current,
        style: MAP_INITIAL_STYLE,
        center: MAP_CONFIG.defaultCenter,
        zoom: MAP_CONFIG.defaultZoom,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
        maxBounds: MAP_CONFIG.maxBounds,
        cooperativeGestures: true,
      });

      map.current = mapInstance;

      handleStyleLoad = () => {
        addBoundaryLayers(mapInstance);
      };

      mapInstance.on("style.load", handleStyleLoad);

      mapInstance.addControl(new maplibregl.NavigationControl(), "top-right");
      mapInstance.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: false,
        }),
        "top-right"
      );

      mapInstance.on("load", () => {
        addBoundaryLayers(mapInstance);
        mapInstance.fitBounds(MAP_CONFIG.maxBounds, {
          padding: 24,
          duration: 0,
        });
        setIsLoading(false);
      });

      mapInstance.on("error", (e) => {
        console.error("MapLibre error:", e);
      });
    } catch (err) {
      console.error("Failed to initialize map:", err);
      setError("Gagal menginisialisasi peta.");
      setIsLoading(false);
    }

    return () => {
      const mapInstance = map.current;
      if (mapInstance) {
        if (handleStyleLoad) {
          mapInstance.off("style.load", handleStyleLoad);
        }
        teardownMapInteractions(mapInstance, layerHandlersRef.current);
        popupRef.current?.remove();
        popupRef.current = null;
        mapInstance.remove();
        map.current = null;
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 2. Switch Basemap Mode (Streets vs Satellite)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;

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

  // ---------------------------------------------------------------------------
  // 2b. Switch Map Mode (Heatmap vs Cluster)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance || isLoading) return;
    applyMapMode(mapInstance, mapMode);
  }, [mapMode, isLoading]);

  // ---------------------------------------------------------------------------
  // 3. Fetch and Render Reports on Map
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!map.current || isLoading) return;

    const mapInstance = map.current;
    let cancelled = false;
    const controller = new AbortController();

    const loadReports = async () => {
      try {
        setError(null);

        const params = new URLSearchParams();
        if (filters?.categories?.length) {
          params.set("categories", filters.categories.join(","));
        }
        if (filters?.statuses?.length) {
          params.set("statuses", filters.statuses.join(","));
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

        const mapEndpoint = adminMode ? "/api/admin/reports/map" : "/api/reports/map";
        const res = await fetch(`${mapEndpoint}?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Gagal mengambil data laporan (${res.status})`);
        }

        const geojson: ReportFeatureCollection = await res.json();
        if (cancelled) return;

        // Filter valid point coordinates
        const validFeatures = geojson.features.filter((f) => {
          return (
            f.geometry?.type === "Point" &&
            isValidCoordinate(f.geometry.coordinates)
          );
        });

        const mapGeoJSON: ReportFeatureCollection = {
          ...geojson,
          features: validFeatures,
        };

        setReportCount(validFeatures.length);

        // Clean up previous layers & listeners
        popupRef.current?.remove();
        popupRef.current = null;
        teardownMapInteractions(mapInstance, layerHandlersRef.current);
        removeReportLayers(mapInstance);

        if (cancelled) return;

        // Add native WebGL layers
        addBoundaryLayers(mapInstance);
        addReportLayers(mapInstance, mapGeoJSON, mapModeRef.current);

        // Bind interactive events
        layerHandlersRef.current = setupMapInteractions({
          map: mapInstance,
          onHeatmapClick: (e) => {
            const targetZoom = Math.min(mapInstance.getZoom() + 2, 15);
            mapInstance.easeTo({
              center: e.lngLat,
              zoom: targetZoom,
              duration: 500,
            });
          },
          onClusterClick: async (e) => {
            if (!e.features?.length) return;
            const feature = e.features[0];
            const clusterId = feature.properties?.cluster_id;
            if (clusterId == null) return;

            const source = mapInstance.getSource("reports") as
              | maplibregl.GeoJSONSource
              | undefined;
            if (!source || typeof source.getClusterExpansionZoom !== "function")
              return;

            try {
              const zoom = await source.getClusterExpansionZoom(clusterId);
              if (feature.geometry.type !== "Point") return;
              mapInstance.easeTo({
                center: feature.geometry.coordinates as [number, number],
                zoom: Math.min(zoom + 0.5, 17),
                duration: 500,
              });
            } catch (zoomErr) {
              console.error("Cluster expansion error:", zoomErr);
            }
          },
          onMarkerClick: (e) => {
            if (!e.features?.length) return;
            const feature = e.features[0];
            const properties = feature.properties as ReportProperties | undefined;
            if (!properties) return;

            popupRef.current?.remove();
            popupRef.current = new maplibregl.Popup({
              closeButton: true,
              closeOnClick: true,
              offset: 14,
              maxWidth: "300px",
              className: "noto-map-popup",
            })
              .setLngLat(e.lngLat)
              .setHTML(buildPopupHTML(properties, { adminMode }))
              .addTo(mapInstance);

            if (properties.id) {
              onMarkerClickRef.current?.(properties.id);
            }
          },
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (cancelled) return;
        console.error("Failed to load map reports:", err);
        setError("Gagal memuat data laporan pada peta.");
      }
    };

    loadReports();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [adminMode, filters, isLoading]);

  // ---------------------------------------------------------------------------
  // 4. Reset View Callback
  // ---------------------------------------------------------------------------
  const handleResetView = useCallback(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    mapInstance.fitBounds(MAP_CONFIG.maxBounds, {
      padding: 24,
      duration: 700,
    });
  }, []);

  // ---------------------------------------------------------------------------
  // 5. Error View
  // ---------------------------------------------------------------------------
  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="mb-2 text-lg font-bold text-red-600">
          Gagal Memuat Peta
        </div>
        <p className="max-w-md text-sm text-gray-600 mb-4">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
        >
          Muat Ulang Halaman
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 6. Main View
  // ---------------------------------------------------------------------------
  return (
    <div className="relative h-full w-full overflow-hidden bg-gray-100">
      <div
        ref={mapContainer}
        data-testid="public-reports-map"
        className="h-full w-full"
      />

      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-xs">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
            <p className="text-sm font-medium text-gray-700">Memuat peta laporan...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          <MapReportBadge count={reportCount} />
          <MapModeControl currentMode={mapMode} onChange={setMapMode} />
          <MapBasemapControl
            currentMode={basemapMode}
            onChange={setBasemapMode}
          />
          <MapLegend
            reportCount={reportCount}
            mode={mapMode}
            statuses={legendStatuses}
          />
          <MapResetButton onReset={handleResetView} />
        </>
      )}
    </div>
  );
}
export default PublicReportsMap;
