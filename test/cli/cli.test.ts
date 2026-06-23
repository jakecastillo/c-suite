import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runCli } from "../../src/cli.js";
import type { ForecastEvent } from "../../src/ledger/events.js";
import { appendEvent } from "../../src/ledger/store.js";
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

  it("predict rejects an unknown predicate id", () => {
    const r = makeTmpGitRepo();
    r.writeFile("a", "x");
    r.commit("i");
    const out = runCli(
      [
        "predict",
        "--text",
        "x",
        "--p",
        "0.5",
        "--type",
        "demand",
        "--by",
        "2026-09-01",
        "--predicate",
        "ask_the_model",
        "--arg",
        "path=x",
      ],
      env(r.root),
    );
    expect(out.code).toBe(1);
    expect(out.out).toMatch(/unknown predicate/);
  });

  it("one bad forecast does not halt resolution of valid siblings", () => {
    const r = makeTmpGitRepo();
    r.writeFile("readme.md");
    r.commit("init");
    const e = env(r.root);
    // a valid, resolvable forecast (path_exists billing -> false)
    runCli(
      [
        "predict",
        "--text",
        "billing",
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
    // a poisoned forecast with an unknown predicate, written straight to the ledger (bypassing predict validation)
    const bad: ForecastEvent = {
      kind: "forecast",
      id: "poison",
      claim_text: "bad",
      p: 0.5,
      source: "single",
      model_id: e.modelId,
      decision_type: "demand",
      created_at: e.now,
      resolve_by: "2026-09-01",
      predicate: "does_not_exist",
      predicate_args: {},
    };
    appendEvent(e.ledgerPath, bad);
    const out = runCli(["resolve"], e);
    expect(out.code).toBe(0);
    expect(out.out).toMatch(/resolved 1/);
    expect(out.out).toMatch(/skipped 1/);
  });
});
