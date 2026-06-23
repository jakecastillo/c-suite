import type { DecisionType, ForecastEvent } from "./events.js";
import { readChain } from "./store.js";

export interface ForecastState {
  id: string;
  claim_text: string;
  p: number;
  decision_type: DecisionType;
  resolve_by: string;
  status: "open" | "resolved";
  outcome?: boolean;
  brier?: number;
}

export function projectState(path: string): ForecastState[] {
  const byId = new Map<string, ForecastState>();
  for (const { event } of readChain(path)) {
    if (event.kind === "forecast") {
      byId.set(event.id, {
        id: event.id,
        claim_text: event.claim_text,
        p: event.p,
        decision_type: event.decision_type,
        resolve_by: event.resolve_by,
        status: "open",
      });
    } else {
      const cur = byId.get(event.id);
      if (cur) {
        cur.status = "resolved";
        cur.outcome = event.outcome;
        cur.brier = event.brier;
      }
    }
  }
  return [...byId.values()];
}

export function dueForecasts(path: string, asOf: string): ForecastEvent[] {
  const resolved = new Set<string>();
  const forecasts: ForecastEvent[] = [];
  for (const { event } of readChain(path)) {
    if (event.kind === "resolution") resolved.add(event.id);
    else forecasts.push(event);
  }
  return forecasts.filter((f) => !resolved.has(f.id) && f.resolve_by <= asOf);
}
