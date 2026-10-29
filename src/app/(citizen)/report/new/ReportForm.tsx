"use client";

import { useState, useRef, useEffect } from "react";
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
import { createReport } from "./actions";
import {
  reportPhotoAnalysisResponseSchema,
  type ReportPhotoAnalysisResponse,
} from "@/features/ai/server/contracts";

interface ReportFormData {
  photos: File[];
  photoPreviewUrls: string[];
  detailLocation: string;
  title: string;
  category: string;
  description: string;
  agreedToTerms: boolean;
  latitude: number | null;
  longitude: number | null;
  locationAccuracyM: number | null;
  locationCapturedAt: string | null;
}

type AiSuggestionField = "title" | "category" | "description" | "detailLocation";

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
const MAX_SOURCE_FILE_SIZE = 20 * 1024 * 1024;
const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024;
const MAX_COMPRESSED_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;
const SUBMISSION_TIMEOUT_MS = 45000;

function compressPhoto(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(
        1,
        MAX_COMPRESSED_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Canvas tidak tersedia di perangkat ini."));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Foto tidak dapat dikompres."));
            return;
          }

          const baseName = file.name.replace(/\.[^/.]+$/, "") || "foto-laporan";
          resolve(new File([blob], `${baseName}.jpg`, { type: "image/jpeg" }));
        },
        "image/jpeg",
        JPEG_QUALITY,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Foto tidak dapat dibaca oleh perangkat ini."));
    };
    image.src = objectUrl;
  });
}

