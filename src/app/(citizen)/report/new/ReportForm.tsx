"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Camera,
  Upload,
  X,
  MapPin,
  AlertCircle,
  Send,
  Eye,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconPlusCircle, IconSparkle } from "@/components/shared/icons";
import { TipsCard } from "./components/TipsCard";

interface ReportFormData {
  photos: File[];
  photoPreviewUrls: string[];
  detailLocation: string;
  title: string;
  category: string;
  description: string;
  agreedToTerms: boolean;
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

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ReportForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ReportFormData>({
    photos: [],
    photoPreviewUrls: [],
    detailLocation: "",
    title: "",
    category: "",
    description: "",
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Photo upload handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newErrors = { ...errors };
    delete newErrors.photos;

    if (formData.photos.length + files.length > MAX_PHOTOS) {
      setErrors({ ...newErrors, photos: `Maksimal ${MAX_PHOTOS} foto per laporan` });
      return;
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setErrors({ ...newErrors, photos: "Ukuran file maksimal 5MB per foto" });
        return;
      }
      if (!file.type.startsWith("image/")) {
        setErrors({ ...newErrors, photos: "Hanya file gambar yang diperbolehkan" });
        return;
      }
    }

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setFormData({
      ...formData,
      photos: [...formData.photos, ...files],
      photoPreviewUrls: [...formData.photoPreviewUrls, ...newPreviewUrls],
    });
    setErrors(newErrors);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(formData.photoPreviewUrls[index]);
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index),
      photoPreviewUrls: formData.photoPreviewUrls.filter((_, i) => i !== index),
    });
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.photos.length === 0) {
      newErrors.photos = "Upload minimal 1 foto kerusakan";
    }
    if (!formData.detailLocation.trim()) {
      newErrors.detailLocation = "Isi detail lokasi kerusakan";
    }
    if (formData.detailLocation.trim().length < 20) {
      newErrors.detailLocation = "Detail lokasi minimal 20 karakter untuk kejelasan";
    }
    if (!formData.title.trim() || formData.title.trim().length < 10) {
      newErrors.title = "Judul minimal 10 karakter";
    }
    if (!formData.category) {
      newErrors.category = "Pilih kategori kerusakan";
    }
    if (!formData.description.trim() || formData.description.trim().length < 20) {
      newErrors.description = "Deskripsi minimal 20 karakter";
    }
    if (!formData.agreedToTerms) {
      newErrors.terms = "Anda harus menyetujui syarat dan ketentuan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('[data-error]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement actual submission to Supabase
      console.log("Submitting report:", formData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Generate ticket number
      const ticketNumber = `NP-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
      
      // Redirect to success page (or show success modal)
      router.push(`/report/success?ticket=${ticketNumber}`);
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({ submit: "Terjadi kesalahan saat mengirim laporan. Silakan coba lagi." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Apakah Anda yakin ingin membatalkan laporan ini? Data yang telah diisi akan hilang."
    );
    if (confirmCancel) {
      router.push("/");
    }
  };

  const selectedCategory = CATEGORIES.find((cat) => cat.value === formData.category);

  // Preview mode
  if (showPreview) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowPreview(false)}
              className="gap-2 mb-4"
            >
              <Edit2 className="h-4 w-4" />
              <span>Kembali ke Form</span>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-text">
              Pratinjau Laporan Anda
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Periksa kembali informasi yang akan dikirimkan
            </p>
          </div>

          {/* Preview Content */}
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6">
            {/* Photos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-text-muted" />
                <h3 className="text-sm font-semibold text-text">Foto Kerusakan</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {formData.photoPreviewUrls.map((url, index) => (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden border border-border bg-surface">
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
              <div className="rounded-lg bg-surface border border-border p-4 text-sm">
                <span className="text-text-muted">Detail Lokasi:</span>
                <p className="font-medium text-text mt-1 leading-relaxed">{formData.detailLocation}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-text">Detail Laporan</h3>
              <div className="rounded-lg bg-surface border border-border p-4 space-y-3 text-sm">
                <div>
                  <span className="text-text-muted">Judul:</span>
                  <p className="font-semibold text-text mt-1">{formData.title}</p>
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setShowPreview(false)}
                className="gap-2 w-full sm:w-auto"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit Laporan</span>
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                variant="default"
                size="lg"
                className="gap-2 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Kirim Laporan</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold mb-2">
            <IconPlusCircle className="h-3.5 w-3.5" />
            <span>Kanal Warga Pati</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">
            Sampaikan Laporan Fasilitas Publik
          </h1>
          <p className="text-sm text-text-muted mt-1 leading-relaxed">
            Laporkan jalan rusak, lampu penerangan mati, saluran air tersumbat, atau fasilitas umum lainnya
            untuk ditindaklanjuti dinas terkait.
          </p>
        </div>

        {/* 2 Column Layout: Form (Left) + Tips (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form (2/3 width on large screens) */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-8">
          {/* Section 1: Photos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-text">1. Foto Kerusakan</h2>
            </div>
            <p className="text-sm text-text-muted">
              Upload foto lokasi kerusakan. Pastikan foto jelas dan tidak mengandung wajah atau plat nomor kendaraan.
            </p>

            {formData.photos.length === 0 ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-surface/50 transition-colors bg-background">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-10 w-10 text-text-muted mb-3" />
                  <p className="mb-2 text-sm text-text">
                    <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                  </p>
                  <p className="text-xs text-text-muted">PNG, JPG, JPEG (Max 5MB, maks 3 foto)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleFileSelect}
                />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {formData.photoPreviewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-border bg-surface group">
                      <Image
                        src={url}
                        alt={`Foto ${index + 1}`}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-white text-xs font-medium">
                        Foto {index + 1}
                      </div>
                    </div>
                  ))}
                </div>

                {formData.photos.length < MAX_PHOTOS && (
                  <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-surface/50 transition-colors bg-background">
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <Upload className="h-4 w-4" />
                      <span>Tambah foto ({formData.photos.length}/{MAX_PHOTOS})</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={handleFileSelect}
                    />
                  </label>
                )}
              </div>
            )}

            {errors.photos && (
              <div data-error className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errors.photos}</span>
              </div>
            )}
          </div>

          {/* Section 2: Location */}
          <div className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-text">2. Lokasi Kerusakan</h2>
            </div>
            <p className="text-sm text-text-muted">
              Jelaskan lokasi kerusakan dengan detail alamat, nama jalan, dan patokan yang jelas.
            </p>

            {/* Detail Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text block">
                Detail Alamat / Lokasi Kerusakan <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.detailLocation}
                onChange={(e) => {
                  setFormData({ ...formData, detailLocation: e.target.value });
                  const newErrors = { ...errors };
                  delete newErrors.detailLocation;
                  setErrors(newErrors);
                }}
                rows={4}
                placeholder="Contoh: Jalan Raya Pati-Tayu KM 12, Kecamatan Gabus, depan Pasar Desa Tanjang, sebelah Masjid Al-Ikhlas"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-text leading-relaxed"
              />
              {errors.detailLocation && (
                <p data-error className="text-xs text-red-600">{errors.detailLocation}</p>
              )}
              <p className="text-xs text-text-muted">
                💡 Tips: Sertakan nama kecamatan, desa/kelurahan, nama jalan, nomor KM (jika ada), dan patokan bangunan terdekat
              </p>
            </div>
          </div>

          {/* Section 3: Details */}
          <div className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-center gap-2">
              <IconSparkle className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-text">3. Detail Laporan</h2>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text block">
                Judul Laporan <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  const newErrors = { ...errors };
                  delete newErrors.title;
                  setErrors(newErrors);
                }}
                placeholder="Contoh: Lampu penerangan jalan mati di ruas Tanjang - Gabus"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-text"
                maxLength={100}
              />
              <div className="flex items-center justify-between text-xs">
                {errors.title ? (
                  <p data-error className="text-red-600">{errors.title}</p>
                ) : (
                  <span className="text-text-muted">{formData.title.length}/100 karakter (min 10)</span>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text block">
                Kategori Kerusakan <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  const newErrors = { ...errors };
                  delete newErrors.category;
                  setErrors(newErrors);
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-text"
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
                  ✓ Akan diteruskan ke: <strong>{selectedCategory.dinas}</strong>
                </p>
              )}
              {errors.category && (
                <p data-error className="text-xs text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text block">
                Deskripsi Masalah <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  const newErrors = { ...errors };
                  delete newErrors.description;
                  setErrors(newErrors);
                }}
                rows={5}
                placeholder="Jelaskan kondisi kerusakan secara detail (apa yang rusak, sejak kapan, dampak bagi warga, dll)"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-text leading-relaxed"
                maxLength={1000}
              />
              <div className="flex items-center justify-between text-xs">
                {errors.description ? (
                  <p data-error className="text-red-600">{errors.description}</p>
                ) : (
                  <span className="text-text-muted">{formData.description.length}/1000 karakter (min 20)</span>
                )}
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="pt-4 border-t border-border">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.agreedToTerms}
                onChange={(e) => {
                  setFormData({ ...formData, agreedToTerms: e.target.checked });
                  const newErrors = { ...errors };
                  delete newErrors.terms;
                  setErrors(newErrors);
                }}
                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/40"
              />
              <span className="text-sm text-text-muted group-hover:text-text">
                Saya menyatakan bahwa informasi yang saya sampaikan adalah benar dan dapat
                dipertanggungjawabkan. Saya memahami bahwa laporan ini akan ditampilkan secara publik
                tanpa identitas pribadi saya.
              </span>
            </label>
            {errors.terms && (
              <p data-error className="text-xs text-red-600 mt-2">{errors.terms}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div data-error className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="gap-2 w-full sm:w-auto"
            >
              <X className="h-4 w-4" />
              <span>Batal</span>
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (validateForm()) {
                    setShowPreview(true);
                  }
                }}
                className="gap-2 flex-1 sm:flex-none"
              >
                <Eye className="h-4 w-4" />
                <span>Pratinjau</span>
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                variant="default"
                className="gap-2 flex-1 sm:flex-none"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Kirim Laporan</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
          </div>

          {/* Right Column: Tips Card (1/3 width on large screens, hidden on mobile) */}
          <div className="hidden lg:block">
            <TipsCard />
          </div>
        </div>
      </div>
    </div>
  );
}
