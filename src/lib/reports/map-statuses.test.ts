import { describe, expect, it } from "vitest";

import {
  DEFAULT_MAP_STATUSES,
  isMapStatus,
  resolveMapStatuses,
} from "./map-statuses";

describe("public map status filter", () => {
  it("defaults to active statuses only", () => {
    expect(resolveMapStatuses([])).toEqual([...DEFAULT_MAP_STATUSES]);
    expect(DEFAULT_MAP_STATUSES).toEqual([
      "diterima",
      "diverifikasi",
      "diproses",
    ]);
  });

  it("never includes merged or closed reports by default", () => {
    expect(resolveMapStatuses([])).not.toContain("digabung");
    expect(resolveMapStatuses([])).not.toContain("ditutup");
    expect(resolveMapStatuses([])).not.toContain("selesai");
    expect(resolveMapStatuses([])).not.toContain("ditolak");
  });

  it("honours explicit optional statuses but rejects excluded ones", () => {
    expect(resolveMapStatuses(["selesai"])).toEqual(["selesai"]);
    expect(resolveMapStatuses(["ditolak", "digabung"])).toEqual(["ditolak"]);
    expect(resolveMapStatuses(["digabung", "ditutup"])).toEqual([
      ...DEFAULT_MAP_STATUSES,
    ]);
  });

  it("recognises only statuses available in the current database enum", () => {
    expect(isMapStatus("diproses")).toBe(true);
    expect(isMapStatus("dibuka_kembali")).toBe(false);
    expect(isMapStatus("digabung")).toBe(false);
    expect(isMapStatus("ditutup")).toBe(false);
  });
});
