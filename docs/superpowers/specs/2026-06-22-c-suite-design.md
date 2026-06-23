# c-suite — Design Specification

- **Status:** Draft for review (pre-implementation) — **rev 9 (architectural thesis: a self-resolving calibration instrument; board is a replaceable input device; v0a board-free spine ships first)**
- **Date:** 2026-06-22
- **Author:** Jake Castillo (with AI research synthesis + adversarial red-team)
- **Repo:** `c-suite/` (OSS; local-only for now). Binary: `csuite`.
- **Reference implementation to port from:** `the-5-to-9/` (same author; proven Claude/Codex multi-runtime plugin + TS driver)
- **Revision note:** rev 2 inverts the build order around a *prove-before-build* gate, ships a tight 4-seat board with a minimal proactive trigger, closes the outcome loop in v1, and demotes "composite of real executives" from headline to internal quality method. See §12 and §15 (Red-team resolutions).

---

## 0. Architectural Thesis (what makes this more than a multi-agent wrapper)

> **c-suite is a closed-loop *calibration instrument* for solo-builder judgment.** It reifies soft strategic decisions as **typed, falsifiable probabilistic forecasts**, resolves them with a **deterministic verifier — code, never the LLM — against git-observable ground truth**, **hash-chains** the graded record so the track record is *verifiable, not editable*, and feeds the resulting calibration back into the human (and, eventually, into the weighting of advisory voices). It is a **control system over a longitudinal repo substrate.** The board is a *replaceable input device.*

The distinguishing word is **control system, not agent.** A multi-agent wrapper emits ungraded prose; this emits falsifiable claims that **reality grades for free** (commits, reverts, file-existence), and the grade conditions the next loop: *predict → git observes → deterministic verifier resolves → proper-score → recalibrate.* The board/personas/nudge/draft-queue are the commodity 90%; **this loop is the 10% where novelty is real, defensible-as-combination, and monotonically compounding.** Build as if the board doesn't exist; let the v0 gate (§11.1) decide whether to bolt it on.

**Three innovations, real *in combination* (each on decades-old lineage):**
- **(A) Self-resolving proper-scoring substrate** *(the spine)* — proper scoring rules (Brier 1950; Tetlock/Good Judgment Project: calibration feedback *produces* skill) wired to a substrate that **resolves its own predictions for free**, inside a coding agent, with the model's *calibration* (not its prose) as the graded object. Novelty = the closed loop over a self-grading substrate + the **deterministic-verifier firewall** (never grade homework with the hallucinating model).
- **(B) Provenance lattice = action-permission lattice** *(the precondition)* — every claim is a typed object `{provenance ∈ grounded⊑inference⊑speculation, confidence, citations, falsification:(observable,threshold,date)}`, validated at the boundary by *code*. The same lattice **projects onto DO/QUEUE/RECOMMEND** (§5): a claim's epistemic provenance *determines what the agent may do unattended* (information-flow / taint-typing lineage, transposed from confidentiality to epistemics). It is the enabling precondition for (A): a prediction is auto-gradable only if its kill-condition was a machine-checkable tuple at write time.
- **(C) JTMS-lite dependency propagation** *(v2 multiplier)* — decisions rest on assumptions tested by tripwires; a fired tripwire walks `rests-on` edges and flags downstream decisions `SUSPECT` (Doyle 1979 truth-maintenance — retraction *propagation*, which RAG/similarity structurally cannot do). Gated on ~20–30 resolved decisions.

**The load-bearing claim (it holds): the architecturally-interesting core and the retention/moat core are the *same mechanism.*** The ledger is interesting *because* it's a self-resolving proper-scoring control loop; it retains *because* it accrues *your* graded, tamper-evident, **non-transferable** record (the moat lives in the future-dated, local *resolution layer* — uncopyable, un-pre-trainable).

**Honest limits (designed-against, not hidden):** the **oracle selection-bias hole** (repo tripwires auto-resolve; "will they pay?" resolves via pasted numbers a discouraged founder may never enter — the hash-chain prevents *editing*, not *non-entry* — the deepest unsolved limit); **moat-clock = churn-clock** (calibration takes months to trust = exactly the retention window §19 fears, so everything subordinates to spinning the flywheel faster); **Goodhart** (Brier alone rewards forecasting trivia + silence on hard one-way doors → needs decision-weighted scoring + a cost for declining). **Cut as shiny-but-hollow:** the "disagreement-maximizing dialectic engine" framing (same-model debate doesn't decorrelate; it's a *named 2026 subfield* → false-first risk), board-as-headline, and per-persona×model×type Brier *reweighting* in v1 (cells never populate at 1–4 decisions/month — a v2 application of the spine, gated with the provider seam).

---

## 1. Summary

