import { describe, expect, it } from "vitest";
import type { ForecastState } from "../../src/ledger/project.js";
import {
  calibrationReport,
  renderReport,
} from "../../src/report/track-record.js";

const resolved = (p: number, outcome: boolean): ForecastState => ({
  id: Math.random().toString(),
  claim_text: "c",
  p,
  decision_type: "demand",
  resolve_by: "2026-09-01",
  status: "resolved",
  outcome,
  brier: (p - (outcome ? 1 : 0)) ** 2,
});

describe("calibrationReport", () => {
  it("reports insufficient when fewer than 8 resolved", () => {
    const r = calibrationReport([resolved(0.7, true), resolved(0.6, false)]);
    expect(r.reliability).toBe("insufficient");
    expect(r.resolved).toBe(2);
  });
  it("flags overconfidence when high-confidence predictions miss often", () => {
    const states = Array.from({ length: 10 }, () => resolved(0.9, false)); // said 90%, never happened
    const r = calibrationReport(states);
    expect(r.reliability).toBe("overconfident");
    expect(r.meanBrier).toBeGreaterThan(0.5);
  });
  it("counts open forecasts separately and ignores them in Brier", () => {
    const open: ForecastState = {
      id: "o",
      claim_text: "c",
      p: 0.5,
      decision_type: "demand",
      resolve_by: "2027-01-01",
      status: "open",
    };
    const r = calibrationReport([open, resolved(0.8, true)]);
    expect(r.open).toBe(1);
    expect(r.resolved).toBe(1);
  });
  it("renders a human-readable string", () => {
    const out = renderReport(calibrationReport([resolved(0.8, true)]));
    expect(out).toContain("resolved");
  });
});
