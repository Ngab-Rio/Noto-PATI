import { describe, it, expect } from "vitest";
import {
  THEME_COLORS,
  REPORT_STATUS_CONFIG,
  normalizeReportStatus,
} from "../theme";

describe("Noto PATI Theme & Style Guide Configuration", () => {
  it("harus memiliki palet Brand sesuai spesifikasi Style Guide", () => {
    expect(THEME_COLORS.brand.primary.hex).toBe("#3B6EA5");
    expect(THEME_COLORS.brand.primaryDark.hex).toBe("#2F5F95");
    expect(THEME_COLORS.brand.primarySoft.hex).toBe("#E3EEF8");
    expect(THEME_COLORS.brand.accent.hex).toBe("#A8532E");
    expect(THEME_COLORS.brand.accentSoft.hex).toBe("#FCEBDF");
  });

  it("harus memiliki palet Neutral sesuai spesifikasi Style Guide", () => {
    expect(THEME_COLORS.neutral.background.hex).toBe("#F6F9FC");
    expect(THEME_COLORS.neutral.surface.hex).toBe("#FFFFFF");
    expect(THEME_COLORS.neutral.border.hex).toBe("#DCE5EE");
    expect(THEME_COLORS.neutral.text.hex).toBe("#1F2D3D");
    expect(THEME_COLORS.neutral.textMuted.hex).toBe("#556577");
    expect(THEME_COLORS.neutral.textOnPrimary.hex).toBe("#FFFFFF");
  });

  it("harus memiliki 4 Status Utama dengan warna WCAG AA yang tepat", () => {
    // Diterima
    expect(REPORT_STATUS_CONFIG.diterima.textColor).toBe("#2C6A93");
    expect(REPORT_STATUS_CONFIG.diterima.bgColor).toBe("#E1F0F8");

    // Diverifikasi
    expect(REPORT_STATUS_CONFIG.diverifikasi.textColor).toBe("#2F6568");
    expect(REPORT_STATUS_CONFIG.diverifikasi.bgColor).toBe("#DDEFEF");

    // Diproses
    expect(REPORT_STATUS_CONFIG.diproses.textColor).toBe("#7A5A12");
    expect(REPORT_STATUS_CONFIG.diproses.bgColor).toBe("#FBF0D2");

    // Selesai
    expect(REPORT_STATUS_CONFIG.selesai.textColor).toBe("#2E6B45");
    expect(REPORT_STATUS_CONFIG.selesai.bgColor).toBe("#DDEFE2");
  });

  it("harus memiliki 4 Status Lainnya dengan warna WCAG AA yang tepat", () => {
    // Dibuka Kembali
    expect(REPORT_STATUS_CONFIG.dibuka_kembali.textColor).toBe("#9A4D22");
    expect(REPORT_STATUS_CONFIG.dibuka_kembali.bgColor).toBe("#FBE6D6");

    // Ditolak
    expect(REPORT_STATUS_CONFIG.ditolak.textColor).toBe("#8F3A3A");
    expect(REPORT_STATUS_CONFIG.ditolak.bgColor).toBe("#F7DEDE");

    // Digabung
    expect(REPORT_STATUS_CONFIG.digabung.textColor).toBe("#594B86");
    expect(REPORT_STATUS_CONFIG.digabung.bgColor).toBe("#E9E5F3");

    // Ditutup
    expect(REPORT_STATUS_CONFIG.ditutup.textColor).toBe("#5A5953");
    expect(REPORT_STATUS_CONFIG.ditutup.bgColor).toBe("#ECEBE8");
  });

  it("normalizeReportStatus harus memetakan alias dan format case-insensitive", () => {
    expect(normalizeReportStatus("DITERIMA")).toBe("diterima");
    expect(normalizeReportStatus("Dibuka Kembali")).toBe("dibuka_kembali");
    expect(normalizeReportStatus("in_progress")).toBe("diproses");
    expect(normalizeReportStatus("done")).toBe("selesai");
    expect(normalizeReportStatus("unknown_status")).toBe("diterima");
  });
});
