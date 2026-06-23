import { z } from "zod";

export const Provenance = z.enum(["grounded", "inference", "speculation"]);
export type Provenance = z.infer<typeof Provenance>;

/** Epistemic lattice: grounded ⊑ inference ⊑ speculation (lower rank = more grounded). */
export const PROVENANCE_RANK: Record<Provenance, number> = { grounded: 0, inference: 1, speculation: 2 };

export const Citation = z.object({ file: z.string().min(1), line: z.number().int().positive().optional() });
export type Citation = z.infer<typeof Citation>;

export const Falsification = z.object({
  observable: z.string().min(1),
  predicate: z.string().min(1),
  args: z.record(z.string(), z.unknown()).default({}),
  threshold: z.number().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be ISO yyyy-mm-dd"),
});
export type Falsification = z.infer<typeof Falsification>;

export const Claim = z.object({
  text: z.string().min(1),
  provenance: Provenance,
  confidence: z.number().min(0).max(1),
  citations: z.array(Citation).default([]),
  falsification: Falsification.optional(),
  rebuttal: z.string().optional(),
});
export type Claim = z.infer<typeof Claim>;

export function parseClaim(input: unknown): Claim {
  return Claim.parse(input);
}
