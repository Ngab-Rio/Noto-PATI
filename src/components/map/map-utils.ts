import maplibregl from "maplibre-gl";

/**
 * Escapes characters for safe HTML injection inside MapLibre popups.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Sanitizes photo URLs, only allowing http/https schemes.
 */
export function getSafePhotoUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const url = value.trim();
  if (!/^https?:\/\//i.test(url)) return "";
  return escapeHtml(url);
}

/**
 * Validates GeoJSON [longitude, latitude] coordinates.
 */
export function isValidCoordinate(
  coordinates: unknown
): coordinates is [number, number] {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return false;
  }
  const [lng, lat] = coordinates;
  return (
    typeof lng === "number" &&
    typeof lat === "number" &&
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

/**
 * Computes LngLatBounds from an array of [longitude, latitude] coordinates.
 */
export function calculateBounds(
  coords: [number, number][]
): maplibregl.LngLatBounds | null {
  if (coords.length === 0) return null;
  const bounds = new maplibregl.LngLatBounds(coords[0], coords[0]);
  for (let i = 1; i < coords.length; i++) {
    bounds.extend(coords[i]);
  }
  return bounds;
}
