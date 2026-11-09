import type { StyleSpecification } from "maplibre-gl";
import { PATI_CENTER } from "@/types/map";
import { THEME_COLORS } from "@/config/theme";
import { PATI_MAP_BOUNDS } from "@/lib/geo/pati-boundary";

export const CATEGORY_LABELS: Record<string, string> = {
  jalan: "Jalan Berlubang / Rusak",
  lampu: "PJU (Penerangan)",
  drainase: "Saluran Air / Drainase",
  jembatan: "Jembatan Rusak",
  tanggul: "Tanggul / Penahan Banjir",
  trotoar: "Trotoar Rusak",
  rambu: "Rambu / Marka Jalan",
  lainnya: "Fasilitas Lainnya",
};

export const STATUS_COLORS: Record<string, string> = {
  diterima: "#2563EB",
  diverifikasi: "#7C3AED",
  diproses: "#D97706",
  selesai: "#16A34A",
  ditolak: "#DC2626",
  digabung: "#594B86",
};

export const STATUS_BG_COLORS: Record<string, string> = {
  diterima: "#EFF6FF",
  diverifikasi: "#F5F3FF",
  diproses: "#FFFBEB",
  selesai: "#F0FDF4",
  ditolak: "#FEF2F2",
  digabung: "#E9E5F3",
};

export const STATUS_LABELS: Record<string, string> = {
  diterima: "Diterima",
  diverifikasi: "Diverifikasi",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
  digabung: "Digabung",
};

export const MAP_INITIAL_STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    "satellite-tiles": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 19,
      attribution:
        "Tiles &copy; Esri, Maxar, Earthstar Geographics, and GIS User Community",
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
};

export const MAP_CONFIG = {
  defaultCenter: PATI_CENTER,
  defaultZoom: 11,
  minZoom: 10,
  maxZoom: 18.5,
  maxBounds: PATI_MAP_BOUNDS,
  maskColor: THEME_COLORS.neutral.background.hex,
  maskOpacity: 0.9,
};
