import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { parseClaim } from "./claim/schema.js";
import { validateClaim } from "./claim/validator.js";
import type { DecisionType, ForecastEvent } from "./ledger/events.js";
import { dueForecasts, projectState } from "./ledger/project.js";
import { appendEvent } from "./ledger/store.js";
import { calibrationReport, renderReport } from "./report/track-record.js";
import { PREDICATES } from "./verifier/predicates.js";
import { resolveForecast } from "./verifier/resolve.js";

export interface CliEnv {
  repoRoot: string;
  ledgerPath: string;
  now: string;
  today: string;
  modelId: string;
  version?: string;
}

export const USAGE = `csuite — a repo-grounded calibration ledger

Record decisions as falsifiable forecasts, resolve them against your git/filesystem
reality with a deterministic verifier (never a model), and track your calibration.

Usage:
  csuite predict --text <claim> --p <0..1> --type <type> --by <yyyy-mm-dd> \\
                 --predicate <name> --arg key=value [--arg key=value ...]
  csuite resolve                 resolve every forecast whose date has passed
  csuite track-record            show your calibration over the hash-chained ledger
  csuite help | --version

Types:      demand | pricing | feasibility | pace | scope
Predicates: path_exists        --arg path=<p>
            commits_to_since    --arg path=<p> --arg since=<yyyy-mm-dd>
            branch_abandoned    --arg branch=<b> --arg days=<n>

Env:  CSUITE_REPO   repo root to ground against (default: git toplevel)
      CSUITE_MODEL  model id stamped on forecasts (default: claude-opus-4-8)

The ledger lives at <repo>/board/decisions.jsonl (git-ignored, append-only, hash-chained).

Example:
  csuite predict --text "users reach the pricing page" --p 0.6 --type demand \\
    --by 2026-09-01 --predicate path_exists --arg path=src/app/pricing.tsx
  csuite resolve
  csuite track-record`;

function flags(argv: string[]): {
  _: string[];
  opts: Record<string, string>;
  args: Record<string, unknown>;
} {
  const _: string[] = [];
  const opts: Record<string, string> = {};
  const args: Record<string, unknown> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] as string;
    if (a === "--arg") {
      const kv = argv[++i] ?? "";
      const eq = kv.indexOf("="); // split on the FIRST '=' so values may contain '='
      if (eq > 0) args[kv.slice(0, eq)] = kv.slice(eq + 1);
    } else if (a.startsWith("--")) opts[a.slice(2)] = argv[++i] ?? "";
    else _.push(a);
  }
  return { _, opts, args };
}
const DECISION_TYPES = new Set<DecisionType>([
  "demand",
  "pricing",
  "feasibility",
  "pace",
  "scope",
]);
function id(seed: string): string {
  return `f_${Buffer.from(seed).toString("hex").slice(0, 12)}`;
}

export function runCli(
  argv: string[],
  env: CliEnv,
): { code: number; out: string } {
  const { _, opts, args } = flags(argv);
  const cmd = _[0];

  // Help / version are handled before touching the filesystem.
  if (cmd === "help" || "help" in opts || argv.includes("-h"))
    return { code: 0, out: USAGE };
  if ("version" in opts)
    return { code: 0, out: `csuite ${env.version ?? "unknown"}` };

  mkdirSync(dirname(env.ledgerPath), { recursive: true });

  if (cmd === "predict") {
    const dtype = opts.type as DecisionType;
    if (!DECISION_TYPES.has(dtype))
      return {
        code: 1,
        out: `error: --type must be one of ${[...DECISION_TYPES].join("|")}`,
      };
    if (!opts.predicate)
      return {
        code: 1,
        out: "error: forecast_needs_falsification (pass --predicate and --arg)",
      };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(opts.by ?? ""))
      return { code: 1, out: "error: --by must be an ISO date (yyyy-mm-dd)" };
    if (!(opts.predicate in PREDICATES))
      return {
        code: 1,
        out: `error: unknown predicate '${opts.predicate}' (known: ${Object.keys(PREDICATES).join(", ")})`,
      };
    const claim = parseClaim({
      text: opts.text,
      provenance: "inference",
      confidence: Number(opts.p),
      falsification: {
        observable: opts.text ?? "",
        predicate: opts.predicate,
        args,
        date: opts.by ?? "",
      },
    });
    const issues = validateClaim(claim, {
      repoRoot: env.repoRoot,
      isForecast: true,
    });
    if (issues.length)
      return {
        code: 1,
        out: `rejected: ${issues.map((i) => i.code).join(", ")}`,
      };
    const ev: ForecastEvent = {
      kind: "forecast",
      id: id(`${opts.text}${env.now}`),
      claim_text: opts.text ?? "",
      p: Number(opts.p),
      source: "single",
      model_id: env.modelId,
      decision_type: dtype,
      created_at: env.now,
      resolve_by: opts.by ?? "",
      predicate: opts.predicate,
      predicate_args: args,
    };
    appendEvent(env.ledgerPath, ev);
    return {
      code: 0,
      out: `recorded forecast ${ev.id} (p=${ev.p}, resolve_by=${ev.resolve_by})`,
    };
  }

  if (cmd === "resolve") {
    const due = dueForecasts(env.ledgerPath, env.today);
    let resolved = 0;
    let skipped = 0;
    for (const f of due) {
      try {
        appendEvent(
          env.ledgerPath,
          resolveForecast(
            f,
            { repoRoot: env.repoRoot, asOf: env.today },
            env.now,
          ),
        );
        resolved++;
      } catch {
        skipped++;
      }
    }
    return {
      code: 0,
      out: `resolved ${resolved} forecast(s) as of ${env.today}${skipped ? `; skipped ${skipped} (error)` : ""}`,
    };
  }

  if (cmd === "track-record") {
    return {
      code: 0,
      out: renderReport(calibrationReport(projectState(env.ledgerPath))),
    };
  }

  return { code: 1, out: USAGE };
}
