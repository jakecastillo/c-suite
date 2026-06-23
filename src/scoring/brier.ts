/** Proper scoring rule (lower is better). p in [0,1], outcome boolean. */
export function brier(p: number, outcome: boolean): number {
  const y = outcome ? 1 : 0;
  return (p - y) ** 2;
}
