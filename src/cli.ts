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
}

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
      const [k, v] = (argv[++i] ?? "").split("=");
      if (k) args[k] = v;
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

  return {
    code: 1,
    out: "usage: csuite <predict|resolve|track-record> [...flags]",
  };
}
