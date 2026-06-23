import type { ForecastState } from "../ledger/project.js";

export interface CalibrationBucket { label: string; predicted: number; observed: number; n: number }
export interface CalibrationReport {
  resolved: number; open: number; meanBrier: number | null;
  reliability: "overconfident" | "underconfident" | "calibrated" | "insufficient";
  buckets: CalibrationBucket[];
}

const MIN_RESOLVED = 8; // shrinkage floor (spec §7: never a raw score at n<8)

export function calibrationReport(states: ForecastState[]): CalibrationReport {
  const resolved = states.filter((s) => s.status === "resolved" && s.outcome !== undefined);
  const open = states.length - resolved.length;
  if (resolved.length === 0) return { resolved: 0, open, meanBrier: null, reliability: "insufficient", buckets: [] };

  const meanBrier = resolved.reduce((a, s) => a + (s.brier ?? 0), 0) / resolved.length;

  // Bucket predictions into deciles; observed = hit rate; predicted = mean p.
  const edges = [0, 0.2, 0.4, 0.6, 0.8, 1.0001];
  const buckets: CalibrationBucket[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const inB = resolved.filter((s) => s.p >= edges[i]! && s.p < edges[i + 1]!);
    if (inB.length === 0) continue;
    buckets.push({
      label: `${edges[i]!.toFixed(1)}-${edges[i + 1]! > 1 ? "1.0" : edges[i + 1]!.toFixed(1)}`,
      predicted: inB.reduce((a, s) => a + s.p, 0) / inB.length,
      observed: inB.filter((s) => s.outcome).length / inB.length,
      n: inB.length,
    });
  }

  let reliability: CalibrationReport["reliability"] = "insufficient";
  if (resolved.length >= MIN_RESOLVED) {
    // mean(predicted) - mean(observed): positive => overconfident.
    const gap = resolved.reduce((a, s) => a + s.p, 0) / resolved.length
              - resolved.filter((s) => s.outcome).length / resolved.length;
    reliability = gap > 0.1 ? "overconfident" : gap < -0.1 ? "underconfident" : "calibrated";
  }

  return { resolved: resolved.length, open, meanBrier, reliability, buckets };
}

export function renderReport(r: CalibrationReport): string {
  const lines = [
    `c-suite track record — ${r.resolved} resolved, ${r.open} open`,
    r.meanBrier === null ? "no resolved predictions yet" : `mean Brier: ${r.meanBrier.toFixed(3)} (0=perfect, 0.25=coin-flip)`,
    `calibration: ${r.reliability}`,
    ...r.buckets.map((b) => `  p≈${b.predicted.toFixed(2)} → happened ${(b.observed * 100).toFixed(0)}% (n=${b.n})`),
  ];
  if (r.reliability === "insufficient") lines.push(`(need ${MIN_RESOLVED}+ resolved predictions before calibration is trustworthy)`);
  return lines.join("\n");
}
