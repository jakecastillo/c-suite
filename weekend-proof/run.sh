#!/usr/bin/env bash
set -euo pipefail

# Weekend-proof runner — the zero-product test of c-suite's core premise.
# Runs three decision-advice "arms" via `claude -p` (your Claude Max plan), then
# shuffles their final outputs into option-1/2/3 so you can grade them BLIND.
#
#   Arm A = one advisor + the output contract
#   Arm B = one advisor + "now red-team your own answer" (THE baseline to beat)
#   Arm C = the full board: 4 management blind drafts (CEO/CMO/CFO/CPO)
#           -> Independent Director challenge -> Board Chair synthesis
#
# Usage:  ./run.sh /path/to/target/repo decisions/my-decision.md
# Output: results/<decision-name>/option-{1,2,3}.md  (+ a sealed .answer-key.txt)

if [ "$#" -ne 2 ]; then
  echo "usage: $0 <target-repo-path> <decision-file>" >&2; exit 1
fi
REPO="$1"; DECISION_FILE="$2"
KIT="$(cd "$(dirname "$0")" && pwd)"

command -v claude >/dev/null 2>&1 || { echo "error: 'claude' CLI not on PATH." >&2; exit 1; }
[ -d "$REPO" ]          || { echo "error: repo '$REPO' not found." >&2; exit 1; }
[ -f "$DECISION_FILE" ] || { echo "error: decision file '$DECISION_FILE' not found." >&2; exit 1; }

DEC="$(cat "$DECISION_FILE")"
CONTRACT="$(cat "$KIT/lib/contract.md")"
NAME="$(basename "${DECISION_FILE%.*}")"
OUT="$KIT/results/$NAME"
mkdir -p "$OUT"

# Read-only grounding tools. Same for every arm, so the test is fair.
TOOLS="Read,Grep,Glob,Bash(git log:*),Bash(git diff:*),Bash(git status:*)"

# Always spend the Claude Max subscription, never a stray API key (mirrors the spec's auth discipline).
run() { # run <out-name> <prompt>
  echo "  - $1 ..." >&2
  ( cd "$REPO" && env -u ANTHROPIC_API_KEY -u ANTHROPIC_AUTH_TOKEN \
      claude -p "$2" --allowedTools "$TOOLS" ) >"$OUT/$1.md" 2>"$OUT/$1.err" \
    || echo "    ! claude failed for $1 (see $OUT/$1.err)" >&2
}

echo "== Weekend proof: $NAME ==" >&2
echo "[arm A] single advisor + contract" >&2
run arm-a "$(cat "$KIT/lib/arm-a.md")

OUTPUT FORMAT:
$CONTRACT

DECISION:
$DEC"

echo "[arm B] single advisor + self-red-team  (the baseline to beat)" >&2
run arm-b "$(cat "$KIT/lib/arm-b.md")

OUTPUT FORMAT:
$CONTRACT

DECISION:
$DEC"

echo "[arm C] the board" >&2
for p in ceo cmo cfo cpo; do
  run "draft-$p" "$(cat "$KIT/personas/$p.md")

OUTPUT FORMAT:
$CONTRACT

DECISION:
$DEC"
done

DRAFTS=""
for p in ceo cmo cfo cpo; do
  UP="$(printf '%s' "$p" | tr '[:lower:]' '[:upper:]')"
  DRAFTS="$DRAFTS

### $UP draft
$(cat "$OUT/draft-$p.md")"
done

run challenge "$(cat "$KIT/personas/independent-director.md")

DECISION:
$DEC

MANAGEMENT DRAFTS:
$DRAFTS"

run arm-c "$(cat "$KIT/personas/board-chair.md")

DECISION:
$DEC

MANAGEMENT DRAFTS:
$DRAFTS

INDEPENDENT DIRECTOR CHALLENGE:
$(cat "$OUT/challenge.md")"

# Shuffle the three FINAL arms into option-1/2/3 (portable: awk+sort, no `shuf`). Seal the key.
echo "Shuffling for blind grading ..." >&2
: > "$OUT/.answer-key.txt"
i=1
for arm in $(printf '%s\n' arm-a arm-b arm-c | awk 'BEGIN{srand()}{print rand()"\t"$0}' | sort | cut -f2-); do
  cp "$OUT/$arm.md" "$OUT/option-$i.md"
  echo "option-$i = $arm" >> "$OUT/.answer-key.txt"
  i=$((i+1))
done

echo "" >&2
echo "Done -> $OUT" >&2
echo "  Grade option-1.md / option-2.md / option-3.md BLIND (ideally tomorrow) with grading-sheet.md." >&2
echo "  Do NOT open .answer-key.txt until after grading." >&2
