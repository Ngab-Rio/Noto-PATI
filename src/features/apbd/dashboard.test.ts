import { describe, expect, it } from "vitest";

import {
  aggregateBelanjaAllocation,
  calculateApbdSummary,
  calculateShare,
  clampPercentage,
  formatPercentage,
  formatRupiah,
  formatRupiahCompact,
  selectApbdReport,
  type ApbdAccountRow,
  type ApbdReportSnapshot,
} from "./dashboard";

function account(
  row_index: number,
  akun: string,
  anggaran: number | null,
  realisasi: number | null,
  is_total_row = false,
): ApbdAccountRow {
  return {
    row_index,
    akun,
    anggaran,
    realisasi,
    persentase: null,
    is_total_row,
  };
}

function report(
  overrides: Partial<ApbdReportSnapshot> = {},
): ApbdReportSnapshot {
  return {
    id: "report-1",
    budget_year: 2026,
    period_month: 11,
    period_name: "November",
    provinsi_name: "Provinsi Jawa Tengah",
    pemda_name: "Kab. Pati",
    source_url: "https://example.test/source",
    download_url: "https://example.test/download",
    fetched_at: "2026-11-05T15:45:00.974Z",
    keterangan_portal: null,
    total_belanja_anggaran: 2_867_861_122_000,
    total_belanja_realisasi: 2_003_417_247_800,
    ...overrides,
  };
}

describe("calculateApbdSummary", () => {
  it("menghitung sisa dan persentase dari total resmi laporan", () => {
    const summary = calculateApbdSummary(report());

    expect(summary.pagu).toBe(2_867_861_122_000);
    expect(summary.realisasi).toBe(2_003_417_247_800);
    expect(summary.sisa).toBe(864_443_874_200);
    expect(summary.persentase).toBeCloseTo(69.858, 3);
    expect(summary.progressPercent).toBeCloseTo(69.858, 3);
  });

  it("membatasi progress bar pada 0–100 tanpa mengubah persentase asli", () => {
    const summary = calculateApbdSummary(
      report({
        total_belanja_anggaran: 100,
        total_belanja_realisasi: 120,
      }),
    );

    expect(summary.persentase).toBe(120);
    expect(summary.progressPercent).toBe(100);
  });

  it("mengembalikan null bila total tidak lengkap atau pagu nol", () => {
    expect(
      calculateApbdSummary(
        report({ total_belanja_anggaran: null, total_belanja_realisasi: 10 }),
      ),
    ).toMatchObject({ sisa: null, persentase: null, progressPercent: null });

    expect(
      calculateApbdSummary(
        report({ total_belanja_anggaran: 100, total_belanja_realisasi: null }),
      ),
    ).toMatchObject({ sisa: null, persentase: null, progressPercent: null });

    expect(
      calculateApbdSummary(
        report({ total_belanja_anggaran: 0, total_belanja_realisasi: 10 }),
      ),
    ).toMatchObject({ sisa: -10, persentase: null, progressPercent: null });
  });
});

describe("clampPercentage", () => {
  it("membatasi nilai ke rentang 0–100", () => {
    expect(clampPercentage(-5)).toBe(0);
    expect(clampPercentage(69.87)).toBe(69.87);
    expect(clampPercentage(120)).toBe(100);
  });

  it("mengembalikan 0 untuk nilai kosong", () => {
    expect(clampPercentage(null)).toBe(0);
    expect(clampPercentage(Number.NaN)).toBe(0);
  });
});

describe("calculateShare", () => {
  it("menghitung porsi terhadap total", () => {
    expect(calculateShare(400, 1_000)).toBe(40);
  });

  it("mengembalikan null untuk total nol atau nilai kosong", () => {
    expect(calculateShare(100, 0)).toBeNull();
    expect(calculateShare(null, 1_000)).toBeNull();
    expect(calculateShare(100, null)).toBeNull();
  });
});

