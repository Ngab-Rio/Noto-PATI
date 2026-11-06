import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only and Supabase server client
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import {
  getCareArticles,
  getCareArticleBySlug,
  getCareRecommendationsForCategory,
} from "./server-data";
import { FALLBACK_CARE_ARTICLES } from "./mock-data";
import { CARE_CATEGORIES } from "./types";
import { createClient } from "@/lib/supabase/server";

describe("Noto PATI Care Feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    } as unknown as Awaited<ReturnType<typeof createClient>>);
  });

  describe("Metadata & Categories", () => {
    it("harus mencakup lima kategori utama infrastruktur", () => {
      expect(CARE_CATEGORIES).toHaveProperty("jalan");
      expect(CARE_CATEGORIES).toHaveProperty("drainase");
      expect(CARE_CATEGORIES).toHaveProperty("lampu");
      expect(CARE_CATEGORIES).toHaveProperty("trotoar");
      expect(CARE_CATEGORIES).toHaveProperty("jembatan");
    });

    it("setiap kategori harus memiliki label dan dinas pengampu yang jelas", () => {
      for (const [key, meta] of Object.entries(CARE_CATEGORIES)) {
        expect(meta.key).toBe(key);
        expect(meta.label).toBeTruthy();
        expect(meta.dinas).toBeTruthy();
        expect(meta.description).toBeTruthy();
      }
    });
  });

  describe("Fallback Data Integrity", () => {
    it("minimal menyediakan satu materi kurasi untuk masing-masing dari 5 kategori utama", () => {
      const categoriesInMock = new Set(FALLBACK_CARE_ARTICLES.map((a) => a.category));
      expect(categoriesInMock.has("jalan")).toBe(true);
      expect(categoriesInMock.has("drainase")).toBe(true);
      expect(categoriesInMock.has("lampu")).toBe(true);
      expect(categoriesInMock.has("trotoar")).toBe(true);
      expect(categoriesInMock.has("jembatan")).toBe(true);
    });

    it("setiap artikel harus memuat seluruh field edukasi yang disyaratkan", () => {
      for (const article of FALLBACK_CARE_ARTICLES) {
        expect(article.id).toBeTruthy();
        expect(article.slug).toBeTruthy();
        expect(article.title).toBeTruthy();
        expect(article.summary).toBeTruthy();
        expect(article.content).toBeTruthy();
        expect(article.causes.length).toBeGreaterThan(0);
        expect(article.impacts.length).toBeGreaterThan(0);
        expect(article.safetyActions.length).toBeGreaterThan(0);
        expect(article.preventionSteps.length).toBeGreaterThan(0);
        expect(article.references.length).toBeGreaterThan(0);
        expect(article.reviewedAt).toBeTruthy();
        expect(article.isPublished).toBe(true);
        expect(article.readTimeMinutes).toBeGreaterThan(0);
      }
    });

    it("tindakan aman (safetyActions) harus mengutamakan keselamatan dan tidak menganjurkan perbaikan berbahaya", () => {
      for (const article of FALLBACK_CARE_ARTICLES) {
        const joinedActions = article.safetyActions.join(" ").toLowerCase();
        // Memastikan ada peringatan untuk tidak mencoba hal berisiko
        expect(
          joinedActions.includes("jangan") ||
            joinedActions.includes("dilarang") ||
            joinedActions.includes("hindari") ||
            joinedActions.includes("kurangi")
        ).toBe(true);
      }
    });
  });

  describe("getCareArticles", () => {
    it("mengembalikan data fallback dengan aman saat query database bermasalah", async () => {
      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Database connection failed" },
              }),
            }),
          }),
        }),
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      const articles = await getCareArticles();
      expect(articles.length).toBe(FALLBACK_CARE_ARTICLES.length);
      expect(articles[0].slug).toBe(FALLBACK_CARE_ARTICLES[0].slug);
    });

    it("dapat memfilter artikel berdasarkan kategori tertentu", async () => {
      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      const articles = await getCareArticles("jalan");
      expect(articles.every((a) => a.category === "jalan")).toBe(true);
      expect(articles.length).toBeGreaterThan(0);
    });
  });

  describe("getCareArticleBySlug", () => {
    it("mengembalikan artikel jika slug ditemukan", async () => {
      const article = await getCareArticleBySlug("jalan-berlubang-dan-amblas");
      expect(article).not.toBeNull();
      expect(article?.slug).toBe("jalan-berlubang-dan-amblas");
      expect(article?.category).toBe("jalan");
    });

    it("mengembalikan null jika slug tidak ditemukan", async () => {
      const article = await getCareArticleBySlug("slug-yang-tidak-ada-sama-sekali");
      expect(article).toBeNull();
    });
  });

  describe("getCareRecommendationsForCategory", () => {
    it("mengembalikan artikel rekomendasi yang sesuai dengan kategori", async () => {
      const recommendations = await getCareRecommendationsForCategory("drainase", 1);
      expect(recommendations.length).toBe(1);
      expect(recommendations[0].category).toBe("drainase");
    });

    it("tidak melempar error jika kategori yang diminta belum memiliki artikel spesifik", async () => {
      const recommendations = await getCareRecommendationsForCategory("rambu", 2);
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });
});
