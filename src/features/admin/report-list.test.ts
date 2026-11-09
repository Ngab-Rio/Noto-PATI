import { describe, expect, it } from "vitest";

import { buildAdminReportsCsv, sortAdminReports } from "./report-list";
import type { AdminReportItem } from "./types";

function report(
  overrides: Partial<AdminReportItem> & Pick<AdminReportItem, "id">,
): AdminReportItem {
  return {
    id: overrides.id,
    ticketNumber: overrides.ticketNumber ?? `NP-${overrides.id}`,
    title: overrides.title ?? "Laporan kerusakan jalan",
    description: overrides.description ?? "Deskripsi kerusakan jalan yang dilaporkan warga.",
    category: overrides.category ?? "Jalan Berlubang / Rusak",
    categoryKey: overrides.categoryKey ?? "road_damage",
    status: overrides.status ?? "diproses",
    location: overrides.location ?? "Kecamatan Pati",
    coordinates: overrides.coordinates ?? { lat: -6.75, lng: 111.04 },
    reporterName: overrides.reporterName ?? "Warga",
    supportCount: overrides.supportCount ?? 0,
    submittedAt: overrides.submittedAt ?? "9 Nov 2026",
    submittedAtRaw: overrides.submittedAtRaw ?? "2026-11-09T08:00:00.000Z",
    slaState: overrides.slaState ?? "in_target",
    slaDueAt: overrides.slaDueAt,
    isOverdue: overrides.isOverdue ?? false,
    images: overrides.images ?? [],
    priority: overrides.priority ?? "sedang",
    timeline: overrides.timeline ?? [],
  };
}

describe("admin report list helpers", () => {
  it("sorts recent reports by creation timestamp instead of ID", () => {
    const reports = [
      report({ id: "newer-id", submittedAtRaw: "2026-11-08T10:00:00.000Z" }),
      report({ id: "older-id", submittedAtRaw: "2026-11-09T10:00:00.000Z" }),
    ];

    expect(sortAdminReports(reports, "newest").map((item) => item.id)).toEqual([
      "older-id",
      "newer-id",
    ]);
  });

  it("sorts reports with the earliest SLA deadline first and missing deadlines last", () => {
    const reports = [
      report({ id: "missing", slaDueAt: undefined }),
      report({ id: "later", slaDueAt: "2026-11-12T00:00:00.000Z" }),
      report({ id: "sooner", slaDueAt: "2026-11-10T00:00:00.000Z" }),
    ];

    expect(sortAdminReports(reports, "due").map((item) => item.id)).toEqual([
      "sooner",
      "later",
      "missing",
    ]);
  });

  it("exports selected report data as escaped, formula-safe CSV", () => {
    const csv = buildAdminReportsCsv([
      report({
        id: "one",
        title: '=HYPERLINK("https://example.com","lihat")',
        location: 'Jl. "Merdeka", Pati',
      }),
    ]);

    expect(csv).toContain('"\'=HYPERLINK(""https://example.com"",""lihat"")"');
    expect(csv).toContain('"Jl. ""Merdeka"", Pati"');
    expect(csv.split("\r\n")).toHaveLength(2);
  });
});
