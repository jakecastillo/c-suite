# c-suite v0a — Calibration Spine (deterministic core) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the board-free, LLM-free deterministic spine of c-suite — record a recommendation as a typed, falsifiable forecast; later resolve its tripwire against git/filesystem reality with *code, never a model*; proper-score it; and display a tamper-evident calibration record.

**Architecture:** An event-sourced, hash-chained append-only ledger of forecasts and their resolutions. A typed *Claim* passes a deterministic boundary validator before becoming a forecast. A *tripwire* is a typed predicate over git/fs state, evaluated by pure functions. Resolution is a separate appended event (never a mutation), so the chain stays verifiable. A Brier scorer folds the log into a calibration report. No LLM, no board, no network — this is the part that ships regardless of whether the board ever earns its seat (spec §0, §7, §12 v0a).

**Tech Stack:** TypeScript (strict), Node ≥20, pnpm, Vitest (tests), Zod (schemas), Biome (lint/format), `node:crypto` (sha256 chain), `node:child_process` `execFileSync` (git queries — never a shell string). CLI via a thin `bin` + `tsx`.

## Global Constraints

- **Substrate:** TypeScript/Node, pnpm; mirror `the-5-to-9` conventions (Biome, Vitest, strict tsconfig). One responsibility per file; keep files small.
- **No LLM, no network in this plan.** v0a-core is pure deterministic logic (the LLM emits claims in a *later* plan; here a claim arrives as data).
- **Append-only + hash-chained ledger.** Resolution is a new event, never an in-place edit. `verifyChain` must detect any tamper.
- **Deterministic verifier firewall (spec §7):** tripwires are evaluated by code over git/fs state — a model is never consulted to resolve a prediction.
- **Determinism in core:** no `Date.now()`/`Math.random()` inside pure modules — timestamps and ids are passed in as arguments (the CLI layer supplies them). This keeps every core function unit-testable.
- **Git safety:** all git invocations use `execFileSync('git', [...args])` with array args (no shell interpolation); path inputs are resolved and confined to the repo root.
- **`board/` is `.gitignore`d** in any target repo the tool writes to (the ledger holds strategic doubts). This plan writes the ledger under a caller-provided path.
- **Decision-type ontology (spec §7):** `demand | pricing | feasibility | pace | scope` — calibration is poolable across these.
- **Brand:** product `c-suite`, binary `csuite`. Roles/types stay literal.

---

## File Structure

```
c-suite/
  package.json            # pnpm, scripts (test, lint, build, csuite bin)
  tsconfig.json           # strict
  vitest.config.ts
  biome.json
  src/
    claim/
      schema.ts           # Zod Claim + Provenance lattice + Falsification + Citation
      validator.ts        # deterministic boundary validator (invariants)
    ledger/
      events.ts           # LedgerEvent union (forecast | resolution) + Zod
      store.ts            # hash-chained append-only JSONL: append, read, verifyChain
      project.ts          # fold events -> current ForecastState[]
    verifier/
      predicates.ts       # typed deterministic predicates over git/fs
      resolve.ts          # evaluate a forecast's tripwire -> outcome
    scoring/
      brier.ts            # Brier score + calibration buckets + reliability flag
    report/
      track-record.ts     # render calibration display from projected state
    cli.ts                # csuite predict | resolve | track-record
  bin/csuite.mjs          # tsx entry -> src/cli.ts
  test/
    claim/{schema,validator}.test.ts
    ledger/{store,project}.test.ts
    verifier/{predicates,resolve}.test.ts
    scoring/brier.test.ts
    report/track-record.test.ts
    cli/cli.test.ts
    helpers/tmp-git.ts    # spin up a throwaway git repo for verifier/integration tests
```

---

### Task 1: Project scaffold + Claim schema

**Files:**
- Create: `c-suite/package.json`, `c-suite/tsconfig.json`, `c-suite/vitest.config.ts`, `c-suite/biome.json`
- Create: `c-suite/src/claim/schema.ts`
- Test: `c-suite/test/claim/schema.test.ts`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `Provenance` (`"grounded"|"inference"|"speculation"`), `PROVENANCE_RANK: Record<Provenance, number>`, `Citation {file: string; line?: number}`, `Falsification {observable, predicate, args, threshold?, date}`, `Claim {text, provenance, confidence, citations, falsification?, rebuttal?}`, and `parseClaim(input: unknown): Claim` (throws `ZodError` on invalid).

- [ ] **Step 1: Scaffold the package** (folded into this task because the first module needs it)

Create `c-suite/package.json`:
```json
{
  "name": "c-suite",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "bin": { "csuite": "bin/csuite.mjs" },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "biome check src test",
    "build": "tsc -p tsconfig.json"
  },
  "dependencies": { "zod": "^3.23.8" },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "tsx": "^4.19.2",
    "typescript": "^5.6.3",
    "vitest": "^2.1.4",
    "@types/node": "^22.9.0"
  }
}
```
Create `c-suite/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "NodeNext", "moduleResolution": "NodeNext",
    "strict": true, "noUncheckedIndexedAccess": true, "exactOptionalPropertyTypes": true,
    "declaration": true, "outDir": "dist", "skipLibCheck": true, "verbatimModuleSyntax": true
  },
  "include": ["src", "test"]
}
```
Create `c-suite/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { include: ["test/**/*.test.ts"], environment: "node" } });
```
Create `c-suite/biome.json`:
```json
{ "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "formatter": { "enabled": true, "indentStyle": "space", "indentWidth": 2 },
  "linter": { "enabled": true, "rules": { "recommended": true } } }
```
Then: `cd c-suite && pnpm install`.

- [ ] **Step 2: Write the failing test**

