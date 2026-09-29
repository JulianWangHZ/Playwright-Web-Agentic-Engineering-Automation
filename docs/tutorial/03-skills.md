# Skill System

| [← Environment Setup](02-setup.md) | [Workflow →](04-workflow.md) |
|:---|---:|
| Step 2: Installation and setup | Step 4: Run your first ticket |

**Step 3 / 6**

---

## What is a skill?

Type `/skill-name argument` in Claude Code and Claude follows the steps in `.claude/skills/{name}/SKILL.md`.

```
/qa-ticket TICKET-1            ← test TICKET-1 from reading the ticket to close
/qa-cases TICKET-1             ← rerun only the case-design stage
/tool-qa-release-gate v1.5     ← pre-release sign-off for v1.5
```

There are only two kinds of arguments: a **ticket** (`TICKET-xxx`) or a **version** (`vX.X`).

---

## Main flow: `/qa-ticket` and its 8 stages

Day to day you only type `/qa-ticket TICKET-xxx`; it calls these skills in order:

| # | Stage | Skill | What it does |
|---|---|---|---|
| 1 | context | `/qa-context` | Read the ticket, walk the target site live, map to the main library |
| 2 | risk | `/qa-risk` | Break the ticket into risks with levels |
| 3 | cases | `/qa-cases` | Matrix → state machine → BDD → prototype → independent review → review page |
| 4 | ★sign-off | `/qa-merge` | After your sign-off, merge into `testcases/` |
| 5 | scripts | `/qa-scripts` | Planner probes the page for locators → generator writes automation |
| 6 | run | `/qa-run` | Run tests, catch fake greens, healer fixes failures |
| 7 | review | `/auto-code-review` | Code review of the new automation |
| 8 | close | `/qa-ticket` itself | Verdict + manual-check list |

To rerun one part (say the cases were sent back), call that stage's skill directly.

### Skill details

| Skill | Argument | Output |
|---|---|---|
| `/qa-ticket` | `TICKET-xxx` | `runs/{ticket}/progress.md` (stage, results, warnings, open questions, Close section) |
| `/qa-context` | `TICKET-xxx` | `context.md` |
| `/qa-risk` | `TICKET-xxx` → `risks.md`; `vX.X` / sprint / ticket list → per-ticket risk table in chat | |
| `/qa-cases` | `TICKET-xxx` | `test_matrix.md`, `state_machine.md`, `cases/*.feature`, `prototype.html`, `bdd_review.md`, `review.html` |
| `/qa-merge` | `TICKET-xxx` | merges into `testcases/` (the only skill that writes it), then `npx bddgen` |
| `/qa-scripts` | `TICKET-xxx` / feature path / `@tag` / scenario / empty | `youtube/evidence/*.md` + step / POM / fixture |
| `/qa-run` | `TICKET-xxx` / feature path / spec subset | test results, healed code |
| `/auto-code-review` | `[--base=<branch>]` | 100-point review, APPROVE / APPROVE_WITH_FIXES / BLOCK |

---

## Standing tools

| When | Skill |
|---|---|
| Pre-release sign-off, post-deploy sanity checklist | `/tool-qa-release-gate vX.X` → `releases/{version}.md` |
| Which ticket in this release is riskiest | `/qa-risk vX.X` |
| Found a bug, file it | `/tool-open-qa-bug TICKET-xxx` |
| Reproduce a reported issue | `/tool-root-cause-analysis <symptom or ticket>` |
| Hunt blind spots after scripted testing | `/tool-exploratory-testing TICKET-xxx` |
| Sync artifacts to Jira | `/tool-jira-sync TICKET-xxx` → one TEST sub-task: AC on the ticket, `review.html` attached |
| Open a PR | `/auto-create-pull-request` |

Index: [docs/qa-workflow-map.md](../qa-workflow-map.md). Visual overview: [pipeline.html](../../pipeline.html).

---

## Key concept: Modified vs New

`qa-cases` checks the main library before writing each `.feature`:

| | Condition | How it's written |
|---|---|---|
| **New** | the file isn't in the main library | the whole file |
| **Modified** | the file already exists | diff only: `# [added]`, `# [changed]` (same Scenario title); removals get `# remove from main library on merge` |

After sign-off, `qa-merge` applies those markers scenario by scenario, so a Modified file in `runs/` looking "incomplete" is expected.

---

| [← Environment Setup](02-setup.md) | [Workflow →](04-workflow.md) |
|:---|---:|
| Step 2: Installation and setup | Step 4: Run your first ticket |
