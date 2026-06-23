import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type {
  ForecastEvent,
  ResolutionEvent,
} from "../../src/ledger/events.js";
import { appendEvent, readChain, verifyChain } from "../../src/ledger/store.js";

const fc = (id: string): ForecastEvent => ({
  kind: "forecast",
  id,
  claim_text: "no payment path",
  p: 0.7,
  source: "single",
  model_id: "claude-opus-4-8",
  decision_type: "demand",
  created_at: "2026-06-22T10:00:00Z",
  resolve_by: "2026-09-01",
  predicate: "path_exists",
  predicate_args: { path: "billing" },
});
const rs = (id: string): ResolutionEvent => ({
  kind: "resolution",
  id,
  resolved_at: "2026-09-01T10:00:00Z",
  outcome: false,
  brier: 0.49,
});

describe("hash-chained ledger store", () => {
  it("appends events and reads them back in order", () => {
    const p = join(mkdtempSync(join(tmpdir(), "csuite-led-")), "ledger.jsonl");
    appendEvent(p, fc("a"));
    appendEvent(p, rs("a"));
    const chain = readChain(p);
    expect(chain.map((c) => c.event.kind)).toEqual(["forecast", "resolution"]);
  });
  it("verifies an untampered chain", () => {
    const p = join(mkdtempSync(join(tmpdir(), "csuite-led-")), "ledger.jsonl");
    appendEvent(p, fc("a"));
    appendEvent(p, fc("b"));
    expect(verifyChain(p)).toEqual({ ok: true });
  });
  it("detects a tampered record", () => {
    const p = join(mkdtempSync(join(tmpdir(), "csuite-led-")), "ledger.jsonl");
    appendEvent(p, fc("a"));
    appendEvent(p, fc("b"));
    const lines = readFileSync(p, "utf8").split("\n").filter(Boolean);
    const first = JSON.parse(lines[0] as string);
    first.event.p = 0.99; // tamper the probability
    writeFileSync(p, `${[JSON.stringify(first), lines[1]].join("\n")}\n`);
    expect(verifyChain(p)).toEqual({ ok: false, brokenAt: 0 });
  });
  it("detects tampering of nested predicate_args (the hash must cover all fields)", () => {
    const p = join(mkdtempSync(join(tmpdir(), "csuite-led-")), "ledger.jsonl");
    appendEvent(p, fc("a"));
    const line = JSON.parse(readFileSync(p, "utf8").trim());
    line.event.predicate_args = { path: "TAMPERED" };
    writeFileSync(p, `${JSON.stringify(line)}\n`);
    expect(verifyChain(p)).toEqual({ ok: false, brokenAt: 0 });
  });
  it("treats a missing file as an empty chain", () => {
    expect(readChain("/nonexistent/ledger.jsonl")).toEqual([]);
    expect(verifyChain("/nonexistent/ledger.jsonl")).toEqual({ ok: true });
  });
});
