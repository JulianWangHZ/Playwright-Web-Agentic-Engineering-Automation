---
name: qa-ticket
description: Single entry point of the QA pipeline — runs one ticket end to end through context → risk → cases → ★sign-off → scripts → run → review → close, chaining stages automatically and stopping only once, at case sign-off. Triggers when the user says "test this ticket", "QA TICKET-xxx", "run from the start", "continue QA", "QA progress", "start testing". To run a single stage only, call the matching qa-* skill directly.
argument-hint: "<TICKET-xxx>"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent, Skill, mcp__atlassian__jira_get_issue
---

# qa-ticket — orchestrator

**The main session loads each stage's qa-* skill with Skill and runs it itself**, reporting progress at every step and reading/writing `progress.md`. No subagents by default: the user sees progress live, and nothing has to re-read the context from scratch. Subagents are used only where they add speed or independence (see §When to dispatch a subagent).

```
context → risk → cases → ★sign-off → scripts → run → review → close → done
   1        2       3         4          5        6       7        8
```

## Artifacts

`runs/{ticket}/`:

| File | Stage |
|---|---|
| `progress.md` | throughout (current stage, one result line per stage, warnings, open questions; close section added at stage 8) |
| `context.md` | 1 |
| `risks.md` | 2 |
| `test_matrix.md`, `state_machine.md` (optional), `cases/{relative}.feature`, `prototype.html` (optional), `bdd_review.md`, `review.html` | 3 |
| `youtube/evidence/…` | 5 (lives in the automation root, not in `runs/`) |

## Start

1. Read `runs/{ticket}/progress.md`.
2. Missing → create the directory and `progress.md` (format below), start at stage 1.
3. Present → report "currently at stage N: X" and resume from there; already `done` → ask which stage to rerun.

### progress.md format

```markdown
# {ticket} — {Jira title}
stage: context | risk | cases | signoff | scripts | run | review | close | done

| # | Stage | Status | Result |
|---|---|---|---|
| 1 | context | ✅ | 4 search behaviors confirmed live |

## Warnings
## Open questions
## Close
```

Update `stage:` and the stage row after each stage; resuming relies on this file.

## Main loop

| stage | Runs | Done when (checked by the main session) |
|---|---|---|
| 1 context | load `qa-context` | `context.md` exists with target behaviors and main-library mapping |
| 2 risk | load `qa-risk` | `risks.md` exists, every risk has a level |
| 3 cases | load `qa-cases`: design → independent review → fix | `test_matrix.md` self-check has all 10 techniques, `.feature` files exist, `bdd_review.md` ≥ 85 or 4 rounds reached |
| 4 sign-off | **you + user** | explicit user approval |
| 5 scripts | load `qa-scripts`: planner → generator, one feature at a time | every `@auto` scenario has an evidence map and feasibility |
| 6 run | load `qa-run`: verify → oracle audit → heal | feasible scenarios green or reason recorded |
| 7 review | `/auto-code-review` (only when stages 5–6 added or changed automation code; otherwise mark skipped) | a verdict exists |
| 8 close | you (see §Close) | `progress.md` has a Close section |

Each round:
1. At the start, print one line: `▶ [3/8 Case design] starting design (2 features), ~3–5 min`
2. Report one line per step inside a stage (design → review, planner → generator, verify → heal) and per finished feature: `✓ planner 2/4: search done`
3. At the end, print one line: `✓ [3/8 Case design] 14 scenarios. Next: sign-off`
4. Check the done condition → if met, update `progress.md` and move on without asking the user.
5. Not met → fill the gap, at most 2 times; still failing or blocked on something only the user knows → print `⏸ Waiting for you: <one specific question>`.

### Context control

All stages share one conversation, so save context on purpose:
- Stages hand off only through artifact files; a new stage reads the sections it needs from disk, not from earlier conversation.
- Large outputs (logs, diffs, bddgen output) → extract the needed part with `grep` / `sed -n` / `jq`; never read them whole.
- One feature at a time; write its result to disk before starting the next, so an interrupted run resumes from what's unfinished.

