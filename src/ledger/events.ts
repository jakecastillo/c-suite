export type DecisionType = "demand" | "pricing" | "feasibility" | "pace" | "scope";

export interface ForecastEvent {
  kind: "forecast";
  id: string;
  claim_text: string;
  p: number;
  source: string;          // "single" | "board" | persona id (no LLM in v0a; supplied by caller)
  model_id: string;
  decision_type: DecisionType;
  created_at: string;      // ISO datetime, supplied by caller
  resolve_by: string;      // ISO date
  predicate: string;       // predicate id, must exist in the verifier registry (Task 4)
  predicate_args: Record<string, unknown>;
}

export interface ResolutionEvent {
  kind: "resolution";
  id: string;              // references a ForecastEvent.id
  resolved_at: string;
  outcome: boolean;
  brier: number;
}

export type LedgerEvent = ForecastEvent | ResolutionEvent;
