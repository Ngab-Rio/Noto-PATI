import { describe, it, expect } from "vitest";
import React from "react";
import {
  getDisplayedReports,
  RelatedReportsThread,
  type RelatedReportItem,
} from "./RelatedReportsThread";

const MOCK_REPORTS: RelatedReportItem[] = [
  {
    id: "rep-001",
    ticketNumber: "NP-2026-001",
    title: "Jalan Rusak di Depan Pasar Puri",
    createdAt: "2026-11-01T10:00:00Z",
    detailLocation: "Jl. Kolonel Sugiyono No. 12",
    photoUrl: "https://example.com/photo1.jpg",
  },
  {
    id: "rep-002",
    ticketNumber: "NP-2026-002",
    title: "Aspal Amblas Dekat Jembatan",
    createdAt: "2026-11-02T11:00:00Z",
    detailLocation: "Jl. Pemuda No. 45",
    photoUrl: null, // Fallback icon test
  },
  {
    id: "rep-003",
    ticketNumber: "NP-2026-003",
    title: "Lubang Dalam Tikungan Rawan Celaka",
    createdAt: "2026-11-03T12:00:00Z",
    detailLocation: "Jl. Dr. Sutomo",
    photoUrl: "https://example.com/photo3.jpg",
  },
  {
    id: "rep-004",
    ticketNumber: "NP-2026-004",
    title: "Kerusakan Tambahan di Jalur Lambat",
    createdAt: "2026-11-04T13:00:00Z",
    detailLocation: "Jl. Sudirman No. 8",
    photoUrl: null,
  },
];

describe("RelatedReportsThread Component & Logic (Issue #40)", () => {
  describe("getDisplayedReports Logic", () => {
    it("mengembalikan array kosong jika reports kosong atau null", () => {
      const res1 = getDisplayedReports([], false, 3);
      expect(res1.displayedReports).toEqual([]);
      expect(res1.hasMore).toBe(false);
      expect(res1.hiddenCount).toBe(0);

      const res2 = getDisplayedReports(null as unknown as RelatedReportItem[], false, 3);
      expect(res2.displayedReports).toEqual([]);
      expect(res2.hasMore).toBe(false);
    });

    it("membatasi laporan yang ditampilkan sesuai initialLimit saat belum di-expand", () => {
      const { displayedReports, hasMore, hiddenCount } = getDisplayedReports(
        MOCK_REPORTS,
        false,
        2
      );

      expect(displayedReports.length).toBe(2);
      expect(displayedReports[0].id).toBe("rep-001");
      expect(displayedReports[1].id).toBe("rep-002");
      expect(hasMore).toBe(true);
      expect(hiddenCount).toBe(2);
    });

    it("menampilkan seluruh laporan saat isExpanded bernilai true", () => {
      const { displayedReports, hasMore, hiddenCount } = getDisplayedReports(
        MOCK_REPORTS,
        true,
        2
      );

      expect(displayedReports.length).toBe(4);
      expect(displayedReports.map((r) => r.id)).toEqual([
        "rep-001",
        "rep-002",
        "rep-003",
        "rep-004",
      ]);
      expect(hasMore).toBe(true);
      expect(hiddenCount).toBe(2);
    });

    it("tidak memiliki tombol ekspansi jika jumlah laporan <= initialLimit", () => {
      const twoReports = MOCK_REPORTS.slice(0, 2);
      const { displayedReports, hasMore, hiddenCount } = getDisplayedReports(
        twoReports,
        false,
        3
      );

      expect(displayedReports.length).toBe(2);
      expect(hasMore).toBe(false);
      expect(hiddenCount).toBe(0);
    });
  });

  describe("RelatedReportsThread Rendering Contract", () => {
    it("merender null jika daftar laporan kosong", () => {
      const element = React.createElement(RelatedReportsThread, {
        parentTicketNumber: "NP-PARENT-01",
        reports: [],
      });
      expect(element.type).toBe(RelatedReportsThread);
    });

    it("mengembalikan elemen JSX valid jika terdapat laporan terkait", () => {
      const element = React.createElement(RelatedReportsThread, {
        parentTicketNumber: "NP-PARENT-01",
        reports: MOCK_REPORTS,
        initialLimit: 2,
      });

      expect(element).not.toBeNull();
      expect(React.isValidElement(element)).toBe(true);
    });
  });
});