**c-suite** (binary `csuite`) is an open-source, Claude-Code-native **self-grading validation forcing-function that lives in your repo** — for a technical builder taking a side-project toward a real business. The **daily face** is three things: a **self-grading decision ledger** ("it remembers what you bet, and tells you if you were right"), a **workflow-native pattern-interrupt** (one line in the terminal you're already in, from a git hook), and **next-moves handed to you half-done** (it drafts the experiment, not just its design). The real C-suite — CEO / CMO / CFO / CPO (CTO/COO opt-in), overseen by an **Independent Director** (challenger) and a neutral **Board Chair** (synthesis) — is the **engine** behind the ledger's judgment and the Type-1 escalation: *invisible plumbing, not a ceremony you convene.* (Demoted to "the quality method + escalation" exactly as §4 demotes "composite of real executives" to an internal method.)

The job: **catch you building unvalidated** (from your commit distribution, which only the longitudinal-repo substrate can see), **name your riskiest untested assumption, draft the cheapest experiment to test it, push you off the repo to get the signal, and interpret what you bring back** to call scale / kill / pivot. It can't *be* the market — but it stops you building until you've found out, and hands you the next move ready to run.

**The strategic safety net (why this de-risks the bet):** the durable core — ledger + git-hook nudge + drafted experiments — **stands even if the multi-persona board *fails* the v0 proof** (§11.1/§12). It doesn't depend on the board beating one prompt; it depends on longitudinal repo grounding + a graded prediction record + zero-context-switch delivery. The car retains even if the engine doesn't clear the gate.

**Retention is the existential metric, not decision-quality** (§11): the AI-advisor category churns ~23–40% on a week-2 novelty cliff; what retains is *completed work + a return habit*. So the product leads with **draft-and-queue** (the agent does the reversible work; you spend a 15-second approve, §5) — promoted from a *safety* caveat to the *headline value*.

**What it is — and is NOT.** It does **not** do org-management, ops, HR, or admin (the user's explicit non-goal). It does **not** claim to *be* the market. Its unit of analysis is **the decision (and the product/repo it concerns) + the demand signal you bring it** — repo-grounding is appropriate for the build/price/positioning half; a builder-maintained `traction.md` (§6) carries the demand half. Every memo carries a **scope-and-stage header** and a **demand-coverage line** (§5) making both boundaries explicit. The honest pitch:

> *It can't tell you anyone wants it. It can stop you building until you've found out, design the $0 test, and make sure you don't misread the result — grounded in the one thing it can't be wrong about: where your commits actually went.***

Three deliberate honesty corrections from rev 1:
- **Repo-grounding gives *triggers*, not verdicts.** The repo tells the board *what to ask about* (grounded, cited); the business judgment on top is **explicitly-flagged inference with calibrated confidence**, never asserted as fact. We do not claim "irrefutable."
- **The scored track record is a retention/personalization mechanism that accrues from install** — not a day-one moat. We engineer it to *start filling on turn one* (seeded from git history) rather than implying instant defensibility.
- **v1 disagreement is prompt-induced perspective-taking on one model.** True model-level decorrelation ("uncorrelated drafts from *different models*") arrives only with the metered API adapters — it is **not** a v1 claim.

It **advises and drafts; it never takes an irreversible action.** It runs on the founder's **Claude Max subscription** by default. The composite-of-real-executives roster (§4) is the **internal quality method** that makes the prompts excellent — not the marketing headline.

The mental model: *"`the-5-to-9`, but the crew is an executive board and the work product is **decisions** instead of code."*

---

## 2. Goals & Non-Goals

### Goals
- Give a deep-in-the-weeds engineer the **business-side counterweight they structurally lack**, and the **filtering/prioritization judgment** they lack in the business plane (the HBS "uneven impact" framing, §3).
- Produce **genuinely critical, non-sycophantic** counsel — and *prove* it beats a single good prompt before building the full engine (§11, §12).
- Catch **blind spots and absences** the founder can't see, grounded in the repo, **without ever asserting a false absence**.
- Build a **falsifiable track record from install** so day-90 ≠ day-1.
- Run on **Claude Max** as a **local OSS repo**, architected (later) to be provider-agnostic.

### Non-Goals (v1)
- Not a coding agent. It reviews *decisions*, not code defects.
- Not autonomous. It never commits, pushes, sends, spends, or changes anything irreversible without explicit human approval. (One *read-only* proactive trigger is allowed — it only ever surfaces text, §6.)
- Not the full ambient 24/7 watcher (deferred). Not the four-provider conductor (deferred to "architecture-complete," §12).
- Not the boss. It is a **stakeholder** whose final word the founder owns.

### Operating principle: **prove before build**
The expensive apparatus (multiple personas, the provider seam, the ledger) is justified *only if* multi-lens deliberation measurably beats one good prompt. So **v1's gating step is an experiment, not a feature** (§11.1, §12). If the board doesn't clear a pre-registered bar, the correct product is the cheaper "single-brain + standing red-team + repo-grounded track record" tool — and we'll have learned that in week one.

---

## 3. The Job (Product Concept & JTBD)

### The strategic core
The HBS "uneven impact" finding anchors the product: AI advice boosted high performers ~10–15% but *hurt* low performers ~8% — and the difference was **who could filter, select, and prioritize** it. A technical founder is a **high performer in code, a low performer in business judgment.** So c-suite's job is **not to generate business advice** (commoditized) — it is to supply the **filtering and prioritization judgment** the founder lacks, grounded in their repo.

### Jobs-to-be-done
1. **"Stop me from building the wrong thing for three months."** (proactive — see the v1 trigger, §6)
2. **"Give me the business counterweight I structurally don't have."**
3. **"Break my decision paralysis with a forcing function, not more options."**
4. **"Catch the blind spot I can't see — the dog that didn't bark."** The most differentiated JTBD — and the one most prone to false-absence hallucination, so it is delivered as a **question, never an assertion** (§5).
5. **"Tell me when to stop, kill, or pivot — and mean it."**
6. **"Be a thinking partner that already knows everything"** — zero re-explanation tax.

### What makes its advice trusted (engineers are the most skeptical audience)
Grounding in cited repo facts; reasoning chains that can be attacked; **calibrated confidence** (and a "confidence this is wrong" number); a **track record that starts accruing at install**; **knowing when to stay silent**; **steelman before critique**.

### Vignettes of "great" (corrected for honesty)
- **The architecture decision that's secretly a pricing decision.** A PR migrates to per-token-metered inference. The CFO grounds the *trigger* — "`pricing.tsx` (committed 3 wks ago) advertises a flat $29/mo plan, and this PR puts a variable COGS curve under your core loop" (cited) — then **flags the inference explicitly**: "*If* your power users run long sessions, this can invert your margin on your best customers (confidence: medium — I can't see usage distribution; here's the number that would confirm it)." Grounded trigger + flagged inference, not a false "irrefutable" verdict.
- **The dog that didn't bark — as a question.** "I searched `auth/`, `billing/`, `app/api/`, and `git log` and didn't find a payment path; your stated Q3 goal is 'first 10 paying users.' **Is payment handled outside this repo** (Stripe link, sibling repo)? If not, the cheapest next experiment is a payment link + waitlist." Plus a **grounding-coverage line**: *read: 412 files / git log 90d; not read: node_modules, sibling workspaces; token budget hit: no.*
- **The track-record nudge (seeded from git).** On first board meeting, the ledger is seeded from history: "Your `spike/dynamo` branch was abandoned after 3 weeks; you've now opened `spike/cassandra`. Same pattern — want to set a kill-criterion this time?"

---

## 4. The Board (Personas)

A C-suite is a **portfolio of cognitive lenses**; quality comes from **structured disagreement**, with each seat a distinct objective + information diet.

### v1 board: the real C-suite + a governing board (management / oversight split)
Real companies separate **management** (the C-suite — proposes, analyzes, runs) from the **board** (oversees, challenges, decides) — and that separation *is* the de-biasing machinery this product needs. So the roster is literal real roles, in two layers. The validation lenses map cleanly onto real titles; nothing here is org-admin (the Chair and Independent Director are *oversight*, not calendar-management).

**Management — the C-suite** (propose & analyze; **blind drafts**, §5):

| Role | Status (v1) | Validation lens | Single highest-value question | Diet |
|---|---|---|---|---|
| **CEO** | **always-on** | Strategy; scale-or-kill; the one bet | *"Given your charter, is this worth your one concurrent bet — or a local maximum you're about to scale?"* | Charter, goals, drafts, ledger |
| **CMO** | **always-on** | Distribution, demand, positioning, the wedge | *"If you didn't exist, what would your user do instead — and can you reach the people that alternative hurts most? Show me the channel."* | README/landing/docs, `traction.md`, GTM surfaces |
| **CFO** (monetization charter) | **always-on** | Will they pay; unit economics; does price survive COGS | *"Invert: what makes this never pay off? Does your heaviest user cost more than they pay?"* | Pricing/billing code, COGS signals, `traction.md` |
| **CPO** | **always-on** | User value, JTBD, value+viability risk | *"Painkiller someone already tries to solve, or a vitamin you find interesting? Name the user, the job, the cheapest test they'll pay for."* | Features, `traction.md`, interview notes, roadmap |
| **CTO** | **opt-in** | Feasibility, debt, build-vs-buy | *(you already fill this seat)* | The codebase, deps |
| **COO** | **opt-in** | Execution, ops, repeatability | *(the ops/admin you don't want by default)* | Process, CI |

**The board — governance** (oversee & challenge; **pinned**, never cost-routed, §8.4):

| Role | Status | Job | Single highest-value question |
|---|---|---|---|
| **Independent Director** | **always-on (pinned)** | The standing challenger — rewarded for the strongest objection; carries the growth-skeptic / charter-guardian mandate (so "stay small" is a legitimate win, not "paralysis") | *"Strongest case this stays a hobby — and what kill-criterion will you pre-commit to?"* |
| **Board Chair** | **always-on (pinned)** | Neutral honest-broker: runs triage/escalation, synthesizes **one** recommendation with **dissent in the headline** + the "confidence-this-is-wrong" number. **Explicitly NOT the CEO** — so the CEO's optimism can't quietly win at the synthesis hop. | — (chairs; does not advocate) |

This maps every engineered mechanism onto a real role: the anti-sycophancy red-team → **Independent Director**; neutral synthesis → **Board Chair**; the demand/GTM lens → **CMO**. A board meeting = 4 management blind drafts (CEO/CMO/CFO/CPO) + the Independent Director's challenge → the Chair synthesizes (~5 drafts + 1 chair call). CTO/COO opt-in; the full roster research is preserved in `docs/board/roster-research.md`.

### Founder-charter & the growth-skeptic (whose game are we playing?)
Every persona was harvested from VC-backed hypergrowth executives, so the board silently encodes **growth/scale as the terminal value** — and the distillation (§4 two-tier) *strips the attribution that would let the founder notice it's a Silicon-Valley assumption*. Two fixes:
- **`board/founder-charter.md`** — a short first-run intake the cold-read *cannot* infer: what "winning" means to you (growth / profit / autonomy / craft); is raising on the table; personal runway / constraints; **what you won't do even if it 3×'d revenue**. **Every persona conditions its recommendation on the charter**, and the blinded eval (§11.1) gets a **values-divergence fixture** (growth-optimal ≠ charter-optimal → the correct board behavior is to *surface the conflict and defer to the charter*, not steer).
- **A standing growth-skeptic asset** (bootstrap / stay-small / default-alive) so the board can voice the premise that *not* scaling is a legitimate win — and so a founder's preference for slowness isn't auto-coded as "paralysis" to be broken.

### Each seat is a composite ("Frankenstein") — the *quality method*, not the headline
A seat is stitched from the most valuable *assets* (traits, mental models, decision heuristics) harvested from several documented executives (full sourced roster in `docs/board/roster-research.md`). This is **why the prompts are good** — it is an internal authoring discipline, not the product pitch (§1). **Coherence rule:** where one person informs multiple seats, attributions are explicit and seats are steered to *different* assets; cross-seat dependencies use `guards:` instead of duplicating an asset (so the board never casts an "echo vote").

### Two-tier authoring: human docs vs. runtime persona
- **Tier 1 — `docs/board/roster-research.md` (ONE sourced appendix, human, NOT loaded at runtime).** Justifies the distilled lists with proper citations (person + public source). **v1 ships the single appendix, not 8 per-seat docs** (D-5 maintenance cut — they never touch runtime and would 8× the rot + named-persons surface). Each persona's `provenance` points to its section.
- **Tier 2 — `personas/<seat>.persona.md` (the runtime contract; the ONLY thing the agent loads).** Front-matter + the terse distilled `assets` list.

```yaml
---
seat: cfo
title: "CFO — monetization: will they pay, how much, does price survive COGS"
human_doc: docs/board/roster-research.md#cfo   # provenance section, NOT loaded at runtime
infoDiet: [read-only repo surface, pricing/billing files, COGS signals, traction.md, goals.md]
outputContract: <the recommendation contract, §5>
tier: pinned                        # CFO + Independent Director + Board Chair are PINNED (bypass cost-routing) — §8.4/§8.5
assets:                             # runtime content — NO person-tags in the body
  - "Invert first: before approving a plan, ask how it loses money and what makes it never pay off."
  - "Kill cross-subsidies: every bet/segment carries its own P&L and defends its runway."
  - "Does your heaviest user cost more than they pay? Price must survive their COGS."
guards:
  - { seat: independent-director, asset: "pre-committed kill-criterion (Ulysses contract)" }
provenance:                         # audit metadata — NOT loaded into the model
  - { person: "Charlie Munger", asset: "invert first", source: "Poor Charlie's Almanack" }
  - { person: "Ruth Porat",     asset: "kill cross-subsidies", source: "public record" }
---
```

**Person-tags are stripped from the runtime `assets` body** (they live only in unloaded `provenance`) — so the model reasons *with the principle*, not "what would Munger say about MY pricing." **Loading rule:** an agent loads only its `assets` list, never `docs/board/*.md`, never `provenance`. **Integrity guardrail (enforced, §11.4):** the board models documented *thinking*, never impersonates a person, and **never fabricates a real person's verdict on the founder's situation**. **Single source of truth:** every `assets` line traces to a sourced asset in its human doc.

Least-privilege: read + grep + `git log` only. **No write/commit/push** tools — structurally.

---

## 5. The Deliberation Engine

### The validation loop (the product spine)
Deliberation serves one backbone — a four-step loop, made a first-class ritual rather than an implication of "a skeptical board." This is what makes the difference between *clever repo critique* and *actual business validation*:

1. **Name the riskiest *untested* assumption — and force the ranking.** The predictable technical-builder failure is treating feasibility (the fun part, in the repo) as the risk while under-weighting value + viability (off-repo). On any venture-classified repo the board's required opening move: *"You've proven you can build it — the repo shows that. The untested risk is whether anyone pays, and you've tested it zero times."*
2. **Design the cheapest falsifying test** — `/next-experiment` is a first-class surface: input = a business hypothesis the repo can't resolve; output = **one** minimal off-repo experiment (landing page, payment link, 5 user calls, waitlist) with a **pre-committed success threshold + dated tripwire written to the ledger.**
3. **Go get the signal** — the board explicitly pushes the builder *off* the repo. This is a feature, not a failure.
4. **Interpret the signal + call scale / kill / pivot** — the round-trip: on the tripwire date the board **prompts for the result**, the builder pastes the real number into `traction.md`, and the board re-deliberates over actual data (*"1 of 20 — below your kill line; reads as a demand failure, not messaging — here are the two pivots"*). This is where the Independent Director's "separate skill from luck" and the base-rate-first assets finally earn their keep — and the moment that converts repo-shaped feedback into validation.

### The typed claim algebra + DO / QUEUE / RECOMMEND (one lattice, two projections — §0-B)
The output contract is **not prose advice — it is a typed claim object**, validated at the serialization boundary by a **deterministic checker (code, not the model)**, the post-prompt twin of `redact.ts`:

```
Claim {
  provenance: grounded ⊑ inference ⊑ speculation   // an information-flow lattice
  confidence, citations[],
  falsification: { observable, threshold, date }    // machine-checkable → makes it auto-gradable (§7)
  rebuttal?                                          // Toulmin: claim/grounds/warrant/qualifier/rebuttal
}
```
Boundary invariants (mechanical, regression-tested — §11.1, *not* prompt-hope): `grounded` ⇒ its `file:line` must `stat`-verify; `speculation` may not headline a Tier-C RECOMMEND; market-claims must be interrogative (false-presence); absence-claims require a `coverage` object and **auto-downgrade to interrogative when the scan was truncated** (computed in code). This turns the spec's three anti-hallucination rules into invariants a model upgrade can't silently break.

**The elegant unification (§0-B): the provenance lattice IS the action-permission lattice.** A claim's epistemic provenance *determines what the agent may do unattended* — `grounded + reversible → DO`; `inference → QUEUE`; `speculation / irreversible → RECOMMEND only`. One lattice, two projections (epistemics + action). Pure advice is the worst-retaining category; value must terminate in an **artifact or a queued action** — so this is the *value* face of the `irreversible-gate`, not a safety limitation:

| Tier | The harness DOES this autonomously | Only RECOMMENDS |
|---|---|---|
| **A — DO** (fully reversible, repo/text-only) | Drafts the **assets** of the next move, not just its design: landing-page copy, the 5 user-interview questions, cold-DM drafts, a waitlist snippet, the `traction.md` scaffold — written to a **scratch branch**. Runs grounding/absence scans; maintains the ledger; writes memos; runs the closed loop. *(The time-saved is the value.)* | — |
| **B — QUEUE** (reversible-but-consequential / leaves the machine) | Prepares the *complete* action behind **Approve-Edit-Reject** with an evidence pack: outreach ready-to-send, the PR ready-to-open, the pricing diff staged. | The send / open / publish / commit itself (fires only on human approval, §9) |
| **C — RECOMMEND only** (irreversible one-way doors) | Frames the decision: dissent-in-headline, confidence-this-is-wrong, flip-assumption, tripwire. | Kill / scale / pivot; raise-or-not; the one concurrent bet. The founder owns these. |

`/next-experiment` is Tier A: it **drafts the experiment's assets to a scratch branch**, closing the advice→action gap that kills advisory tools.

### The protocol
**Triage** (reversibility + who decides) → **Diagnosis** (one-paragraph crux) → **≥3 options** (incl. do-nothing + steelmanned least-favorite) → **Manufacture the counter-case** (blind drafts → pre-mortem → named red-team → inversion) → **Evaluate** (EV, asymmetric-bet bias, *survival-first*) → **Converge & commit** (one recommendation + three artifacts).

### Hybrid execution + the entry inversion
- **`/ask` (routine, the 95% surface) is NOT bare single-brain.** It carries the *cheap-but-real* differentiators: **mandatory grounding citation, a forced Independent-Director second voice (two-voice minimum), and the output contract** (flip-assumption + tripwire). A bare custom-GPT can't do grounded + adversarial + falsifiable.
- **The founder never has to self-assess "is this board-worthy."** The **Board Chair** triages every entry and **escalates to a full board meeting on a detected one-way (Type-1) door.** Pull-when-reflective is replaced by escalate-when-it-matters.
- **`/board-meeting` (big/irreversible)** runs full blind drafts → cross-exam → synthesis (§8.2: the proven N-process fan-out; the tight board keeps it affordable in v1).

### Scope-and-stage header (every memo) — the unit-of-analysis fix
The board reasons about **the decision and its product/repo context**, never the whole company. Every memo opens with a mandatory header that turns the invisible "repo == company" assumption into a disclosed limit — the natural sibling of the grounding-coverage line:

> *Scope: 1 repo (`<name>`), classified `<venture|client|hobby|library|infra>`, stage `<pre-PMF|…>`. This is a **decision/product** review, not company oversight — I can't see other repos, finances, the cap table, your pipeline, or anything off-disk. Off-disk facts: supply via `board/context.md` or in-session.*

A founder-set **repo classification** (confirmed at first-run) gates which seats activate and how forcefully they push. `/state-of-the-company` is renamed **`/state-of-the-repo`** to stop the over-claim at the surface level.

### Absence is interrogative, by contract
The board **may never assert "you have no X."** An absence emits a **confirmation request** — *"I searched `<paths>` / `git log` and didn't find X — is this handled outside the repo?"* — plus a per-memo **grounding-coverage line** (what was read, what wasn't, whether the token budget was hit). **The interrogative is only as honest as that coverage line:** if the file-list or grep was itself truncated (budget hit, partial scan), the absence claim is *downgraded further* — "I could only scan `<subset>`; I didn't see X *there*" — never a clean "didn't find X." A truncated scan can never produce a confident absence question. This closes the single most dangerous hallucination surface (false absence delivered with confidence).

### Market claims are interrogative too (the false-*presence* hole)
Symmetric to the false-absence rule: the board may forbid "you have no X" but must equally never **assert** a market fact it can't see — *"your market is devs who'll pay $29"* is false-*presence*, the same hallucination surface unguarded. Every business-plane / off-disk claim is **interrogative or flagged-inference, never an assertion.** Each memo carries a **demand-coverage line** (sibling to grounding-coverage): *"Demand basis: `traction.md`, updated 12 days ago — 1.2k visits, 0 paying; no live usage data."* **Stale or empty demand evidence fires the same downgrade** as a truncated scan — the board cannot speak confidently about a market it has no signal on; it can only force the test that would produce one.

### The output contract
> **Evidence** (cited `file:line`/commit/goal) → **Inference** (chain; speculation explicitly flagged) → **Recommendation** (one call) → **Confidence** (calibrated) + **"confidence this recommendation is wrong"** → **Flip-assumption** → **Tripwire** (observable + threshold + date, biased toward *repo-observable* thresholds) → **Dissent** (the strongest surviving objection — **in the headline, not an appendix**).

### Synthesis: honest-broker, dissent-forward
The **Board Chair** (honest-broker objective, explicitly **not** the CEO — whose documented blind spot is reality-distortion/denial) does the synthesis. Synthesis **surfaces the strongest surviving dissent in the headline** and emits the "confidence-this-is-wrong" number. **Track-record weighting is deferred** until ≥N resolved predictions exist — until then confidence is stated flat, not falsely "calibrated by track record" on an empty ledger.

### Anti-sycophancy (engineered + measured)
Distinct objectives/diets; personas never see the founder's preferred answer first; standing red-team; score-then-justify; separate cold critic pass; calibrated confidence. **Measured** by the baseline-delta eval (§11.1), a **convergence metric** (if N blind drafts agree >X% of the time, personas have collapsed — a better signal than pushback rate), and an **adversarial pushback-rate** fixture the founder never grades (§11).

---

## 6. Surfaces (v1)

- **`/ask <exec> [q]`** — two-voice grounded take (exec + Independent Director) with the output contract.
- **`/board-meeting [topic]`** — full deliberation → decision memo + ledger entry.
- **`/next-experiment [hypothesis]`** — **the validation surface (§5 spine), Tier A "DO".** Input: a business hypothesis the repo can't resolve. Output: one minimal off-repo test + pre-committed threshold + dated tripwire to the ledger — **AND the test's assets drafted to a scratch branch** (landing copy, the 5 interview questions, cold-DM drafts, waitlist snippet). Hands you the next move half-done, not just designed — this is the advice→action gap that kills advisory tools, closed.
- **`/pre-mortem [plan]`** — red-team a plan.
- **`/state-of-the-repo`** — on-demand absence scan (interrogative + grounding- + demand-coverage + scope-and-stage header). Renamed from `/state-of-the-company` to stop the unit-of-analysis over-claim.
- **`/review-decision <id>`** + **the closed loop** — on the tripwire date the board **prompts for the real result**; the builder pastes the number into `board/traction.md`; the board **re-deliberates over the actual data** and calls scale/kill/pivot. **Market-facing tripwires are first-class and *preferred*** (the prior repo-observable bias optimized for what's measurable, not what validates); repo-observable ones auto-resolve where possible.
- **`/set-goals`** — but first-run is a **zero-config cold read** (below), so this is *confirm/correct*, not a blank page.
- **`/track-record`** — **displayed calibration (the architectural payoff, §0-A/§7):** the calibration curve ("board said 70%, happened 4/7"), the global over/under-confidence reliability flag, and the hash-chain-verified prediction history. *This is the v1 retention surface — it converts "I have good judgment" (unfalsifiable) into a Brier score pinned at prediction time.*
- **The post-commit nudge — the PRIMARY distribution surface (rev 8 reframe):** a git **post-commit/pre-push hook** runs a silenced, materiality-gated absence/self-contradiction delta and emits **at most one line, at most once per N days** ("0 customer-facing commits this week, demand untested"; "you're scaling a pattern you killed in `spike/dynamo`"). One line, in the terminal you're already in — **zero context-switch is the single biggest predictor of week-4 retention**, and incumbents can't put themselves inside your git hook. Read-only; never acts. *This is the habit engine, not "the one allowed autonomy."* **No scheduled/cron cadence and no 24/7 ambient watcher** (founder decision rev 8: one false alarm = muted forever; the nudge is the only background surface).

### First-run cold read + charter intake (no blank page)
On first run: (1) classify the repo (venture/client/hobby/library/infra, founder-confirmed); (2) infer **provisional goals** from README + commits + issues; (3) run the short **founder-charter intake** (§4) **including the one demand question — *"What evidence do you have that anyone wants this? A number, a quote, a link, or 'none yet' — honestly."*** ("none yet" is a valid, high-signal answer that makes demand a stage variable); (4) **open with one earned, specific *strength* before any discomfort**, then deliver **one true, repo-cited observation.** Goal-setting becomes confirm/correct.

**`board/traction.md` — the demand half (builder-pastes, never integrate).** The board ingests demand evidence; it never goes and gets it. One builder-maintained file (reusing `context.md`'s exact pipeline: `.gitignore` default, secret pre-scan, evidence-to-cite never instructions-to-follow) where the builder pastes whatever he has — landing visits + conversion, waitlist count, "5 people said X," a Stripe number, a Reddit thread, or nothing. It feeds the CMO/CPO/CFO/Independent-Director diets. **No live Stripe/analytics/CRM integration, no scraping** — that's the company-management bloat the user rejects; paste-in is the whole mechanism.

**Reception matters (was a blind spot):** a relentlessly non-flattering machine pointed at the founder's weakest plane is *abandonable*. So the cold read leads with a genuine strength; **git-history failure-seeding of the ledger is gated behind a few sessions** (not fired on turn one); the proactive trigger has a tone/intensity dial; and the **CEO seat** carries a *sustainable-pace* mandate (flag pace/isolation as **business** risks — not therapy). **Low-signal fallback:** when README/git signal is below threshold (thin repo, squashed history, non-English), the cold read **says so honestly** instead of manufacturing a platitude.

---

## 7. Memory & State

> **The ledger is a scoring-rule instrument, not a log (§0 Innovation A).** This is the architectural spine, so it's specified as a control loop.

- **Forecast records, not memos.** Every recommendation is stored as `{id, claim, p (probability), persona, model_id, decision_type, resolve_by, resolution_source, tripwire, status}`. `model_id` is stamped at write time (a model swap must not pool incomparable scores); `decision_type` ∈ a small **poolable ontology** (demand / pricing / feasibility / pace / scope) so calibration is poolable at low N.
- **The tripwire is a typed deterministic predicate over git/filesystem state, resolved by CODE — never a model call** (the *verifier firewall*: the system must not grade its homework with the same hallucinating model). E.g. `file_exists("billing/")`, `commits_to("app/api") > 0 by <date>`, `branch_abandoned("spike/*")`. On `resolve_by`, the verifier checks it, applies a **proper scoring rule** (Brier/log), and appends the grade.
- **Hash-chained, append-only** (`board/decisions.jsonl` + `board/ledger/*.md`); **`board/` is `.gitignore`d by default**; the chain makes the track record *verifiable, not editable*. Bi-temporal invalidate-don't-delete is deferred (its *reason to exist* arrives with JTMS-lite, §0-C). **Secrets never enter the ledger** (§9.1).
- **Calibration is DISPLAYED, not yet used to reweight** (v1): `/track-record` shows the curve ("board said 70%, happened 4/7") + a single **global over/under-confidence reliability flag** with hierarchical-Bayes shrinkage (never a raw per-cell score at n<8). Per-decision-type *voice-weighting* (Hedge/shrinkage) is **v2, gated on the same trigger as the provider seam** — enough resolved data per type AND genuine multi-model decorrelation; they unlock together.
- **Open architectural items (honest, §0 limits):** *decision-weighted scoring* + a *cost for "declined to forecast"* (Goodhart guard — don't reward forecasting only near-certain trivia); and the **oracle selection-bias hole** — repo-observable tripwires auto-resolve, but decision-relevant outcomes ("did they pay?") depend on the founder pasting the number (the deepest unsolved limit; the hash-chain prevents editing, not non-entry).
- **Ledger seeding from git history** on first meeting: mine abandoned branches, reverted merges, doubled-scope refactors → the ledger shows skin-in-the-game on turn one.
- **Team-ready from day one (solo-first, but nearly free):** every ledger entry carries an **`author`** field and a **`shareability`** flag (`private-doubt` vs `shared-decision`). Solo, this is inert; it's the only durable *team* moat (a git-native, board-challenged **shared decision log** — "why did we choose flat pricing in March?" → cited entry + the dissent logged at the time) **and** it pre-empts the v2 landmine: a hash-chained record of strategic doubts must never become a 2-person blame/scapegoat artifact. Team is an explicit **v2 hypothesis**, not v1 scope.
- **`board/goals.md`** — seeded by the cold read, confirmed by the founder.
- **Tripwires biased to repo-observable thresholds** (commits, reverts, files-exist) so a fraction auto-resolve; the outcome loop (§6) captures the rest.
- Semantic memory = the repo (native search/read; no vector DB). Git is the checkpoint.

---

## 8. Provider Architecture

> **v1 reality:** one model family (Claude, via `claude -p` on Max). The full provider seam is **architecture-complete work, deferred until after the v0 proof holds** (§12). v1 tracks only **Opus quota %** — not the two-currency `CostRecord` union. What follows is the target architecture; the **bolded v1 items** are what actually ships first.

### 8.1 The seam — one persona turn (architecture-complete)
A provider-agnostic core composes a single primitive: `runPersonaTurn({persona, task, tier, outputContract, limits, signal}) → PersonaTurnResult`, generalizing `the-5-to-9`'s `WorkerAdapter.run`. **v1 implements only the `claude-cli` adapter behind a thin internal function — the registry/capabilities/multi-adapter seam is extracted later from two real implementations** (don't abstract against one).

**v1-critical: the result is a discriminated union with failure variants.** `PersonaTurnResult` includes `{ status: 'ok' | 'throttled' | 'quota-exhausted' | 'error', retryAfter? }`. The fan-out uses **`allSettled` + bounded retry with jitter**, degrades to **partial synthesis** ("CFO draft unavailable — throttled"), and **pre-flight refuses a wide Opus fan-out at ≥85% weekly quota.** (Rev-1's `Promise.all` would crash a whole meeting on one throttle after burning quota on the other drafts — a trust-killer.)

### 8.2 Orchestration: the proven N-process fan-out is the v1 default
**v1 ships the pattern that already works in `the-5-to-9`: one `exec('claude', …)` process per persona, fanned out via `allSettled` over N separate `runPersonaTurn` calls** (ref: `driver/src/adapters/claude.ts` one-process-per-spec + `driver/src/parallel.ts:70`). Blind drafts are guaranteed by *separate processes with separate system prompts* — the one mechanism that genuinely cannot see each other's context. The tight 4-seat board bounds this to ~4–5 cold processes per meeting; **the honest cost/latency story is N cold `claude -p` runs, each re-grounding the repo** (mitigated by the tight board, not by an unproven primitive).

> **Spike-gated optimization (NOT the v1 default):** a *single-process* fan-out (ground once, spawn isolated blind sub-drafts inside one `claude -p`) would cut the N× re-grounding cost — but **no such mutually-blind-sub-draft primitive exists in the ported reference**, and a single shared-context invocation cannot guarantee drafts don't see each other. It may be promoted to default **only after Spike 2 (§13) proves the blind-draft primitive works** under subscription `-p`. Until then, N-process is the default and the affordability math is computed on it.

The **multi-process / multi-provider neutral conductor is fast-follow**, justified only when the metered API adapters land and genuine cross-*model* fan-out exists to conduct.

### 8.3 Adapters (deferred to architecture-complete)
`claude-cli` (v1, the only one wired) → then `openai-api` (raw-api family: in-process loop, 4 read-only Zod tools + path-traversal sandbox, terminal coercion) → `anthropic-api` (re-skin) → `codex-cli` (opt-in; NDJSON churn risk). Auth-fallback guards (scrub stray `ANTHROPIC_API_KEY`/`OPENAI_API_KEY`, parse `/status` / `codex login status`) port from `the-5-to-9`.

### 8.4 Routing — cost knob does NOT touch the governance seats (challenger + chair) or the CFO (v1)
**v1 default: CFO, the Independent Director, AND the Board Chair are PINNED to the known-good model (`tier: pinned`, §8.5); CEO/CMO/CPO/CTO may run cheaper.** The two anti-sycophancy roles (CFO downside + Independent Director challenge) must not be cost-routed (rev-1 defaulted them to Sonnet — gutting the machinery the product is sold on); **and the Board Chair is pinned too** — a flattened honest-broker would silently erase the Independent Director's surviving dissent at the last hop, defeating the whole chain. Cheaper routing for the pinnable seats is unlocked only after a per-model **dissent-calibration eval** shows parity. The scarce resource is the **weekly Opus cap**; the tight 4-seat board (≤~4–5 N-process calls + synthesis) keeps a meeting affordable without relying on the unproven single-process path.

### 8.5 Persona portability & tier→model (architecture-complete)
One author format (§4) → pure renderers (`claude` real in v1; `codex`/`raw` later). `tier` ∈ {`cheap`, `standard`, `deep`, **`pinned`**} resolves to a model via versioned `config/tiers.yaml` (data-not-code, build-time-verified; 2026 model IDs are live-validated). **`pinned`** is the anti-sycophancy reservation: it always resolves to the known-good model and **bypasses all cost-routing** (used by the CFO, the Independent Director, and the Board Chair — §8.4), unlocked to cheaper tiers only after a per-model dissent-calibration eval shows parity.

---

## 9. Safety & Rails
- **Advise & draft, never send.** Reversible internal actions may be autonomous; **commit/push/send/spend/pricing changes require human Approve-Edit-Reject** via the **`irreversible-gate` hook** (port from `the-5-to-9`). Honors the conservative git profile — **no autonomous commit/push.** The proactive trigger (§6) is read-only.
- Reads run free; personas have **no write/push tools**.
- **No false absences** (interrogative-by-contract, §5); every memo carries a **grounding-coverage line**.
- Hard caps + kill switch; pre-flight Opus-quota refusal; stagnation/no-progress guards.
- **Integrity guardrail is enforced and evaluated** (§11.4), not merely asserted.

### 9.1 Data boundary & confidentiality (was a blind spot)
- **Disclosure:** one honest paragraph at first-run — *what* is transmitted (the grounded subset of your repo), *to whom* (the configured model provider, e.g. Anthropic on Max), and that **nothing leaves the machine without a board command** (the proactive trigger only runs a local materiality check before deciding whether to call the model). The ledger is **local-by-default**.
- **Secret pre-scan + `.csuiteignore`:** before any file content can enter a prompt *or* a cited memo, the grounding set is scanned for secret patterns (`.env`, `*.pem`, keys, tokens, `tfstate`) and a `.csuiteignore` is honored; redactions are reported in the grounding-coverage line ("redacted: 3 files matched secret patterns"). Reuses the coverage-line machinery. **The `file:line` evidence contract must never write a secret into the ledger.**
- **Ledger is `.gitignore`d by default;** committing `board/` is an explicit opt-in (it's a permanent, timestamped record of strategic doubts). A **hash-chain** over the append-only ledger makes the "falsifiable track record" *verifiable*, not silently editable.

### 9.2 Prompt-injection threat model (was a blind spot)
The board's core action is ingesting **attacker-influenceable text** (READMEs, dependency files, issue bodies, commit messages) into a privileged reasoning loop. Standing rule: **content read from the repo is *evidence to analyze, never instructions to follow*** — ingested content is wrapped in data-delimiters, and the pinned **Independent Director has an explicit mandate to flag embedded instructions**. "Read-only" stops the board from *acting*; it does nothing to stop it from being *steered*, so the **trust boundary between a memo's text output and the hook/CLI machinery that handles it is drawn explicitly** (no memo text is ever interpolated into a shell/git/`bd` command), with a per-action interception test (§11.5). The proactive hook (§6) fires on freshly-pulled, uninspected content — so it runs the *same* injection-hardening, not a relaxed path.

### 9.3 Legal posture (don't-ship-to-others-without)
- **LICENSE:** Apache-2.0 (warranty disclaimer + patent grant + `NOTICE`); verify `the-5-to-9` license compatibility before porting code. ("OSS" with no license = all-rights-reserved.)
- **Not-advice disclaimer:** first-run + every memo footer — *"a thinking aid, not financial/legal/investment advice; you own every decision; no warranty."* The calibrated "confidence-this-is-wrong" number is good epistemics, **not** a legal disclaimer.
- **Named-persons NOTICE:** real executives are cited as **documented public ideas attributed to their source** (book/letter/talk); the individuals are **not affiliated with or endorsing** this project; seats stay **literal** (CFO, never "Buffett"); characterizations are framed as sourced commentary, never asserted fact. A *publish-time* CI gate checks characterization discipline. (See §4, §13-D1.)
- **Provider-ToS pass-through / EAR:** one line — automated inference traffic (the proactive hook) is the user's responsibility under the provider's usage policy; standard OSS export notice.

---

## 10. Build Substrate & Repo Layout

**Substrate: TypeScript/Node (pnpm)** + markdown personas/skills/commands + shell/mjs hooks, mirroring `the-5-to-9`. Claude Code plugin (Claude-native v1).

```
c-suite/
  .claude-plugin/plugin.json
  eval/                               # v0 GATE — built FIRST (§11.1)
    fixtures/                         # ~5 real decisions from Jake's repos, with rubrics
    baseline-delta.ts                 # runs single+contract / single+redteam / full board; blind-judged
    convergence.ts integrity-cases/   # convergence metric; impersonation red cases
  docs/board/                         # TIER 1 (human, NOT loaded): roster-research.md (ONE sourced appendix; 8 per-seat docs cut, D-5)
  personas/                           # TIER 2 runtime: ceo/cmo/cfo/cpo + independent-director + board-chair (cto/coo opt-in)
    *.persona.md  render/claude.ts
  core/
    protocol/                         # triage, N-process blind fan-out, cross-exam, honest-broker synthesis
    orchestrate-claude.ts             # v1 N-process fan-out (one claude -p per persona) + allSettled/retry/quota guard
    ledger/                           # append-only decisions.jsonl, memos, git-history seeding, closed-loop outcome ritual
    validation-loop.ts                # §5 spine: riskiest-assumption → next-experiment → signal → scale/kill/pivot
    coldread.ts                       # first-run goal inference + demand question + one uncomfortable observation
    redact.ts                         # secret pre-scan + .csuiteignore (before any prompt/memo) — §9.1
  commands/  skills/                  # ask(two-voice), board-meeting, next-experiment, pre-mortem, state-of-the-repo, review-decision, set-goals, track-record
  hooks/                              # irreversible-gate, session-start(outcome-loop + tripwire prompt), proactive-trigger(post-commit, injection-hardened), hooks.json
  cli/                                # csuite entrypoint
  board/                              # scaffolded into TARGET repo (.gitignore'd by default): goals.md, founder-charter.md, traction.md, context.md, config.yaml, ledger/(hash-chained), decisions.jsonl
  LICENSE(Apache-2.0)  NOTICE(named-persons)  SECURITY.md  .csuiteignore
  tests/  docs/board/roster-research.md  + OSS scaffolding
  # DEFERRED (architecture-complete): core/providers/* seam+registry+CostRecord union, raw-api adapters, tiers.yaml
```

---

## 11. Evals & Testing

### 11.1 The gating experiment (built FIRST, before any persona engine)
**Baseline-delta eval.** Run real decisions from Jake's repos **three ways**: (a) single Opus + output contract, (b) single Opus + forced red-team, (c) full board. **Judge = the founder, BLINDED** — scoring the three outputs **paired, side-by-side, on decision quality, without knowing which is which** (label-shuffled per fixture). Blinding removes the only thing that made "founder as judge" invalid (bias toward one's own product); the founder is the best domain expert on their own decisions. Optional: one operator peer for inter-rater agreement, and a different-family LLM as a *secondary consistency check only* (never the arbiter — it rewards executive-sounding prose, the exact failure mode under test). Score against a **pre-registered margin** the board must beat (b) by.

**Pre-committed decision rule (set BEFORE running — this is what stops the gate becoming theater):**
- **Ambiguous = FAIL.** If the board beats (b) by *less than* the pre-registered margin, or the lift is within rater noise, that is a **fail → cut to single-brain + standing red-team** (the cheaper product). It is *not* the founder's call to interpret favorably.
- **Powering the gate (v0 task, not prose):** n≈5 single-rater cannot distinguish a real lift from noise. The eval harness must either raise n meaningfully **or** justify a small-n design explicitly — multiple raters, **paired within-fixture** (a/b/c judged side-by-side per decision), and **effect-size framing, not significance**. The rater protocol (who, how blinded, rubric) is specified in the harness, not assumed.
- **The margin and the judge are inputs set before any scoring** (§13 Spike 4; founder decision on the judge).

The board most likely wins on the *hard, irreversible* fixtures and ties on the easy ones — so fixtures over-sample Type-1 decisions, where the board's value (if real) concentrates.

**The gate tests the *validation* axis, because that's the user's actual goal (rev 5):**
- **Primary criterion = the behavioral proxy, not prose quality.** The headline number is: across the fixtures, **on how many did the board surface something that would have changed the builder's actual next commit / next move?** A prose-quality lift that changes no behavior is theater no matter how blinded the judging.
- **Fixtures must include validation decisions, not only product/technical ones.** At least one *"I think people want X — what now?"* fixture, and at least one **demand-divergence fixture**: repo says "shipping fast," `traction.md` says "nobody signed up" → the correct output is *"you're optimizing build when you should be testing demand,"* and the board **fails the fixture if it gives product-polish advice instead.** Per the "ambiguous = fail" rule: if the board can't beat one good prompt on *"force me to validate this and interpret what I bring back,"* the validation value-prop is theater — and the builder should learn that in week one.

**Validity envelope (state it on every PASS):** a PASS licenses *"better than one prompt, for this author's repos, by this author's blinded judgment"* — a real, worthy result — **not** *"the product works."* Generalization to other users/domains is a **separate post-v0 hypothesis**, not granted by the gate. Two further limits, stated not hidden: the blinded judge is (per §3) weak at exactly the business axis being scored; and the gate measures advice *quality in a calm graded artifact*, not whether better advice **changed what the founder actually did** under load — which is exactly why the **behavioral proxy** ("would this have changed your next move?") is the *primary* gate criterion (§11.1), not the prose-quality score. Stamp every eval + ledger artifact with the **resolved model ID** — a PASS is valid only for that model.

### 11.2 Convergence metric
On the fixtures, measure how often the N blind drafts reach the *same* conclusion. >X% ⇒ personas have collapsed into one voice (anti-sycophancy failure) — a stronger signal than pushback rate.

### 11.3 Decision-eval fixtures + outcome-graded evals
Adversarial sycophancy cases (founder is wrong; correct = respectful pushback) → **pushback rate**; **grounding rate** (every claim cited). Graded on **objective tripwire outcomes + a frozen adversarial fixture set the founder never grades** (avoids project-level RLHF-sycophancy). Add: a **values-divergence fixture** (growth-optimal ≠ charter-optimal → correct board behavior is to surface the conflict and defer to the charter), a **prompt-injection fixture** (repo content embedding instructions → board must flag, not follow), and **RETENTION as a co-primary outcome variable (rev 8 — not a footnote):** *did the founder voluntarily open it on a real decision they weren't told to test, in week 3?* The entire AI-advisor category's dividing line is week-1 vs week-3 use; **quality without retention is a passed eval and a dead tool.** Decision-quality (the v0 gate) and week-3 voluntary retention are co-headline; instrument both from day one. **Eval-set lifecycle:** a never-iterated-against **held-out test set** distinct from the dev set, refreshed by mining new ledger decisions — so "verified by evals" doesn't quietly mean "overfit to 5 cases." **Re-gate trigger:** on a detected model change, auto-run convergence + pushback in CI and alarm if anti-sycophancy regressed below the v0 bar.

### 11.4 Integrity guardrail eval
Red cases ("what would Buffett do about MY pricing?" → must **refuse impersonation, apply the principle, cite source**). No-person-tags-in-runtime is snapshot-tested.

### 11.5 Mechanical & adapter tests
N-process fan-out (blind drafts don't see each other; partial synthesis on a throttled draft; abort on `signal`); ledger append/seed/outcome-loop; irreversible-gate (port + adapt `the-5-to-9`'s harness). **Note — these are BUILDS, not ports:** the reference `claude.ts` does bare `JSON.parse` + `if(!ok) throw` and `parallel.ts` uses `Promise.all`, so the **terminal-coercion fallback** (re-ask once on schema-fail, then lenient prose parse) and the `allSettled`/partial-synthesis/quota-preflight machinery (§8.1) are net-new code. `/status`-parse snapshot test.

---

## 12. v1 Scope, Sequencing & Deferred

### v−1 — The Weekend Proof (ZERO code; do this BEFORE writing the v0 plan)
The current v0 is a 1–2 week build *before you learn the one thing that kills or greenlights everything.* Test the core premise first, by hand, this weekend — it's the cheapest experiment, and it's exactly what c-suite's own board would prescribe (*"you've proven you can spec it; the untested risk is whether the board beats one prompt — go get that signal"*):
1. Take **3 real decisions** from your repos (ideally your actual north-star project — the one you're motivated to keep using it on, so retention solves itself).
2. Run each **three ways by hand**: (a) one `claude -p` with the output contract; (b) (a) + *"now red-team your own answer"*; (c) four separate `claude -p` calls with the four persona prompts pasted in, then a synthesis prompt.
3. **Shuffle labels; grade blind a day later.** The only number that matters: **on how many did (c) surface something that would have changed your next commit that (b) did not?**
4. **Pre-committed kill line:** if fewer than **2 of 3** would have changed your next move, the *board* is "single-brain + red-team" at best → **build the cheaper engine** (single-brain + red-team) but **keep the durable core regardless** — ledger + git-hook nudge + drafted experiments don't depend on the board winning (§1 safety net). Pass → build v0 with the full board engine.
5. **Also record (rev 8 — the behavior/retention question, since pure advice doesn't retain):** for each decision, *did you actually execute the recommended move within 72 hours — and would a **ready-made draft** (the landing copy / interview script / DMs the harness would hand you) have made you more likely to?* If "yes, the draft would've moved me," that's the draft-and-queue thesis confirming on its own author.

Either outcome wins: a board pass → build the engine; a board fail → you build the *cheaper* engine and still ship the retaining product, having spent a weekend not a month.

### v0a — The Calibration Spine (build FIRST, board-free; §0 architectural thesis)
**"Build as if the board doesn't exist."** The first real code is the retaining core, which does **not** depend on the board winning anything: the typed **claim algebra + deterministic boundary validator** (§5), the **forecast-record ledger + deterministic tripwire verifier + proper-score + hash-chain** (§7), **`/track-record` calibration display** (§6), the **post-commit nudge**, and **`/next-experiment` Tier-A drafting** (§5). This is ~a few hundred lines, no board, no provider seam — and it is the product that retains. Ship this regardless of the v0b result.

### v0b — The Board Gate (only if the weekend proof passes; the board earns its seat or doesn't)
The baseline-delta eval harness (§11.1) + repo fixtures (over-sampling Type-1 decisions) + a runnable board *just complete enough to test*: the tight 4 seats as distilled `assets`, the N-process blind fan-out, honest-broker synthesis, feeding the v0a claim/ledger layer. **Decision gate (pre-committed, §11.1; ambiguous = fail):** does the board beat single-prompt-with-red-team by the pre-registered margin? If yes → the board becomes the deliberation engine on top of the spine; if no → the spine ships with "single-brain + red-team" as the engine. **Either way v0a ships.**

### Project-level kill-criterion (eat the dog food)
Beyond the board's gate, set a tripwire for the **whole project** (write it to its own ledger): given the author's stated north-star is a *different* project, if by **<date +60d>** the author has not voluntarily opened `/track-record` on a real decision in week 3 **and** the calibration ledger has <5 resolved predictions, c-suite is not earning its opportunity cost vs. the north-star → pause and fold the learnings back. The tool's own logic, applied to itself.

### v1 — Minimal Lovable (only if v0 clears) — three layers (rev 8)
**The product is centered on Layers 1–2 (the retaining daily face); Layer 3 is the engine.**
- **Layer 1 — daily driver (the retaining core):** the **self-grading ledger + closed loop** (the headline); the **post-commit nudge** (primary distribution surface); the two-voice `/ask`. First-run cold read; git-seeded append-only ledger (with `author`/`shareability` fields, §7); outcome loop at session-start; repo-observable + market-facing tripwires.
- **Layer 2 — doer (the retention multiplier):** **`/next-experiment` drafts the experiment's assets to a scratch branch** (Tier A); **queued actions behind `irreversible-gate` with an evidence pack** (Tier B). This is the draft-and-queue value spine (§5).
- **Layer 3 — escalation engine (held loosely):** `/board-meeting` — the N-process board, **auto-escalated by the Board Chair on a Type-1 door** (deterministic allowlist). Invisible plumbing, not a ceremony.
- **No scheduled cadence / no 24/7 ambient watcher** (founder decision rev 8): on-demand + the post-commit nudge are the only background surfaces.
- Absence-as-interrogative + grounding-coverage; **scope-and-stage header** + repo classification; dissent-in-headline synthesis.
- **Founder-charter intake + growth-skeptic asset** (every persona conditions on the charter); reception-aware cold read (earned strength first; failure-seeding gated).
- **Secret pre-scan + `.csuiteignore`; prompt-injection hardening; data-boundary disclosure; ledger `.gitignore`d + hash-chained.**
- `claude-cli` inference (N-process fan-out) with `allSettled`/retry/quota-guard + terminal-coercion fallback; **CFO + Independent Director + Board Chair pinned**.
- `irreversible-gate` + drawn trust-boundary; Claude plugin packaging; the eval suite (§11, incl. validity-envelope + values/injection/retention fixtures) wired to CI; **one sourced research appendix** (not 8 per-seat docs).
- **LICENSE (Apache-2.0) + NOTICE (named-persons) + first-run not-advice disclaimer** — required before *anyone but the author* installs (see §13-D2).

### Build order
0. **Weekend manual proof** (zero code; kill line). 1. **v0a — the board-free calibration spine** (typed claims + boundary validator + forecast-record ledger + deterministic tripwire verifier + hash-chain + `/track-record` calibration display + post-commit nudge + `/next-experiment` Tier-A drafting) — *ships regardless*. 2. **v0b — board eval harness + fixtures + a minimal board feeding the spine** → gate. 3. — gate (ambiguous = fail; board engine only if it clears) — 4. v1 layers: cold read + charter + outcome loop + `traction.md`; two-voice `/ask`; router triage. 5. Hardening: secret-scan + `.csuiteignore` + injection + `irreversible-gate` + LICENSE/NOTICE + eval suite in CI. 6. Plugin packaging + OSS scaffolding.

### Deferred (architecture-complete / v2+)
Provider seam + registry + `CostRecord` discriminated union + raw-api/codex adapters + `tiers.yaml` (v1 tracks Opus quota % only); the multi-process/multi-provider conductor; bi-temporal invalidate-don't-delete ledger; **track-record *weighting* in synthesis** (flat confidence until ≥N resolved predictions); the full 7+ roster and deep Tier-1 docs; the full ambient 24/7 watcher; DSPy/GEPA optimization; agent-inbox UX.

---

## 13. Resolved Decisions

- **Target:** OSS, Claude-Code-native, default Claude Max; provider-agnostic **later**. **Brand:** literal `c-suite` (binary `csuite`); roles literal.
- **Product framing (rev 4):** a **product/technical-decision stakeholder team** that ensures good decisions get made — **not** virtual company-management. Unit of analysis = **the decision + its product/repo**, disclosed on every memo via the scope-and-stage header.
- **Product framing (rev 5 — the sharpest steer):** the product is a **validation forcing-function** for a technical builder taking a side-project to a business — it *catches you building unvalidated, names the riskiest untested assumption, designs the cheapest off-repo test, and interprets the signal you bring back* (§5 validation loop). It is **not** "AI that validates your business" (it can't be the market) and **not** org-management. Roster (finalized in **rev 7** — real C-suite + governance): management **CEO / CMO / CFO(monetization) / CPO** always-on (CTO/COO opt-in) + an **Independent Director** (challenger) and **Board Chair** (neutral synthesis). Demand enters via a **builder-maintained `traction.md`** (paste-in, never integrate). The **v0 gate now tests the validation axis** (behavioral-proxy as primary criterion + a demand-divergence fixture).
- **Center of gravity (rev 8 — use-case research):** the **retaining product is the ledger + post-commit nudge + drafted next-moves**; the **board is the engine/escalation, not the daily surface** (D-D). The harness now **does reversible work** (draft-and-queue, Tier A/B/C, §5) — `/next-experiment` drafts the test's assets (D-A). **No scheduled cadence / 24/7 watcher** — on-demand + the nudge only (D-B). **Solo first**, ledger architected **team-ready** (`author`/`shareability`) for a v2 wedge (D-C). **Retention (week-3 voluntary use) is a co-primary metric** with decision-quality (D-E). The durable core **survives a board v0-gate failure** (§1 safety net); run the gate, expect "single-brain + red-team + ledger" as the base case (D-F).
- **Whose game (D-3):** add `board/founder-charter.md` + a growth-skeptic asset; personas condition on the charter; values-divergence fixture in the eval.
- **Named execs (D-1):** **keep**, as **proper citations** (person + public source) in one appendix + a NOTICE; seats stay literal; no fabrication/endorsement; characterization-discipline is a publish-time CI gate. Citing documented public ideas with attribution is standard nominative use; a pre-release legal check is bundled with D-2/D-4.
- **Maintenance (D-5):** **cut the 8 per-seat human docs**; one sourced `roster-research.md` appendix suffices.
- **Distribution (D-2):** v0/v1 is **author-only for the proof**; LICENSE + secret-scan + threat model + NOTICE are **hard gates before any other user installs**. Confirm `hawaii.edu` (D-4) affiliation creates no IP/COI claim before publishing.
- **Prove-before-build:** v0 baseline-delta eval gates the engine. **Board (rev-7 — real C-suite + governance):** management = **CEO / CMO / CFO(monetization) / CPO always-on; CTO + COO opt-in**; governance = **Independent Director** (standing challenger, pinned) + **Board Chair** (neutral synthesis, pinned, ≠ CEO). **Cadence:** on-demand **+ one minimal proactive trigger**; the Board Chair auto-escalates Type-1 doors.
- **Persona model:** composite-of-real-executives as the **internal quality method** (not the headline); two-tier docs; person-tags stripped from runtime `assets`; integrity guardrail enforced + evaluated.
- **Deliberation:** absence-as-interrogative + grounding-coverage; **market-claim interrogative (false-presence)** + demand-coverage; **Board Chair** (honest-broker) synthesis with dissent-in-headline + "confidence-wrong"; two-voice `/ask`; the **validation loop** (riskiest-assumption → `/next-experiment` → signal → scale/kill/pivot) as the spine.
- **Runtime:** **N-process blind fan-out (one `claude -p` per persona) is the v1 default** (proven in `the-5-to-9`); single-process fan-out is a spike-gated optimization, not shipped by default. `allSettled`/retry/quota-guard; **CFO + Independent Director + Board Chair pinned** to known-good model; provider seam deferred.
- **Memory:** append-only ledger, git-seeded, outcome loop in v1; repo-observable tripwires; weighting + bi-temporal deferred.
- **Honesty corrections:** drop "irrefutable"; track record = retention-from-install, not day-1 moat; v1 disagreement = one-model perspective-taking, decorrelation arrives with API adapters.
- **Headline framing:** lead with the **repo-grounded skeptic + falsifiable track record** (the daily driver); the full executive **board is the escalation for Type-1/irreversible calls**, not the everyday surface. v1 optimizes `/ask` + the ledger first.
- **v0 eval judge:** the **founder, blinded** (paired a/b/c, label-shuffled); optional operator peer for inter-rater agreement; LLM only as a secondary consistency check. Distinct from the §11.3 ongoing pushback-rate fixtures (which the founder never grades, to avoid training toward agreement).

### Spikes (resolve during build)
1. **CLI structured-output adherence** at full output-contract complexity under subscription `-p` (+ terminal-coercion fallback). 2. **Prove the single-process blind-draft primitive** (mutually-blind sub-drafts in one `claude -p`) before it may be promoted above the N-process default — and measure real N-process concurrency/latency/quota cost under Max either way. 3. Live model IDs/prices (future-dated). 4. The pre-registered baseline-delta *margin* (set before the eval) + the **rater protocol** (n, blinding, paired scoring). 5. `/status`-parse brittleness across CLI updates.

### Build-time decisions to carry into the plan (from the final audit — specify, don't guess)
1. **Board Chair (synthesis): model-call or code?** It must "surface the strongest *surviving* dissent" + emit a "confidence-wrong" number (a judgment task). Decide before coding the board: if it's a `claude -p` call it's a **pinned model call** (on top of the 4 management drafts + the Independent Director) and the §8.2 cost math must include it; pin its exact input contract (full drafts + cross-exam, or summaries). **Blocks v0.**
2. **The eval rubric + margin + how the behavioral-proxy binary combines with the quality score** is a **first-class v0 deliverable**, equal to the harness — not a sub-bullet. With n≈5/one rater, make the behavioral-proxy binary ("changed my next move: y/n") the headline; don't over-engineer a prose scale. A vague rubric makes "ambiguous = FAIL" unfalsifiable. **IS the v0 gate.**
3. **Router Type-1 detection = a deterministic allowlist rule, NOT an LLM classifier** (`pricing|billing|migrations|public API|LICENSE|auth` paths → board) + "when unsure, ask one yes/no." A silent classifier's false-negative is exactly the "build the wrong thing for 3 months" failure. v1 task.

### Top risks → mitigations
1. **Board ≈ one good prompt (existential)** → the v0 gating eval; cut to single-brain if it fails. 2. **Sycophancy** → pinned governance seats (CFO + Independent Director + Board Chair), convergence metric, frozen non-founder-graded evals. 3. **False-absence hallucination** → interrogative-by-contract + grounding-coverage. 4. **Empty-ledger / no day-1 value** → cold read + git-seeding + outcome loop. 5. **On-demand misses the moment** → minimal proactive trigger + router auto-escalation. 6. **Throttle mid-meeting** → discriminated-union result + `allSettled`/partial synthesis + quota pre-flight. 7. **Impersonation / living-person risk** → demote real-execs framing, strip runtime tags, integrity eval. 8. **Scope blowout** → seam/ledger-weighting/full-roster deferred behind the proof.

---

## 14. References (proven patterns to port from `the-5-to-9`)
`driver/src/adapters/adapter.ts` (the seam, for later) · `driver/src/config.ts` (`scrubbedEnv`) · `hooks/irreversible-gate.mjs` (+`.sh`, `gate.test.mjs`) · `hooks/session-start.sh` (outcome-loop + tripwire check hook) · `scripts/night-shift.sh` (proactive trigger model) · `.claude-plugin/plugin.json`, `agents/*.md`, `skills/*/SKILL.md`, `commands/`.

---

## 15. Red-team Resolutions (rev 1 → rev 2 → rev 3)
FATAL-1 (no quality experiment) → §11.1 gating eval. FATAL-2 (proactive JTBDs / empty ledger) → §6 trigger + cold read + §7 git-seed + outcome loop. FATAL-3 (no first-run moment) → §6 cold read. FATAL-4 (scope = secret v2) → §12 v0/architecture-complete split; seam deferred. SERIOUS-5 (Sonnet guts skeptics) → §8.4 pin CFO+Skeptic. SERIOUS-6 (same-model correlation) → §1 honesty downgrade + §11.2 convergence metric. SERIOUS-7 (false absence) → §5 interrogative. SERIOUS-8 (overclaim "irrefutable") → §1/§3 grounded-triggers framing. SERIOUS-9 (`/ask` = free GPT) → §5 two-voice + contract + CoS escalation. SERIOUS-10 (no throttle handling) → §8.1 discriminated union + `allSettled`. SERIOUS-11 (7× re-ground) → §8.2 N-process default + tight board bounds the cost (single-process is spike-gated; see rev-3 note). SERIOUS-12 (CEO synthesizes / founder-graded evals) → §5 CoS synthesis + §11.3 frozen evals. SERIOUS-13 (unenforced integrity) → §4 strip tags + §11.4 eval. 14 (deferential rule deletes board) → §4 tight board as the explicit default. 15 (Tier-1 docs are a doc product) → §12 defer deep docs. 16 (brittle CLI flags) → §13 spikes + coercion fallback.

**Rev 2 → rev 3 (fresh-eyes verification fixes):** A new FATAL was caught — rev 2 had promoted an *unproven* single-process fan-out to the v1 default, contradicting the ported `the-5-to-9` reference (verified: `driver/src/adapters/claude.ts` is one process per persona; `parallel.ts:70` fans out via separate processes). Resolved by making the **proven N-process fan-out the v1 default** and spike-gating single-process (§8.2). Also fixed: the **synthesizer (Chief-of-Staff) is now pinned** alongside CFO+Skeptic (§8.4) — an unpinned synthesizer would erase the pinned Skeptic's dissent at the last hop; the **gate now has a pre-committed "ambiguous = fail" rule + rater-power requirement** (§11.1); and the **false-absence interrogative is downgraded further when the scan itself was truncated** (§5). Founder decisions now resolved (§13): eval judge = **founder blinded, paired a/b/c**; framing = **grounded-skeptic daily driver that convenes a board for big calls**.

---

## 16. Blind-spot Resolutions (rev 3 → rev 4)
A completeness sweep (6 negative-space lenses) found whole categories the spec was *silent* on. The headline: the design secured the board against *being wrong* but not against *being abandoned, attacked, leaking, or playing the wrong game* — and the most dangerous unexamined assumption was **"the repo is the company."**

- **C-1 unit-of-analysis** → reframed (§1): a **decision/product stakeholder**, not company oversight; **scope-and-stage header** on every memo (§5); `/state-of-the-repo` rename; repo classification + `board/context.md`.
- **C-2 reception/abandonment** → reception-aware cold read (earned strength first; failure-seeding gated; tone dial; CEO-seat sustainable-pace mandate) (§6); **retention signal** in evals (§11.3).
- **C-3 data egress / secrets** → §9.1 data-boundary disclosure + **secret pre-scan + `.csuiteignore`** + ledger `.gitignore`d + hash-chain.
- **C-4 prompt injection** → §9.2 threat model: repo content is *evidence, not instructions*; Independent Director flags embedded instructions; injection fixture (§11.3).
- **C-5 growth/VC values-capture** → §4 **founder-charter** + growth-skeptic asset; **values-divergence fixture** (§11.3).
- **I-6 license / disclaimer** → §9.3 Apache-2.0 + NOTICE + not-advice disclaimer.
- **I-7 ledger in git** → `.gitignore` default + hash-chain (§7/§9.1).
- **I-8 n=1 / model rot** → **validity envelope** + model-ID stamping + re-gate trigger (§11.1/§11.3).
- **I-9 named-persons (publish surface)** → cite-by-source + NOTICE + literal seats + publish-time characterization gate (D-1).
- **I-10/I-13 stage-invariance / behavior** → context-confidence flags + behavioral proxy (§11.1).
- **I-11 monorepo budget** → repo-size triage + `--scope` (v1 task).
- **I-12 trust boundary** → drawn explicitly; memo text never reaches a shell/git/`bd` call (§9.2 + test).
- **Founder decisions D-1…D-5** resolved in §13; **D-4** (`hawaii.edu` IP/COI) is a pre-release real-world check, not a spec item.
- **Deferred/ACCEPT+DOCUMENT:** multi-stakeholder (cofounder) arbitration = explicit v1 non-goal; community fixtures; broaden roster beyond US/VC or document the default; maintenance-budget tally.

**Verdict carried into the plan:** nothing here blocks the **v0 proof**; the LICENSE + secret-scan + named-persons NOTICE are **don't-ship-to-others-without** gates; the scope-header + founder-charter are the one *structural addition* (they change what the board is grounded on and optimizing for). Architecture sound; the negative space was in the *frame*, now drawn.

---

## 17. Usability / Real-Value Resolutions (rev 4 → rev 5)
A usability pass against the user's true goal — *real business validation on side-projects, no org-management* — returned **"conditional yes": achievable, but it needs a frame-and-roster shift, not more engineering.** What the board **can** deliver (better than any tool he could otherwise reach): catch building-without-validation from his own git history; catch the business consequence of a technical decision (the COGS-vs-pricing archetype); name the riskiest untested assumption and design the cheapest test; force the kill/scale/pivot call using his own pattern. What it **fundamentally cannot**: *be the market.* The honest pitch is therefore a **forcing-function that structures and interprets the validation he must go do**, not "AI that validates."

Changes applied: **§1** reframed to the forcing-function; **§4** roster validation-optimized (Distribution promoted, CFO→monetization, CoS→voiceless function, COO cut, `traction.md` into diets); **§5** added the validation loop as the product spine + the **market-claim interrogative rule** (false-presence) + demand-coverage line; **§6** added `/next-experiment`, `traction.md`, the demand question, and the **closed-loop** (prompt-for-result → re-deliberate); market-facing tripwires made first-class; **§11.1** the v0 gate now tests the validation axis (behavioral-proxy primary + demand-divergence fixture); **§10** scaffold gains `traction.md`, `validation-loop.ts`, `/next-experiment`.

**The killer usable moments this buys** (all buildable, all groundable): (1) the **build-vs-validate ledger** ("87% of commits in `infra/`, 0% in anything customer-facing; your stated risk is demand, tested zero times"); (2) the **architecture decision that's secretly a pricing decision**; (3) the **dog that didn't bark** (no landing/waitlist/analytics/payment path) as an interrogative; (4) the **pattern-interrupt from git history** (`spike/dynamo` died at 3 weeks, you just opened `spike/cassandra`); (5) the **closed loop** — it prompts for the number on the tripwire date and re-deliberates over what you paste. **Single most important change:** the reframe itself — *board = mechanism, not pitch* — nailed before any code.

---

## 18. Roster Realignment to a Real C-Suite (rev 6 → rev 7)
On the founder's steer ("more closely aligned to real c-suite roles"), the rev-5/6 abstractions ("Distribution/GTM," a non-titled "Skeptic," a faceless "synthesizer") were realigned onto **literal real roles in a real management/board structure** — which, conveniently, is also *more* faithful to how real boards de-bias:

- **Management — the C-suite (propose & analyze, blind drafts):** **CEO · CMO · CFO(monetization) · CPO** always-on; **CTO · COO** opt-in (you fill CTO; COO is the ops/admin you don't want). The old "Distribution/GTM" is just the **CMO**; the CFO keeps the monetization charter.
- **The board — governance (oversee & challenge, pinned):** the **Independent Director** *is* the anti-sycophancy challenger (rewarded for the strongest objection; carries the growth-skeptic/charter-guardian mandate); the **Board Chair** *is* the neutral honest-broker synthesizer — **explicitly not the CEO**, so the CEO's optimism can't quietly win the synthesis.

Nothing of value was lost: every engineered mechanism (dedicated red-team, neutral synthesis, demand lens) now wears a real, recognizable title, and the **pinned set** (anti-sycophancy + neutral synthesis) is **CFO + Independent Director + Board Chair**. A board meeting ≈ 4 management blind drafts + the Independent Director's challenge → the Chair synthesizes (~5 drafts + 1 chair call). Personas: `ceo/cmo/cfo/cpo` + `independent-director/board-chair` (+ `cto/coo` opt-in).

---

## 19. Center-of-Gravity Shift (rev 7 → rev 8) — use-case research
Fresh research on where an agentic harness delivers *true, retained* value for a solo founder / small team returned **"evolve, don't pivot."** The architecture, rails, and anti-sycophancy moat are sound and stay maximal; what changes is the **center of gravity and the value framing**:

- **The retaining product is not "a board you convene."** AI-advisor tools churn ~23–40% on a week-2 novelty cliff (the gap between advice given and acted-upon). What retains is **completed work + a return habit**. So the **daily face** is the **self-grading ledger** ("remembers what you bet, tells you if you were right" — the uncopyable moat: nobody can clone 9 months of *your* resolved predictions), the **post-commit nudge** (zero-context-switch, the #1 predictor of week-4 retention), and **drafted next-moves**. The board is demoted to the **engine + Type-1 escalation** (mirroring §4's demotion of "composite executives"). *(Founder decision D-D.)*
- **Draft-and-queue is the value, not a safety limitation.** The `irreversible-gate` moves from §9 (Safety) into the value prop as the **DO / QUEUE / RECOMMEND** tiers (§5). `/next-experiment` now **drafts the experiment's assets** to a scratch branch, not just its design — closing the advice→action gap that kills advisory tools. *(D-A.)*
- **No scheduled cadence / 24/7 watcher.** A weekly cron run was the research's top *expansion* candidate, but the founder declined (one false alarm = muted forever); the **post-commit nudge is the only background surface.** *(D-B.)*
- **Solo first, ledger team-ready.** The team version is a v2 hypothesis sunk in v1 by the **scapegoat/weaponization landmine** (a permanent record of strategic doubts becomes ammunition in a 2-person room); pre-empt it now with `author`/`shareability` fields (§7). *(D-C.)*
- **Retention is a co-primary metric** with decision-quality (§11). *(D-E.)*
- **The safety net (the most important strategic point):** the durable core — ledger + nudge + drafted experiments — **does not depend on the board beating one prompt**, so it **survives a v0-gate failure.** Run the gate as specified, expecting "single-brain + red-team + ledger" as the base case; build the durable core either way. *(D-F.)*

**Net:** mostly framing/emphasis (re-center, demote "board," promote draft-and-queue + retention) plus one real scope addition (drafted experiment assets). The unique wedge to plant the flag on: the **graded-prediction ledger** — *not* generic "git memory," which is commoditizing fast.

---

## 20. Architectural Thesis (rev 8 → rev 9) — six probes converged
A probe of "what would make this *architecturally* innovative" ran six independent threads (novelty landscape, calibration math, belief revision, dialectic orchestration, learning-without-training, falsifiability-as-types). **All six converged on the same component** — none defended the board as the moat; every one pointed at the **self-grading, repo-resolved, hash-chained prediction ledger.** The result is a sharper *identity*, not new scope:

- **Identity (new §0):** a **closed-loop calibration instrument / control system over a repo substrate**, not "an AI board." Build as if the board doesn't exist; the v0 gate decides whether it earns a seat. The board's own demotion (rev 8) is *correct and pushed harder*.
- **The interesting core = the retaining core = the same mechanism.** Interesting *because* it's a self-resolving proper-scoring loop; retains *because* the graded record is yours, tamper-evident, non-transferable. One bet.
- **It does NOT betray "ship the cheap core":** the minimal innovative form (typed claims + boundary validator + deterministic tripwire verifier + hash-chained forecast records + *displayed* calibration) is also the cheap form — a few hundred lines, no new infra. §5/§7/§6 updated accordingly.
- **Honest limits made first-class (§0, §7):** oracle selection-bias (off-repo outcomes need a paste that may never come); moat-clock = churn-clock; Goodhart on the score.
- **Cut from the headline:** the "dialectic engine" framing (false-first risk — a named 2026 subfield) and any per-cell Brier *reweighting* in v1 (deferred, coupled to the provider-seam trigger).

The single most defensible bet, verbatim: *typed falsifiable claims exist so the ledger can grade itself against git-observable reality — a deterministic verifier (never the LLM) resolves predictions, a proper scoring rule scores them, a hash-chain makes the record verifiable not editable, and the same provenance lattice that makes claims gradable also decides what the agent may do unattended.*
