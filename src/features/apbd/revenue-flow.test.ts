import { describe, expect, it } from "vitest";
import { buildRevenueFlowCategories } from "./revenue-flow";

describe("buildRevenueFlowCategories", () => {
  it("groups DJPK income rows without counting parent rows twice", () => {
    const categories = buildRevenueFlowCategories([
      { row_index: 0, akun: "Pendapatan Daerah", anggaran: 2719861122000, realisasi: 0 },
      { row_index: 1, akun: "PAD", anggaran: 612271706000, realisasi: 0 },
      { row_index: 2, akun: "Pajak Daerah", anggaran: 268161175000, realisasi: 0 },
      { row_index: 3, akun: "Retribusi Daerah", anggaran: 304651506000, realisasi: 0 },
      {
        row_index: 4,
        akun: "Hasil Pengelolaan Kekayaan Daerah yang Dipisahkan",
        anggaran: 36090545000,
        realisasi: 0,
      },
      { row_index: 5, akun: "Lain-Lain PAD yang Sah", anggaran: 3368480000, realisasi: 0 },
      { row_index: 6, akun: "TKDD", anggaran: 1975368105000, realisasi: 0 },
      {
        row_index: 7,
        akun: "Pendapatan Transfer Pemerintah Pusat",
        anggaran: 1975368105000,
        realisasi: 0,
      },
      { row_index: 8, akun: "Pendapatan Lainnya", anggaran: 132221311000, realisasi: 0 },
      {
        row_index: 9,
        akun: "Pendapatan Transfer Antar Daerah",
        anggaran: 132221311000,
        realisasi: 0,
      },
      { row_index: 10, akun: "Belanja Daerah", anggaran: 2867861122000, realisasi: 0 },
    ]);

    expect(categories.map(({ amount }) => amount)).toEqual([
      612271706000,
      2107589416000,
      null,
    ]);
    expect(categories[0].children).toHaveLength(4);
    expect(categories[1].children.map(({ label }) => label)).toEqual([
      "Pendapatan Transfer Pemerintah Pusat",
      "Pendapatan Transfer Antar Daerah",
    ]);
    expect(
      categories[0].amount! + categories[1].amount!,
    ).toBe(2719861122000);
  });

  it("uses separately listed non-transfer income as other lawful revenue", () => {
    const categories = buildRevenueFlowCategories([
      { row_index: 0, akun: "PAD", anggaran: 100, realisasi: 0 },
      { row_index: 1, akun: "Pajak Daerah", anggaran: 100, realisasi: 0 },
      { row_index: 2, akun: "TKDD", anggaran: 200, realisasi: 0 },
      {
        row_index: 3,
        akun: "Pendapatan Transfer Pemerintah Pusat",
        anggaran: 200,
        realisasi: 0,
      },
      { row_index: 4, akun: "Pendapatan Lainnya", anggaran: 25, realisasi: 0 },
      { row_index: 5, akun: "Pendapatan Hibah", anggaran: 25, realisasi: 0 },
      { row_index: 6, akun: "Belanja Daerah", anggaran: 325, realisasi: 0 },
    ]);

    expect(categories[2].amount).toBe(25);
    expect(categories[2].children[0].label).toBe("Pendapatan Hibah");
  });
});
