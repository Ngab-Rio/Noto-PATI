import { describe, it, expect, beforeEach } from "vitest";
import {
  getVisualEducationForCategory,
  VISUAL_EDUCATION_REGISTRY,
  trackCareEvent,
} from "./visual-education";
import { FALLBACK_CARE_ARTICLES } from "./mock-data";

describe("Visual Contextual Education Feature", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  describe("Kesesuaian seluruh kategori laporan", () => {
    const reportCategories = [
      "jalan",
      "drainase",
      "lampu",
      "trotoar",
      "jembatan",
      "tanggul",
      "rambu",
      "lainnya",
    ];

    it("harus memiliki data edukasi visual yang sesuai untuk setiap kategori", () => {
      for (const cat of reportCategories) {
        const data = getVisualEducationForCategory(cat);
        expect(data).not.toBeNull();
        expect(data?.category).toBe(cat);
      }
    });

    it("judul harus singkat dan tidak melebihi batas 6 kata", () => {
      for (const data of Object.values(VISUAL_EDUCATION_REGISTRY)) {
        const words = data.title.trim().split(/\s+/);
        expect(words.length).toBeLessThanOrEqual(6);
      }
    });

    it("ringkasan harus padat dan maksimal 2 kalimat", () => {
      for (const data of Object.values(VISUAL_EDUCATION_REGISTRY)) {
        // Kalimat dipisahkan oleh tanda titik
        const sentences = data.summary.split(/\.\s+/).filter(Boolean);
        expect(sentences.length).toBeLessThanOrEqual(2);
      }
    });

    it("tindakan aman (safeActions) maksimal 3 item dengan teks singkat (< 10 kata)", () => {
      for (const data of Object.values(VISUAL_EDUCATION_REGISTRY)) {
        expect(data.safeActions.length).toBeLessThanOrEqual(3);
        for (const action of data.safeActions) {
          const wordCount = action.text.trim().split(/\s+/).length;
          expect(wordCount).toBeLessThanOrEqual(10);
        }
      }
    });

    it("langkah pencegahan (prevention) maksimal 3 item dengan teks singkat (< 10 kata)", () => {
      for (const data of Object.values(VISUAL_EDUCATION_REGISTRY)) {
        expect(data.prevention.length).toBeLessThanOrEqual(3);
        for (const item of data.prevention) {
          const wordCount = item.text.trim().split(/\s+/).length;
          expect(wordCount).toBeLessThanOrEqual(10);
        }
      }
    });

    it("setiap kategori harus memiliki komponen ilustrasi SVG dan deskripsi alt bermakna", () => {
      for (const data of Object.values(VISUAL_EDUCATION_REGISTRY)) {
        expect(data.Illustration).toBeDefined();
        expect(data.illustrationAlt).toBeTruthy();
        expect(data.illustrationAlt.length).toBeGreaterThan(10);
      }
    });

    it("setiap kategori harus menautkan ke fullArticleSlug yang valid", () => {
      const articleSlugs = new Set(
        FALLBACK_CARE_ARTICLES.map((article) => article.slug)
      );

      for (const data of Object.values(VISUAL_EDUCATION_REGISTRY)) {
        expect(data.fullArticleSlug).toBeTruthy();
        expect(articleSlugs.has(data.fullArticleSlug)).toBe(true);
      }
    });
  });

  describe("Category Mapping & Fallback Resilience", () => {
    it("dapat menangani alias 'penerangan' dan memetakannya ke 'lampu'", () => {
      const data = getVisualEducationForCategory("penerangan");
      expect(data?.category).toBe("lampu");
    });

    it("menggunakan panduan umum untuk kategori fasilitas publik lainnya", () => {
      expect(getVisualEducationForCategory("tanggul")?.fullArticleSlug).toBe(
        "retakan-dan-rembesan-tanggul-sungai"
      );
      expect(getVisualEducationForCategory("rambu")?.fullArticleSlug).toBe(
        "rambu-dan-marka-jalan-rusak"
      );
      expect(getVisualEducationForCategory("lainnya")?.fullArticleSlug).toBe(
        "panduan-umum-fasilitas-publik"
      );
      expect(getVisualEducationForCategory("lainnya")?.categoryLabel).toBe(
        "Fasilitas Publik Lainnya"
      );
      expect(getVisualEducationForCategory("lainnya")?.title).not.toContain(
        "Vandalisme"
      );
    });

    it("mengarahkan laporan vandalisme yang masuk kategori lainnya ke panduan umum", () => {
      const reportCategory = "lainnya";
      const vandalismArticle = FALLBACK_CARE_ARTICLES.find(
        (article) => article.slug === "vandalisme-fasilitas-publik"
      );
      const education = getVisualEducationForCategory(reportCategory);

      expect(vandalismArticle?.category).toBe(reportCategory);
      expect(education?.fullArticleSlug).toBe("panduan-umum-fasilitas-publik");
    });

    it("dapat menangani kategori tak dikenal dengan fallback aman ke 'jalan' tanpa melempar error", () => {
      const data = getVisualEducationForCategory("kategori_acak_tidak_ada");
      expect(data?.category).toBe("jalan");
    });
  });

  describe("Event Telemetry Tracking", () => {
    it("mencatat event care tanpa melempar error", () => {
      expect(() => {
        trackCareEvent("card_viewed", "jalan", "report-123");
        trackCareEvent("click_learn_more", "jalan", "report-123");
        trackCareEvent("click_view_report", "jalan", "report-123");
      }).not.toThrow();

      if (typeof window !== "undefined") {
        const stored = JSON.parse(window.localStorage.getItem("notopati_care_events") || "[]");
        expect(stored.length).toBe(3);
        expect(stored[0].event).toBe("card_viewed");
        expect(stored[0].category).toBe("jalan");
      }
    });
  });
});
