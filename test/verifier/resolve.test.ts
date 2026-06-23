import { describe, expect, it } from "vitest";
import type { ForecastEvent } from "../../src/ledger/events.js";
import { resolveForecast } from "../../src/verifier/resolve.js";
import { makeTmpGitRepo } from "../helpers/tmp-git.js";

const forecast = (over: Partial<ForecastEvent>): ForecastEvent => ({
  kind: "forecast",
  id: "a",
  claim_text: "billing exists by Sep",
  p: 0.3,
  source: "single",
  model_id: "m",
  decision_type: "feasibility",
  created_at: "2026-06-22T10:00:00Z",
  resolve_by: "2026-09-01",
  predicate: "path_exists",
  predicate_args: { path: "billing" },
  ...over,
});

describe("resolveForecast", () => {
  it("resolves outcome=true and scores when the predicate holds", () => {
    const r = makeTmpGitRepo();
    r.writeFile("billing/x.ts");
    r.commit("add billing");
    const res = resolveForecast(
      forecast({ p: 0.3 }),
      { repoRoot: r.root, asOf: "2026-09-01" },
      "2026-09-01T10:00:00Z",
    );
    expect(res).toMatchObject({ kind: "resolution", id: "a", outcome: true });
    expect(res.brier).toBeCloseTo(0.49); // (0.3 - 1)^2
  });
  it("resolves outcome=false when the predicate does not hold", () => {
    const r = makeTmpGitRepo();
    r.writeFile("readme.md");
    r.commit("init");
    const res = resolveForecast(
      forecast({ p: 0.3 }),
      { repoRoot: r.root, asOf: "2026-09-01" },
      "2026-09-01T10:00:00Z",
    );
    expect(res.outcome).toBe(false);
    expect(res.brier).toBeCloseTo(0.09); // (0.3 - 0)^2
  });
});
