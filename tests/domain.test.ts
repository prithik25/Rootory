import { describe, expect, it } from "vitest";
import { filterListings, seed, age, day } from "../lib/data";
describe("marketplace filtering", () => {
  it("combines category, location, and a case-insensitive search", () => {
    const found = filterListings(
      seed().listings,
      "BASIL",
      "Growing supplies",
      "pune",
    );
    expect(found).toHaveLength(1);
    expect(found[0].id).toBe("l2");
  });
  it("does not show listings outside the chosen locality", () => {
    expect(
      filterListings(seed().listings, "tomato", "Produce", "Nashik"),
    ).toHaveLength(0);
  });
});
describe("plant age", () => {
  it("never shows a negative growing day for future dates", () => {
    expect(age(day(2))).toBe(0);
  });
});