Create `c-suite/test/claim/schema.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseClaim, PROVENANCE_RANK } from "../../src/claim/schema.js";

describe("Claim schema", () => {
  it("parses a valid grounded claim with a citation and falsification tuple", () => {
    const c = parseClaim({
      text: "No payment path exists",
      provenance: "grounded",
      confidence: 0.7,
      citations: [{ file: "src/app.ts", line: 12 }],
      falsification: { observable: "billing dir exists", predicate: "path_exists", args: { path: "billing" }, date: "2026-09-01" },
    });
    expect(c.confidence).toBe(0.7);
    expect(c.citations[0]?.file).toBe("src/app.ts");
  });

  it("rejects confidence outside [0,1]", () => {
    expect(() => parseClaim({ text: "x", provenance: "inference", confidence: 1.5 })).toThrow();
  });

  it("rejects an unknown provenance", () => {
    expect(() => parseClaim({ text: "x", provenance: "vibes", confidence: 0.5 })).toThrow();
  });

  it("rejects a falsification date that is not ISO yyyy-mm-dd", () => {
    expect(() => parseClaim({ text: "x", provenance: "inference", confidence: 0.5,
      falsification: { observable: "o", predicate: "path_exists", args: {}, date: "Sept 1" } })).toThrow();
  });

  it("orders the provenance lattice grounded < inference < speculation", () => {
    expect(PROVENANCE_RANK.grounded).toBeLessThan(PROVENANCE_RANK.inference);
    expect(PROVENANCE_RANK.inference).toBeLessThan(PROVENANCE_RANK.speculation);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd c-suite && pnpm vitest run test/claim/schema.test.ts`
Expected: FAIL — cannot resolve `../../src/claim/schema.js`.

- [ ] **Step 4: Write the implementation**

Create `c-suite/src/claim/schema.ts`:
```ts
import { z } from "zod";

export const Provenance = z.enum(["grounded", "inference", "speculation"]);
export type Provenance = z.infer<typeof Provenance>;

/** Epistemic lattice: grounded ⊑ inference ⊑ speculation (lower rank = more grounded). */
export const PROVENANCE_RANK: Record<Provenance, number> = { grounded: 0, inference: 1, speculation: 2 };

export const Citation = z.object({ file: z.string().min(1), line: z.number().int().positive().optional() });
export type Citation = z.infer<typeof Citation>;

export const Falsification = z.object({
  observable: z.string().min(1),
  predicate: z.string().min(1),
  args: z.record(z.string(), z.unknown()).default({}),
  threshold: z.number().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be ISO yyyy-mm-dd"),
});
export type Falsification = z.infer<typeof Falsification>;

export const Claim = z.object({
  text: z.string().min(1),
  provenance: Provenance,
  confidence: z.number().min(0).max(1),
  citations: z.array(Citation).default([]),
  falsification: Falsification.optional(),
  rebuttal: z.string().optional(),
});
export type Claim = z.infer<typeof Claim>;

export function parseClaim(input: unknown): Claim {
  return Claim.parse(input);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd c-suite && pnpm vitest run test/claim/schema.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
cd /Users/jakecastillo/Documents/GitHub
git add c-suite/package.json c-suite/tsconfig.json c-suite/vitest.config.ts c-suite/biome.json c-suite/src/claim/schema.ts c-suite/test/claim/schema.test.ts
git commit -m "feat(claim): typed Claim schema with provenance lattice + falsification tuple"
```

---

### Task 2: Deterministic boundary validator

**Files:**
- Create: `c-suite/src/claim/validator.ts`
- Test: `c-suite/test/claim/validator.test.ts`

**Interfaces:**
- Consumes: `Claim` (Task 1).
- Produces: `ValidationIssue {code: string; message: string}`, `ValidateOptions {repoRoot: string; isHeadline?: boolean; isForecast?: boolean}`, `validateClaim(claim: Claim, opts: ValidateOptions): ValidationIssue[]` (empty array = valid).

- [ ] **Step 1: Write the failing test**

Create `c-suite/test/claim/validator.test.ts`:
```ts
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd c-suite && pnpm vitest run test/claim/validator.test.ts`
Expected: FAIL — cannot resolve `validator.js`.

- [ ] **Step 3: Write the implementation**

Create `c-suite/src/claim/validator.ts`:
```ts
import { existsSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import type { Claim } from "./schema.js";

export interface ValidationIssue { code: string; message: string }
export interface ValidateOptions { repoRoot: string; isHeadline?: boolean; isForecast?: boolean }

export function validateClaim(claim: Claim, opts: ValidateOptions): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const root = resolve(opts.repoRoot);

  if (claim.provenance === "grounded") {
    if (claim.citations.length === 0) {
      issues.push({ code: "grounded_needs_citation", message: "grounded claim must cite at least one file" });
    }
    for (const c of claim.citations) {
      const abs = isAbsolute(c.file) ? c.file : resolve(root, c.file);
      if (!abs.startsWith(root)) {
        issues.push({ code: "citation_escapes_repo", message: `citation escapes repo root: ${c.file}` });
      } else if (!existsSync(abs)) {
        issues.push({ code: "citation_not_found", message: `cited file not found: ${c.file}` });
      }
    }
  }

  if (opts.isHeadline && claim.provenance === "speculation") {
    issues.push({ code: "speculation_headline", message: "speculation cannot headline a recommendation" });
  }

  if (opts.isForecast && !claim.falsification) {
    issues.push({ code: "forecast_needs_falsification", message: "a forecast must carry a falsification tuple" });
  }

  return issues;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd c-suite && pnpm vitest run test/claim/validator.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
cd /Users/jakecastillo/Documents/GitHub
git add c-suite/src/claim/validator.ts c-suite/test/claim/validator.test.ts
git commit -m "feat(claim): deterministic boundary validator (provenance + citation stat-check + forecast invariant)"
```

---

### Task 3: Ledger events + hash-chained append-only store

**Files:**
- Create: `c-suite/src/ledger/events.ts`, `c-suite/src/ledger/store.ts`
- Test: `c-suite/test/ledger/store.test.ts`

