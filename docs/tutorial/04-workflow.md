# Workflow: Run Your First Ticket

| [← Skill System](03-skills.md) | [Newcomer Checklist →](05-checklist.md) |
|:---|---:|
| Step 3: Which skills exist | Step 5: Checklist |

**Step 4 / 6**

Visual overview: [pipeline.html](../../pipeline.html)

---

## One ticket, one line

```
/qa-ticket TICKET-xxx
context → risk → cases → ★sign-off → scripts → run → review → close
```

Environment (dev / staging / prod) is an annotation in `progress.md`, not a stage.

| Path | Contents | In git |
|---|---|---|
| `runs/{ticket}/` | every artifact for the ticket + `progress.md` | no |
| `testcases/` | BDD main library, written only by `qa-merge` | yes |
| `youtube/evidence/` | planner evidence maps | yes |
| `releases/{version}.md` | release sign-offs | no |

---

## What you'll see

One progress line at the start and end of each stage:

```
▶ [3/8 Case design] starting design (2 features), ~3–5 min
✓ [3/8 Case design] 14 scenarios. Next: review
```

The first three stages run on their own, then it **waits for you**:

```
⏸ Waiting for you: case sign-off
- 14 scenarios (@smoke 2 | @auto 10 | manual 4)
- HIGH risks R1, R2 covered
- 1 open question: …
- Review 91/100
- Review page: /…/runs/TICKET-xxx/review.html
```

### What you do

1. Open `review.html` in a browser: overview, test matrix, state machine, prototype, acceptance list and BDD are all there.
2. The "Acceptance list" tab can go straight to the PM.
3. Looks right → reply "approved". Needs changes → say what; it fixes, re-reviews, and asks again.

After sign-off the `.feature` files merge into `testcases/`, then automation, test runs, code review and close run without stopping.

It stops again only when truly stuck: Jira can't read the ticket, browser tooling is unavailable, the site is unreachable, or a suspected product bug (it asks before filing).

---

## Stage by stage

1. **context** (`qa-context`) — reads the ticket and sub-tasks, walks the target site live, reads the product repo when `.claude/CODEBASE.md` maps one, and marks each touched main-library file Modified or New. Facts only.
2. **risk** (`qa-risk`) — concrete risk items with HIGH / MED / LOW; every HIGH risk must get a matrix row.
3. **cases** (`qa-cases`) — test matrix with all ten techniques and a self-check, a state machine when there are state transitions, BDD per `.claude/rules/gherkin.md`, a prototype for new pages, an independent review (< 85 → fix and re-review, at most 4 rounds), then `review.html`.
4. **★sign-off** — the only stop; `qa-merge` then merges into `testcases/`:

   | Delta | Action |
   |---|---|
   | New file | copied to `testcases/{relative}` |
   | `# [added]` Scenario | inserted after the matching section |
   | `# [changed]` Scenario | same-name `Scenario:` replaced |
   | `# remove from main library on merge` | same-name Scenario deleted |

5. **scripts** (`qa-scripts`) — the planner walks each `@auto` scenario in a real browser and writes an evidence map with a feasibility verdict (`AUTOMATABLE` / `NEEDS_URL_SETUP` / `NOT_FEASIBLE` / `TC_STALE`); the generator writes code where every selector traces back to the evidence map.
6. **run** (`qa-run`) — runs the subset, audits assertions against the evidence map, breaks one key assertion per scenario to prove it turns red, and fixes remaining failures in the main session (at most 2 rounds per test).
7. **review** (`auto-code-review`) — only when stages 5–6 changed automation code.
8. **close** — the Close section of `progress.md`: verdict ✅ / ⚠️ / ❌, numbers, HIGH-risk coverage, **manual checks** (scenarios automation can't cover), candidate bugs.

After close it asks whether to run `/tool-jira-sync`, `/auto-create-pull-request`, or `/tool-open-qa-bug`.

---

## Interrupted?

Run `/qa-ticket TICKET-xxx` again; it resumes from the stage recorded in `progress.md`.

---

## Before a release

When a version's tickets are closed:

```
/tool-qa-release-gate v1.5
```

It pulls the version's tickets and open bugs by fixVersion, reads each ticket's Close section, and computes GO / CONDITIONAL-GO / NO-GO into `releases/v1.5.md` (with a post-deploy sanity checklist and a sign-off table). Any open P0 bug is a NO-GO; a human always signs.

---

## Rules

- `testcases/` is written only by `qa-merge`, after sign-off.
- No automation code before sign-off; automation never edits `.feature` files.
- No commit / push unless you ask.

---

| [← Skill System](03-skills.md) | [Newcomer Checklist →](05-checklist.md) |
|:---|---:|
| Step 3: Which skills exist | Step 5: Checklist |