function createClientRequestId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const randomValue = Math.random() * 16 | 0;
    const value = character === "x" ? randomValue : (randomValue & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function ReportForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const clientRequestIdRef = useRef<string>(createClientRequestId());
  const submitLockRef = useRef(false);
  const analysisRequestIdRef = useRef(0);
  const geocodeRequestIdRef = useRef(0);
  const locationCapturePendingRef = useRef(false);
  const manuallyEditedFieldsRef = useRef(new Set<AiSuggestionField>());
  const capturedLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);
  
  const [formData, setFormData] = useState<ReportFormData>({
    photos: [],
    photoPreviewUrls: [],
    detailLocation: "",
    title: "",
    category: "",
    description: "",
    agreedToTerms: false,
    latitude: null,
    longitude: null,
    locationAccuracyM: null,
    locationCapturedAt: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoAnalysis, setPhotoAnalysis] = useState<ReportPhotoAnalysisResponse | null>(null);
  const [photoAnalysisMessage, setPhotoAnalysisMessage] = useState("");
  const [aiFilledFields, setAiFilledFields] = useState<Set<AiSuggestionField>>(
    () => new Set<AiSuggestionField>(),
  );
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  // Request location permission on component mount for mobile devices
  useEffect(() => {
    // Only request if location hasn't been captured yet
    if (formData.latitude !== null && formData.longitude !== null) {
      return;
    }

    // Check if running in a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      setLocationMessage("Akses lokasi membutuhkan HTTPS. Gunakan localhost atau buka aplikasi melalui URL HTTPS.");
      return;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationMessage("Perangkat atau browser tidak mendukung lokasi. Silakan isi alamat secara manual.");
      return;
    }

    // Request location permission immediately
    locationCapturePendingRef.current = true;
    setIsResolvingLocation(true);
    setLocationMessage("Meminta izin akses lokasi perangkat...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        locationCapturePendingRef.current = false;
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        // Store in ref for immediate access (no closure issues)
        capturedLocationRef.current = { latitude, longitude };
        
        setFormData((currentFormData) => ({
          ...currentFormData,
          latitude,
          longitude,
          locationAccuracyM: Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null,
          locationCapturedAt: new Date(position.timestamp).toISOString(),
        }));
        setErrors((currentErrors) => {
          const nextErrors = { ...currentErrors };
          delete nextErrors.location;
          return nextErrors;
        });
        setLocationMessage("Lokasi perangkat berhasil ditangkap. Upload foto untuk analisis AI.");
        
        // Don't auto-fill location text until user uploads a photo
        // This prevents confusion when user hasn't seen the form yet
      },
      (error) => {
        locationCapturePendingRef.current = false;
        setIsResolvingLocation(false);
        setLocationMessage(
          error.code === 1
            ? "Izin lokasi ditolak. Aktifkan izin lokasi di pengaturan browser lalu muat ulang halaman."
            : error.code === 2
              ? "Lokasi perangkat tidak tersedia. Periksa GPS atau jaringan lalu coba lagi."
              : "Pencarian lokasi terlalu lama. Periksa GPS lalu coba lagi.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const markFieldAsManuallyEdited = (field: AiSuggestionField) => {
    manuallyEditedFieldsRef.current.add(field);
    setAiFilledFields((current) => {
      const next = new Set(current);
      next.delete(field);
      return next;
    });
  };

  const resolveLocation = async (latitude: number, longitude: number) => {
    const requestId = ++geocodeRequestIdRef.current;
    console.log('[resolveLocation] Starting reverse geocode:', { latitude, longitude, requestId });
    setIsResolvingLocation(true);
    setLocationMessage("");

    try {
      const query = new URLSearchParams({
        lat: String(latitude),
        lon: String(longitude),
      });
      console.log('[resolveLocation] Fetching from API:', `/api/location/reverse-geocode?${query}`);
      
      // Add timeout for client-side request (15 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(`/api/location/reverse-geocode?${query}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      const payload: unknown = await response.json();
      console.log('[resolveLocation] API response:', { ok: response.ok, status: response.status, payload });

      if (!response.ok) {
        const message = payload && typeof payload === "object"
          && "message" in payload && typeof payload.message === "string"
          ? payload.message
          : "Alamat otomatis tidak tersedia. Silakan isi lokasi secara manual.";
        throw new Error(message);
      }

      if (!payload || typeof payload !== "object"
        || !("address" in payload) || typeof payload.address !== "string") {
        throw new Error("Alamat otomatis tidak valid. Silakan isi lokasi secara manual.");
      }
      const address = payload.address;
      console.log('[resolveLocation] Got address:', address);

      if (requestId !== geocodeRequestIdRef.current) {
        console.log('[resolveLocation] Request cancelled (stale)');
        return;
      }

      if (!manuallyEditedFieldsRef.current.has("detailLocation")) {
        console.log('[resolveLocation] Updating detailLocation field');
        setFormData((current) => {
          if (current.detailLocation.trim() || manuallyEditedFieldsRef.current.has("detailLocation")) {
            console.log('[resolveLocation] Field already filled or manually edited, skipping');
            return current;
          }
          console.log('[resolveLocation] Setting detailLocation to:', address);
          return { ...current, detailLocation: address };
        });
        setAiFilledFields((current) => new Set(current).add("detailLocation"));
        setErrors((current) => {
          const next = { ...current };
          delete next.detailLocation;
          return next;
        });
      }
      setLocationMessage("Lokasi perkiraan dari koordinat GPS melalui OpenStreetMap; periksa dan edit sebelum mengirim.");
    } catch (error) {
      console.error('[resolveLocation] Error:', error);
      if (requestId === geocodeRequestIdRef.current) {
        const message = error instanceof Error && error.name === "AbortError"
          ? "Pencarian alamat terlalu lama. Silakan coba lagi atau isi lokasi secara manual."
          : error instanceof Error
            ? error.message
            : "Alamat otomatis tidak tersedia. Silakan isi lokasi secara manual.";
        setLocationMessage(message);
      }
    } finally {
      if (requestId === geocodeRequestIdRef.current) {
        setIsResolvingLocation(false);
      }
    }
  };

  const requestDeviceLocation = () => {
    if (
      locationCapturePendingRef.current
      || (formData.latitude !== null && formData.longitude !== null)
    ) {
      return;
    }

    if (!window.isSecureContext) {
      setLocationMessage("Akses lokasi membutuhkan HTTPS. Gunakan localhost atau buka aplikasi melalui URL HTTPS.");
      return;
    }
    if (!navigator.geolocation) {
      setLocationMessage("Perangkat atau browser tidak mendukung lokasi. Silakan isi alamat secara manual.");
      return;
    }

    locationCapturePendingRef.current = true;
    setIsResolvingLocation(true);
    setLocationMessage("Meminta lokasi perangkat...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        locationCapturePendingRef.current = false;
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        // Store in ref for immediate access
        capturedLocationRef.current = { latitude, longitude };
        
        setFormData((currentFormData) => ({
          ...currentFormData,
          latitude,
          longitude,
          locationAccuracyM: Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null,
          locationCapturedAt: new Date(position.timestamp).toISOString(),
        }));
        setErrors((currentErrors) => {
          const nextErrors = { ...currentErrors };
          delete nextErrors.location;
          return nextErrors;
        });
        void resolveLocation(latitude, longitude);
      },
      (error) => {
        locationCapturePendingRef.current = false;
        setIsResolvingLocation(false);
        setLocationMessage(
          error.code === 1
            ? "Izin lokasi ditolak. Aktifkan izin lokasi di browser lalu coba lagi."
            : error.code === 2
              ? "Lokasi perangkat tidak tersedia. Periksa GPS atau jaringan lalu coba lagi."
              : "Pencarian lokasi terlalu lama. Periksa GPS lalu coba lagi.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  };

  // Photo upload handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newErrors = { ...errors };
    delete newErrors.photos;

    if (formData.photos.length + files.length > MAX_PHOTOS) {
      setErrors({ ...newErrors, photos: `Maksimal ${MAX_PHOTOS} foto per laporan` });
      return;
    }

    for (const file of files) {
      if (file.size > MAX_SOURCE_FILE_SIZE) {
        setErrors({ ...newErrors, photos: "Ukuran foto asli maksimal 20MB per foto" });
        return;
      }
      if (!file.type.startsWith("image/")) {
        setErrors({ ...newErrors, photos: "Hanya file gambar yang diperbolehkan" });
        return;
      }
    }

    setIsCompressing(true);

    try {
      const compressedFiles = await Promise.all(files.map(compressPhoto));
      if (compressedFiles.some((file) => file.size > MAX_UPLOAD_FILE_SIZE)) {
        setErrors({ ...newErrors, photos: "Foto masih terlalu besar setelah dikompres. Ambil foto dengan jarak atau pencahayaan yang lebih baik." });
        return;
      }

      const newPreviewUrls = compressedFiles.map((file) => URL.createObjectURL(file));

      setFormData((currentFormData) => ({
        ...currentFormData,
        photos: [...currentFormData.photos, ...compressedFiles],
        photoPreviewUrls: [...currentFormData.photoPreviewUrls, ...newPreviewUrls],
      }));
      setPhotoAnalysis(null);
      setPhotoAnalysisMessage("");
      setAiFilledFields((current) => {
        const next = new Set(current);
        next.delete("title");
        next.delete("category");
        next.delete("description");
        return next;
      });
      setErrors(newErrors);
      
      // If location already captured (from mount), trigger reverse geocode
      // Otherwise, request device location
      if (files.length > 0) {
        // Use ref to avoid closure issues with state
        const capturedLocation = capturedLocationRef.current;
        if (capturedLocation) {
          console.log('[ReportForm] Location already captured, triggering reverse geocode:', capturedLocation);
          window.setTimeout(() => {
            void resolveLocation(capturedLocation.latitude, capturedLocation.longitude);
          }, 100);
        } else {
          console.log('[ReportForm] No location yet, requesting device location');
          window.setTimeout(requestDeviceLocation, 0);
        }
      }
    } catch (error) {
      console.error("Photo compression error:", error);
      setErrors({ ...newErrors, photos: "Foto tidak dapat diproses di perangkat ini." });
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(formData.photoPreviewUrls[index]);
    const remainingPhotos = formData.photos.filter((_, i) => i !== index);
    const remainingPreviewUrls = formData.photoPreviewUrls.filter((_, i) => i !== index);
    const aiFieldsToClear = index === 0 ? new Set(aiFilledFields) : new Set<AiSuggestionField>();
    setPhotoAnalysis(null);
    setPhotoAnalysisMessage("");
    if (index === 0) {
      analysisRequestIdRef.current += 1;
      setAiFilledFields(new Set<AiSuggestionField>());
      setFormData((current) => {
        const next = { ...current, photos: remainingPhotos, photoPreviewUrls: remainingPreviewUrls };
        for (const field of aiFieldsToClear) {
          if (!manuallyEditedFieldsRef.current.has(field)) {
            next[field] = "";
          }
        }
        return next;
      });
    } else {
      setFormData({
        ...formData,
        photos: remainingPhotos,
        photoPreviewUrls: remainingPreviewUrls,
      });
    }
  };

  const analyzePhoto = async (photo: File) => {
    if (isAnalyzingPhoto || isSubmitting || isCompressing) {
      return;
    }

    const requestId = ++analysisRequestIdRef.current;
    setIsAnalyzingPhoto(true);
    setPhotoAnalysis(null);
    setPhotoAnalysisMessage("");

    try {
      const body = new FormData();
      body.append("photo", photo);
      
      // Add timeout for AI analysis (35 seconds - slightly longer than server timeout)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);
      
      const response = await fetch("/api/ai/analyze-report-photo", {
        method: "POST",
        body,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      const payload: unknown = await response.json();
      if (requestId !== analysisRequestIdRef.current) {
        return;
      }

      if (!response.ok) {
        const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
          ? payload.message
          : "Analisis AI gagal. Silakan lanjutkan secara manual.";
        setPhotoAnalysisMessage(message);
        return;
      }

      const parsedResponse = reportPhotoAnalysisResponseSchema.safeParse(payload);
      if (!parsedResponse.success) {
        setPhotoAnalysisMessage("Respons analisis tidak valid. Silakan lanjutkan secara manual.");
        return;
      }

      if (requestId !== analysisRequestIdRef.current) {
        return;
      }

      setPhotoAnalysis(parsedResponse.data);
      const suggestions = parsedResponse.data.analysis;
      const filledFields = (["category", "title", "description"] as const)
        .filter((field) => (
          !manuallyEditedFieldsRef.current.has(field)
          && !formData[field].trim()
        ));
      setFormData((current) => {
        if (!current.photos.includes(photo)) {
          return current;
        }

        const next = { ...current };
        for (const field of filledFields) {
          if (
            !next[field].trim()
            && !manuallyEditedFieldsRef.current.has(field)
          ) {
            next[field] = suggestions[field];
          }
        }
        return next;
      });
      setAiFilledFields((current) => new Set([...current, ...filledFields]));
      setErrors((current) => {
        const next = { ...current };
        filledFields.forEach((field) => delete next[field]);
        return next;
      });
      setPhotoAnalysisMessage("Field kosong telah diisi dengan saran AI. Periksa dan edit sebelum mengirim.");
    } catch (error) {
      console.error("Photo analysis request failed", error);
      const message = error instanceof Error && error.name === "AbortError"
        ? "Analisis AI melebihi batas waktu (35 detik). Silakan coba lagi atau lanjutkan secara manual."
        : "Analisis AI tidak tersedia. Silakan coba lagi atau lanjutkan secara manual.";
      setPhotoAnalysisMessage(message);
    } finally {
      if (requestId === analysisRequestIdRef.current) {
        setIsAnalyzingPhoto(false);
      }
    }
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
    if (formData.latitude === null || formData.longitude === null) {
      newErrors.location = "Ambil lokasi perangkat sebelum mengirim laporan";
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

    if (submitLockRef.current || isSubmitting || isCompressing) {
      return;
    }
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('[data-error]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await Promise.race([
        createReport({
        clientRequestId: clientRequestIdRef.current,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        detailLocation: formData.detailLocation,
        photos: formData.photos,
        latitude: formData.latitude,
        longitude: formData.longitude,
        locationAccuracyM: formData.locationAccuracyM,
        locationCapturedAt: formData.locationCapturedAt,
        }),
        new Promise<never>((_, reject) => {
          window.setTimeout(
            () => reject(new Error("SUBMISSION_TIMEOUT")),
            SUBMISSION_TIMEOUT_MS,
          );
        }),
      ]);

      if (!result.ok) {
        setErrors({ submit: result.message });
        return;
      }

      router.push(`/reports/${result.reportId}`);
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({
        submit: error instanceof Error && error.message === "SUBMISSION_TIMEOUT"
          ? "Koneksi terlalu lama. Data form tetap tersimpan, silakan coba kirim lagi."
          : "Terjadi kesalahan saat mengirim laporan. Data form tetap tersimpan, silakan coba lagi.",
      });
    } finally {
      submitLockRef.current = false;
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
                <span className="text-text-muted block mt-3">Koordinat perangkat:</span>
                <p className="font-medium text-text mt-1">
                  {formData.latitude}, {formData.longitude}
                  {formData.locationAccuracyM !== null && (
                    <span className="text-text-muted font-normal"> (akurasi ±{Math.round(formData.locationAccuracyM)} m)</span>
                  )}
                </p>
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

              {errors.submit && (
                <p data-error className="text-sm text-red-600" role="alert">
                  {errors.submit}
                </p>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isCompressing}
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
                    <span>{errors.submit ? "Coba Lagi" : "Kirim Laporan"}</span>
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
            <p className="text-xs text-text-muted">
              Setelah foto dipilih, lokasi perangkat akan diminta untuk membantu mengisi perkiraan alamat. Analisis foto oleh AI hanya berjalan jika Anda menekan tombol analisis.
            </p>

            {formData.photos.length === 0 ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-surface/50 transition-colors bg-background">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-10 w-10 text-text-muted mb-3" />
                  <p className="mb-2 text-sm text-text">
                    <span className="font-semibold">Ambil foto dengan kamera</span>
                  </p>
                  <p className="text-xs text-text-muted">Foto akan dikompres otomatis, maksimal 3 foto</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onClick={(event) => event.stopPropagation()}
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
                      onClick={(event) => event.stopPropagation()}
                      onChange={handleFileSelect}
                    />
                  </label>
                )}
              </div>
            )}

            {formData.photos.length > 0 && (
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => formData.photos[0] && analyzePhoto(formData.photos[0])}
                  disabled={isAnalyzingPhoto || isSubmitting || isCompressing}
                  className="gap-2"
                >
                  <IconSparkle className="h-4 w-4" />
                  <span>{isAnalyzingPhoto ? "Sedang menganalisis..." : "Analisis dengan AI"}</span>
                </Button>
                {isAnalyzingPhoto && (
                  <p role="status" className="text-sm text-text-muted">
                    AI sedang meninjau foto pertama. Anda tetap dapat mengedit semua field.
                  </p>
                )}
                {photoAnalysisMessage && (
                  <p role={photoAnalysis ? "status" : "alert"} className="text-sm text-text-muted">
                    {photoAnalysisMessage}
                  </p>
                )}
                {photoAnalysis && (
                  <div className="space-y-3 rounded-lg border border-primary/20 bg-primary-soft/30 p-4">
                    <div>
                      <p className="text-sm font-semibold text-text">Saran AI — sudah diisikan ke field yang kosong</p>
                      <p className="text-xs text-text-muted">
                        {photoAnalysis.provider} · {photoAnalysis.model}
                        {photoAnalysis.analysis.confidence !== null
                          && photoAnalysis.analysis.confidence !== undefined
                          && ` · Confidence ${Math.round(photoAnalysis.analysis.confidence * 100)}% (bukan jaminan kebenaran)`}
                      </p>
                    </div>
                    <p className="text-sm text-text">
                      Kategori: {CATEGORIES.find((category) => category.value === photoAnalysis.analysis.category)?.label}
                    </p>
                    <p className="text-sm text-text">{photoAnalysis.analysis.title}</p>
                    <p className="text-sm text-text">{photoAnalysis.analysis.description}</p>
                    <p className="text-xs text-text-muted">
                      Saran kategori AI belum dievaluasi terhadap dataset berlabel. Tinjau dan edit semua field sebelum mengirim laporan.
                    </p>
                  </div>
                )}
              </div>
            )}

            {isCompressing && (
              <p className="text-sm text-text-muted">Memproses foto...</p>
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
            <p className="text-xs text-text-muted">
              Setelah lokasi perangkat diperoleh, koordinat dikirim ke OpenStreetMap untuk mencari perkiraan alamat. Periksa dan edit hasilnya; pelaporan tetap dapat dilanjutkan jika pencarian gagal.
            </p>

            {/* Detail Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text block">
                Detail Alamat / Lokasi Kerusakan <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.detailLocation}
                onChange={(e) => {
                  markFieldAsManuallyEdited("detailLocation");
                  setFormData({ ...formData, detailLocation: e.target.value });
                  const newErrors = { ...errors };
                  delete newErrors.detailLocation;
                  setErrors(newErrors);
                }}
                rows={4}
                placeholder="Contoh: Jalan Raya Pati-Tayu KM 12, Kecamatan Gabus, depan Pasar Desa Tanjang, sebelah Masjid Al-Ikhlas"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-text leading-relaxed"
              />
              {isResolvingLocation && (
                <p role="status" className="text-xs text-text-muted">
                  Mencari perkiraan alamat dari koordinat GPS...
                </p>
              )}
              {locationMessage && (
                <p role="status" className="text-xs text-text-muted">
                  {locationMessage}
                  {locationMessage.includes("OpenStreetMap") && (
                    <> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">© OpenStreetMap contributors</a></>
                  )}
                </p>
              )}
              {formData.photos.length > 0
                && (formData.latitude === null || formData.longitude === null)
                && !isResolvingLocation && (
                  <Button type="button" variant="outline" onClick={requestDeviceLocation}>
                    Coba deteksi lokasi lagi
                  </Button>
                )}
              {errors.location && (
                <p data-error className="text-xs text-red-600">{errors.location}</p>
              )}
              {aiFilledFields.has("detailLocation") && (
                <p className="text-xs text-primary">Perkiraan alamat otomatis dari GPS · dapat diedit</p>
              )}
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
                  markFieldAsManuallyEdited("title");
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
              {aiFilledFields.has("title") && (
                <p className="text-xs text-primary">Diisi sebagai draf oleh AI · dapat diedit</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text block">
                Kategori Kerusakan <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  markFieldAsManuallyEdited("category");
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
              {aiFilledFields.has("category") && (
                <p className="text-xs text-primary">Dipilih sebagai saran AI · dapat diedit</p>
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
                  markFieldAsManuallyEdited("description");
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
              {aiFilledFields.has("description") && (
                <p className="text-xs text-primary">Diisi sebagai draf oleh AI · dapat diedit</p>
              )}
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
                disabled={isCompressing}
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
                disabled={isSubmitting || isCompressing}
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
                    <span>{errors.submit ? "Coba Lagi" : "Kirim Laporan"}</span>
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
