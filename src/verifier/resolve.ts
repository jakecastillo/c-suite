import type { ForecastEvent, ResolutionEvent } from "../ledger/events.js";
import { brier } from "../scoring/brier.js";
import { type PredicateContext, runPredicate } from "./predicates.js";

export function resolveForecast(
  forecast: ForecastEvent,
  ctx: PredicateContext,
  resolvedAt: string,
): ResolutionEvent {
  const outcome = runPredicate(
    forecast.predicate,
    forecast.predicate_args,
    ctx,
  );
  return {
    kind: "resolution",
    id: forecast.id,
    resolved_at: resolvedAt,
    outcome,
    // Round to 6 decimals so the ledger stores 0.49 rather than 0.48999999999999994.
    brier: Math.round(brier(forecast.p, outcome) * 1e6) / 1e6,
  };
}
