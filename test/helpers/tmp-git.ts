import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export function makeTmpGitRepo() {
  const root = mkdtempSync(join(tmpdir(), "csuite-git-"));
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: root, stdio: "pipe" }).toString();
  git("init", "-q");
  git("config", "user.email", "t@t.dev");
  git("config", "user.name", "t");
  return {
    root,
    writeFile(rel: string, content = "x") {
      mkdirSync(join(root, dirname(rel)), { recursive: true });
      writeFileSync(join(root, rel), content);
    },
    commit(msg: string) {
      git("add", "-A");
      // Pin BOTH author and committer dates so `git log --since` and `%cI` are deterministic
      // (branch_abandoned/commits_to_since read committer date, which --date alone does NOT set).
      execFileSync("git", ["commit", "-q", "-m", msg], {
        cwd: root,
        stdio: "pipe",
        env: {
          ...process.env,
          GIT_AUTHOR_DATE: "2026-06-20T10:00:00",
          GIT_COMMITTER_DATE: "2026-06-20T10:00:00",
        },
      });
    },
    branch(name: string) {
      git("branch", name);
    },
    git,
  };
}
