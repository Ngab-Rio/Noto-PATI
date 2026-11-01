import { describe, expect, it } from "vitest";

import { buildSearchOrFilter } from "./search";

describe("buildSearchOrFilter", () => {
  it("membangun filter or untuk judul dan lokasi", () => {
    expect(buildSearchOrFilter("jalan rusak")).toBe(
      "title.ilike.%jalan rusak%,detail_location.ilike.%jalan rusak%",
    );
  });

  it("membersihkan karakter yang merusak sintaks PostgREST", () => {
    expect(buildSearchOrFilter("a,b(c)")).toBe(
      "title.ilike.%a b c%,detail_location.ilike.%a b c%",
    );
  });

  it("mengembalikan null untuk pencarian kosong", () => {
    expect(buildSearchOrFilter("   ")).toBeNull();
    expect(buildSearchOrFilter("()")).toBeNull();
  });
});
