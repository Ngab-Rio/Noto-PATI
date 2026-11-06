"use client";

import Image from "next/image";
import { Camera, MapPin, FileText, Send, Edit2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step3ReviewProps {
  formData: {
    photos: File[];
    photoPreviewUrls: string[];
    title: string;
    category: string;
    description: string;
    detailLocation: string;
    latitude: number | null;
    longitude: number | null;
    locationAccuracyM: number | null;
    agreedToTerms: boolean;
  };
  errors: Record<string, string>;
  isSubmitting: boolean;
  onFieldChange: (field: string, value: unknown) => void;
  onBack: () => void;
  onSubmit: () => void;
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

export function Step3Review({
  formData,
  errors,
  isSubmitting,
  onFieldChange,
  onBack,
  onSubmit,
}: Step3ReviewProps) {
  const selectedCategory = CATEGORIES.find((cat) => cat.value === formData.category);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-text">Review Laporan</h2>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          Periksa kembali informasi laporan Anda sebelum mengirim. Laporan akan dipublikasikan di peta publik.
        </p>
      </div>

      {/* Preview Content */}
      <div className="space-y-6">
        {/* Photos */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-text">Foto Kerusakan</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {formData.photoPreviewUrls.map((url, index) => (
              <div
                key={index}
                className="aspect-video rounded-lg overflow-hidden border border-border bg-surface"
              >
                <Image
                  src={url}
                  alt={`Foto ${index + 1}`}
                  width={400}
                  height={225}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-text">Lokasi</h3>
          </div>
          <div className="rounded-lg bg-background border border-border p-4 text-sm space-y-2">
            <div>
              <span className="text-text-muted">Detail Lokasi:</span>
              <p className="font-medium text-text mt-1 leading-relaxed">
                {formData.detailLocation}
              </p>
            </div>
            <div className="pt-2 border-t border-border">
              <span className="text-text-muted">Koordinat GPS:</span>
              <p className="font-medium text-text mt-1">
                {formData.latitude}, {formData.longitude}
                {formData.locationAccuracyM !== null && (
                  <span className="text-text-muted font-normal">
                    {" "}
                    (akurasi ±{Math.round(formData.locationAccuracyM)} m)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-text">Detail Laporan</h3>
          </div>
          <div className="rounded-lg bg-background border border-border p-4 space-y-4 text-sm">
            <div>
              <span className="text-text-muted">Judul:</span>
              <p className="font-semibold text-text mt-1 text-base">{formData.title}</p>
            </div>
            <div>
              <span className="text-text-muted">Kategori:</span>
              <p className="font-medium text-text mt-1">
                {selectedCategory?.label || formData.category}
              </p>
              {selectedCategory && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  Akan diteruskan ke: {selectedCategory.dinas}
                </p>
              )}
            </div>
            <div>
              <span className="text-text-muted">Deskripsi:</span>
              <p className="text-text mt-1 leading-relaxed whitespace-pre-line">
                {formData.description}
              </p>
            </div>
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="pt-4 border-t border-border">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.agreedToTerms}
              onChange={(e) => onFieldChange("agreedToTerms", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/40"
              aria-invalid={errors.terms ? "true" : "false"}
              aria-describedby={errors.terms ? "terms-error" : undefined}
              aria-required="true"
            />
            <span className="text-sm text-text-muted group-hover:text-text">
              Saya menyatakan bahwa informasi yang saya sampaikan adalah benar dan dapat
              dipertanggungjawabkan. Saya memahami bahwa laporan ini akan ditampilkan secara
              publik tanpa identitas pribadi saya.
            </span>
          </label>
          {errors.terms && (
            <p id="terms-error" className="text-xs text-red-600 mt-2" role="alert">
              {errors.terms}
            </p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errors.submit}</span>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="gap-2"
        >
          <Edit2 className="h-4 w-4" />
          Edit Laporan
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !formData.agreedToTerms}
          size="lg"
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="inline-block h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
              <span>Mengirim...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span className="font-semibold">Kirim Laporan</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