**Interfaces:**
- Consumes: nothing from prior tasks (self-contained data layer).
- Produces:
  - `ForecastEvent {kind:"forecast"; id; claim_text; p; source; model_id; decision_type; created_at; resolve_by; predicate; predicate_args}`
  - `ResolutionEvent {kind:"resolution"; id; resolved_at; outcome: boolean; brier: number}`
  - `LedgerEvent = ForecastEvent | ResolutionEvent`; `DecisionType = "demand"|"pricing"|"feasibility"|"pace"|"scope"`
  - `appendEvent(path: string, event: LedgerEvent): void`
  - `readChain(path: string): {event: LedgerEvent; prev_hash: string; hash: string}[]`
  - `verifyChain(path: string): {ok: boolean; brokenAt?: number}`

- [ ] **Step 1: Write the failing test**

Create `c-suite/test/ledger/store.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendEvent, readChain, verifyChain } from "../../src/ledger/store.js";
import type { ForecastEvent, ResolutionEvent } from "../../src/ledger/events.js";

const fc = (id: string): ForecastEvent => ({
  kind: "forecast", id, claim_text: "no payment path", p: 0.7, source: "single",
  model_id: "claude-opus-4-8", decision_type: "demand", created_at: "2026-06-22T10:00:00Z",
  resolve_by: "2026-09-01", predicate: "path_exists", predicate_args: { path: "billing" },
});
const rs = (id: string): ResolutionEvent => ({ kind: "resolution", id, resolved_at: "2026-09-01T10:00:00Z", outcome: false, brier: 0.49 });

describe("hash-chained ledger store", () => {
  it("appends events and reads them back in order", () => {
    const p = join(mkdtempSync(join(tmpdir(), "csuite-led-")), "ledger.jsonl");
    appendEvent(p, fc("a")); appendEvent(p, rs("a"));
    const chain = readChain(p);
    expect(chain.map(c => c.event.kind)).toEqual(["forecast", "resolution"]);
  });
  it("verifies an untampered chain", () => {
    const p = join(mkdtempSync(join(tmpdir(), "csuite-led-")), "ledger.jsonl");
    appendEvent(p, fc("a")); appendEvent(p, fc("b"));
    expect(verifyChain(p)).toEqual({ ok: true });
  });
  it("detects a tampered record", () => {
    const p = join(mkdtempSync(join(tmpdir(), "csuite-led-")), "ledger.jsonl");
    appendEvent(p, fc("a")); appendEvent(p, fc("b"));
    const lines = readFileSync(p, "utf8").split("\n").filter(Boolean);
    const first = JSON.parse(lines[0]!); first.event.p = 0.99;       // tamper the probability
    writeFileSync(p, [JSON.stringify(first), lines[1]].join("\n") + "\n");
    expect(verifyChain(p)).toEqual({ ok: false, brokenAt: 0 });
  });
  it("treats a missing file as an empty chain", () => {
    expect(readChain("/nonexistent/ledger.jsonl")).toEqual([]);
    expect(verifyChain("/nonexistent/ledger.jsonl")).toEqual({ ok: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd c-suite && pnpm vitest run test/ledger/store.test.ts`
Expected: FAIL — cannot resolve `events.js` / `store.js`.

- [ ] **Step 3: Write the events module**

Create `c-suite/src/ledger/events.ts`:
```ts
export type DecisionType = "demand" | "pricing" | "feasibility" | "pace" | "scope";

export interface ForecastEvent {
  kind: "forecast";
  id: string;
  claim_text: string;
  p: number;
  source: string;          // "single" | "board" | persona id (no LLM in v0a; supplied by caller)
  model_id: string;
  decision_type: DecisionType;
  created_at: string;      // ISO datetime, supplied by caller
  resolve_by: string;      // ISO date
  predicate: string;       // predicate id, must exist in the verifier registry (Task 4)
  predicate_args: Record<string, unknown>;
}

export interface ResolutionEvent {
  kind: "resolution";
  id: string;              // references a ForecastEvent.id
  resolved_at: string;
  outcome: boolean;
  brier: number;
}

export type LedgerEvent = ForecastEvent | ResolutionEvent;
```

- [ ] **Step 4: Write the store (hash-chain)**

Create `c-suite/src/ledger/store.ts`:
```ts
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import type { LedgerEvent } from "./events.js";

interface ChainedLine { event: LedgerEvent; prev_hash: string; hash: string }
const GENESIS = "0".repeat(64);

/** Canonical JSON with sorted keys (one level deep is enough for our flat events + small args). */
function canonical(event: LedgerEvent): string {
  return JSON.stringify(event, Object.keys(event as Record<string, unknown>).sort());
}
function hashOf(prev: string, event: LedgerEvent): string {
  return createHash("sha256").update(prev + canonical(event)).digest("hex");
}

export function readChain(path: string): ChainedLine[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as ChainedLine);
}

export function appendEvent(path: string, event: LedgerEvent): void {
  const chain = readChain(path);
  const prev = chain.length ? chain[chain.length - 1]!.hash : GENESIS;
  const line: ChainedLine = { event, prev_hash: prev, hash: hashOf(prev, event) };
  appendFileSync(path, `${JSON.stringify(line)}\n`);
}

export function verifyChain(path: string): { ok: boolean; brokenAt?: number } {
  const chain = readChain(path);
  let prev = GENESIS;
  for (let i = 0; i < chain.length; i++) {
    const line = chain[i]!;
    if (line.prev_hash !== prev || line.hash !== hashOf(prev, line.event)) return { ok: false, brokenAt: i };
    prev = line.hash;
  }
  return { ok: true };
}
```

> Note: `canonical()` sorts top-level keys; `predicate_args` is small and written by us, so nested-key order is stable in practice. If args grow, swap in a deterministic deep-stringify — out of scope for v0a.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd c-suite && pnpm vitest run test/ledger/store.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
cd /Users/jakecastillo/Documents/GitHub
git add c-suite/src/ledger/events.ts c-suite/src/ledger/store.ts c-suite/test/ledger/store.test.ts
git commit -m "feat(ledger): event-sourced hash-chained append-only store with tamper detection"
```

---

### Task 4: Deterministic git/fs predicates (the verifier firewall)

**Files:**
- Create: `c-suite/src/verifier/predicates.ts`
- Create: `c-suite/test/helpers/tmp-git.ts`
- Test: `c-suite/test/verifier/predicates.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `PredicateContext {repoRoot: string; asOf: string}` (asOf = ISO date the resolution runs)
  - `Predicate = (args: Record<string, unknown>, ctx: PredicateContext) => boolean`
  - `PREDICATES: Record<string, Predicate>` with keys `path_exists`, `commits_to_since`, `branch_abandoned`
  - `runPredicate(id: string, args, ctx): boolean` (throws `Error` on unknown id)
  - helper (test only): `makeTmpGitRepo(): {root; commit; writeFile; branch}`

