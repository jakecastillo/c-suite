import { describe, expect, it } from "vitest";
import { runPredicate } from "../../src/verifier/predicates.js";
import { makeTmpGitRepo } from "../helpers/tmp-git.js";

describe("deterministic predicates", () => {
  it("path_exists is true for a committed path, false otherwise", () => {
    const r = makeTmpGitRepo();
    r.writeFile("billing/index.ts");
    r.commit("add billing");
    const ctx = { repoRoot: r.root, asOf: "2026-09-01" };
    expect(runPredicate("path_exists", { path: "billing" }, ctx)).toBe(true);
    expect(runPredicate("path_exists", { path: "marketing" }, ctx)).toBe(false);
  });
  it("commits_to_since counts commits touching a path after a date", () => {
    const r = makeTmpGitRepo();
    r.writeFile("app/api/pay.ts");
    r.commit("add pay");
    const ctx = { repoRoot: r.root, asOf: "2026-09-01" };
    expect(
      runPredicate(
        "commits_to_since",
        { path: "app/api", since: "2026-06-01" },
        ctx,
      ),
    ).toBe(true);
    expect(
      runPredicate(
        "commits_to_since",
        { path: "app/api", since: "2026-07-01" },
        ctx,
      ),
    ).toBe(false);
  });
  it("branch_abandoned is true when a branch has no commits in N days before asOf", () => {
    const r = makeTmpGitRepo();
    r.writeFile("a.ts");
    r.commit("base");
    r.branch("spike/dynamo");
    const ctx = { repoRoot: r.root, asOf: "2026-09-01" };
    expect(
      runPredicate(
        "branch_abandoned",
        { branch: "spike/dynamo", days: 30 },
        ctx,
      ),
    ).toBe(true);
  });
  it("throws on an unknown predicate id", () => {
    const r = makeTmpGitRepo();
    expect(() =>
      runPredicate(
        "ask_the_model",
        {},
        { repoRoot: r.root, asOf: "2026-09-01" },
      ),
    ).toThrow(/unknown predicate/);
  });
  it("commits_to_since rejects a path that escapes the repo", () => {
    const r = makeTmpGitRepo();
    r.writeFile("a.ts");
    r.commit("i");
    expect(() =>
      runPredicate(
        "commits_to_since",
        { path: "../../etc", since: "2026-01-01" },
        { repoRoot: r.root, asOf: "2026-09-01" },
      ),
    ).toThrow(/escapes repo/);
  });
  it("branch_abandoned returns false for a missing branch (no throw)", () => {
    const r = makeTmpGitRepo();
    r.writeFile("a.ts");
    r.commit("i");
    expect(
      runPredicate(
        "branch_abandoned",
        { branch: "does/not/exist", days: 30 },
        { repoRoot: r.root, asOf: "2026-09-01" },
      ),
    ).toBe(false);
  });
});
