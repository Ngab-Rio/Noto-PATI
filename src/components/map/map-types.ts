import type { MapFilters } from "@/types/map";

export type BasemapMode = "streets" | "satellite";

export interface PublicReportsMapProps {
  onMarkerClick?: (reportId: string) => void;
  filters?: MapFilters;
  adminMode?: boolean;
}

export interface ReportProperties {
  id?: string;
  ticketNumber?: string;
  title?: string;
  category?: string;
  status?: string;
  detailLocation?: string;
  createdAt?: string;
  photoUrl?: string;
  point_count?: number;
  cluster?: boolean;
  cluster_id?: number;
}

export type LayerEventHandler = {
  event: "click" | "mouseenter" | "mouseleave";
  layerId: string;
  handler: (event: maplibregl.MapLayerMouseEvent) => void;
};
