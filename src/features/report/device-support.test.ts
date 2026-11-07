import { describe, expect, it } from "vitest";
import { supportsReportDevice } from "./device-support";

describe("supportsReportDevice", () => {
  it("allows phones and Android tablets", () => {
    expect(
      supportsReportDevice({
        userAgent: "Mozilla/5.0 (Linux; Android 15; Pixel 9)",
        platform: "Linux armv8l",
        maxTouchPoints: 5,
        hasCoarsePointer: true,
      }),
    ).toBe(true);

    expect(
      supportsReportDevice({
        userAgent: "Mozilla/5.0 (Linux; Android 15; Tablet)",
        platform: "Linux armv8l",
        maxTouchPoints: 5,
        hasCoarsePointer: true,
      }),
    ).toBe(true);
  });

  it("allows iPadOS desktop user agents and touch-first tablets", () => {
    expect(
      supportsReportDevice({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)",
        platform: "MacIntel",
        maxTouchPoints: 5,
        hasCoarsePointer: false,
      }),
    ).toBe(true);

    expect(
      supportsReportDevice({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        platform: "Win32",
        maxTouchPoints: 10,
        hasCoarsePointer: true,
      }),
    ).toBe(true);
  });

  it("blocks desktop browsers without touch-first input", () => {
    expect(
      supportsReportDevice({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        platform: "Win32",
        maxTouchPoints: 0,
        hasCoarsePointer: false,
      }),
    ).toBe(false);
  });
});
