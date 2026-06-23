import { describe, expect, it } from "vitest";
import { brier } from "../../src/scoring/brier.js";

describe("brier", () => {
  it("is 0 for a perfectly confident correct prediction", () => {
    expect(brier(1, true)).toBe(0);
  });
  it("is 1 for a perfectly confident wrong prediction", () => {
    expect(brier(1, false)).toBe(1);
  });
  it("is 0.25 for a coin-flip", () => {
    expect(brier(0.5, true)).toBe(0.25);
    expect(brier(0.5, false)).toBe(0.25);
  });
});
