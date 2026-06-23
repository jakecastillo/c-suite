import type { ForecastEvent, ResolutionEvent } from "../ledger/events.js";
import { brier } from "../scoring/brier.js";
import { type PredicateContext, runPredicate } from "./predicates.js";

export function resolveForecast(forecast: ForecastEvent, ctx: PredicateContext, resolvedAt: string): ResolutionEvent {
  const outcome = runPredicate(forecast.predicate, forecast.predicate_args, ctx);
  return { kind: "resolution", id: forecast.id, resolved_at: resolvedAt, outcome, brier: brier(forecast.p, outcome) };
}
