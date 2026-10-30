"use client";

/**
 * Public Reports Map Component
 * Displays reports on an interactive map using MapLibre GL JS
 */

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { ReportFeatureCollection } from "@/types/map";
import { PATI_CENTER } from "@/types/map";

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

export function PublicReportsMap({
  onMarkerClick,
  filters,
}: PublicReportsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportCount, setReportCount] = useState(0);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
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
          },
          layers: [
            {
              id: "osm-tiles",
              type: "raster",
              source: "osm-tiles",
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: PATI_CENTER,
        zoom: 11,
        minZoom: 8,
        maxZoom: 18,
      });

      // Add navigation controls (zoom buttons)
      map.current.addControl(new maplibregl.NavigationControl(), "top-right");

      // Add geolocate control
      map.current.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: false,
        }),
        "top-right"
      );

      map.current.on("load", () => {
        setIsLoading(false);
      });

      map.current.on("error", (e) => {
        console.error("Map error:", e);
        setError("Gagal memuat peta");
      });
    } catch (err) {
      console.error("Failed to initialize map:", err);
      setError("Gagal menginisialisasi peta");
      setIsLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Load and display report markers
  useEffect(() => {
    if (!map.current || isLoading) return;

    const loadReports = async () => {
      try {
        // Build query params
        const params = new URLSearchParams();
        if (filters?.categories && filters.categories.length > 0) {
          params.append("categories", filters.categories.join(","));
        }
        if (filters?.statuses && filters.statuses.length > 0) {
          params.append("statuses", filters.statuses.join(","));
        }
        if (filters?.kecamatan) {
          params.append("kecamatan", filters.kecamatan);
        }
        if (filters?.dateFrom) {
          params.append("dateFrom", filters.dateFrom);
        }
        if (filters?.dateTo) {
          params.append("dateTo", filters.dateTo);
        }

        const response = await fetch(`/api/reports/map?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }

        const geojson: ReportFeatureCollection = await response.json();
        setReportCount(geojson.features.length);

        if (!map.current) return;

        // Remove existing source and layers
        if (map.current.getLayer("reports-layer")) {
          map.current.removeLayer("reports-layer");
        }
        if (map.current.getSource("reports")) {
          map.current.removeSource("reports");
        }

        // Add source
        map.current.addSource("reports", {
          type: "geojson",
          data: geojson,
        });

        // Add circle layer for markers
        map.current.addLayer({
          id: "reports-layer",
          type: "circle",
          source: "reports",
          paint: {
            "circle-radius": 8,
            "circle-color": [
              "match",
              ["get", "status"],
              "diterima",
              "#3b82f6", // blue
              "diverifikasi",
              "#8b5cf6", // purple
              "diproses",
              "#f59e0b", // amber
              "selesai",
              "#10b981", // green
              "ditolak",
              "#ef4444", // red
              "#6b7280", // gray (default)
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 0.8,
          },
        });

        // Add hover effect
        map.current.on("mouseenter", "reports-layer", () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = "pointer";
          }
        });

        map.current.on("mouseleave", "reports-layer", () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = "";
          }
        });

        // Add click handler
        map.current.on("click", "reports-layer", (e) => {
          if (!e.features || e.features.length === 0) return;

          const feature = e.features[0];
          const properties = feature.properties;

          if (!properties) return;

          // Create popup
          new maplibregl.Popup({
            closeButton: true,
            closeOnClick: true,
            offset: 15,
          })
            .setLngLat(e.lngLat)
            .setHTML(
              `
              <div class="p-3 min-w-[200px]">
                <div class="text-xs font-semibold text-gray-500 mb-1">
                  ${properties.ticketNumber}
                </div>
                <h3 class="font-semibold text-sm mb-2 text-gray-900">
                  ${properties.title}
                </h3>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-600">${properties.category}</span>
                  <span class="px-2 py-0.5 rounded text-white bg-blue-600">
                    ${properties.status}
                  </span>
                </div>
                <button 
                  class="mt-3 w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                  onclick="window.location.href='/reports/${properties.id}'"
                >
                  Lihat Detail
                </button>
              </div>
            `
            )
            .addTo(map.current!);

          if (onMarkerClick) {
            onMarkerClick(properties.id);
          }
        });
      } catch (err) {
        console.error("Failed to load reports:", err);
        setError("Gagal memuat data laporan");
      }
    };

    loadReports();
  }, [filters, isLoading, onMarkerClick]);

  // Reset to Pati center
  const resetView = () => {
    if (map.current) {
      map.current.flyTo({
        center: PATI_CENTER,
        zoom: 11,
        duration: 1000,
      });
    }
  };

  if (error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Gagal Memuat Peta
          </div>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <div ref={mapContainer} className="h-full w-full" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Memuat peta...</p>
          </div>
        </div>
      )}

      {/* Report Count Badge */}
      {!isLoading && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-4 py-2 z-10">
          <div className="text-xs text-gray-600">Total Laporan</div>
          <div className="text-lg font-bold text-blue-600">{reportCount}</div>
        </div>
      )}

      {/* Reset View Button */}
      <button
        onClick={resetView}
        className="absolute bottom-24 right-4 bg-white rounded-lg shadow-md px-3 py-2 text-sm font-medium hover:bg-gray-50 z-10"
        title="Kembali ke Kabupaten Pati"
      >
        🎯 Reset View
      </button>
    </div>
  );
}
