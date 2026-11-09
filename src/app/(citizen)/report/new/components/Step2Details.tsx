"use client";

import { MapPin, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconSparkle } from "@/components/shared/icons";

interface Step2DetailsProps {
  formData: {
    title: string;
    category: string;
    description: string;
    detailLocation: string;
    latitude: number | null;
    longitude: number | null;
    locationAccuracyM: number | null;
  };
  errors: Record<string, string>;
  aiFilledFields: Set<string>;
  isResolvingLocation: boolean;
  locationMessage: string;
  onFieldChange: (field: string, value: string) => void;
  onRequestLocation: (refresh?: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

const CATEGORIES = [
  { value: "jalan", label: "Jalan Berlubang / Rusak", dinas: "Bina Marga - DPUTR" },
  { value: "lampu", label: "Penerangan Jalan Umum (PJU)", dinas: "Dishub Kab. Pati" },
  { value: "drainase", label: "Saluran Air / Drainase Tersumbat", dinas: "Dinas SDA - DPUTR" },
  { value: "jembatan", label: "Jembatan Rusak / Retak", dinas: "Bina Marga - DPUTR" },
  { value: "tanggul", label: "Tanggul Sungai / Penahan Banjir", dinas: "Dinas SDA & BPBD" },
  { value: "trotoar", label: "Trotoar / Pedestrian Rusak", dinas: "Bina Marga - DPUTR" },
  { value: "rambu", label: "Rambu / Marka Jalan Hilang", dinas: "Dishub Kab. Pati" },
  { value: "lainnya", label: "Fasilitas Publik Lainnya", dinas: "Dinas terkait" },
];

export function Step2Details({
  formData,
  errors,
  aiFilledFields,
  isResolvingLocation,
  locationMessage,
  onFieldChange,
  onRequestLocation,
  onBack,
  onNext,
}: Step2DetailsProps) {
  const selectedCategory = CATEGORIES.find((cat) => cat.value === formData.category);

  const validateStep2 = (): boolean => {
    return !!(
      formData.title.trim().length >= 10 &&
      formData.category &&
      formData.description.trim().length >= 20 &&
      formData.detailLocation.trim().length >= 20 &&
      formData.latitude !== null &&
      formData.longitude !== null
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-10 w-10 rounded-full bg-accent-soft flex items-center justify-center">
            <FileText className="h-5 w-5 text-accent" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-text">Detail Laporan</h2>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          Periksa dan sesuaikan informasi laporan Anda. Field yang diisi AI sudah ditandai.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text block">
            Judul Laporan <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onFieldChange("title", e.target.value)}
            placeholder="Contoh: Lampu penerangan jalan mati di ruas Tanjang - Gabus"
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-text transition-colors ${
              aiFilledFields.has("title")
                ? "border-primary/40 bg-primary-soft/20"
                : errors.title
                  ? "border-red-500"
                  : "border-border"
            }`}
            maxLength={100}
            aria-invalid={errors.title ? "true" : "false"}
            aria-describedby={errors.title ? "title-error" : undefined}
            aria-required="true"
          />
          <div className="flex items-center justify-between text-xs gap-2">
            <div className="flex-1">
              {errors.title ? (
                <p id="title-error" className="text-red-600" role="alert">
                  {errors.title}
                </p>
              ) : aiFilledFields.has("title") ? (
                <div className="flex items-center gap-1.5 text-primary">
                  <IconSparkle className="h-3 w-3" />
                  <span className="font-medium">Draf dari AI</span>
                </div>
              ) : null}
            </div>
            <span className="text-text-muted shrink-0">{formData.title.length}/100</span>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text block">
            Kategori Kerusakan <span className="text-red-600">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => onFieldChange("category", e.target.value)}
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-text transition-colors ${
              aiFilledFields.has("category")
                ? "border-primary/40 bg-primary-soft/20"
                : errors.category
                  ? "border-red-500"
                  : "border-border"
            }`}
            aria-invalid={errors.category ? "true" : "false"}
            aria-describedby={errors.category ? "category-error" : undefined}
            aria-required="true"
          >
            <option value="">-- Pilih Kategori --</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {selectedCategory && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Akan diteruskan ke: <strong>{selectedCategory.dinas}</strong>
            </p>
          )}
          {aiFilledFields.has("category") && (
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <IconSparkle className="h-3 w-3" />
              <span className="font-medium">Saran dari AI</span>
            </div>
          )}
          {errors.category && (
            <p id="category-error" className="text-xs text-red-600" role="alert">
              {errors.category}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text block">
            Deskripsi Masalah <span className="text-red-600">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onFieldChange("description", e.target.value)}
            rows={5}
            placeholder="Jelaskan kondisi kerusakan secara detail (apa yang rusak, sejak kapan, dampak bagi warga, dll)"
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-text leading-relaxed transition-colors ${
              aiFilledFields.has("description")
                ? "border-primary/40 bg-primary-soft/20"
                : errors.description
                  ? "border-red-500"
                  : "border-border"
            }`}
            maxLength={1000}
            aria-invalid={errors.description ? "true" : "false"}
            aria-describedby={errors.description ? "description-error" : undefined}
            aria-required="true"
          />
          <div className="flex items-center justify-between text-xs gap-2">
            <div className="flex-1">
              {errors.description ? (
                <p id="description-error" className="text-red-600" role="alert">
                  {errors.description}
                </p>
              ) : aiFilledFields.has("description") ? (
                <div className="flex items-center gap-1.5 text-primary">
                  <IconSparkle className="h-3 w-3" />
                  <span className="font-medium">Draf dari AI</span>
                </div>
              ) : null}
            </div>
            <span className="text-text-muted shrink-0">{formData.description.length}/1000</span>
          </div>
        </div>

        {/* Detail Location */}
        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-primary" />
            <label htmlFor="report-location-readonly" className="text-sm font-medium text-text">
              Alamat perkiraan dari GPS <span className="text-red-600">*</span>
            </label>
          </div>
          <textarea
            id="report-location-readonly"
            value={formData.detailLocation}
            readOnly
            aria-readonly="true"
            rows={3}
            placeholder="Alamat akan diisi otomatis setelah lokasi perangkat ditemukan."
            className={`w-full resize-none px-3.5 py-2.5 text-sm rounded-lg border-2 bg-primary-soft/20 text-text leading-relaxed transition-colors ${
              errors.detailLocation ? "border-red-500" : "border-border"
            }`}
            aria-invalid={errors.detailLocation ? "true" : "false"}
            aria-describedby={errors.detailLocation
              ? "report-location-help detailLocation-error"
              : "report-location-help"}
            aria-required="true"
          />
          {isResolvingLocation && (
            <p className="text-xs text-text-muted flex items-center gap-2">
              <div className="inline-block h-3 w-3 border-2 border-t-transparent border-primary rounded-full animate-spin" />
              Mencari perkiraan alamat dari GPS...
            </p>
          )}
          {locationMessage && (
            <p className="text-xs text-text-muted">{locationMessage}</p>
          )}
          {(formData.latitude === null || !formData.detailLocation.trim()) && !isResolvingLocation && (
            <Button type="button" variant="outline" size="sm" onClick={() => onRequestLocation(true)}>
              <MapPin className="h-4 w-4 mr-2" />
              Coba deteksi lokasi perangkat lagi
            </Button>
          )}
          {errors.detailLocation && (
            <p id="detailLocation-error" className="text-xs text-red-600" role="alert">
              {errors.detailLocation}
            </p>
          )}
          {errors.location && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errors.location}</span>
            </div>
          )}
          <p id="report-location-help" className="text-xs text-text-muted">
            Alamat perkiraan diisi otomatis dari GPS dan tidak dapat diedit. Jika titiknya keliru, ambil ulang lokasi perangkat.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-6 border-t border-border">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          ← Kembali
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!validateStep2()}
          className="gap-2"
        >
          Lanjut ke Review →
        </Button>
      </div>
    </div>
  );
}
