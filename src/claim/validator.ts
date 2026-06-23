import { existsSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import type { Claim } from "./schema.js";

export interface ValidationIssue { code: string; message: string }
export interface ValidateOptions { repoRoot: string; isHeadline?: boolean; isForecast?: boolean }

export function validateClaim(claim: Claim, opts: ValidateOptions): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const root = resolve(opts.repoRoot);

  if (claim.provenance === "grounded") {
    if (claim.citations.length === 0) {
      issues.push({ code: "grounded_needs_citation", message: "grounded claim must cite at least one file" });
    }
    for (const c of claim.citations) {
      const abs = isAbsolute(c.file) ? c.file : resolve(root, c.file);
      if (!abs.startsWith(root)) {
        issues.push({ code: "citation_escapes_repo", message: `citation escapes repo root: ${c.file}` });
      } else if (!existsSync(abs)) {
        issues.push({ code: "citation_not_found", message: `cited file not found: ${c.file}` });
      }
    }
  }

  if (opts.isHeadline && claim.provenance === "speculation") {
    issues.push({ code: "speculation_headline", message: "speculation cannot headline a recommendation" });
  }

  if (opts.isForecast && !claim.falsification) {
    issues.push({ code: "forecast_needs_falsification", message: "a forecast must carry a falsification tuple" });
  }

  return issues;
}
