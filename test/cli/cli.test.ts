import { readFileSync, writeFileSync } from "node:fs";
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

  it("help / --help / -h print usage with exit 0", () => {
    const r = makeTmpGitRepo();
    for (const argv of [["help"], ["--help"], ["-h"]]) {
      const out = runCli(argv, env(r.root));
      expect(out.code).toBe(0);
      expect(out.out).toMatch(/Usage:/);
      expect(out.out).toMatch(/predict/);
    }
  });

  it("--version prints the supplied version", () => {
    const r = makeTmpGitRepo();
    const out = runCli(["--version"], { ...env(r.root), version: "1.2.3" });
    expect(out.code).toBe(0);
    expect(out.out).toBe("csuite 1.2.3");
  });

  it("an unknown command prints full usage with exit 1", () => {
    const r = makeTmpGitRepo();
    const out = runCli(["wat"], env(r.root));
    expect(out.code).toBe(1);
    expect(out.out).toMatch(/Usage:/);
  });

  it("--arg values may contain '=' (split on the first only)", () => {
    const r = makeTmpGitRepo();
    r.writeFile("a", "x");
    r.commit("i");
    const e = env(r.root);
    runCli(
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
        "path_exists",
        "--arg",
        "path=a=b=c",
      ],
      e,
    );
    const line = JSON.parse(readFileSync(e.ledgerPath, "utf8").trim());
    expect(line.event.predicate_args.path).toBe("a=b=c");
  });

  it("resolves branch_abandoned through the CLI (numeric --arg coercion)", () => {
    const r = makeTmpGitRepo();
    r.writeFile("a.ts");
    r.commit("base");
    r.branch("spike/dynamo");
    const e = env(r.root); // today=2026-09-01; helper pins commit dates to 2026-06-20
    const p = runCli(
      [
        "predict",
        "--text",
        "spike is dead",
        "--p",
        "0.8",
        "--type",
        "scope",
        "--by",
        "2026-09-01",
        "--predicate",
        "branch_abandoned",
        "--arg",
        "branch=spike/dynamo",
        "--arg",
        "days=30",
      ],
      e,
    );
    expect(p.code).toBe(0);
    const res = runCli(["resolve"], e);
    expect(res.out).toMatch(/resolved 1/);
    expect(res.out).not.toMatch(/skipped/);
  });

  it("verify (and track-record) detect a tampered ledger", () => {
    const r = makeTmpGitRepo();
    r.writeFile("a");
    r.commit("i");
    const e = env(r.root);
    runCli(
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
        "path_exists",
        "--arg",
        "path=a",
      ],
      e,
    );
    expect(runCli(["verify"], e).code).toBe(0);

    const line = JSON.parse(readFileSync(e.ledgerPath, "utf8").trim());
    line.event.p = 0.99; // tamper
    writeFileSync(e.ledgerPath, `${JSON.stringify(line)}\n`);

    const v = runCli(["verify"], e);
    expect(v.code).toBe(1);
    expect(v.out).toMatch(/TAMPERED/);

    const tr = runCli(["track-record"], e);
    expect(tr.code).toBe(1);
    expect(tr.out).toMatch(/INTEGRITY BROKEN/);
  });
});