- [ ] **Step 1: Write the git test helper**

Create `c-suite/test/helpers/tmp-git.ts`:
```ts
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export function makeTmpGitRepo() {
  const root = mkdtempSync(join(tmpdir(), "csuite-git-"));
  const git = (...args: string[]) => execFileSync("git", args, { cwd: root, stdio: "pipe" }).toString();
  git("init", "-q");
  git("config", "user.email", "t@t.dev");
  git("config", "user.name", "t");
  return {
    root,
    writeFile(rel: string, content = "x") { mkdirSync(join(root, dirname(rel)), { recursive: true }); writeFileSync(join(root, rel), content); },
    commit(msg: string) { git("add", "-A"); git("commit", "-q", "-m", msg, "--date", "2026-06-20T10:00:00"); },
    branch(name: string) { git("branch", name); },
    git,
  };
}
```

- [ ] **Step 2: Write the failing test**

Create `c-suite/test/verifier/predicates.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { runPredicate } from "../../src/verifier/predicates.js";
import { makeTmpGitRepo } from "../helpers/tmp-git.js";

describe("deterministic predicates", () => {
  it("path_exists is true for a committed path, false otherwise", () => {
    const r = makeTmpGitRepo(); r.writeFile("billing/index.ts"); r.commit("add billing");
    const ctx = { repoRoot: r.root, asOf: "2026-09-01" };
    expect(runPredicate("path_exists", { path: "billing" }, ctx)).toBe(true);
    expect(runPredicate("path_exists", { path: "marketing" }, ctx)).toBe(false);
  });
  it("commits_to_since counts commits touching a path after a date", () => {
    const r = makeTmpGitRepo(); r.writeFile("app/api/pay.ts"); r.commit("add pay");
    const ctx = { repoRoot: r.root, asOf: "2026-09-01" };
    expect(runPredicate("commits_to_since", { path: "app/api", since: "2026-06-01" }, ctx)).toBe(true);
    expect(runPredicate("commits_to_since", { path: "app/api", since: "2026-07-01" }, ctx)).toBe(false);
  });
  it("branch_abandoned is true when a branch has no commits in N days before asOf", () => {
    const r = makeTmpGitRepo(); r.writeFile("a.ts"); r.commit("base"); r.branch("spike/dynamo");
    const ctx = { repoRoot: r.root, asOf: "2026-09-01" };
    expect(runPredicate("branch_abandoned", { branch: "spike/dynamo", days: 30 }, ctx)).toBe(true);
  });
  it("throws on an unknown predicate id", () => {
    const r = makeTmpGitRepo();
    expect(() => runPredicate("ask_the_model", {}, { repoRoot: r.root, asOf: "2026-09-01" })).toThrow(/unknown predicate/);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd c-suite && pnpm vitest run test/verifier/predicates.test.ts`
Expected: FAIL — cannot resolve `predicates.js`.

- [ ] **Step 4: Write the implementation**

Create `c-suite/src/verifier/predicates.ts`:
```ts
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";

export interface PredicateContext { repoRoot: string; asOf: string } // asOf: ISO date
export type Predicate = (args: Record<string, unknown>, ctx: PredicateContext) => boolean;

function git(ctx: PredicateContext, ...args: string[]): string {
  return execFileSync("git", args, { cwd: ctx.repoRoot, stdio: "pipe" }).toString().trim();
}
function str(args: Record<string, unknown>, key: string): string {
  const v = args[key];
  if (typeof v !== "string" || v.length === 0) throw new Error(`predicate arg '${key}' must be a non-empty string`);
  return v;
}
function num(args: Record<string, unknown>, key: string): number {
  const v = args[key];
  if (typeof v !== "number") throw new Error(`predicate arg '${key}' must be a number`);
  return v;
}
function inRepo(ctx: PredicateContext, rel: string): string {
  const abs = isAbsolute(rel) ? rel : resolve(ctx.repoRoot, rel);
  if (!abs.startsWith(resolve(ctx.repoRoot))) throw new Error(`path escapes repo: ${rel}`);
  return abs;
}

export const PREDICATES: Record<string, Predicate> = {
  /** A file or directory exists in the working tree. */
  path_exists: (args, ctx) => existsSync(inRepo(ctx, str(args, "path"))),

  /** ≥1 commit touched `path` strictly after `since` (ISO date) and on/before asOf. */
  commits_to_since: (args, ctx) => {
    const path = str(args, "path");
    const since = str(args, "since");
    const out = git(ctx, "log", `--since=${since}`, `--until=${ctx.asOf} 23:59:59`, "--oneline", "--", path);
    return out.length > 0;
  },

  /** `branch` exists and its tip commit is older than `days` before asOf (no recent activity). */
  branch_abandoned: (args, ctx) => {
    const branch = str(args, "branch");
    const days = num(args, "days");
    let iso: string;
    try { iso = git(ctx, "log", "-1", "--format=%cI", branch); } catch { return false; } // branch missing → not "abandoned"
    if (!iso) return false;
    const tip = Date.parse(iso);
    const asOf = Date.parse(`${ctx.asOf}T00:00:00Z`);
    return asOf - tip > days * 24 * 60 * 60 * 1000;
  },
};

export function runPredicate(id: string, args: Record<string, unknown>, ctx: PredicateContext): boolean {
  const p = PREDICATES[id];
  if (!p) throw new Error(`unknown predicate: ${id}`);
  return p(args, ctx);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd c-suite && pnpm vitest run test/verifier/predicates.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
cd /Users/jakecastillo/Documents/GitHub
git add c-suite/src/verifier/predicates.ts c-suite/test/helpers/tmp-git.ts c-suite/test/verifier/predicates.test.ts
git commit -m "feat(verifier): deterministic git/fs predicates (path_exists, commits_to_since, branch_abandoned)"
```

