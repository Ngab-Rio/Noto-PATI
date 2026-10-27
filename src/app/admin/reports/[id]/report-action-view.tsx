"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Users,
  Timer,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  Send,
  Upload,
  ExternalLink,
  Info,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import type { AdminReportItem } from "@/features/admin/types";
import type { ReportStatusKey } from "@/config/theme";

interface ReportActionViewProps {
  report: AdminReportItem;
}

export function ReportActionView({ report: initialReport }: ReportActionViewProps) {
  const [report, setReport] = useState<AdminReportItem>(initialReport);
  const [activeAction, setActiveAction] = useState<
    "verify" | "progress" | "reject" | "merge"
  >(
    initialReport.status === "diterima"
      ? "verify"
      : initialReport.status === "diverifikasi" || initialReport.status === "diproses"
      ? "progress"
      : "verify"
  );

  // Form states
  const [notes, setNotes] = useState("");
  const [targetDays, setTargetDays] = useState("7");
  const [rejectReason, setRejectReason] = useState("bukan_kewenangan");
  const [progressStatus, setProgressStatus] = useState<ReportStatusKey>(
    initialReport.status === "diverifikasi" ? "diproses" : "selesai"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Handle Verify Action
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newTimelineItem = {
        id: `tl-${Date.now()}`,
        status: "diverifikasi" as ReportStatusKey,
        actor: "Admin (Anda)",
        role: "admin" as const,
        note:
          notes.trim() ||
          `Laporan telah diverifikasi valid. Estimasi penanganan ${targetDays} hari kerja.`,
        timestamp: "Baru saja",
      };

      setReport((prev) => ({
        ...prev,
        status: "diverifikasi",
        dueDateLabel: `Tenggat penanganan: ${targetDays} hari lagi`,
        isOverdue: false,
        timeline: [newTimelineItem, ...prev.timeline],
      }));

      setIsSubmitting(false);
      setActionSuccessMessage(
        "Laporan berhasil diverifikasi! Status laporan kini berubah menjadi Diverifikasi."
      );
      setNotes("");
    }, 600);
  };

  // Handle Progress / Finish Action
  const handleUpdateProgress = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newTimelineItem = {
        id: `tl-${Date.now()}`,
        status: progressStatus,
        actor: "Admin (Anda)",
        role: "admin" as const,
        note:
          notes.trim() ||
          (progressStatus === "selesai"
            ? "Pekerjaan perbaikan infrastruktur telah selesai 100% dan lolos inspeksi fisik."
            : "Tim lapangan sedang melakukan pengerjaan fisik di lokasi."),
        timestamp: "Baru saja",
      };

      setReport((prev) => ({
        ...prev,
        status: progressStatus,
        dueDateLabel:
          progressStatus === "selesai" ? "Tuntas dalam SLA" : prev.dueDateLabel,
        isOverdue: false,
        timeline: [newTimelineItem, ...prev.timeline],
      }));

      setIsSubmitting(false);
      setActionSuccessMessage(
        `Status berhasil diperbarui menjadi ${
          progressStatus === "selesai" ? "Selesai" : "Diproses"
        }!`
      );
      setNotes("");
    }, 600);
  };

  // Handle Reject Action
  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      alert("Alasan penolakan wajib diisi untuk transparansi pelapor.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const reasonLabels: Record<string, string> = {
        bukan_kewenangan: "Bukan merupakan kewenangan Pemkab Pati (Jalur Nasional/Swasta)",
        foto_tidak_jelas: "Foto kerusakan tidak jelas / tidak menunjukkan objek infrastruktur",
        lokasi_tidak_valid: "Lokasi tidak dapat ditemukan atau tidak akurat",
        laporan_palsu: "Laporan dinyatakan tidak berdasar setelah verifikasi lapangan",
      };

      const newTimelineItem = {
        id: `tl-${Date.now()}`,
        status: "ditolak" as ReportStatusKey,
        actor: "Admin (Anda)",
        role: "admin" as const,
        note: `Alasan penolakan: ${reasonLabels[rejectReason] || rejectReason}. Catatan: ${notes}`,
        timestamp: "Baru saja",
      };

      setReport((prev) => ({
        ...prev,
        status: "ditolak",
        dueDateLabel: undefined,
        isOverdue: false,
        timeline: [newTimelineItem, ...prev.timeline],
      }));

      setIsSubmitting(false);
      setActionSuccessMessage(
        "Laporan ditolak. Alasan penolakan telah tercatat pada linimasa publik."
      );
      setNotes("");
    }, 600);
  };

  // Handle Merge Action
  const handleMerge = (targetTicket: string) => {
    if (!confirm(`Gabungkan laporan ini ke tiket utama ${targetTicket}?`)) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newTimelineItem = {
        id: `tl-${Date.now()}`,
        status: "digabung" as ReportStatusKey,
        actor: "Admin (Anda)",
        role: "admin" as const,
        note: `Laporan digabung ke tiket laporan serupa ${targetTicket} berdasarkan kesamaan lokasi dan objek.`,
        timestamp: "Baru saja",
      };

      setReport((prev) => ({
        ...prev,
        status: "digabung",
        dueDateLabel: undefined,
        isOverdue: false,
        timeline: [newTimelineItem, ...prev.timeline],
      }));

      setIsSubmitting(false);
      setActionSuccessMessage(`Laporan berhasil digabungkan ke ${targetTicket}!`);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Navigation & Status Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
            <Link
              href="/admin/reports"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kelola Laporan</span>
            </Link>
            <span>/</span>
            <span className="font-mono text-text">{report.ticketNumber}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-text">
              {report.title}
            </h1>
            <StatusBadge status={report.status} size="md" />
            {report.priority === "tinggi" && (
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-status-ditolak-bg text-status-ditolak-text">
                Prioritas Tinggi
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {report.dueDateLabel && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                report.isOverdue
                  ? "bg-status-ditolak-bg border-status-ditolak-text/30 text-status-ditolak-text"
                  : "bg-status-diverifikasi-bg border-status-diverifikasi-text/30 text-status-diverifikasi-text"
              }`}
            >
              <Timer className="h-4 w-4" />
              <span>{report.dueDateLabel}</span>
            </span>
          )}
        </div>
      </div>

      {/* ── Success Alert ── */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-xl border border-status-selesai-text/30 bg-status-selesai-bg text-status-selesai-text text-sm font-semibold flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* ── 2-Column Layout: Details vs Admin Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── Left 2 Columns: Report Information ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Main Details Card */}
          <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-text border-b border-border/60 pb-3">
              Informasi Pengaduan Warga
            </h2>

            {/* Description */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Deskripsi Kerusakan
              </h3>
              <p className="text-sm text-text leading-relaxed whitespace-pre-line">
                {report.description}
              </p>
            </div>

            {/* Photos */}
            {report.images.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Dokumentasi Foto Lapangan ({report.images.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {report.images.map((img, i) => (
                    <a
                      key={i}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-4/3 rounded-lg overflow-hidden border border-border bg-background block"
                    >
                      <Image
                        src={img}
                        alt={`Foto laporan ${i + 1}`}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                        <ExternalLink className="h-4 w-4" />
                        <span>Perbesar</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/60 text-xs">
              <div>
                <span className="text-text-muted">Kategori Infrastruktur:</span>
                <p className="font-semibold text-text mt-0.5">{report.category}</p>
              </div>

              <div>
                <span className="text-text-muted">Dinas Penanggung Jawab:</span>
                <p className="font-semibold text-text mt-0.5">
                  {report.assignedDinas || "DPUPR Kab. Pati"}
                </p>
              </div>

              <div>
                <span className="text-text-muted">Lokasi / Alamat:</span>
                <p className="font-semibold text-text mt-0.5 flex items-start gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{report.location}</span>
                </p>
              </div>

              <div>
                <span className="text-text-muted">Koordinat GPS:</span>
                <p className="font-mono text-text mt-0.5">
                  {report.coordinates.lat.toFixed(5)},{" "}
                  {report.coordinates.lng.toFixed(5)}{" "}
                  <span className="text-status-selesai-text font-sans font-semibold">
                    (Valid PostGIS)
                  </span>
                </p>
              </div>

              <div>
                <span className="text-text-muted">Pelapor:</span>
                <p className="font-semibold text-text mt-0.5 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-text-muted" />
                  <span>{report.reporterName}</span>
                </p>
              </div>

              <div>
                <span className="text-text-muted">Kontak Pelapor:</span>
                <p className="font-semibold text-text mt-0.5 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-text-muted" />
                  <span>{report.reporterPhone || "0812-XXXX-XXXX"}</span>
                </p>
              </div>

              <div>
                <span className="text-text-muted">Dukungan Masyarakat:</span>
                <p className="font-semibold text-text mt-0.5 flex items-center gap-1 text-primary">
                  <Users className="h-3.5 w-3.5" />
                  <span>{report.supportCount} warga mengonfirmasi</span>
                </p>
              </div>

              <div>
                <span className="text-text-muted">Waktu Pengiriman:</span>
                <p className="font-semibold text-text mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-text-muted" />
                  <span>{report.submittedAt}</span>
                </p>
              </div>
            </div>
          </div>

          {/* 2. Duplicate Detection Assistance (FR-10) */}
          {report.duplicateCandidates && report.duplicateCandidates.length > 0 && (
            <div className="rounded-xl border border-accent/30 bg-accent-soft/30 p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <Layers className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-accent">
                    Bantuan Deteksi Duplikat (FR-10)
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Sistem mendeteksi {report.duplicateCandidates.length} laporan serupa
                    dalam radius 100 meter dengan kategori yang sama:
                  </p>

                  <div className="mt-3 space-y-2">
                    {report.duplicateCandidates.map((dup) => (
                      <div
                        key={dup.id}
                        className="bg-surface rounded-lg border border-border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-primary">
                              {dup.ticketNumber}
                            </span>
                            <span className="text-text-muted">
                              ({dup.distanceMeters}m dari lokasi ini)
                            </span>
                          </div>
                          <p className="font-medium text-text mt-0.5">{dup.title}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMerge(dup.ticketNumber)}
                          disabled={isSubmitting || report.status === "digabung"}
                          className="text-xs font-semibold shrink-0 h-8"
                        >
                          Gabung ke Tiket Ini
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Status History Timeline (FR-08) */}
          <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-xs">
            <h2 className="text-base font-bold text-text mb-4 pb-2 border-b border-border/60 flex items-center justify-between">
              <span>Linimasa Riwayat Status (Audit Trail FR-08)</span>
              <span className="text-xs text-text-muted font-normal">
                {report.timeline.length} peristiwa tercatat
              </span>
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {report.timeline.map((item, index) => (
                <div key={item.id} className="relative">
                  {/* Dot */}
                  <div
                    className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-surface ${
                      index === 0 ? "bg-primary ring-4 ring-primary-soft" : "bg-text-muted"
                    }`}
                  />

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={item.status} size="sm" />
                      <span className="text-xs font-bold text-text">{item.actor}</span>
                      <span className="text-[11px] text-text-muted">· {item.timestamp}</span>
                    </div>

                    {item.note && (
                      <p className="text-xs text-text-muted mt-1.5 leading-relaxed bg-background/60 p-2.5 rounded-lg border border-border/50">
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column: Admin Action Panel ── */}
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-xs sticky top-32">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-text">Tindakan Petugas</h2>
            </div>

            {/* Action Navigation Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-background rounded-lg border border-border mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveAction("verify")}
                className={`py-2 rounded text-center transition-all ${
                  activeAction === "verify"
                    ? "bg-surface text-primary shadow-xs"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Verifikasi
              </button>
              <button
                type="button"
                onClick={() => setActiveAction("progress")}
                className={`py-2 rounded text-center transition-all ${
                  activeAction === "progress"
                    ? "bg-surface text-primary shadow-xs"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Progres/Selesai
              </button>
              <button
                type="button"
                onClick={() => setActiveAction("reject")}
                className={`py-2 rounded text-center transition-all ${
                  activeAction === "reject"
                    ? "bg-surface text-status-ditolak-text shadow-xs"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Tolak
              </button>
            </div>

            {/* TAB 1: VERIFIKASI */}
            {activeAction === "verify" && (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="p-3 rounded-lg bg-status-diverifikasi-bg/50 border border-status-diverifikasi-text/20 text-xs text-status-diverifikasi-text">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      Verifikasi mengubah status menjadi <strong>Diverifikasi</strong> dan
                      menetapkan tenggat penanganan kepada dinas terkait.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Estimasi Waktu Penanganan (SLA Demo)
                  </label>
                  <select
                    value={targetDays}
                    onChange={(e) => setTargetDays(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="3">3 Hari Kalender (Prioritas Cepat)</option>
                    <option value="7">7 Hari Kalender (Standar SLA)</option>
                    <option value="14">14 Hari Kalender (Perlu Tender/Material)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Catatan Verifikasi (Tampil di Linimasa Warga)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Tim teknis DPUPR telah meninjau fisik ke lokasi. Masuk program penambalan aspal."
                    className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || report.status === "diverifikasi"}
                  className="w-full text-xs font-semibold h-9 gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {report.status === "diverifikasi"
                      ? "Sudah Diverifikasi"
                      : "Konfirmasi Verifikasi Laporan"}
                  </span>
                </Button>
              </form>
            )}

            {/* TAB 2: UPDATE PROGRES / SELESAI */}
            {activeAction === "progress" && (
              <form onSubmit={handleUpdateProgress} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Pilih Status Baru
                  </label>
                  <select
                    value={progressStatus}
                    onChange={(e) => setProgressStatus(e.target.value as ReportStatusKey)}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="diproses">Diproses (Sedang Dikerjakan di Lapangan)</option>
                    <option value="selesai">Selesai (Perbaikan Tuntas 100%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Catatan Progres Pengerjaan
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tuliskan perkembangan perbaikan fisik atau hasil akhir penyelesaian..."
                    className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {progressStatus === "selesai" && (
                  <div className="p-3 rounded-lg border border-dashed border-border bg-background text-center">
                    <Upload className="h-4 w-4 mx-auto text-text-muted mb-1" />
                    <span className="text-[11px] text-text font-medium block">
                      Unggah Foto Bukti Penanganan Selesai
                    </span>
                    <span className="text-[10px] text-text-muted">
                      JPG/PNG maks. 5MB (Simulasi)
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || report.status === "selesai"}
                  className="w-full text-xs font-semibold h-9 gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  <span>
                    Simpan Perubahan ke {progressStatus === "selesai" ? "Selesai" : "Diproses"}
                  </span>
                </Button>
              </form>
            )}

            {/* TAB 3: TOLAK LAPORAN */}
            {activeAction === "reject" && (
              <form onSubmit={handleReject} className="space-y-4">
                <div className="p-3 rounded-lg bg-status-ditolak-bg/50 border border-status-ditolak-text/20 text-xs text-status-ditolak-text">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      Sesuai PRD FR-07, penolakan laporan <strong>wajib</strong> menyertakan
                      kategori alasan dan keterangan rinci kepada pelapor.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Alasan Penolakan
                  </label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="bukan_kewenangan">
                      Bukan Kewenangan Pemkab (Jalur Nasional/Provinsi)
                    </option>
                    <option value="foto_tidak_jelas">Foto Tidak Jelas / Kurang Bukti</option>
                    <option value="lokasi_tidak_valid">Lokasi Tidak Akurat / Tidak Ditemukan</option>
                    <option value="laporan_palsu">Laporan Palsu / Tidak Ditemukan Kerusakan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Uraian Penjelasan Penolakan <span className="text-status-ditolak-text">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    required
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Jelaskan secara sopan alasan penolakan agar pelapor memahami keputusannya..."
                    className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isSubmitting || report.status === "ditolak"}
                  className="w-full text-xs font-semibold h-9 gap-1.5"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Tolak Laporan Ini</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
