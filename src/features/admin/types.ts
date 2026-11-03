import type { ReportStatusKey } from "@/config/theme";

export interface AdminReportItem {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  categoryKey: "road_damage" | "drainage" | "street_lighting" | "sidewalk" | "other_infrastructure";
  status: ReportStatusKey;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  reporterName: string;
  reporterPhone?: string;
  supportCount: number;
  submittedAt: string;
  submittedAtRaw: string;
  dueDateLabel?: string;
  dueDateRaw?: string;
  isOverdue?: boolean;
  images: string[];
  assignedDinas?: string;
  priority: "tinggi" | "sedang" | "rendah";
  timeline: {
    id: string;
    status: ReportStatusKey;
    actor: string;
    role: "warga" | "admin" | "sistem";
    note?: string;
    timestamp: string;
    proofImage?: string;
  }[];
  duplicateCandidates?: {
    id: string;
    ticketNumber: string;
    title: string;
    distanceMeters: number;
    similarityScore: number;
  }[];
}
