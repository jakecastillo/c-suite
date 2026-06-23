# c-suite

**Your gut feelings, now with a scoreboard.**

"I have good instincts." Sure you do — *which* ones, exactly? c-suite turns that
unfalsifiable flex into something git can grade. You write a decision down as a
*prediction* — a probability, a machine-checkable tripwire, and a date — and when
the date arrives, **reality scores you.** Not a model. Not your memory. Plain code,
reading your repo.

```console
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

> **What this is — and isn't — yet (v0.1.0).** This is the deterministic core: *you*
> write the typed prediction, the tool grades it against git, and keeps a
> tamper-evident scoreboard. The AI advisory board and the LLM that drafts
> predictions *for* you are deliberately later layers — see the [roadmap](#roadmap).
> The scoreboard is the interesting part on its own, and the part that compounds.

---

## The pitch

Every founder thinks they're calibrated. Almost none are — and there's no way to
*know* without keeping receipts. c-suite keeps the receipts:

- **Predict** — log a decision as `P(outcome) by <date>`, with a tripwire code can check.
- **Resolve** — when the date passes, a deterministic verifier checks that tripwire
  against your real git/filesystem history and scores it with a [Brier score](https://en.wikipedia.org/wiki/Brier_score).
- **Track-record** — see where you're overconfident, where you're sandbagging, and
  (eventually) whether your gut is worth trusting on *this kind* of call.

The one rule that makes it trustworthy: **a model never grades a prediction.** An
LLM might *suggest* one someday, but resolution is always plain code reading git.
We call it the *verifier firewall* — it's why the scoreboard can't quietly fudge a
number to make you feel better.

## Install

Requires **Node ≥ 20** and `git`.

```bash
npx c-suite --help            # one-off, no install
npm install -g c-suite        # or install the `csuite` command globally
csuite --help
```

<details>
<summary>From source</summary>

```bash
git clone https://github.com/jakecastillo/c-suite && cd c-suite
pnpm install
pnpm build                    # compiles src/ -> dist/ (the bin runs the compiled output)
node bin/csuite.mjs --help
```
</details>

By default c-suite grounds against your **git toplevel**; override with
`CSUITE_REPO=/path/to/repo` (handy for subdirectories and monorepos).

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
— so your calibration can be pooled by the *kind* of call you're making.

**Predicates** — the deterministic tripwires. Every one reads git/fs; none ask a model:

| Predicate | Args | True when |
|---|---|---|
| `path_exists` | `path=<p>` | the path exists in the working tree |
| `commits_to_since` | `path=<p>` `since=<yyyy-mm-dd>` | ≥1 commit touched `<p>` after `<since>` |
| `branch_abandoned` | `branch=<b>` `days=<n>` | `<b>`'s tip is older than `<n>` days |

**Environment:**

| Var | Default | Purpose |
|---|---|---|
| `CSUITE_REPO` | git toplevel | repo root to ground against (subdirs/monorepos) |
| `CSUITE_MODEL` | `claude-opus-4-8` | model id stamped on forecasts (for later layers) |

The ledger lives at **`<repo>/board/decisions.jsonl`** — local-by-default
(git-ignored), append-only, and hash-chained. Resolving never edits a forecast; it
*appends* a separate resolution event, so the whole chain stays verifiable. Tampered
with a past entry? `csuite verify` (and `track-record`) will tell on you.

## How it works

```
  you (or, later, an LLM)
        │  predict: a typed Claim {provenance, confidence, falsification:(observable,threshold,date)}
        ▼
  ┌──────────────────────────────────────────────┐
  │  boundary validator (code) — rejects an        │
  │  unfalsifiable or ungrounded forecast          │
  └───────────────────┬──────────────────────────┘
                      ▼  append
  ┌──────────────────────────────────────────────┐
  │  hash-chained append-only ledger               │
  │  (board/decisions.jsonl)                       │
  └───────────────────┬──────────────────────────┘
        resolve: on/after the date │
                      ▼
  ┌──────────────────────────────────────────────┐
  │  deterministic VERIFIER (git/fs predicates)    │  ← never a model
  │  → outcome → Brier score → append resolution   │
  └───────────────────┬──────────────────────────┘
                      ▼
  ┌──────────────────────────────────────────────┐
  │  track-record: calibration curve + reliability │
  └──────────────────────────────────────────────┘
```

A small control loop: **predict → git observes → a deterministic verifier resolves
→ proper-score → recalibrate.** The full architectural rationale (and the honest
limits) lives in the [design spec](docs/superpowers/specs/2026-06-22-c-suite-design.md).

## Roadmap

v0.1.0 is the spine. It's built so the layers above can be added — or fail their own
gates — without rework, and so the spine keeps its value even if they never ship:

1. **LLM claim emission** — `claude -p` (one advisor + a self-red-team) *drafts* the
   typed forecast from a decision you describe, routed through the same validator and
   ledger. Plus a `next-experiment` helper and a post-commit nudge.
2. **The board** — a multi-persona executive board (CEO/CMO/CFO/CPO + an independent
   director + a neutral chair) for the big, irreversible calls — gated behind a
   blunt "does it actually beat one good prompt?" experiment (`weekend-proof/`).
3. **Hardening** — secret-scan, prompt-injection guards, packaging.

## Development

```bash
pnpm check     # typecheck (src+test) + build + test + lint — the whole gate
# or à la carte:
pnpm typecheck # strict tsc over src + test (Vitest transpiles, so this is the real type gate)
pnpm build     # tsc -> dist/
pnpm test      # Vitest (unit + an e2e test that runs the actual binary)
pnpm lint      # Biome
```

All logic lives in the unit-tested `runCli`; `bin/csuite.mjs` is a thin shim — the
only place real time and paths are read — covered by an end-to-end test. New
contributors, start with [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Honest limits

No tool earns trust by overpromising, so:

- It grades **what's observable in git.** The most decision-relevant outcomes
  (*"did anyone actually pay?"*) usually aren't — those need a number you bring it.
- Calibration takes **months** of resolved predictions to mean anything; the
  `track-record` view will keep saying "insufficient" until you've got ≥8.
- v0.1.0 has **no LLM.** You write the typed prediction yourself. That's on purpose —
  prove the spine before bolting on the layers that lean on it.

## Documentation

- **Design & rationale** — [`docs/superpowers/specs/2026-06-22-c-suite-design.md`](docs/superpowers/specs/2026-06-22-c-suite-design.md)
- **Contributing** — [`CONTRIBUTING.md`](CONTRIBUTING.md)
- **Security & threat model** — [`SECURITY.md`](SECURITY.md)
- **Changelog** — [`CHANGELOG.md`](CHANGELOG.md)

## License

[Apache-2.0](LICENSE) — see [`NOTICE`](NOTICE) for attribution and the
not-financial-advice disclaimer. Contributions welcome under the same license.
