#!/usr/bin/env node
// Thin real-world entry: the ONLY place real clock/paths/process are read.
// All logic lives in the unit-tested runCli (src/cli.ts -> dist/cli.js).
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const distUrl = new URL("../dist/cli.js", import.meta.url);
if (!existsSync(fileURLToPath(distUrl))) {
  console.error("csuite: build artifacts missing — run `pnpm build` (or `npm run build`) first.");
  process.exit(1);
}
const { runCli } = await import(distUrl.href);

// Repo root: $CSUITE_REPO override (useful for subdirs/monorepos/tests), else the git toplevel.
const repoRoot = process.env.CSUITE_REPO
  ? resolve(process.env.CSUITE_REPO)
  : execFileSync("git", ["rev-parse", "--show-toplevel"]).toString().trim();

const now = new Date().toISOString();
const env = {
  repoRoot,
  ledgerPath: `${repoRoot}/board/decisions.jsonl`,
  now,
  today: now.slice(0, 10),
  modelId: process.env.CSUITE_MODEL ?? "claude-opus-4-8",
  version: pkg.version,
};

const { code, out } = runCli(process.argv.slice(2), env);
console.log(out);
process.exit(code);
