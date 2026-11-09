"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera, Upload, X, CheckCircle2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconSparkle } from "@/components/shared/icons";
import type { ReportPhotoAnalysisResponse } from "@/features/ai/server/contracts";

interface Step1PhotoUploadProps {
  photos: File[];
  photoPreviewUrls: string[];
  isCompressing: boolean;
  isAnalyzing: boolean;
  photoAnalysis: ReportPhotoAnalysisResponse | null;
  photoAnalysisMessage: string;
  errors: Record<string, string>;
  maxPhotos: number;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (index: number) => void;
  onAnalyzePhoto: () => void;
  onConfirmAnalysis: () => void;
  onEditAnalysis: () => void;
}

const CATEGORIES = [
  { value: "jalan", label: "Jalan Berlubang / Rusak" },
  { value: "lampu", label: "Penerangan Jalan Umum (PJU)" },
  { value: "drainase", label: "Saluran Air / Drainase Tersumbat" },
  { value: "jembatan", label: "Jembatan Rusak / Retak" },
  { value: "tanggul", label: "Tanggul Sungai / Penahan Banjir" },
  { value: "trotoar", label: "Trotoar / Pedestrian Rusak" },
  { value: "rambu", label: "Rambu / Marka Jalan Hilang" },
  { value: "lainnya", label: "Fasilitas Publik Lainnya" },
];

export function Step1PhotoUpload({
  photos,
  photoPreviewUrls,
  isCompressing,
  isAnalyzing,
  photoAnalysis,
  photoAnalysisMessage,
  errors,
  maxPhotos,
  onFileSelect,
  onRemovePhoto,
  onAnalyzePhoto,
  onConfirmAnalysis,
  onEditAnalysis,
}: Step1PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedCategory = CATEGORIES.find((cat) => cat.value === photoAnalysis?.analysis.category);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-10 w-10 rounded-full bg-primary-soft flex items-center justify-center">
            <Camera className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-text">
            Upload Foto Kerusakan
          </h2>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          Ambil foto kerusakan yang jelas. AI kami akan membantu mengisi detail laporan secara otomatis.
        </p>
      </div>

      {/* Photo Upload Area */}
      {photos.length === 0 ? (
        <label className="flex flex-col items-center justify-center w-full min-h-[16rem] sm:min-h-[20rem] border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-surface/50 transition-colors bg-background active:scale-[0.99]">
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary-soft flex items-center justify-center mb-4">
              <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <p className="mb-2 text-lg sm:text-xl font-semibold text-text text-center">
              Ambil Foto dengan Kamera
            </p>
            <p className="text-sm sm:text-base text-text-muted text-center mb-4">
              Foto akan dikompres otomatis
            </p>
            <div className="px-4 py-2 rounded-full bg-primary-soft text-primary text-sm font-medium">
              Maksimal {maxPhotos} foto
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            capture="environment"
            multiple
            onClick={(event) => event.stopPropagation()}
            onChange={onFileSelect}
            aria-label="Upload foto kerusakan"
          />
        </label>
      ) : (
        <div className="space-y-4">
          {/* Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photoPreviewUrls.map((url, index) => (
              <div
                key={index}
                className="relative aspect-video rounded-lg overflow-hidden border-2 border-border bg-surface group"
              >
                <Image
                  src={url}
                  alt={`Foto ${index + 1}`}
                  width={400}
                  height={225}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemovePhoto(index)}
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

          {/* Add More Photos */}
          {photos.length < maxPhotos && !photoAnalysis && (
            <label className="flex items-center justify-center w-full min-h-[5rem] py-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-surface/50 transition-colors bg-background active:scale-[0.99]">
              <div className="flex items-center gap-2 text-base sm:text-sm text-text-muted">
                <Upload className="h-5 w-5 sm:h-4 sm:w-4" />
                <span>
                  Tambah foto ({photos.length}/{maxPhotos})
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
                multiple
                onClick={(event) => event.stopPropagation()}
                onChange={onFileSelect}
                aria-label="Tambah foto kerusakan"
              />
            </label>
          )}
        </div>
      )}

      {/* Compressing State */}
      {isCompressing && (
        <div className="flex items-center justify-center py-4 text-sm text-text-muted">
          <div className="inline-block h-4 w-4 border-2 border-t-transparent border-primary rounded-full animate-spin mr-2" />
          Memproses foto...
        </div>
      )}

      {/* Error */}
      {errors.photos && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
          <X className="h-4 w-4 shrink-0" />
          <span>{errors.photos}</span>
        </div>
      )}

      {/* AI Analysis Section */}
      {photos.length > 0 && !photoAnalysis && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={onAnalyzePhoto}
              disabled={isAnalyzing || isCompressing}
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent/90 shadow-md hover:shadow-lg transition-all relative overflow-hidden group flex-1 sm:flex-none"
            >
              {isAnalyzing ? (
                <>
                  <div className="inline-block h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  <span className="font-semibold">Menganalisis...</span>
                </>
              ) : (
                <>
                  <IconSparkle className="h-5 w-5 animate-pulse group-hover:animate-spin" />
                  <span className="font-semibold">Analisis dengan AI</span>
                  <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-accent text-[10px] font-bold text-white shadow-sm">
                    Recommended
                  </span>
                </>
              )}
            </Button>
            {!isAnalyzing && (
              <p className="text-xs text-text-muted sm:flex-1">
                AI dapat membantu mengisi kategori dan detail laporan. Periksa kembali semua sarannya.
              </p>
            )}
          </div>
          {photoAnalysisMessage && (
            <p className="text-sm text-text-muted">{photoAnalysisMessage}</p>
          )}
        </div>
      )}

      {/* AI Analysis Results - Confirmation */}
      {photoAnalysis && (
        <div className="space-y-4 pt-4 border-t-2 border-primary/20">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary-soft/30 border-2 border-primary/30">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <IconSparkle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-bold text-text mb-1">Analisis AI selesai</h3>
                <p className="text-sm text-text-muted">
                  AI telah menganalisis foto Anda. Periksa hasil di bawah dan konfirmasi jika sudah sesuai.
                </p>
              </div>

              {/* Analysis Results */}
              <div className="space-y-3 p-4 rounded-lg bg-background border border-border">
                <div>
                  <p className="text-xs text-text-muted mb-1">Kategori Kerusakan:</p>
                  <p className="font-semibold text-text text-base">
                    {selectedCategory?.label || photoAnalysis.analysis.category}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Judul Laporan:</p>
                  <p className="font-medium text-text">{photoAnalysis.analysis.title}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Deskripsi:</p>
                  <p className="text-sm text-text leading-relaxed">
                    {photoAnalysis.analysis.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-text-muted">
                    Model: {photoAnalysis.provider} · {photoAnalysis.model}
                    {photoAnalysis.analysis.confidence !== null && photoAnalysis.analysis.confidence !== undefined && (
                      <> · Confidence {Math.round(photoAnalysis.analysis.confidence * 100)}%</>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  onClick={onConfirmAnalysis}
                  size="lg"
                  className="gap-2 flex-1"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Ya, Sudah Benar</span>
                </Button>
                <Button
                  type="button"
                  onClick={onEditAnalysis}
                  variant="outline"
                  size="lg"
                  className="gap-2 flex-1"
                >
                  <Edit3 className="h-5 w-5" />
                  <span>Perlu Saya Edit</span>
                </Button>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                Anda tetap dapat mengedit semua detail pada langkah berikutnya.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
