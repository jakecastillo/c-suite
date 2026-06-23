# c-suite

**A repo-grounded calibration ledger for your decisions.**

Record a decision as a *falsifiable forecast*, let a **deterministic verifier** (code, never a model) resolve it against your repository's real git/filesystem state, and watch your **calibration** accrue over a tamper-evident, hash-chained ledger.

```
$ csuite predict --text "users will reach the pricing page" --p 0.6 --type demand \
    --by 2026-09-01 --predicate path_exists --arg path=src/app/pricing.tsx
recorded forecast f_7573657273 (p=0.6, resolve_by=2026-09-01)

$ csuite resolve          # on/after the date, checks the tripwire against reality
resolved 1 forecast(s) as of 2026-09-02

$ csuite track-record
c-suite track record — 1 resolved, 0 open
mean Brier: 0.360 (0=perfect, 0.25=coin-flip)
calibration: insufficient
  p≈0.60 → happened 0% (n=1)
(need 8+ resolved predictions before calibration is trustworthy)
```

> **Status: v0.1.0 — the deterministic calibration spine.** This is the LLM-free,
> board-free core: you write the typed prediction, and the tool grades it against
> git. The AI advisory board and the LLM that *drafts* these predictions for you
> are deliberately *later* layers (see [Roadmap](#roadmap)). The spine is the part
> that's interesting on its own — and the part that retains.

---

## Why

You have good judgment in some domains and worse judgment in others, but you can't
*tell which* — "I have good instincts" is unfalsifiable. c-suite makes it
falsifiable: every call you record is a probability + a machine-checkable tripwire
+ a date. When the date arrives, **reality grades it for you**, with a proper
scoring rule, over a hash-chain that can't be quietly edited after the fact. Over
months this becomes the one thing no tool can hand you on day one and no
competitor can copy: *a verified record of which of your bets were right.*

The design principle is **separation**: an LLM may eventually *propose* a
prediction, but it is **never** consulted to *resolve* one — resolution is plain
code reading git. That "verifier firewall" is what keeps the track record honest.

## Install

Requires **Node ≥ 20** and `git`. (Currently run from source; not yet published to npm.)

```bash
git clone <this-repo> && cd c-suite
pnpm install
pnpm build          # compiles src/ -> dist/ (the bin runs the compiled output)
node bin/csuite.mjs --help
# optional: `npm link` (or `pnpm link --global`) to get `csuite` on your PATH
```

By default the tool grounds against your **git toplevel**; override with
`CSUITE_REPO=/path/to/repo`.

## Usage

```
csuite predict --text <claim> --p <0..1> --type <type> --by <yyyy-mm-dd> \
               --predicate <name> --arg key=value [--arg key=value ...]
csuite resolve                 # resolve every forecast whose date has passed
csuite track-record            # show your calibration (and verify the chain)
csuite verify                  # check the ledger's hash chain for tampering
csuite help | --version
```

**Decision types:** `demand` · `pricing` · `feasibility` · `pace` · `scope`
(so calibration can be pooled by kind of decision).

**Predicates** (the deterministic tripwires — all read git/fs, never a model):

| Predicate | Args | True when |
|---|---|---|
| `path_exists` | `path=<p>` | the path exists in the working tree |
| `commits_to_since` | `path=<p>` `since=<yyyy-mm-dd>` | ≥1 commit touched `<p>` after `<since>` |
| `branch_abandoned` | `branch=<b>` `days=<n>` | `<b>`'s tip is older than `<n>` days |

**Environment:**

| Var | Default | Purpose |
|---|---|---|
| `CSUITE_REPO` | git toplevel | repo root to ground against (use for subdirs/monorepos) |
| `CSUITE_MODEL` | `claude-opus-4-8` | model id stamped on forecasts (for later layers) |

The ledger lives at **`<repo>/board/decisions.jsonl`** — local-by-default
(git-ignored), append-only, hash-chained. Resolving never mutates a forecast; it
appends a separate resolution event, so the chain stays verifiable.

## How it works

```
  you (or, later, an LLM)
        │  predict: a typed Claim {provenance, confidence, falsification:(observable,threshold,date)}
        ▼
  ┌──────────────────────────────────────────────┐
  │  boundary validator (code) — rejects an       │
  │  unfalsifiable or ungrounded forecast          │
  └───────────────────┬──────────────────────────┘
                      ▼  append
  ┌──────────────────────────────────────────────┐
  │  hash-chained append-only ledger              │
  │  (board/decisions.jsonl)                       │
  └───────────────────┬──────────────────────────┘
        resolve: on/after the date │
                      ▼
  ┌──────────────────────────────────────────────┐
  │  deterministic VERIFIER (git/fs predicates)   │  ← never a model
  │  → outcome → Brier score → append resolution   │
  └───────────────────┬──────────────────────────┘
                      ▼
  ┌──────────────────────────────────────────────┐
  │  track-record: calibration curve + reliability │
  └──────────────────────────────────────────────┘
```

It's a small control loop: **predict → git observes → a deterministic verifier
resolves → proper-score → recalibrate.** The full architectural rationale (and the
honest limits) is in [`docs/superpowers/specs/2026-06-22-c-suite-design.md`](docs/superpowers/specs/2026-06-22-c-suite-design.md).

## Roadmap

v0.1.0 is the spine. It is designed so the layers above it can be added (or fail)
without rework — and so the spine retains value even if they're never built:

1. **LLM claim emission** — `claude -p` (a single advisor + a self-red-team) *drafts*
   the typed forecast from a decision you describe, routed through the same
   validator and ledger. Plus a `/next-experiment` that drafts the test's assets,
   and a post-commit nudge.
2. **The board** — a multi-persona executive board (CEO/CMO/CFO/CPO + an independent
   director + a neutral chair) for the big, irreversible calls — gated behind a
   "does it actually beat one good prompt?" experiment (`weekend-proof/`).
3. **Hardening** — secret-scan, prompt-injection guards, packaging.

## Development

```bash
pnpm check     # typecheck (src+test) + build + test + lint, all in one
# or individually:
pnpm typecheck # tsc strict over src + test (Vitest transpiles, so this is the real type gate)
pnpm build     # tsc -> dist/
pnpm test      # Vitest (unit + an e2e test that runs the actual binary)
pnpm lint      # Biome
```

All logic lives in the unit-tested `runCli`; `bin/csuite.mjs` is a thin shim
(the only place real time/paths are read), covered by an end-to-end test.

## Honest limits

- It grades **what's observable in git**. The most decision-relevant outcomes
  (*"did anyone pay?"*) usually aren't — those need a number you bring it.
- Calibration takes **months** of resolved predictions to become trustworthy
  (the `track-record` view says so until you have ≥8).
- v0.1.0 has **no LLM** — you write the typed prediction yourself. That's the
  point of proving the spine before adding the layers that lean on it.

## License

[Apache-2.0](LICENSE). See [`NOTICE`](NOTICE). Contributions welcome — see
[`CONTRIBUTING.md`](CONTRIBUTING.md); security reports, [`SECURITY.md`](SECURITY.md).
