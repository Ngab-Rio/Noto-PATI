import { describe, it, expect } from "vitest";
import {
  calculateSlaStage,
  calculateReportSla,
  formatRemainingTime,
  formatDueDate,
} from "./sla";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NOW = "2026-01-10T12:00:00Z";
const FUTURE = "2026-01-11T12:00:00Z"; // +24 jam dari NOW
const PAST = "2026-01-09T12:00:00Z"; // -24 jam dari NOW
const FAR_FUTURE = "2026-01-17T12:00:00Z"; // +7 hari dari NOW

// ---------------------------------------------------------------------------
// calculateSlaStage
// ---------------------------------------------------------------------------

describe("calculateSlaStage", () => {
  describe("status diterima (SLA verifikasi)", () => {
    it("mengembalikan in_target saat tenggat belum lewat", () => {
      const result = calculateSlaStage("diterima", FUTURE, NOW);
      expect(result.kind).toBe("verification");
      expect(result.state).toBe("in_target");
      expect(result.dueAt).toBe(FUTURE);
      expect(result.remainingMs).toBe(86_400_000); // 24 jam
    });

    it("mengembalikan overdue saat tenggat sudah lewat", () => {
      const result = calculateSlaStage("diterima", PAST, NOW);
      expect(result.state).toBe("overdue");
      expect(result.remainingMs).toBe(-86_400_000); // -24 jam
    });

    it("mengembalikan not_applicable saat dueAt null", () => {
      const result = calculateSlaStage("diterima", null, NOW);
      expect(result.state).toBe("not_applicable");
      expect(result.dueAt).toBeNull();
      expect(result.remainingMs).toBeNull();
    });

    it("mengembalikan not_applicable saat dueAt undefined", () => {
      const result = calculateSlaStage("diterima", undefined, NOW);
      expect(result.state).toBe("not_applicable");
    });

    it("mengembalikan not_applicable saat tanggal tidak valid", () => {
      expect(calculateSlaStage("diterima", "bukan-tanggal", NOW).state).toBe(
        "not_applicable",
      );
      expect(calculateSlaStage("diterima", FUTURE, "bukan-tanggal").state).toBe(
        "not_applicable",
      );
    });
  });

  describe("status diverifikasi / diproses (SLA penyelesaian)", () => {
    it("diverifikasi — in_target saat tenggat belum lewat", () => {
      const result = calculateSlaStage("diverifikasi", FAR_FUTURE, NOW);
      expect(result.kind).toBe("handling");
      expect(result.state).toBe("in_target");
    });

    it("diproses — in_target menggunakan tenggat yang sama dengan diverifikasi", () => {
      const result = calculateSlaStage("diproses", FAR_FUTURE, NOW);
      expect(result.kind).toBe("handling");
      expect(result.state).toBe("in_target");
    });

    it("diverifikasi — overdue saat tenggat sudah lewat", () => {
      const result = calculateSlaStage("diverifikasi", PAST, NOW);
      expect(result.state).toBe("overdue");
      expect(result.remainingMs).toBeLessThan(0);
    });
  });

  describe("status selesai", () => {
    it("completed_on_time saat diselesaikan sebelum tenggat", () => {
      const completedAt = "2026-01-10T06:00:00Z"; // 6 jam sebelum NOW, dueAt = FUTURE
      const result = calculateSlaStage("selesai", FUTURE, NOW, completedAt);
      expect(result.state).toBe("completed_on_time");
      expect(result.remainingMs).toBeNull();
    });

    it("completed_on_time saat diselesaikan tepat pada tenggat", () => {
      const completedAt = FUTURE; // tepat sama dengan dueAt
      const result = calculateSlaStage("selesai", FUTURE, NOW, completedAt);
      expect(result.state).toBe("completed_on_time");
    });

    it("completed_late saat diselesaikan setelah tenggat", () => {
      const completedAt = "2026-01-12T12:00:00Z"; // setelah FUTURE
      const result = calculateSlaStage("selesai", FUTURE, NOW, completedAt);
      expect(result.state).toBe("completed_late");
    });

    it("not_applicable saat completedAt tidak tersedia", () => {
      const result = calculateSlaStage("selesai", FUTURE, NOW);
      expect(result.state).toBe("not_applicable");
      expect(result.remainingMs).toBeNull();
    });

    it("not_applicable saat dueAt atau completedAt tidak valid", () => {
      expect(calculateSlaStage("selesai", "bukan-tanggal", NOW, NOW).state).toBe(
        "not_applicable",
      );
      expect(calculateSlaStage("selesai", FUTURE, NOW, "bukan-tanggal").state).toBe(
        "not_applicable",
      );
    });

    it("not_applicable saat dueAt null", () => {
      const result = calculateSlaStage("selesai", null, NOW, NOW);
      expect(result.state).toBe("not_applicable");
    });
  });

  describe("status terminal (ditolak & digabung)", () => {
    it("ditolak — not_applicable", () => {
      const result = calculateSlaStage("ditolak", FUTURE, NOW);
      expect(result.state).toBe("not_applicable");
      expect(result.remainingMs).toBeNull();
    });

    it("digabung — not_applicable", () => {
      const result = calculateSlaStage("digabung", FUTURE, NOW);
      expect(result.state).toBe("not_applicable");
    });
  });
});

// ---------------------------------------------------------------------------
// calculateReportSla
// ---------------------------------------------------------------------------

