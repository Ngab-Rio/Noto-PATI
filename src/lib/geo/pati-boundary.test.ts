import { describe, expect, it } from "vitest";

import {
  buildInversePolygon,
  PATI_BOUNDARY_BOUNDS,
  PATI_BOUNDARY_GEOMETRY,
  PATI_MAP_BOUNDS,
} from "./pati-boundary";

describe("Pati boundary geometry", () => {
  it("builds an inverse polygon with a clockwise Pati hole", () => {
    const mask = buildInversePolygon(PATI_BOUNDARY_GEOMETRY);

    expect(mask.features).toHaveLength(1);
    expect(mask.features[0].geometry.coordinates).toHaveLength(2);
    expect(mask.features[0].geometry.coordinates[0]).toEqual([
      [-180, -90],
      [180, -90],
      [180, 90],
      [-180, 90],
      [-180, -90],
    ]);
    expect(mask.features[0].geometry.coordinates[1][0]).toEqual([111.234176, -6.687284]);
  });

  it("supports multipolygon holes", () => {
    const mask = buildInversePolygon({
      type: "MultiPolygon",
      coordinates: [
        [[[1, 1], [2, 1], [2, 2], [1, 1]]],
        [[[3, 3], [4, 3], [4, 4], [3, 3]]],
      ],
    });

    expect(mask.features).toHaveLength(1);
  });

  it("restores islands inside polygon holes", () => {
    const mask = buildInversePolygon({
      type: "Polygon",
      coordinates: [
        [[0, 0], [4, 0], [4, 4], [0, 0]],
        [[1, 1], [2, 1], [2, 2], [1, 1]],
      ],
    });

    expect(mask.features).toHaveLength(2);
    expect(mask.features[1].geometry.coordinates).toHaveLength(1);
  });

  it("keeps the padded map bounds around the boundary", () => {
    expect(PATI_MAP_BOUNDS[0][0]).toBeLessThan(PATI_BOUNDARY_BOUNDS.west);
    expect(PATI_MAP_BOUNDS[0][1]).toBeLessThan(PATI_BOUNDARY_BOUNDS.south);
    expect(PATI_MAP_BOUNDS[1][0]).toBeGreaterThan(PATI_BOUNDARY_BOUNDS.east);
    expect(PATI_MAP_BOUNDS[1][1]).toBeGreaterThan(PATI_BOUNDARY_BOUNDS.north);
  });
});