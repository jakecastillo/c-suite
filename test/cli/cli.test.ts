import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runCli } from "../../src/cli.js";
import { makeTmpGitRepo } from "../helpers/tmp-git.js";

function env(root: string) {
  return {
    repoRoot: root,
    ledgerPath: join(root, "board", "decisions.jsonl"),
    now: "2026-06-22T10:00:00Z",
    today: "2026-09-01",
    modelId: "claude-opus-4-8",
  };
}

describe("csuite CLI", () => {
  it("predict → resolve → track-record produces a calibration line", () => {
    const r = makeTmpGitRepo();
    r.writeFile("readme.md");
    r.commit("init");
    const e = env(r.root);

    const predict = runCli(
      [
        "predict",
        "--text",
        "billing will exist",
        "--p",
        "0.3",
        "--type",
        "feasibility",
        "--by",
        "2026-09-01",
        "--predicate",
        "path_exists",
        "--arg",
        "path=billing",
      ],
      e,
    );
    expect(predict.code).toBe(0);
    expect(predict.out).toMatch(/recorded forecast/);

    const resolve = runCli(["resolve"], e); // billing was never created → outcome false, p=0.3 → brier 0.09
    expect(resolve.code).toBe(0);
    expect(resolve.out).toMatch(/resolved 1/);

    const track = runCli(["track-record"], e);
    expect(track.out).toMatch(/1 resolved/);
  });

  it("rejects a forecast with no falsification predicate", () => {
    const r = makeTmpGitRepo();
    r.writeFile("a", "x");
    r.commit("i");
    const out = runCli(
      [
        "predict",
        "--text",
        "vibes",
        "--p",
        "0.5",
        "--type",
        "demand",
        "--by",
        "2026-09-01",
      ],
      env(r.root),
    );
    expect(out.code).toBe(1);
    expect(out.out).toMatch(/forecast_needs_falsification|predicate/);
  });
});
