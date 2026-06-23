import { describe, expect, it } from "vitest";
import { PROVENANCE_RANK, parseClaim } from "../../src/claim/schema.js";

describe("Claim schema", () => {
  it("parses a valid grounded claim with a citation and falsification tuple", () => {
    const c = parseClaim({
      text: "No payment path exists",
      provenance: "grounded",
      confidence: 0.7,
      citations: [{ file: "src/app.ts", line: 12 }],
      falsification: {
        observable: "billing dir exists",
        predicate: "path_exists",
        args: { path: "billing" },
        date: "2026-09-01",
      },
    });
    expect(c.confidence).toBe(0.7);
    expect(c.citations[0]?.file).toBe("src/app.ts");
  });

  it("rejects confidence outside [0,1]", () => {
    expect(() =>
      parseClaim({ text: "x", provenance: "inference", confidence: 1.5 }),
    ).toThrow();
  });

  it("rejects an unknown provenance", () => {
    expect(() =>
      parseClaim({ text: "x", provenance: "vibes", confidence: 0.5 }),
    ).toThrow();
  });

  it("rejects a falsification date that is not ISO yyyy-mm-dd", () => {
    expect(() =>
      parseClaim({
        text: "x",
        provenance: "inference",
        confidence: 0.5,
        falsification: {
          observable: "o",
          predicate: "path_exists",
          args: {},
          date: "Sept 1",
        },
      }),
    ).toThrow();
  });

  it("orders the provenance lattice grounded < inference < speculation", () => {
    expect(PROVENANCE_RANK.grounded).toBeLessThan(PROVENANCE_RANK.inference);
    expect(PROVENANCE_RANK.inference).toBeLessThan(PROVENANCE_RANK.speculation);
  });
});
