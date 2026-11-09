import type { Database } from "@/types/supabase";

export type ReportCategory = Database["public"]["Enums"]["report_category"];

export interface CareReference {
  title: string;
  source: string;
  url?: string;
}

export interface CareArticle {
  id: string;
  slug: string;
  category: ReportCategory;
  title: string;
  summary: string;
  content: string;
  causes: string[];
  impacts: string[];
  safetyActions: string[];
  preventionSteps: string[];
  references: CareReference[];
  reviewedAt: string;
  isPublished: boolean;
  readTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CareCategoryMeta {
  key: ReportCategory;
  label: string;
  dinas: string;
  description: string;
}

export const CARE_CATEGORIES: Record<ReportCategory, CareCategoryMeta> = {
  jalan: {
    key: "jalan",
    label: "Jalan & Aspal",
    dinas: "Bina Marga - DPUTR",
    description: "Edukasi kondisi perkerasan jalan, lubang aspal, dan keselamatan berkendara.",
  },
  drainase: {
    key: "drainase",
    label: "Drainase & Saluran Air",
    dinas: "Dinas SDA - DPUTR",
    description: "Panduan pencegahan genangan banjir, sedimentasi, dan kelancaran saluran air.",
  },
  lampu: {
    key: "lampu",
    label: "Penerangan Jalan (PJU)",
    dinas: "Dishub Kab. Pati",
    description: "Informasi keselamatan penerangan jalan umum dan mitigasi bahaya arus listrik.",
  },
  trotoar: {
    key: "trotoar",
    label: "Trotoar & Pedestrian",
    dinas: "Bina Marga - DPUTR",
    description: "Edukasi hak pejalan kaki, aksesibilitas difabel, dan fasilitas ubin pemandu.",
  },
  jembatan: {
    key: "jembatan",
    label: "Jembatan & Penyeberangan",
    dinas: "Bina Marga - DPUTR",
    description: "Mengenali integritas struktur jembatan sungai, gerusan air, dan batas muatan.",
  },
  tanggul: {
    key: "tanggul",
    label: "Tanggul & Pengendali Banjir",
    dinas: "Dinas SDA - DPUTR",
    description: "Kenali retakan, rembesan, dan erosi pada tanggul serta langkah aman warga.",
  },
  rambu: {
    key: "rambu",
    label: "Rambu & Marka Jalan",
    dinas: "Dishub Kab. Pati",
    description: "Panduan menghadapi rambu hilang, rusak, tertutup, atau marka yang memudar.",
  },
  lainnya: {
    key: "lainnya",
    label: "Fasilitas Publik Lainnya",
    dinas: "Dinas terkait",
    description: "Panduan umum mengenali dan melaporkan kerusakan fasilitas publik dengan aman.",
  },
};
