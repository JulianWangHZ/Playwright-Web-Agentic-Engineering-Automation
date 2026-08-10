---
name: stage-test-matrix
description: Two-stage test matrix for Feature / Version. argument：TICKET-xxx → Feature (build matrix from the ticket); vX.X TICKET-xxx → Version (move + enhance); vX.X → Version wrap-up (integrate each Feature's matrix + regression). Triggers when the user mentions "test matrix, matrix, build matrix". ⛔ Use this skill only when you want the "test matrix" artifact by itself; to run the full workflow from scratch (matrix→state machine→BDD→prototype→review) use the corresponding flow-feature/version-testing-workflow.
argument-hint: "<TICKET-xxx | vX.X TICKET-xxx | vX.X>"
allowed-tools: Read, Write, Bash, mcp__atlassian__jira_get_issue, mcp__atlassian__jira_search
---

Test Matrix assistant. Automatically determines the **Feature / Version** stage from the argument. Forbidden: writing state_machine/stage-ui-prototype/feature / modifying repo code / commit / push.

---

## Phase 0: Determine stage + path

| argument | Stage | Prerequisite | Output path |
|---|---|---|---|
| `TICKET-xxx` | Feature | — | `features/{ticket}/test_matrix.md` |
| `vX.X TICKET-xxx` | Version (a ticket merged in) | `versions/{version}/plan.md` (missing → run `/stage-version-test-plan` first) | `versions/{version}/testcases/{ticket}/test_matrix.md` |
| `vX.X` | Version wrap-up (integration + regression) | `versions/{version}/plan.md` (missing → run `/stage-version-test-plan` first) | `versions/{version}/testcases/regression/test_matrix.md` |

If the argument is incomplete, ask.

---

# Feature mode (TICKET-xxx)

## Feature Step 1: Branch strategy (highest priority)

```bash
git status; git branch --show-current; git branch --list 'feature/v*' | head
```

| Situation | Action |
|---|---|
| Currently on `feature/vX.X` | Ask piggyback or open a separate `feature/{ticket}`? Default **piggyback** |
| Local `feature/v*` exists but not on it | List them to choose, default piggyback the latest |
| No version branch | Open `feature/{ticket}` from main |

If not clean, stop and ask. After branching, create `features/{ticket}/` (if it exists, ask: continue / overwrite / cancel).

## Feature Step 2: Fetch the Jira ticket

`jira_get_issue` to fetch summary/description/status/parent/issuetype/subtasks/labels. Record Figma / PR links.

| issuetype | Auto-add |
|---|---|
| Story / Epic (has subtasks) | `searchJql parent={ticket}` |
| Sub-task | parent + all siblings |
| Task / Bug | none |

`Release to Staging` / `QA Testing` → describe the actual situation; `To Do` / `In Progress` → mark "not yet implemented".

## Feature Step 2.1: Actually read the Figma design (**mandatory** when the ticket has a Figma link)

**Copying the link is not reading it.** If the ticket has a Figma link, you must use the figma MCP to read the actual layout, and derive dimensions from the design — do not rely on the ticket description alone — **the risk of missing an entire page layout/entry point is right here.**

1. `get_metadata` (fileKey + node) to probe the frame structure. Output often exceeds the token limit → save to file automatically, use `jq -r '.[0].text'` + grep to extract frame names / node ids / layout list, do not read inline.
2. For each key layout (each page, section, dialog) use `get_screenshot` or `get_design_context` to confirm UI details one by one: field composition, click destination (in-site / opens externally), state (active/disabled/empty state), list limit, pagination spec, etc.
3. The figma MCP View seat has a **tool-call quota limit**; pick key screenshots to save quota; for details you cannot screenshot, go back and extract from the saved metadata.
4. Write the facts read from the design into the matrix dimensions; the "to be confirmed" section of the Step 5.1 self-check must be **triaged**: which `?` have been resolved by the design, and which are unknown backend API contracts (only the latter are left for repo lookup / asking the owner).

## Feature Step 3: Determine the test aspects

YouTube is an external site with no in-house project code. Read the ticket and judge for yourself which feature aspects are affected (do not throw a checklist for the user to tick): video search / video playback / channel / search filters. Report your conclusion; the user corrects it if wrong.

## Feature Step 4: Confirm target-site behavior (mandatory)

YouTube is an external site (https://www.youtube.com), no in-house repo to pull. Instead use the actual target-site behavior as the source of truth — the ticket description, Figma, and observation from walking pages can all serve as evidence; `?` are confirmed in Step 6 by walking the live pages, not by repo lookup.

## Feature Step 5: Write the draft (including `?`)

**Header (fixed):**
```markdown
# {ticket} — {full Jira title}
> Jira: https://your-workspace.atlassian.net/browse/{ticket}
> Status: {status} ｜ Affected aspects: {video search / video playback / channel / search filters}
```

**Feature file mapping table** (first `ls testcases/` to cross-check the main library; currently search / watch / channel / search-filters):
```
| Main-library file | Modified/New | Change content |
```
Exists in main library → Modified; not present → New. Only include the dimensions changed by this ticket.

**Body dimensions (technique-driven, not from memory)**: read `references/coverage-techniques.md` and **apply each item in turn** — the ten functional test design techniques — to produce matrix rows: Equivalence Partitioning / Boundary Value Analysis / Decision Table (search filter condition combinations, etc.) / Positive·Negative·Exception Paths / Error Guessing / State Transition (→ delegate to state_machine.md) / Roles·Permissions (mostly N/A for YouTube guest/logged-out state) / Environment Variance / Data Lifecycle·CRUD / Pairwise·Orthogonal.

> Purpose: upgrade "add/remove per ticket" into "enumerate per technique". For each technique, **produce rows if applicable, note the reason if N/A** (see Step 5.1 self-check below), so the matrix does not miss dimensions at the source (`bdd-review` will check this self-check back).

## Feature Step 5.1: Coverage-technique self-check + cross-cutting metrics (mandatory output)

Following the self-check table format in `references/coverage-techniques.md`, produce two sections at the end of the draft (**this is what bdd-review checks back against, do not omit it**):

1. **Coverage-technique self-check table**: `Technique | Applicable? | Corresponding matrix row / reason for N/A` — the ten techniques row by row; applicable gets a ✅ pointing to the matrix row, not applicable is marked N/A with a **one-line reason** (no blanks, no skipping).
2. **Cross-cutting metrics (non-BDD)**: when a performance/security/a11y/responsive/race-condition/console aspect is detected, mark one line each `{aspect} → {dedicated skill}` (pointer only, **do not write as a matrix row, do not count in coverage**).

## Feature Step 6: Fill in `?`

YouTube has no in-house repo. Fill in `?` by walking the target site (https://www.youtube.com, guest/logged-out) and observing the corresponding behavior — write confirmed behavior directly; keep `?` for what cannot be confirmed and note the operations tried.

## Feature Step 7: Write the file

`Write` to `features/{ticket}/test_matrix.md`. For each Feature file, run `ls testcases/{path}.feature` to verify the Modified/New mark. **Before writing, confirm the Step 5.1 "coverage-technique self-check table" has all ten items (no blank cells) + the "cross-cutting metrics" section exists.**

## Feature report

```
Produced features/{ticket}/test_matrix.md
Filled in N items (confirmed by walking pages) ｜ still ? M items
Next step: ① /stage-state-machine {ticket} (if needed) ② /stage-write-bdd {ticket}
```

---

# Version mode (vX.X TICKET-xxx)

## Version Step 1: Parse + confirm

Confirm plan.md exists and the ticket is in the "Feature allocation" table (if not → remind and ask whether to add it to plan.md).

## Version Step 2: Decide the mode

```bash
ls features/{ticket}/test_matrix.md 2>&1
ls versions/{version}/testcases/{ticket}/test_matrix.md 2>&1
```

| features/ | version container | Action |
|---|---|---|
| exists | missing | Move mode (move + enhance) |
| missing | missing | Rewrite mode |
| exists | exists | Ask user: continue/overwrite/cancel |
| missing | exists | Ask user: continue enhancing/overwrite |

## Version Step 3a: Move mode

```bash
mkdir -p versions/{version}/testcases/{ticket}
git mv features/{ticket}/test_matrix.md versions/{version}/testcases/{ticket}/test_matrix.md
```

Check the remaining files in features/{ticket}/ (state_machine/cases/stage-ui-prototype) → tell the user to cleanup after the corresponding skills have run.

## Version Step 3b: Rewrite mode

Same as the Feature flow: fetch the Jira ticket → determine aspects → confirm target-site behavior → write the draft → fill in `?`.

## Version Step 4: Enhance the Version content

| Enhancement item | Description |
|---|---|
| Cross-Feature link points | Only the Version level shows multi-Feature interaction (e.g. search → enter channel → play) |
| Lead QA mark | Fetch from plan.md |
| Cross-check against the Feature scope in plan.md | Confirm consistency |
| Coverage-technique self-check | Move mode: reuse the Feature self-check table and re-verify it is still complete; rewrite mode: re-run Feature Step 5.1 (`references/coverage-techniques.md`) |

## Version Step 5: Fill in `?`

Same logic as Feature Step 6 (confirm by walking the live target site).

## Version Step 6: Header format (fixed)

```markdown
# {ticket} — {full Jira title}
> Jira: https://your-workspace.atlassian.net/browse/{ticket}
> Version: {version} ｜ Lead QA: {fetch from plan.md}
> Status: {Jira status}
```

Move mode must update "Version" and "Lead QA".

## Version Step 7: sanity check + update changes.md

For each Feature file, `ls testcases/{path}.feature` to verify Modified/New. Add this ticket's file to the corresponding Feature section in `versions/{version}/changes.md`.

## Version report

```
Produced versions/{version}/testcases/{ticket}/test_matrix.md (move/rewrite)
Filled in N items ｜ still ? M items
changes.md updated
Next step: ① /stage-state-machine {version} {ticket} (if needed) ② /stage-write-bdd {version} {ticket}
```

---

# Version wrap-up mode (vX.X, integration + regression)

## Wrap-up Step 1: Parse + confirm

Confirm: plan.md, testcases/ (each Feature subfolder), and changes.md exist.

## Wrap-up Step 2: Read existing information

1. plan.md — integration flow list + regression scope
2. changes.md Regression section — regression case list
3. Each Feature: testcases/{ticket}/test_matrix.md (products involved, business states, condition→behavior, environment variance)

## Wrap-up Step 3: Write testcases/regression/test_matrix.md

**Header (fixed):**
```markdown
# {version} integration + regression test matrix
Sprint: {reuse} ｜ Lead QA: {reuse} ｜ Corresponding plan: [plan.md](../../plan.md)
```

**Integration test matrix** (cross-Feature flows, do not duplicate Version content):
```markdown
## Integration test matrix

| # | Flow | Role | Expected | Features involved |
|---|---|---|---|---|

### Cross-Feature state interaction
- {description, e.g. the chain of search → filter → enter channel → play}
```

**Regression test matrix:**
```markdown
## Regression test matrix

| # | Module | Role | Scenario | Expected |
|---|---|---|---|---|
```

> **Integration-perspective techniques**: the integration/regression matrix still applies the **Positive·Negative·Exception Paths** and **Roles** from `references/coverage-techniques.md` — for each cross-Feature flow, add at least one negative flow where "some Feature fails/is blocked midway", do not list only the happy-path chain. Non-functional aspects likewise go through the "cross-cutting metrics" pointer and are not expanded.

## Wrap-up Step 4: Fill in `?`

Fill in `?` by observing the live target site (guest/logged-out); keep `?` for what cannot be confirmed.

## Wrap-up Step 5: sanity check

For the Features involved in the integration flows → `ls versions/{version}/testcases/{ticket}/` to confirm cases exist. For regression cases → confirm changes.md Regression already lists them.

## Wrap-up Step 6: Write the file

`Write` to `versions/{version}/testcases/regression/test_matrix.md`.

## Wrap-up report

```
Produced versions/{version}/testcases/regression/test_matrix.md
N integration flows (M Features involved) ｜ N regression modules
Filled in N items (file:line) ｜ still ? M items
Next step: /stage-write-bdd {version}
```

---

## Rules

- If the argument is incomplete, ask; if the prerequisite is missing → run the corresponding skill first
- Version: merge features/{ticket}/ into the version container `versions/{version}/testcases/{ticket}/` using `git mv` (preserves history)
- Version wrap-up integration matrix focuses on "integration perspective + cross-Feature interaction", **do not duplicate the Version matrix content**
- Feature: Step 4 confirm target-site behavior (YouTube external site, no in-house repo to pull); no commit / push
- Always `Write` to write files; header format is fixed; mark `?` when unsure
- **Enumerate dimensions per the techniques in `references/coverage-techniques.md`**, not from memory; each matrix **must include the coverage-technique self-check table (ten items, no blanks) + cross-cutting metrics section** (Feature Step 5.1); non-functional items are pointer-only, not counted in coverage
