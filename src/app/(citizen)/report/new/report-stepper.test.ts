import { describe, expect, it } from "vitest";

import {
  firstInvalidStep,
  isWithinPati,
  MOCK_PATI_LOCATION,
  nextStep,
  previousStep,
  randomPatiLocation,
  validateReportStep,
  type ReportStepData,
} from "./report-stepper";

function makeData(overrides: Partial<ReportStepData> = {}): ReportStepData {
  return {
    photos: [new File(["photo"], "foto.jpg", { type: "image/jpeg" })],
    detailLocation: "Jalan Raya Pati-Tayu KM 12, depan Pasar Desa Tanjang",
    title: "Lampu penerangan jalan mati di ruas Tanjang",
    category: "lampu",
    description:
      "Lampu penerangan jalan mati sejak seminggu terakhir sehingga jalan sangat gelap pada malam hari.",
    latitude: -6.7558,
    longitude: 111.0379,
    agreedToTerms: true,
    ...overrides,
  };
}

describe("report stepper validation", () => {
  it("requires at least one photo on step 1", () => {
    expect(validateReportStep(1, makeData({ photos: [] }))).toHaveProperty(
      "photos",
    );
    expect(validateReportStep(1, makeData())).toEqual({});
  });

  it("requires location, category, and minimum text lengths on step 2", () => {
    const errors = validateReportStep(
      2,
      makeData({
        detailLocation: "pendek",
        title: "pendek",
        category: "",
        description: "pendek",
        latitude: null,
        longitude: null,
      }),
    );

    expect(errors.detailLocation).toMatch(/Coba deteksi lokasi perangkat lagi/i);
    expect(errors).toHaveProperty("title");
    expect(errors).toHaveProperty("category");
    expect(errors).toHaveProperty("description");
    expect(errors).toHaveProperty("location");
  });

  it("asks the user to retry when automatic location text is missing", () => {
    const errors = validateReportStep(
      2,
      makeData({ detailLocation: "" }),
    );

    expect(errors.detailLocation).toBe(
      "Alamat otomatis belum ditemukan. Coba deteksi lokasi perangkat lagi.",
    );
  });

  it("blocks locations outside Kabupaten Pati on step 2", () => {
    const errors = validateReportStep(
      2,
      makeData({ latitude: -6.9932, longitude: 110.4229 }),
    );

    expect(errors.location).toMatch(/luar wilayah Kabupaten Pati/i);
  });

  it("requires the terms agreement on step 3", () => {
    expect(validateReportStep(3, makeData({ agreedToTerms: false }))).toHaveProperty(
      "terms",
    );
    expect(validateReportStep(3, makeData())).toEqual({});
  });

  it("finds the first invalid step for submit recovery", () => {
    expect(firstInvalidStep(makeData({ photos: [] }))).toBe(1);
    expect(firstInvalidStep(makeData({ title: "pendek" }))).toBe(2);
    expect(firstInvalidStep(makeData({ agreedToTerms: false }))).toBe(3);
    expect(firstInvalidStep(makeData())).toBeNull();
  });

  it("moves between steps and stops at the edges", () => {
    expect(nextStep(1)).toBe(2);
    expect(nextStep(2)).toBe(3);
    expect(nextStep(3)).toBeNull();
    expect(previousStep(3)).toBe(2);
    expect(previousStep(2)).toBe(1);
    expect(previousStep(1)).toBeNull();
  });
});

describe("client-side Pati region pre-check", () => {
  it("accepts a point in the middle of Kabupaten Pati", () => {
    expect(isWithinPati(-6.7558, 111.0379)).toBe(true);
  });

  it("rejects a point outside Kabupaten Pati", () => {
    expect(isWithinPati(-6.9932, 110.4229)).toBe(false);
  });

  it("rejects invalid coordinates", () => {
    expect(isWithinPati(Number.NaN, 111.0379)).toBe(false);
    expect(isWithinPati(-6.7558, Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("keeps the dev mock location inside Kabupaten Pati", () => {
    expect(
      isWithinPati(MOCK_PATI_LOCATION.latitude, MOCK_PATI_LOCATION.longitude),
    ).toBe(true);
  });

  it("generates random dev locations inside Kabupaten Pati", () => {
    for (let index = 0; index < 25; index += 1) {
      const location = randomPatiLocation();

      expect(isWithinPati(location.latitude, location.longitude)).toBe(true);
      expect(location.accuracyM).toBe(12);
    }
  });
});
