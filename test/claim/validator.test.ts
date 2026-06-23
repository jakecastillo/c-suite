import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateClaim } from "../../src/claim/validator.js";
import type { Claim } from "../../src/claim/schema.js";

function repoWith(file: string): string {
  const root = mkdtempSync(join(tmpdir(), "csuite-val-"));
  mkdirSync(join(root, "src"), { recursive: true });
  writeFileSync(join(root, file), "x");
  return root;
}
const base = (over: Partial<Claim>): Claim => ({ text: "t", provenance: "inference", confidence: 0.5, citations: [], ...over });

describe("validateClaim", () => {
  it("passes a grounded claim whose citation exists", () => {
    const root = repoWith("src/a.ts");
    expect(validateClaim(base({ provenance: "grounded", citations: [{ file: "src/a.ts" }] }), { repoRoot: root })).toEqual([]);
  });
  it("flags a grounded claim with no citations", () => {
    const root = repoWith("src/a.ts");
    const issues = validateClaim(base({ provenance: "grounded", citations: [] }), { repoRoot: root });
    expect(issues.map(i => i.code)).toContain("grounded_needs_citation");
  });
  it("flags a grounded citation that does not exist", () => {
    const root = repoWith("src/a.ts");
    const issues = validateClaim(base({ provenance: "grounded", citations: [{ file: "src/ghost.ts" }] }), { repoRoot: root });
    expect(issues.map(i => i.code)).toContain("citation_not_found");
  });
  it("flags a citation that escapes the repo root", () => {
    const root = repoWith("src/a.ts");
    const issues = validateClaim(base({ provenance: "grounded", citations: [{ file: "../../etc/passwd" }] }), { repoRoot: root });
    expect(issues.map(i => i.code)).toContain("citation_escapes_repo");
  });
  it("forbids speculation as the headline of a recommendation", () => {
    const root = repoWith("src/a.ts");
    const issues = validateClaim(base({ provenance: "speculation" }), { repoRoot: root, isHeadline: true });
    expect(issues.map(i => i.code)).toContain("speculation_headline");
  });
  it("requires a falsification tuple when recorded as a forecast", () => {
    const root = repoWith("src/a.ts");
    const issues = validateClaim(base({ falsification: undefined }), { repoRoot: root, isForecast: true });
    expect(issues.map(i => i.code)).toContain("forecast_needs_falsification");
  });
  it("flags an absolute citation outside the repo", () => {
    const root = repoWith("src/a.ts");
    const issues = validateClaim(base({ provenance: "grounded", citations: [{ file: "/etc/hosts" }] }), { repoRoot: root });
    expect(issues.map(i => i.code)).toContain("citation_escapes_repo");
  });
  it("flags a sibling dir that shares the root's name prefix", () => {
    const root = repoWith("src/a.ts");
    const sibling = `${root}-evil`;
    mkdirSync(sibling, { recursive: true });
    writeFileSync(join(sibling, "secret"), "x");
    const issues = validateClaim(base({ provenance: "grounded", citations: [{ file: join(sibling, "secret") }] }), { repoRoot: root });
    expect(issues.map(i => i.code)).toContain("citation_escapes_repo");
  });
});