---

### Task 5: Brier scoring + the tripwire resolver

**Files:**
- Create: `c-suite/src/scoring/brier.ts`, `c-suite/src/verifier/resolve.ts`
- Test: `c-suite/test/scoring/brier.test.ts`, `c-suite/test/verifier/resolve.test.ts`

**Interfaces:**
- Consumes: `runPredicate` + `PredicateContext` (Task 4); `ForecastEvent`/`ResolutionEvent` (Task 3).
- Produces:
  - `brier(p: number, outcome: boolean): number` (returns `(p - (outcome?1:0))^2`)
  - `resolveForecast(forecast: ForecastEvent, ctx: PredicateContext, resolvedAt: string): ResolutionEvent`

- [ ] **Step 1: Write the failing Brier test**

Create `c-suite/test/scoring/brier.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { brier } from "../../src/scoring/brier.js";

describe("brier", () => {
  it("is 0 for a perfectly confident correct prediction", () => { expect(brier(1, true)).toBe(0); });
  it("is 1 for a perfectly confident wrong prediction", () => { expect(brier(1, false)).toBe(1); });
  it("is 0.25 for a coin-flip", () => { expect(brier(0.5, true)).toBe(0.25); expect(brier(0.5, false)).toBe(0.25); });
});
```

- [ ] **Step 2: Run + fail, then implement brier**

Run: `cd c-suite && pnpm vitest run test/scoring/brier.test.ts` → FAIL (no `brier.js`).
Create `c-suite/src/scoring/brier.ts`:
```ts
/** Proper scoring rule (lower is better). p in [0,1], outcome boolean. */
export function brier(p: number, outcome: boolean): number {
  const y = outcome ? 1 : 0;
  return (p - y) ** 2;
}
```
Run again → PASS (3 tests).

- [ ] **Step 3: Write the failing resolver test**

Create `c-suite/test/verifier/resolve.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { resolveForecast } from "../../src/verifier/resolve.js";
import { makeTmpGitRepo } from "../helpers/tmp-git.js";
import type { ForecastEvent } from "../../src/ledger/events.js";

const forecast = (over: Partial<ForecastEvent>): ForecastEvent => ({
  kind: "forecast", id: "a", claim_text: "billing exists by Sep", p: 0.3, source: "single",
  model_id: "m", decision_type: "feasibility", created_at: "2026-06-22T10:00:00Z",
  resolve_by: "2026-09-01", predicate: "path_exists", predicate_args: { path: "billing" }, ...over,
});

describe("resolveForecast", () => {
  it("resolves outcome=true and scores when the predicate holds", () => {
    const r = makeTmpGitRepo(); r.writeFile("billing/x.ts"); r.commit("add billing");
    const res = resolveForecast(forecast({ p: 0.3 }), { repoRoot: r.root, asOf: "2026-09-01" }, "2026-09-01T10:00:00Z");
    expect(res).toMatchObject({ kind: "resolution", id: "a", outcome: true });
    expect(res.brier).toBeCloseTo(0.49); // (0.3 - 1)^2
  });
  it("resolves outcome=false when the predicate does not hold", () => {
    const r = makeTmpGitRepo(); r.writeFile("readme.md"); r.commit("init");
    const res = resolveForecast(forecast({ p: 0.3 }), { repoRoot: r.root, asOf: "2026-09-01" }, "2026-09-01T10:00:00Z");
    expect(res.outcome).toBe(false);
    expect(res.brier).toBeCloseTo(0.09); // (0.3 - 0)^2
  });
});
```

- [ ] **Step 4: Run + fail, then implement resolver**

Run: `cd c-suite && pnpm vitest run test/verifier/resolve.test.ts` → FAIL.
Create `c-suite/src/verifier/resolve.ts`:
```ts
import type { ForecastEvent, ResolutionEvent } from "../ledger/events.js";
import { brier } from "../scoring/brier.js";
import { type PredicateContext, runPredicate } from "./predicates.js";

export function resolveForecast(forecast: ForecastEvent, ctx: PredicateContext, resolvedAt: string): ResolutionEvent {
  const outcome = runPredicate(forecast.predicate, forecast.predicate_args, ctx);
  return { kind: "resolution", id: forecast.id, resolved_at: resolvedAt, outcome, brier: brier(forecast.p, outcome) };
}
```
Run again → PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd /Users/jakecastillo/Documents/GitHub
git add c-suite/src/scoring/brier.ts c-suite/src/verifier/resolve.ts c-suite/test/scoring/brier.test.ts c-suite/test/verifier/resolve.test.ts
git commit -m "feat(scoring): Brier score + deterministic tripwire resolver"
```

---

### Task 6: Project events → current state

**Files:**
- Create: `c-suite/src/ledger/project.ts`
- Test: `c-suite/test/ledger/project.test.ts`

**Interfaces:**
- Consumes: `readChain` (Task 3), `LedgerEvent`/`ForecastEvent`/`DecisionType` (Task 3).
- Produces:
  - `ForecastState {id; claim_text; p; decision_type; resolve_by; status: "open"|"resolved"; outcome?: boolean; brier?: number}`
  - `projectState(path: string): ForecastState[]` (folds forecast + resolution events; a forecast with a matching resolution is `resolved`)
  - `dueForecasts(path: string, asOf: string): ForecastEvent[]` (open forecasts whose `resolve_by` ≤ asOf)

- [ ] **Step 1: Write the failing test**

Create `c-suite/test/ledger/project.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendEvent } from "../../src/ledger/store.js";
import { projectState, dueForecasts } from "../../src/ledger/project.js";
import type { ForecastEvent, ResolutionEvent } from "../../src/ledger/events.js";

