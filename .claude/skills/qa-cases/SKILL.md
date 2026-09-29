---
name: qa-cases
description: Stage 3 of the qa-ticket pipeline — case design. From context.md + risks.md, build the test matrix → state machine (optional) → BDD .feature → HTML prototype (optional), then dispatch an independent reviewer (<85 fix and re-review, at most 4 rounds) and assemble review.html. Artifacts in runs/{ticket}/. Triggers on "test matrix", "state machine", "write BDD", "write scenarios", "prototype", "review BDD", "BDD score".
argument-hint: "<TICKET-xxx>"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent, mcp__atlassian__jira_get_issue, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot
---

# qa-cases — case design

Prerequisites: `runs/{ticket}/context.md`, `risks.md` (missing → return `blocked`, run qa-context / qa-risk first).
Forbidden: writing the `testcases/` main library (qa-merge does that after sign-off) / Scenario Outline / invented scenarios / commit / push.
Never stop mid-way to ask; conflicts or unknowns go into the matrix "Open questions" and are presented once at the /qa-ticket sign-off stop.

## 1. Read the basis

`context.md` (requirement, observed site behavior, business rules, main-library mapping) + `risks.md`. Behavior still `?` → confirm it live on the target site; still unconfirmed → keep `?`.

## 2. Test matrix `test_matrix.md`

```markdown
# {ticket} — {full Jira title}
> Status: {status}

## Feature file mapping
| Main-library file | Modified/New | What changes |
|---|---|---|

## Matrix
| # | Dimension / technique | Condition | Expected behavior | Source (ticket / observed / file:line / R#) |
|---|---|---|---|---|

## Technique self-check
## Cross-cutting pointers (non-BDD)
## Open questions
```

- Apply **all ten techniques** in `references/coverage-techniques.md` item by item, not from memory.
- Self-check lists all ten: applicable ✅ pointing to matrix rows; not applicable N/A with a one-line reason, never blank.
- Every HIGH risk in `risks.md` maps to a matrix row (source column `R#`).
- Non-functional aspects (performance, security, a11y, responsive, concurrency, console) get one line in "Cross-cutting pointers" as `{dimension}: {where and why it matters}`, never a matrix row.

## 3. State machine `state_machine.md` (only with clear state transitions)

1. Table of new/changed UI elements (element / page / cooldown / A-B)
2. mermaid `stateDiagram-v2`
3. **Transition coverage table**: every legal edge (0-switch) has a scenario; illegal / unreachable transitions are listed as negatives (must be blocked)

```markdown
| Transition (from→to : condition) | Type | Scenario |
|---|---|---|
| Home→Results : submit keyword | legal | ✅ |
| Home→Results : empty keyword | illegal (blocked) | ✅ |
```

## 4. BDD `cases/{relative}.feature`

`{relative}` is the path under the main `testcases/` library (e.g. `search.feature`), so merging maps straight back.

Follow `.claude/rules/gherkin.md` exactly (format, three tag axes, declarative style, prohibitions).

**Modified (already in the main library) — write the diff only**:
1. Read the main-library file for existing Scenarios and the Feature header.
2. Write only two kinds: `# [added]` (not in the main library) and `# [changed]` (behavior changed; Scenario title identical to the main library).
3. Keep the Feature header intact; do not copy unrelated existing Scenarios.
4. A main-library Scenario that no longer holds → write a same-name Scenario with the comment `# remove from main library on merge`.

**New (not in the main library)**: write the whole file; `Background:` only for truly shared preconditions; cover happy path + main errors + boundaries.

Afterwards, check every matrix row has scenario coverage; anything uncovered goes into "Open questions" with a reason.

## 5. Prototype `prototype.html` (optional)

Only for new pages / complex UI flows; spec and template in `references/prototype.md`.

## 6. Review

Per `references/review-rubric.md`: design and fixes stay in the main session; **scoring goes to an independent subagent** (`general-purpose`, model sonnet, wait in the foreground). Print `▶ [3/8 Review] dispatching independent reviewer, ~2 min` first. <85 → verify → fix → brand-new reviewer, at most 4 rounds. Write `bdd_review.md` once at the end.

## 7. Review page `review.html`

After the review, assemble the artifacts into a single HTML file per `references/review-page.md`. Shown to the user at sign-off, attached to Jira on sync.

## Report

```
runs/{ticket}/: test_matrix.md (N rows) | state_machine.md (yes/no) | .feature M files (Modified a / New b) | prototype (yes/no) | review.html
Scenarios: total X | @smoke a | @auto b | manual c
Review: X/100 (verdict) | open questions N | remaining ? M
```
