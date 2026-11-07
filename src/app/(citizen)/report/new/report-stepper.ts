import { PATI_BOUNDARY } from "./pati-boundary";

export type ReportStep = 1 | 2 | 3;

export interface ReportStepData {
  photos: File[];
  detailLocation: string;
  title: string;
  category: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  agreedToTerms: boolean;
}

export const REPORT_STEPS: ReadonlyArray<{
  id: ReportStep;
  label: string;
  title: string;
}> = [
  { id: 1, label: "Foto", title: "Foto Kerusakan" },
  { id: 2, label: "Detail", title: "Lokasi & Detail Laporan" },
  { id: 3, label: "Tinjau", title: "Tinjau & Kirim" },
];

/** Dev-only fallback for testing when the device is outside Kabupaten Pati. */
export const MOCK_PATI_LOCATION = {
  latitude: -6.7558,
  longitude: 111.0379,
  accuracyM: 12,
} as const;

const PATI_BOUNDS = PATI_BOUNDARY.reduce(
  (bounds, [longitude, latitude]) => ({
    minLatitude: Math.min(bounds.minLatitude, latitude),
    maxLatitude: Math.max(bounds.maxLatitude, latitude),
    minLongitude: Math.min(bounds.minLongitude, longitude),
    maxLongitude: Math.max(bounds.maxLongitude, longitude),
  }),
  {
    minLatitude: Number.POSITIVE_INFINITY,
    maxLatitude: Number.NEGATIVE_INFINITY,
    minLongitude: Number.POSITIVE_INFINITY,
    maxLongitude: Number.NEGATIVE_INFINITY,
  },
);

/** Dev-only random point inside Kabupaten Pati for varied test reports. */
export function randomPatiLocation() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const latitude =
      PATI_BOUNDS.minLatitude
      + Math.random() * (PATI_BOUNDS.maxLatitude - PATI_BOUNDS.minLatitude);
    const longitude =
      PATI_BOUNDS.minLongitude
      + Math.random() * (PATI_BOUNDS.maxLongitude - PATI_BOUNDS.minLongitude);

    if (isWithinPati(latitude, longitude)) {
      return { latitude, longitude, accuracyM: 12 };
    }
  }

  return { ...MOCK_PATI_LOCATION };
}

function isPointInRing(
  longitude: number,
  latitude: number,
  ring: ReadonlyArray<readonly [number, number]>,
) {
  let inside = false;

  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const [currentX, currentY] = ring[index];
    const [previousX, previousY] = ring[previous];
    const crossesLatitude = (currentY > latitude) !== (previousY > latitude);

    if (
      crossesLatitude
      && longitude < ((previousX - currentX) * (latitude - currentY)) / (previousY - currentY) + currentX
    ) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Cheap client-side pre-check using a simplified Pati boundary. The database
 * trigger remains the authoritative validation when the report is submitted.
 */
export function isWithinPati(latitude: number, longitude: number): boolean {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return false;
  }

  return isPointInRing(longitude, latitude, PATI_BOUNDARY);
}

export function validateReportStep(
  step: ReportStep,
  data: ReportStepData,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (data.photos.length === 0) {
      errors.photos = "Upload minimal 1 foto kerusakan";
    }
  }

  if (step === 2) {
    if (!data.detailLocation.trim()) {
      errors.detailLocation = "Isi detail lokasi kerusakan";
    } else if (data.detailLocation.trim().length < 20) {
      errors.detailLocation = "Detail lokasi minimal 20 karakter untuk kejelasan";
    }

    if (data.latitude === null || data.longitude === null) {
      errors.location = "Ambil lokasi perangkat sebelum melanjutkan";
    } else if (!isWithinPati(data.latitude, data.longitude)) {
      errors.location =
        "Lokasi berada di luar wilayah Kabupaten Pati. Silakan ambil foto di dalam wilayah Kabupaten Pati agar laporan dapat diproses.";
    }

    if (!data.title.trim() || data.title.trim().length < 10) {
      errors.title = "Judul minimal 10 karakter";
    }

    if (!data.category) {
      errors.category = "Pilih kategori kerusakan";
    }

    if (!data.description.trim() || data.description.trim().length < 20) {
      errors.description = "Deskripsi minimal 20 karakter";
    }
  }

  if (step === 3 && !data.agreedToTerms) {
    errors.terms = "Anda harus menyetujui syarat dan ketentuan";
  }

  return errors;
}

export function firstInvalidStep(data: ReportStepData): ReportStep | null {
  for (const step of [1, 2, 3] as const) {
    if (Object.keys(validateReportStep(step, data)).length > 0) {
      return step;
    }
  }

  return null;
}

export function nextStep(step: ReportStep): ReportStep | null {
  return step < 3 ? ((step + 1) as ReportStep) : null;
}

export function previousStep(step: ReportStep): ReportStep | null {
  return step > 1 ? ((step - 1) as ReportStep) : null;
}
