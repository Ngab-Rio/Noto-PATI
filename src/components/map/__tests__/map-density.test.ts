import { describe, expect, it } from "vitest";

import { DENSITY_COLORS } from "@/config/theme";
import {
  CLUSTER_DENSITY_THRESHOLDS,
  CLUSTER_TEXT_COLORS,
  HEATMAP_TUNING,
  HEATMAP_WEIGHT_EXPRESSION,
  buildClusterColorExpression,
  buildClusterTextColorExpression,
  buildHeatmapColorExpression,
  buildHeatmapOpacityExpression,
} from "../map-density";

describe("map density configuration", () => {
  it("uses the 5 / 20 cluster thresholds", () => {
    expect(CLUSTER_DENSITY_THRESHOLDS).toEqual({ mid: 6, high: 21 });
  });

  it("builds a step cluster color expression from point_count", () => {
    expect(buildClusterColorExpression()).toEqual([
      "step",
      ["get", "point_count"],
      DENSITY_COLORS.low.hex,
      6,
      DENSITY_COLORS.mid.hex,
      21,
      DENSITY_COLORS.high.hex,
    ]);
  });

  it("keeps cluster count text WCAG AA via dark text on the yellow band", () => {
    expect(buildClusterTextColorExpression()).toEqual([
      "step",
      ["get", "point_count"],
      CLUSTER_TEXT_COLORS.low,
      6,
      CLUSTER_TEXT_COLORS.mid,
      21,
      CLUSTER_TEXT_COLORS.high,
    ]);
    expect(CLUSTER_TEXT_COLORS.mid).toBe("#1F2D3D");
  });

  it("uses a constant heatmap weight expression for future support weighting", () => {
    expect(HEATMAP_WEIGHT_EXPRESSION).toEqual(["literal", 1]);
  });

  it("maps heatmap density transparent -> blue -> yellow -> red", () => {
    expect(buildHeatmapColorExpression()).toEqual([
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      ...HEATMAP_TUNING.colorStops.flatMap(([density, color]) => [
        density,
        color,
      ]),
    ]);
  });

  it("fades the heatmap to zero by zoom 15", () => {
    const expression = buildHeatmapOpacityExpression() as unknown as unknown[];
    expect(expression).toContain(15);
    expect(expression[expression.length - 1]).toBe(0);
  });
});
