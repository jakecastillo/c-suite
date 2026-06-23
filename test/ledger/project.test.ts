import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type {
  ForecastEvent,
  ResolutionEvent,
} from "../../src/ledger/events.js";
import { dueForecasts, projectState } from "../../src/ledger/project.js";
import { appendEvent } from "../../src/ledger/store.js";

const fc = (id: string, resolve_by: string): ForecastEvent => ({
  kind: "forecast",
  id,
  claim_text: id,
  p: 0.4,
  source: "single",
  model_id: "m",
  decision_type: "demand",
  created_at: "2026-06-22T10:00:00Z",
  resolve_by,
  predicate: "path_exists",
  predicate_args: { path: "x" },
});
const rs = (id: string): ResolutionEvent => ({
  kind: "resolution",
  id,
  resolved_at: "2026-09-01T10:00:00Z",
  outcome: true,
  brier: 0.36,
});

describe("projectState / dueForecasts", () => {
  it("marks a forecast resolved once its resolution event arrives", () => {
    const p = join(mkdtempSync(join(tmpdir(), "csuite-proj-")), "l.jsonl");
    appendEvent(p, fc("a", "2026-09-01"));
    appendEvent(p, fc("b", "2026-10-01"));
    appendEvent(p, rs("a"));
    const state = projectState(p);
    expect(state.find((s) => s.id === "a")?.status).toBe("resolved");
    expect(state.find((s) => s.id === "a")?.outcome).toBe(true);
    expect(state.find((s) => s.id === "b")?.status).toBe("open");
  });
  it("returns only open forecasts due on/before asOf", () => {
    const p = join(mkdtempSync(join(tmpdir(), "csuite-proj-")), "l.jsonl");
    appendEvent(p, fc("a", "2026-09-01"));
    appendEvent(p, fc("b", "2026-10-01"));
    appendEvent(p, rs("a"));
    expect(dueForecasts(p, "2026-09-15").map((f) => f.id)).toEqual([]); // a is resolved; b is not due until 2026-10-01
    expect(dueForecasts(p, "2026-10-01").map((f) => f.id)).toEqual(["b"]);
  });
});
