# Changelog

All notable changes to this project are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

## [0.1.0] — 2026-06-22

First release: **the deterministic calibration spine** (board-free, LLM-free).

### Added
- `csuite predict` — record a decision as a typed, falsifiable forecast
  (probability + a machine-checkable tripwire + a date), validated at the boundary.
- `csuite resolve` — a deterministic verifier (code, never a model) resolves every
  due forecast against git/filesystem state and Brier-scores it.
- `csuite track-record` — calibration curve + over/under-confidence reliability
  flag over the ledger (honest "insufficient" below 8 resolved predictions).
- Deterministic predicates: `path_exists`, `commits_to_since`, `branch_abandoned`.
- Hash-chained (SHA-256), append-only, local-by-default ledger
  (`board/decisions.jsonl`) covering every field of every event, with
  `verifyChain` tamper detection.
- `csuite help` / `--version`; `CSUITE_REPO` and `CSUITE_MODEL` overrides.
- Apache-2.0 license, NOTICE, CONTRIBUTING, SECURITY, and an end-to-end test that
  runs the actual binary.

### Notes
- This release deliberately has **no LLM and no advisory board** — they are later
  layers that build on (and are gated by) this spine. See the README roadmap and
  the design spec under `docs/`.
