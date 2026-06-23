import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

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
function inRepo(ctx: PredicateContext, p: string): string {
  const root = resolve(ctx.repoRoot);
  const abs = isAbsolute(p) ? p : resolve(root, p);
  const rel = relative(root, abs);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error(`path escapes repo: ${p}`);
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
