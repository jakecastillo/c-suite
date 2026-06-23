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
