# c-suite — Weekend Proof (zero product code)

This is the one experiment that decides whether c-suite is worth building. Before writing a
line of the product, find out: **does a multi-lens board actually beat one good prompt at
forcing you to validate — on your own real decisions?**

It's exactly what c-suite's own board would tell you to do: *you've designed it; the untested
assumption is that the board beats one prompt — go get that signal.*

## The premise being tested
Three ways to get advice on a real decision, graded blind:
- **Arm A** — one advisor + a disciplined output contract.
- **Arm B** — one advisor + *"now red-team your own answer."* **This is the baseline to beat** — it's the cheap product c-suite collapses to if the board adds nothing.
- **Arm C** — the full board: 4 management blind drafts (CEO / CMO / CFO / CPO) → an **Independent Director** challenge → a neutral **Board Chair** synthesis.

If C doesn't clearly beat B on *your* decisions, no orchestration or ledger saves it.

## Prerequisites
- `claude` CLI logged into your **Claude Max** plan (`claude` once, interactively, to confirm you're signed in — the runner scrubs `ANTHROPIC_API_KEY` so it never silently meters an API key).
- macOS/Linux `bash`. Cost ≈ 8 `claude` calls per decision × 3 ≈ ~24 calls — modest on Max.

## Run it (4 steps)

**1. Write 3 real decisions.** Copy the template per decision — ideally from the project you're
most motivated to keep using this on (your north-star repo), so a "pass" also means you'll
actually use the tool.
```
cp decisions/_TEMPLATE.md decisions/should-i-add-billing.md   # then edit it
```

**2. Run each decision** (point it at the repo the decision is about):
```
chmod +x run.sh
./run.sh /path/to/that/repo decisions/should-i-add-billing.md
```
This writes `results/should-i-add-billing/option-{1,2,3}.md` (the three arms, shuffled) plus a
sealed `.answer-key.txt`. Repeat for all 3 decisions.

**3. Grade blind — ideally the next day.** Open `grading-sheet.md` and score the options without
knowing which is which. The only thing that matters: *would this have changed my actual next move?*

**4. Reveal + decide.** Open each `.answer-key.txt`, tally, and apply the **pre-committed kill
line**: **board wins ≥ 2 of 3 → build v0; < 2 of 3 → stop and build just "advisor + red-team."**

## Manual mode (if the runner's flags don't match your CLI version)
Every prompt is a plain file. For any arm, paste into a `claude` session opened **inside the
target repo** (so it can read the code): `lib/arm-a.md` or `lib/arm-b.md` (+ `lib/contract.md`
+ your decision text); for the board, run `personas/{ceo,cmo,cfo,cpo}.md` separately, then paste
those four outputs into `personas/independent-director.md`, then all of it into
`personas/board-chair.md`. Save the three final answers, shuffle them yourself, grade blind.

## Honest framing
A PASS means *"the board beat one prompt, on my repos, by my blinded judgment"* — real and worth
proving, not "the product works for everyone." A FAIL is just as valuable: you spent a weekend,
not a month, and found the cheaper product hiding inside the idea.
