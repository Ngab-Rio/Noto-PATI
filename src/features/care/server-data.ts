import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { CareArticle, CareReference, ReportCategory } from "./types";
import { FALLBACK_CARE_ARTICLES } from "./mock-data";

interface CareArticleRow {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  causes: string[] | null;
  impacts: string[] | null;
  safety_actions: string[] | null;
  prevention_steps: string[] | null;
  references: unknown;
  reviewed_at: string;
  is_published: boolean;
  read_time_minutes: number;
  created_at: string;
  updated_at: string;
}

function parseReferences(raw: unknown): CareReference[] {
  if (!Array.isArray(raw)) return [];
  const results: CareReference[] = [];
  for (const item of raw) {
    if (typeof item === "object" && item !== null && "title" in item && "source" in item) {
      results.push({
        title: String((item as { title: unknown }).title),
        source: String((item as { source: unknown }).source),
        url: "url" in item && (item as { url?: unknown }).url ? String((item as { url?: unknown }).url) : undefined,
      });
    }
  }
  return results;
}

function rowToCareArticle(row: CareArticleRow): CareArticle {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category as ReportCategory,
    title: row.title,
    summary: row.summary,
    content: row.content,
    causes: Array.isArray(row.causes) ? row.causes : [],
    impacts: Array.isArray(row.impacts) ? row.impacts : [],
    safetyActions: Array.isArray(row.safety_actions) ? row.safety_actions : [],
    preventionSteps: Array.isArray(row.prevention_steps) ? row.prevention_steps : [],
    references: parseReferences(row.references),
    reviewedAt: row.reviewed_at,
    isPublished: row.is_published,
    readTimeMinutes: row.read_time_minutes ?? 3,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Mengambil seluruh artikel edukasi yang dipublikasikan,
 * dengan filter opsional berdasarkan kategori.
 */
export async function getCareArticles(category?: string): Promise<CareArticle[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("care_articles")
      .select("*")
      .eq("is_published", true)
      .order("reviewed_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      if (error) {
        console.warn("Care articles query fallback due to:", error.message);
      }
      return category && category !== "all"
        ? FALLBACK_CARE_ARTICLES.filter((a) => a.category === category)
        : FALLBACK_CARE_ARTICLES;
    }

    return (data as unknown as CareArticleRow[]).map(rowToCareArticle);
  } catch (error) {
    console.warn("Failed to fetch care articles from DB, using fallback:", error);
    return category && category !== "all"
      ? FALLBACK_CARE_ARTICLES.filter((a) => a.category === category)
      : FALLBACK_CARE_ARTICLES;
  }
}

/**
 * Mengambil satu artikel edukasi berdasarkan slug unik.
 */
export async function getCareArticleBySlug(slug: string): Promise<CareArticle | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("care_articles")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data) {
      const fallback = FALLBACK_CARE_ARTICLES.find((a) => a.slug === slug);
      return fallback ?? null;
    }

    return rowToCareArticle(data as unknown as CareArticleRow);
  } catch (error) {
    console.warn(`Failed to fetch care article by slug ${slug}:`, error);
    const fallback = FALLBACK_CARE_ARTICLES.find((a) => a.slug === slug);
    return fallback ?? null;
  }
}

/**
 * Mengambil artikel edukasi yang relevan untuk kategori laporan tertentu.
 * Digunakan untuk rekomendasi kontekstual setelah lapor atau di detail laporan.
 */
export async function getCareRecommendationsForCategory(
  category: string,
  limit = 2
): Promise<CareArticle[]> {
  try {
    const articles = await getCareArticles(category);
    if (articles.length >= limit) {
      return articles.slice(0, limit);
    }

    // Jika artikel pada kategori tersebut kurang, ambil artikel lain untuk melengkapi
    const otherArticles = await getCareArticles();
    const combined = [...articles];
    for (const item of otherArticles) {
      if (!combined.some((c) => c.id === item.id)) {
        combined.push(item);
      }
      if (combined.length >= limit) break;
    }
    return combined.slice(0, limit);
  } catch {
    return FALLBACK_CARE_ARTICLES.filter((a) => a.category === category).slice(0, limit);
  }
}
