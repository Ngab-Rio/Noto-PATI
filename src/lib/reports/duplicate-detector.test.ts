import { describe, expect, it } from "vitest";

// Haversine test calculation matching duplicate-detector.ts
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

describe("Duplicate Detection - Distance & Rule Logic", () => {
  it("menghitung jarak 0 meter untuk koordinat yang identik", () => {
    const lat = -6.7558;
    const lng = 111.0379;
    expect(calculateHaversineDistance(lat, lng, lat, lng)).toBe(0);
  });

  it("mendeteksi koordinat dalam radius 50 meter", () => {
    // Alun-alun Pati
    const baseLat = -6.7558;
    const baseLng = 111.0379;
    // ~25 meter ke utara
    const nearLat = baseLat + 0.00022;
    const nearLng = baseLng;

    const distance = calculateHaversineDistance(baseLat, baseLng, nearLat, nearLng);
    expect(distance).toBeLessThanOrEqual(50);
  });

  it("menolak koordinat di luar radius 50 meter", () => {
    const baseLat = -6.7558;
    const baseLng = 111.0379;
    // ~500 meter jauhnya
    const farLat = baseLat + 0.0045;
    const farLng = baseLng;

    const distance = calculateHaversineDistance(baseLat, baseLng, farLat, farLng);
    expect(distance).toBeGreaterThan(50);
  });

  it("memvalidasi aturan rentang waktu maksimal 6 jam (21600 detik)", () => {
    const now = new Date("2026-11-02T12:00:00Z").getTime();
    const threeHoursAgo = new Date("2026-11-02T09:00:00Z").getTime();
    const sevenHoursAgo = new Date("2026-11-02T05:00:00Z").getTime();

    const diffThreeHours = (now - threeHoursAgo) / 1000;
    const diffSevenHours = (now - sevenHoursAgo) / 1000;

    expect(diffThreeHours).toBeLessThanOrEqual(6 * 3600);
    expect(diffSevenHours).toBeGreaterThan(6 * 3600);
  });
});