describe("selectApbdReport", () => {
  const reports = [
    report({ id: "latest", budget_year: 2026, period_month: 11 }),
    report({ id: "older", budget_year: 2026, period_month: 2 }),
    report({ id: "previous-year", budget_year: 2025, period_month: 12 }),
  ];

  it("memilih periode yang diminta", () => {
    expect(selectApbdReport(reports, "2026", "2")?.id).toBe("older");
  });

  it("kembali ke snapshot terbaru untuk periode yang tidak tersedia", () => {
    expect(selectApbdReport(reports, "2024", "1")?.id).toBe("latest");
    expect(selectApbdReport(reports)?.id).toBe("latest");
  });

  it("mengembalikan null untuk daftar kosong", () => {
    expect(selectApbdReport([], "2026", "11")).toBeNull();
  });
});

describe("aggregateBelanjaAllocation", () => {
  const accounts = [
    account(0, "Belanja Daerah", 1_000, 500, true),
    account(1, "Belanja Pegawai", 400, 200),
    account(2, "Belanja Pegawai", 400, 200), // duplikat persis dari DJPK
    account(3, "Belanja Barang dan Jasa", 200, 100),
    account(4, "Belanja Barang dan Jasa", 200, 100),
    account(5, "Belanja Modal", 100, 50),
    account(6, "Belanja Modal", 100, 50),
    account(7, "Belanja Lainnya", 300, 150),
    account(8, "Belanja Bantuan Keuangan", 300, 150), // turunan Belanja Lainnya
    account(9, "Belanja Hibah", 100, 50), // turunan lain
  ];

  it("hanya memakai kelompok langsung dan tidak menghitung ganda", () => {
    const allocation = aggregateBelanjaAllocation(accounts);

    expect(allocation.map((item) => item.label)).toEqual([
      "Belanja Pegawai",
      "Belanja Lainnya",
      "Belanja Barang dan Jasa",
      "Belanja Modal",
    ]);
    expect(allocation.reduce((total, item) => total + item.pagu, 0)).toBe(1_000);
    expect(allocation.reduce((total, item) => total + item.realisasi, 0)).toBe(
      500,
    );
  });

  it("mengurutkan berdasarkan pagu terbesar", () => {
    const allocation = aggregateBelanjaAllocation(accounts);
    expect(allocation.map((item) => item.pagu)).toEqual([400, 300, 200, 100]);
  });

  it("mengabaikan baris tanpa nilai dan mengembalikan kosong", () => {
    expect(
      aggregateBelanjaAllocation([
        account(0, "Belanja Pegawai", null, 10),
        account(1, "Belanja Modal", 100, null),
      ]),
    ).toEqual([]);
    expect(aggregateBelanjaAllocation([])).toEqual([]);
  });
});

describe("formatRupiah", () => {
  it("memakai locale id-ID dan tanpa desimal", () => {
    const formatted = formatRupiah(2_867_861_122_000).replace(/\u00a0/g, " ");

    expect(formatted).toContain("Rp");
    expect(formatted).toContain("2.867.861.122.000");
  });

  it("menampilkan placeholder untuk nilai kosong", () => {
    expect(formatRupiah(null)).toBe("Belum tersedia");
    expect(formatPercentage(null)).toBe("Belum tersedia");
    expect(formatRupiahCompact(null)).toBe("Belum tersedia");
  });

  it("memformat persentase dengan koma desimal", () => {
    expect(formatPercentage(69.858)).toBe("69,86%");
  });

  it("memformat nilai besar secara ringkas untuk tampilan utama", () => {
    expect(formatRupiahCompact(2_867_861_122_000)).toBe("Rp 2,87 T");
    expect(formatRupiahCompact(2_003_885_390_268)).toBe("Rp 2,00 T");
    expect(formatRupiahCompact(642_808_524_676)).toBe("Rp 642,8 M");
  });
});