const fc = (id: string, resolve_by: string): ForecastEvent => ({
  kind: "forecast", id, claim_text: id, p: 0.4, source: "single", model_id: "m",
  decision_type: "demand", created_at: "2026-06-22T10:00:00Z", resolve_by,
  predicate: "path_exists", predicate_args: { path: "x" },
});
const rs = (id: string): ResolutionEvent => ({ kind: "resolution", id, resolved_at: "2026-09-01T10:00:00Z", outcome: true, brier: 0.36 });

describe("projectState / dueForecasts", () => {
  it("marks a forecast resolved once its resolution event arrives", () => {
    const p = join(mkdtempSync(join(tmpdir(), "csuite-proj-")), "l.jsonl");
    appendEvent(p, fc("a", "2026-09-01")); appendEvent(p, fc("b", "2026-10-01")); appendEvent(p, rs("a"));
    const state = projectState(p);
    expect(state.find(s => s.id === "a")?.status).toBe("resolved");
    expect(state.find(s => s.id === "a")?.outcome).toBe(true);
    expect(state.find(s => s.id === "b")?.status).toBe("open");
  });
  it("returns only open forecasts due on/before asOf", () => {
    const p = join(mkdtempSync(join(tmpdir(), "csuite-proj-")), "l.jsonl");
    appendEvent(p, fc("a", "2026-09-01")); appendEvent(p, fc("b", "2026-10-01")); appendEvent(p, rs("a"));
    expect(dueForecasts(p, "2026-09-15").map(f => f.id)).toEqual(["b"].filter(() => false).concat([])); // a is resolved, b not yet due
    expect(dueForecasts(p, "2026-10-01").map(f => f.id)).toEqual(["b"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd c-suite && pnpm vitest run test/ledger/project.test.ts`
Expected: FAIL — cannot resolve `project.js`.

- [ ] **Step 3: Write the implementation**

Create `c-suite/src/ledger/project.ts`:
```ts
import type { DecisionType, ForecastEvent } from "./events.js";
import { readChain } from "./store.js";

export interface ForecastState {
  id: string; claim_text: string; p: number; decision_type: DecisionType; resolve_by: string;
  status: "open" | "resolved"; outcome?: boolean; brier?: number;
}

export function projectState(path: string): ForecastState[] {
  const byId = new Map<string, ForecastState>();
  for (const { event } of readChain(path)) {
    if (event.kind === "forecast") {
      byId.set(event.id, {
        id: event.id, claim_text: event.claim_text, p: event.p,
        decision_type: event.decision_type, resolve_by: event.resolve_by, status: "open",
      });
    } else {
      const cur = byId.get(event.id);
      if (cur) { cur.status = "resolved"; cur.outcome = event.outcome; cur.brier = event.brier; }
    }
  }
  return [...byId.values()];
}

export function dueForecasts(path: string, asOf: string): ForecastEvent[] {
  const resolved = new Set<string>();
  const forecasts: ForecastEvent[] = [];
  for (const { event } of readChain(path)) {
    if (event.kind === "resolution") resolved.add(event.id);
    else forecasts.push(event);
  }
  return forecasts.filter((f) => !resolved.has(f.id) && f.resolve_by <= asOf);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd c-suite && pnpm vitest run test/ledger/project.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd /Users/jakecastillo/Documents/GitHub
git add c-suite/src/ledger/project.ts c-suite/test/ledger/project.test.ts
git commit -m "feat(ledger): fold events into forecast state + due-forecast selection"
```

---

### Task 7: Calibration report (`track-record`)

**Files:**
- Create: `c-suite/src/report/track-record.ts`
- Test: `c-suite/test/report/track-record.test.ts`

**Interfaces:**
- Consumes: `ForecastState` (Task 6).
- Produces:
  - `CalibrationBucket {label: string; predicted: number; observed: number; n: number}`
  - `CalibrationReport {resolved: number; open: number; meanBrier: number | null; reliability: "overconfident"|"underconfident"|"calibrated"|"insufficient"; buckets: CalibrationBucket[]}`
  - `calibrationReport(states: ForecastState[]): CalibrationReport`
  - `renderReport(r: CalibrationReport): string`

- [ ] **Step 1: Write the failing test**

Create `c-suite/test/report/track-record.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { calibrationReport, renderReport } from "../../src/report/track-record.js";
import type { ForecastState } from "../../src/ledger/project.js";

const resolved = (p: number, outcome: boolean): ForecastState =>
  ({ id: Math.random().toString(), claim_text: "c", p, decision_type: "demand", resolve_by: "2026-09-01", status: "resolved", outcome, brier: (p-(outcome?1:0))**2 });

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
    const open: ForecastState = { id: "o", claim_text: "c", p: 0.5, decision_type: "demand", resolve_by: "2027-01-01", status: "open" };
    const r = calibrationReport([open, resolved(0.8, true)]);
    expect(r.open).toBe(1);
    expect(r.resolved).toBe(1);
  });
  it("renders a human-readable string", () => {
    const out = renderReport(calibrationReport([resolved(0.8, true)]));
    expect(out).toContain("resolved");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd c-suite && pnpm vitest run test/report/track-record.test.ts`
Expected: FAIL — cannot resolve `track-record.js`.

- [ ] **Step 3: Write the implementation**

Create `c-suite/src/report/track-record.ts`:
```ts
import type { ForecastState } from "../ledger/project.js";

export interface CalibrationBucket { label: string; predicted: number; observed: number; n: number }
export interface CalibrationReport {
  resolved: number; open: number; meanBrier: number | null;
  reliability: "overconfident" | "underconfident" | "calibrated" | "insufficient";
  buckets: CalibrationBucket[];
}

const MIN_RESOLVED = 8; // shrinkage floor (spec §7: never a raw score at n<8)

export function calibrationReport(states: ForecastState[]): CalibrationReport {
  const resolved = states.filter((s) => s.status === "resolved" && s.outcome !== undefined);
  const open = states.length - resolved.length;
  if (resolved.length === 0) return { resolved: 0, open, meanBrier: null, reliability: "insufficient", buckets: [] };

  const meanBrier = resolved.reduce((a, s) => a + (s.brier ?? 0), 0) / resolved.length;

  // Bucket predictions into deciles; observed = hit rate; predicted = mean p.
  const edges = [0, 0.2, 0.4, 0.6, 0.8, 1.0001];
  const buckets: CalibrationBucket[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const inB = resolved.filter((s) => s.p >= edges[i]! && s.p < edges[i + 1]!);
    if (inB.length === 0) continue;
    buckets.push({
      label: `${edges[i]!.toFixed(1)}-${edges[i + 1]! > 1 ? "1.0" : edges[i + 1]!.toFixed(1)}`,
      predicted: inB.reduce((a, s) => a + s.p, 0) / inB.length,
      observed: inB.filter((s) => s.outcome).length / inB.length,
      n: inB.length,
    });
  }

  let reliability: CalibrationReport["reliability"] = "insufficient";
  if (resolved.length >= MIN_RESOLVED) {
    // mean(predicted) - mean(observed): positive => overconfident.
    const gap = resolved.reduce((a, s) => a + s.p, 0) / resolved.length
              - resolved.filter((s) => s.outcome).length / resolved.length;
    reliability = gap > 0.1 ? "overconfident" : gap < -0.1 ? "underconfident" : "calibrated";
  }

  return { resolved: resolved.length, open, meanBrier, reliability, buckets };
}

export function renderReport(r: CalibrationReport): string {
  const lines = [
    `c-suite track record — ${r.resolved} resolved, ${r.open} open`,
    r.meanBrier === null ? "no resolved predictions yet" : `mean Brier: ${r.meanBrier.toFixed(3)} (0=perfect, 0.25=coin-flip)`,
    `calibration: ${r.reliability}`,
    ...r.buckets.map((b) => `  p≈${b.predicted.toFixed(2)} → happened ${(b.observed * 100).toFixed(0)}% (n=${b.n})`),
  ];
  if (r.reliability === "insufficient") lines.push(`(need ${MIN_RESOLVED}+ resolved predictions before calibration is trustworthy)`);
  return lines.join("\n");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd c-suite && pnpm vitest run test/report/track-record.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd /Users/jakecastillo/Documents/GitHub
git add c-suite/src/report/track-record.ts c-suite/test/report/track-record.test.ts
git commit -m "feat(report): calibration report + render (shrinkage floor at n<8)"
```

---

### Task 8: CLI wiring (`csuite predict | resolve | track-record`)

**Files:**
- Create: `c-suite/src/cli.ts`, `c-suite/bin/csuite.mjs`
- Test: `c-suite/test/cli/cli.test.ts`

**Interfaces:**
- Consumes: `parseClaim`+`Claim` (T1), `validateClaim` (T2), `appendEvent`+`verifyChain`+events (T3), `runPredicate` (T4), `resolveForecast` (T5), `projectState`+`dueForecasts` (T6), `calibrationReport`+`renderReport` (T7).
- Produces: `runCli(argv: string[], env: {repoRoot: string; ledgerPath: string; now: string; today: string; modelId: string}): {code: number; out: string}` — pure-ish (clock injected). `csuite.mjs` supplies real clock + paths.

- [ ] **Step 1: Write the failing integration test**

Create `c-suite/test/cli/cli.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { makeTmpGitRepo } from "../helpers/tmp-git.js";
import { runCli } from "../../src/cli.js";

function env(root: string) {
  return { repoRoot: root, ledgerPath: join(root, "board", "decisions.jsonl"), now: "2026-06-22T10:00:00Z", today: "2026-09-01", modelId: "claude-opus-4-8" };
}

describe("csuite CLI", () => {
  it("predict → resolve → track-record produces a calibration line", () => {
    const r = makeTmpGitRepo(); r.writeFile("readme.md"); r.commit("init");
    const e = env(r.root);

    const predict = runCli(["predict", "--text", "billing will exist", "--p", "0.3",
      "--type", "feasibility", "--by", "2026-09-01", "--predicate", "path_exists", "--arg", "path=billing"], e);
    expect(predict.code).toBe(0);
    expect(predict.out).toMatch(/recorded forecast/);

    const resolve = runCli(["resolve"], e); // billing was never created → outcome false, p=0.3 → brier 0.09
    expect(resolve.code).toBe(0);
    expect(resolve.out).toMatch(/resolved 1/);

    const track = runCli(["track-record"], e);
    expect(track.out).toMatch(/1 resolved/);
  });

  it("rejects a forecast with no falsification predicate", () => {
    const r = makeTmpGitRepo(); r.writeFile("a", "x"); r.commit("i");
    const out = runCli(["predict", "--text", "vibes", "--p", "0.5", "--type", "demand", "--by", "2026-09-01"], env(r.root));
    expect(out.code).toBe(1);
    expect(out.out).toMatch(/forecast_needs_falsification|predicate/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd c-suite && pnpm vitest run test/cli/cli.test.ts`
Expected: FAIL — cannot resolve `cli.js`.

- [ ] **Step 3: Write the CLI**

Create `c-suite/src/cli.ts`:
```ts
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { parseClaim } from "./claim/schema.js";
import { validateClaim } from "./claim/validator.js";
import type { DecisionType, ForecastEvent } from "./ledger/events.js";
import { appendEvent } from "./ledger/store.js";
import { dueForecasts, projectState } from "./ledger/project.js";
import { resolveForecast } from "./verifier/resolve.js";
import { calibrationReport, renderReport } from "./report/track-record.js";

export interface CliEnv { repoRoot: string; ledgerPath: string; now: string; today: string; modelId: string }

function flags(argv: string[]): { _: string[]; opts: Record<string, string>; args: Record<string, unknown> } {
  const _: string[] = []; const opts: Record<string, string> = {}; const args: Record<string, unknown> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--arg") { const [k, v] = (argv[++i] ?? "").split("="); if (k) args[k] = v; }
    else if (a.startsWith("--")) opts[a.slice(2)] = argv[++i] ?? "";
    else _.push(a);
  }
  return { _, opts, args };
}
const DECISION_TYPES = new Set<DecisionType>(["demand", "pricing", "feasibility", "pace", "scope"]);
function id(seed: string): string { return `f_${Buffer.from(seed).toString("hex").slice(0, 12)}`; }

export function runCli(argv: string[], env: CliEnv): { code: number; out: string } {
  const { _, opts, args } = flags(argv);
  const cmd = _[0];
  mkdirSync(dirname(env.ledgerPath), { recursive: true });

  if (cmd === "predict") {
    const dtype = opts.type as DecisionType;
    if (!DECISION_TYPES.has(dtype)) return { code: 1, out: `error: --type must be one of ${[...DECISION_TYPES].join("|")}` };
    if (!opts.predicate) return { code: 1, out: "error: forecast_needs_falsification (pass --predicate and --arg)" };
    const claim = parseClaim({
      text: opts.text, provenance: "inference", confidence: Number(opts.p),
      falsification: { observable: opts.text ?? "", predicate: opts.predicate, args, date: opts.by ?? "" },
    });
    const issues = validateClaim(claim, { repoRoot: env.repoRoot, isForecast: true });
    if (issues.length) return { code: 1, out: `rejected: ${issues.map((i) => i.code).join(", ")}` };
    const ev: ForecastEvent = {
      kind: "forecast", id: id(`${opts.text}${env.now}`), claim_text: opts.text ?? "", p: Number(opts.p),
      source: "single", model_id: env.modelId, decision_type: dtype, created_at: env.now,
      resolve_by: opts.by ?? "", predicate: opts.predicate, predicate_args: args,
    };
    appendEvent(env.ledgerPath, ev);
    return { code: 0, out: `recorded forecast ${ev.id} (p=${ev.p}, resolve_by=${ev.resolve_by})` };
  }

  if (cmd === "resolve") {
    const due = dueForecasts(env.ledgerPath, env.today);
    for (const f of due) appendEvent(env.ledgerPath, resolveForecast(f, { repoRoot: env.repoRoot, asOf: env.today }, env.now));
    return { code: 0, out: `resolved ${due.length} forecast(s) as of ${env.today}` };
  }

  if (cmd === "track-record") {
    return { code: 0, out: renderReport(calibrationReport(projectState(env.ledgerPath))) };
  }

  return { code: 1, out: "usage: csuite <predict|resolve|track-record> [...flags]" };
}
```

Create `c-suite/bin/csuite.mjs`:
```js
#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { register } from "node:module";
register("tsx/esm", import.meta.url);
const { runCli } = await import("../src/cli.ts");
const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"]).toString().trim();
const now = new Date().toISOString();
const today = now.slice(0, 10);
const env = { repoRoot, ledgerPath: `${repoRoot}/board/decisions.jsonl`, now, today, modelId: process.env.CSUITE_MODEL ?? "claude-opus-4-8" };
const { code, out } = runCli(process.argv.slice(2), env);
console.log(out);
process.exit(code);
```

> `bin/csuite.mjs` is the *only* place real time/`Date` is read (forbidden in core per Global Constraints). It's thin and untested; all logic lives in the unit-tested `runCli`.

- [ ] **Step 4: Run the integration test to verify it passes**

Run: `cd c-suite && pnpm vitest run test/cli/cli.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Run the full suite + lint**

Run: `cd c-suite && pnpm test && pnpm lint`
Expected: all tests PASS; Biome clean.

- [ ] **Step 6: Commit**

```bash
cd /Users/jakecastillo/Documents/GitHub
git add c-suite/src/cli.ts c-suite/bin/csuite.mjs c-suite/test/cli/cli.test.ts
git commit -m "feat(cli): csuite predict|resolve|track-record over the deterministic spine"
```

---

## Roadmap (subsequent plans — NOT this plan)

This plan delivers **v0a-core**: the deterministic, LLM-free calibration ledger. It is working, testable software on its own (`csuite predict | resolve | track-record`). The remaining build order from the spec (each its own plan):

1. **v0a-llm** — claim *emission* via `claude -p` (a single advisor + self-red-team) that produces a typed `Claim` → routed through this validator → ledger; `/next-experiment` Tier-A asset drafting to a scratch branch; the post-commit nudge hook. *(Adds the LLM boundary + the draft-and-queue value; reuses this entire core.)*
2. **v0b-board** — the N-process board engine feeding this same claim/ledger layer, gated by the **weekend proof** (zero-code, `weekend-proof/`) and the baseline-delta eval (spec §11.1). Build only if the board clears the gate; the spine ships regardless.
3. **v1-hardening** — secret pre-scan/`.csuiteignore`, prompt-injection hardening, `irreversible-gate`, LICENSE/NOTICE, eval suite in CI, Claude-plugin packaging.

## Self-Review

- **Spec coverage (v0a scope):** typed claim algebra → T1/T2; forecast-record ledger + hash-chain → T3; deterministic tripwire verifier (code, not model) → T4; proper scoring → T5; event projection + due-selection → T6; `/track-record` calibration display → T7; CLI surface → T8. The LLM-facing v0a pieces (claim emission, `/next-experiment`, nudge) are explicitly the next plan (roadmap #1), not silently dropped.
- **No placeholders:** every code step contains complete, runnable code; every run step states the exact command + expected result.
- **Type consistency:** `ForecastEvent`/`ResolutionEvent`/`DecisionType` defined in T3 are consumed unchanged in T5/T6/T8; `ForecastState` defined in T6 is consumed in T7; `PredicateContext` defined in T4 is consumed in T5/T8; `Claim`/`parseClaim` from T1 consumed in T2/T8; `validateClaim`/`ValidateOptions` from T2 consumed in T8. No name drift.
- **Determinism honored:** no `Date.now()`/`Math.random()` in `src/` except the test helper's `Math.random()` id (test-only) and the thin untested `bin/csuite.mjs`. Clocks are injected via `CliEnv`.
