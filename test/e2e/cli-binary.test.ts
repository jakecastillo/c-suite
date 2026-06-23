import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { makeTmpGitRepo } from "../helpers/tmp-git.js";

// End-to-end test of the ACTUAL `bin/csuite.mjs` binary (not runCli directly).
// This is the test that would have caught the original broken tsx-loader shim:
// the unit tests call runCli() and never execute the bin.

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const bin = join(pkgRoot, "bin", "csuite.mjs");

function csuite(
  args: string[],
  repoRoot: string,
): { stdout: string; status: number } {
  try {
    const stdout = execFileSync("node", [bin, ...args], {
      env: {
        ...process.env,
        CSUITE_REPO: repoRoot,
        CSUITE_MODEL: "test-model",
      },
      encoding: "utf8",
    });
    return { stdout, status: 0 };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: (err.stdout ?? "") + (err.stderr ?? ""),
      status: err.status ?? 1,
    };
  }
}

describe("csuite binary (e2e)", () => {
  beforeAll(() => {
    // The bin imports dist/cli.js — build it once before exercising the binary.
    execFileSync("pnpm", ["build"], { cwd: pkgRoot, stdio: "pipe" });
    expect(existsSync(join(pkgRoot, "dist", "cli.js"))).toBe(true);
  }, 60_000);

  it("runs predict → resolve → track-record through the real binary", () => {
    const r = makeTmpGitRepo();
    r.writeFile("src/app.ts");
    r.commit("init");

    const predict = csuite(
      [
        "predict",
        "--text",
        "app exists",
        "--p",
        "0.8",
        "--type",
        "feasibility",
        "--by",
        "2026-01-01",
        "--predicate",
        "path_exists",
        "--arg",
        "path=src/app.ts",
      ],
      r.root,
    );
    expect(predict.status).toBe(0);
    expect(predict.stdout).toMatch(/recorded forecast/);

    // resolve uses the real clock as `today`; a 2026-01-01 resolve_by is safely in the past.
    const resolved = csuite(["resolve"], r.root);
    expect(resolved.status).toBe(0);
    expect(resolved.stdout).toMatch(/resolved 1/);

    const track = csuite(["track-record"], r.root);
    expect(track.stdout).toMatch(/1 resolved/);

    // the ledger landed under <repo>/board and is hash-chained
    const ledger = readFileSync(
      join(r.root, "board", "decisions.jsonl"),
      "utf8",
    )
      .trim()
      .split("\n");
    expect(ledger.length).toBe(2); // forecast + resolution
    expect(JSON.parse(ledger[0] ?? "{}").hash).toMatch(/^[0-9a-f]{64}$/);
  }, 30_000);

  it("prints help and version through the real binary", () => {
    const r = makeTmpGitRepo();
    const help = csuite(["help"], r.root);
    expect(help.status).toBe(0);
    expect(help.stdout).toMatch(/Usage:/);

    const version = csuite(["--version"], r.root);
    expect(version.status).toBe(0);
    expect(version.stdout).toMatch(/csuite \d+\.\d+\.\d+/);
  }, 30_000);
});
