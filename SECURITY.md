# Security Policy

## Reporting a vulnerability

Please report security issues **privately** — open a GitHub security advisory on
this repository (Security → Report a vulnerability), or email the maintainer.
Do not open a public issue for a vulnerability. We'll acknowledge within a
reasonable window and coordinate a fix and disclosure.

## Security posture (what c-suite does and doesn't do)

c-suite v0.1.0 is intentionally small and local:

- **No network, no model, no telemetry** in the core. The deterministic verifier
  reads git/filesystem state only.
- **The ledger is local-by-default.** `board/decisions.jsonl` is git-ignored — it
  is a private record of your decisions and is never transmitted anywhere.
- **Git is invoked safely.** All git calls use `execFileSync("git", [...arrayArgs])`
  — never a shell string — so predicate arguments cannot inject shell commands.
- **Path containment.** Path arguments are confined to the repo root with a
  prefix-collision-safe check (`relative()` + separator, not `startsWith`).
- **Tamper-evidence.** The ledger is a SHA-256 hash chain over every field of
  every event; `track-record` walks and verifies it.

## Things to know

- The ledger may contain sensitive strategic notes you typed into `--text`. It is
  git-ignored by default; **do not commit `board/`** unless you intend to, and
  treat it as you would any private notes.
- This is early software. The threat model for the (future) LLM and board layers —
  prompt injection from repo content, secret redaction — is described in the
  design spec and is **not yet implemented** in v0.1.0, which has no LLM surface.
