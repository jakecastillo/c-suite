# Contributing to c-suite

Thanks for your interest. c-suite is early (v0.1.0 — the deterministic calibration
spine), so the highest-value contributions are bug reports from real use, new
**deterministic predicates**, and sharpening the docs.

## Ground rules

- **The verifier is sacred.** Anything that resolves a forecast must be plain,
  deterministic code reading git/filesystem state — **never** a model call, a
  network request, or anything non-reproducible. That "verifier firewall" is the
  whole point; a PR that breaks it will not be merged.
- **TDD.** Every change ships with a test that fails before and passes after.
  No placeholders, no tests that assert nothing.
- **Determinism in `src/`.** No `Date.now()` / `Math.random()` / wall-clock in
  `src/`; time and identity flow in as parameters (`bin/csuite.mjs` is the only
  place real time is read).

## The gate (must be green before a PR)

```bash
pnpm check     # = typecheck (src+test) + build + test + lint
```

`pnpm typecheck` matters specifically: Vitest transpiles without type-checking, so
the strict `tsc` pass is the real type gate. The build also runs in CI; the
binary is exercised by an end-to-end test (`test/e2e/`).

## Adding a predicate

Predicates live in `src/verifier/predicates.ts` as pure `(args, ctx) => boolean`
functions in the `PREDICATES` registry. Add yours, add it to the README table,
and test it against a throwaway git repo (`test/helpers/tmp-git.ts`). Keep all
git calls `execFileSync("git", [...arrayArgs])` — never a shell string — and run
any path argument through the `inRepo` containment guard.

## Style

Biome handles formatting and lint (`pnpm lint`); run `pnpm exec biome check --write
src test` to auto-format. Match the surrounding code.

## Submitting

Open an issue for anything non-trivial before a large PR. By contributing you
agree your contributions are licensed under Apache-2.0 (see LICENSE).
