import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

const SIGNED_URL_TTL_SECONDS = 60 * 10;
// Cache di bawah TTL supaya URL yang dikirim ke browser masih valid saat dipakai.
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHED_PATHS = 1000;

const cache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Signed URL per path, di-cache sebentar supaya URL-nya stabil: browser bisa
 * memakai ulang gambar dan Storage tidak menandatangani path yang sama terus-menerus.
 * shortcut: cache per proses server; hilang saat restart atau pindah instance.
 */
export async function getSignedPhotoUrls(
  paths: string[],
): Promise<Map<string, string>> {
  const now = Date.now();
  const signed = new Map<string, string>();
  const missing: string[] = [];

  for (const path of new Set(paths)) {
    const cached = cache.get(path);
    if (cached && cached.expiresAt > now) {
      signed.set(path, cached.url);
    } else {
      missing.push(path);
    }
  }

  if (missing.length === 0) {
    return signed;
  }

  const { data } = await createAdminClient()
    .storage.from("report-photos")
    .createSignedUrls(missing, SIGNED_URL_TTL_SECONDS);

  for (const item of data ?? []) {
    if (!item.signedUrl || !item.path) continue;
    signed.set(item.path, item.signedUrl);
    cache.set(item.path, { url: item.signedUrl, expiresAt: now + CACHE_TTL_MS });
  }

  if (cache.size > MAX_CACHED_PATHS) {
    for (const [path, entry] of cache) {
      if (entry.expiresAt <= now) cache.delete(path);
    }
  }

  return signed;
}