### When to dispatch a subagent

Only for work that runs in parallel or needs an independent view; each returns a summary only. Dispatch in one message and wait in the foreground — never fire-and-forget in the background.

| Stage | Dispatch | When |
|---|---|---|
| 3 cases | a brand-new independent reviewer per scoring round (`general-purpose`, model sonnet) | every round; avoids self-review bias |
| 5 scripts | one `playwright-test-generator` per feature | ≥ 2 feasible features, after you've written the shared base |
| 7 review | the reviewer inside `/auto-code-review` | per that skill |

Everything else (design, planner, healer) runs in the main session: the browser is a single session and can't run in parallel, and fixes need to be visible live. Subagents cannot dispatch subagents.

## ★ Case sign-off (the only mandatory stop)

Sign-off flow across files: this section (the stop) ← `qa-cases` §6–7 (review + review page) ← `qa-cases/references/review-rubric.md` (scoring and fix loop) → `qa-merge` (after sign-off).

After cases are done, stop and present concisely in chat:
1. Scenario count, `@smoke` / `@auto` / manual counts
2. Coverage of HIGH risks
3. Techniques marked N/A and why
4. Remaining `?` open questions, review score
5. Absolute path of the review page `runs/{ticket}/review.html` (open in a browser; the "Acceptance list" tab can go straight to the PM)

**What counts as sign-off**: only explicit approval ("approved", "OK, continue", "LGTM"); vague replies or replies that also request changes do not count.
- Changes requested → fix per the user's exact words → re-review → ask again.
- After sign-off:
  1. Run `qa-merge {ticket}` to merge back into the `testcases/` main library (it lists the merge plan first).
  2. Record who signed off and a summary of their words in `progress.md`, move to stage 5.

**Forbidden**: merging or generating automation code without sign-off.

## Close (stage 8)

Aggregate only; do not rerun any stage. Read the `progress.md` rows, `risks.md`, evidence-map feasibility, run results, and review verdict, then write the Close section of `progress.md`:

```markdown
## Close
Verdict: {✅ ready | ⚠️ conditional | ❌ not recommended} | Environment: {…} | Date: {date}
Cases: total X | @smoke a | @auto b | manual c | review X/100 | merged New n / Modified m
Automation: passed a | failed b (reason) | NOT_FEASIBLE c | TC_STALE d
HIGH risks: R1 ✅ / R3 ❌ (reason)
Manual checks:
- [ ] {scenario} ({reason})
Candidate bugs: {list or "none"}
```

Verdict rules: a HIGH risk uncovered, or a suspected product bug unresolved → ❌; only manual checks or Minor items left → ⚠️; otherwise ✅. `tool-qa-release-gate` reads this section.

Report the verdict in chat, then ask once each (never do it automatically): sync to Jira (`/tool-jira-sync`)? open a PR (`/auto-create-pull-request`, only when there is new automation code)? file candidate bugs (`/tool-open-qa-bug`)?

## Other reasons to stop

Stop only when you cannot proceed:
- Jira cannot read the ticket, or the ticket is too thin to build a matrix
- Live-probe tooling unavailable (Playwright MCP and its fallback both fail), or the target site is unreachable
- Suspected product bug (route to `/tool-open-qa-bug`, ask first)

`NOT_FEASIBLE` and `TC_STALE` do **not** stop the run; record them as warnings in `progress.md` and list them as manual checks at close.

## Rules

- Environment (dev/staging/prod) is an annotation, not a stage; retesting the same ticket in another environment adds a row to `progress.md`.
- No commit / push (only when the user explicitly asks); product repos are read-only.
- Release sign-off and cross-ticket aggregation are outside this flow; use `/tool-qa-release-gate`.