describe("calculateReportSla", () => {
  it("laporan diterima: gunakan verificationDueAt", () => {
    const result = calculateReportSla(
      {
        status: "diterima",
        verificationDueAt: FUTURE,
        handlingDueAt: null,
        completedAt: null,
      },
      NOW,
    );
    expect(result.kind).toBe("verification");
    expect(result.state).toBe("in_target");
    expect(result.dueAt).toBe(FUTURE);
  });

  it("laporan diterima tanpa verificationDueAt — not_applicable", () => {
    const result = calculateReportSla(
      {
        status: "diterima",
        verificationDueAt: null,
        handlingDueAt: FAR_FUTURE,
        completedAt: null,
      },
      NOW,
    );
    expect(result.state).toBe("not_applicable");
    expect(result.dueAt).toBeNull();
  });

  it("laporan diverifikasi: gunakan handlingDueAt", () => {
    const result = calculateReportSla(
      {
        status: "diverifikasi",
        verificationDueAt: PAST,
        handlingDueAt: FAR_FUTURE,
        completedAt: null,
      },
      NOW,
    );
    expect(result.kind).toBe("handling");
    expect(result.state).toBe("in_target");
    expect(result.dueAt).toBe(FAR_FUTURE);
  });

  it("laporan diproses: gunakan handlingDueAt yang sama", () => {
    const result = calculateReportSla(
      {
        status: "diproses",
        verificationDueAt: PAST,
        handlingDueAt: FAR_FUTURE,
        completedAt: null,
      },
      NOW,
    );
    expect(result.kind).toBe("handling");
    expect(result.state).toBe("in_target");
  });

  it("laporan diproses tanpa handlingDueAt — not_applicable", () => {
    const result = calculateReportSla(
      {
        status: "diproses",
        verificationDueAt: PAST,
        handlingDueAt: null,
        completedAt: null,
      },
      NOW,
    );
    expect(result.state).toBe("not_applicable");
    expect(result.dueAt).toBeNull();
  });

  it("laporan selesai tepat waktu", () => {
    const completedAt = "2026-01-11T10:00:00Z"; // sebelum FAR_FUTURE
    const result = calculateReportSla(
      {
        status: "selesai",
        verificationDueAt: null,
        handlingDueAt: FAR_FUTURE,
        completedAt,
      },
      NOW,
    );
    expect(result.state).toBe("completed_on_time");
  });

  it("laporan selesai terlambat", () => {
    const completedAt = "2026-01-20T12:00:00Z"; // setelah FAR_FUTURE
    const result = calculateReportSla(
      {
        status: "selesai",
        verificationDueAt: null,
        handlingDueAt: FAR_FUTURE,
        completedAt,
      },
      NOW,
    );
    expect(result.state).toBe("completed_late");
  });

  it("laporan selesai tanpa handlingDueAt — not_applicable", () => {
    const result = calculateReportSla(
      {
        status: "selesai",
        verificationDueAt: null,
        handlingDueAt: null,
        completedAt: NOW,
      },
      NOW,
    );
    expect(result.state).toBe("not_applicable");
  });

  it("laporan ditolak — not_applicable", () => {
    const result = calculateReportSla(
      {
        status: "ditolak",
        verificationDueAt: FUTURE,
        handlingDueAt: FAR_FUTURE,
        completedAt: null,
      },
      NOW,
    );
    expect(result.state).toBe("not_applicable");
  });

  it("laporan digabung — not_applicable (SLA mengikuti laporan utama)", () => {
    const result = calculateReportSla(
      {
        status: "digabung",
        verificationDueAt: FUTURE,
        handlingDueAt: FAR_FUTURE,
        completedAt: null,
      },
      NOW,
    );
    expect(result.state).toBe("not_applicable");
  });

  it("data timestamp tidak lengkap (semua null) — not_applicable", () => {
    const result = calculateReportSla(
      {
        status: "diterima",
        verificationDueAt: null,
        handlingDueAt: null,
        completedAt: null,
      },
      NOW,
    );
    expect(result.state).toBe("not_applicable");
  });
});

// ---------------------------------------------------------------------------
// formatRemainingTime
// ---------------------------------------------------------------------------

describe("formatRemainingTime", () => {
  it("null → 'Belum tersedia'", () => {
    expect(formatRemainingTime(null)).toBe("Belum tersedia");
  });

  it("86_400_000 ms → '1 hari'", () => {
    expect(formatRemainingTime(86_400_000)).toBe("1 hari");
  });

  it("90_000_000 ms → '1 hari 1 jam'", () => {
    expect(formatRemainingTime(90_000_000)).toBe("1 hari 1 jam");
  });

  it("3_600_000 ms → '1 jam'", () => {
    expect(formatRemainingTime(3_600_000)).toBe("1 jam");
  });

  it("3_900_000 ms → '1 jam 5 mnt'", () => {
    expect(formatRemainingTime(3_900_000)).toBe("1 jam 5 mnt");
  });

  it("nilai negatif diproses sebagai absolut", () => {
    expect(formatRemainingTime(-86_400_000)).toBe("1 hari");
  });

  it("0 ms → '0 menit'", () => {
    expect(formatRemainingTime(0)).toBe("0 menit");
  });
});

// ---------------------------------------------------------------------------
// formatDueDate
// ---------------------------------------------------------------------------

describe("formatDueDate", () => {
  it("null → 'Tidak diketahui'", () => {
    expect(formatDueDate(null)).toBe("Tidak diketahui");
  });

  it("ISO string → format tanggal lokal", () => {
    const result = formatDueDate("2026-01-11T12:00:00Z");
    // Memastikan output adalah string non-kosong dan berisi angka tahun
    expect(typeof result).toBe("string");
    expect(result).toContain("2026");
  });

  it("tanggal tidak valid → 'Tidak diketahui'", () => {
    expect(formatDueDate("bukan-tanggal")).toBe("Tidak diketahui");
  });
});

