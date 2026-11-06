import { describe, it, expect, beforeEach } from "vitest";
import {
  getVisualEducationForCategory,
  VISUAL_EDUCATION_REGISTRY,
  trackCareEvent,
} from "./visual-education";

describe("Visual Contextual Education Feature", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  describe("Kesesuaian Spesifikasi 5 Kategori Utama", () => {
    const mainCategories = ["jalan", "drainase", "lampu", "trotoar", "jembatan"];

    it("harus memiliki data edukasi visual untuk kelima kategori", () => {
      for (const cat of mainCategories) {
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
      for (const data of Object.values(VISUAL_EDUCATION_REGISTRY)) {
        expect(data.fullArticleSlug).toBeTruthy();
      }
    });
  });

  describe("Category Mapping & Fallback Resilience", () => {
    it("dapat menangani alias 'penerangan' dan memetakannya ke 'lampu'", () => {
      const data = getVisualEducationForCategory("penerangan");
      expect(data?.category).toBe("lampu");
    });

    it("dapat menangani kategori sekunder 'tanggul' dan memetakannya ke 'drainase'", () => {
      const data = getVisualEducationForCategory("tanggul");
      expect(data?.category).toBe("drainase");
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
