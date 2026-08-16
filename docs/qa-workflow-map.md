# QA Workflow Map (Single Source of Truth)

> **This file is the single source for "which skill to use and how the workflow goes".** CLAUDE.md / README / other docs all point here and no longer copy the stage tables independently — to avoid drift.
> Not sure which to use → run `/flow-qa-router <describe your scenario>`; it picks for you based on this file.

---

## 0. Two-Layer Architecture

| Layer | Members | Role |
|---|---|---|
| **Layer 1 orchestration** | `/flow-qa-router` (dispatcher) · `/flow-feature-testing-workflow` · `/flow-version-testing-workflow` | High-level entry: pick a skill, or walk you through a whole stage |
| **Layer 2 execution** | test-matrix / state-machine / write-bdd / ui-prototype / bdd-review / version-test-plan / tc-merge / jira-sync … (see §4 below) | The individual skills that do the actual work |

## 1. Intent Stage Model (sliced by "work intent", not by environment)

**Core**: the same feature is tested in dev and also in staging — so **you cannot slice stages by environment**. Slice by work intent; **environment (dev/staging/pre-release) is an orthogonal attribute** (which environment a given test ran in is an annotation, not a stage).

| Intent stage | What you're doing | Artifact directory | Environment (orthogonal attribute) |
|---|---|---|---|
| **Feature** | Design and test a **single feature** (the same feature in dev / staging both count as this stage) | `features/{ticket}/` | dev / staging |
| **Version** | Confirm **which features the version includes** + cross-feature aggregation (scope changes); wrap-up does integration + regression + go/no-go release gate | `versions/{version}/` (the container itself; regression goes in `testcases/regression/`) | staging / pre-release |

> "Merging a feature into a version" = the test assets in `features/{ticket}/` graduate and merge into `versions/{version}/testcases/{ticket}/` (not a stage change, but an aggregation).

## 2. Stage Determination Rule (single source)

Skills auto-detect the stage from the **argument format**, so you don't need to memorize different commands:

| Argument | Stage | Example |
|---|---|---|
| `TICKET-xxx` | Feature | `/stage-test-matrix TICKET-1352` |
| `vX.X TICKET-xxx` | Version (a ticket merged into a version) | `/stage-write-bdd v4.16 TICKET-1352` |
| `vX.X` | Version aggregation / wrap-up | `/stage-version-test-plan v4.16`, `/stage-tc-merge v4.16` |

(`bdd-review` is an exception: it determines the stage by **path** instead — `features/` = Feature, `versions/{version}/` (root, including `testcases/regression/`) = Version.)

## 3. Skill Sequence per Stage

| Stage | Skill order |
|---|---|
| **Feature** | `/stage-test-matrix` → `/stage-state-machine` (optional) → `/stage-write-bdd` → `/stage-ui-prototype` (optional) → `/stage-bdd-review` (optional) → `/stage-jira-sync` (optional) |
| **Version** | `/stage-version-test-plan` → per Feature: `/stage-test-matrix` → `/stage-state-machine` (optional) → `/stage-write-bdd` → `/stage-bdd-review` (optional) → wrap-up: integration / regression matrix + BDD → `/tool-qa-release-gate` (release gate) → `/stage-jira-sync` (optional) → `/stage-tc-merge` (after release gate) |

> **The Version "per Feature" is not always re-run**: only tickets **changed** in this version re-run the corresponding stages (matrix / BDD…) according to the change scope; unchanged tickets reuse the existing Feature-stage artifacts.
> Do not skip the order: drawing the state machine before validating the matrix easily skews scope; writing cases before drawing the state machine easily misses boundaries.
> Want to be walked through step by step → use that stage's orchestrator directly (`/flow-feature-testing-workflow`, `/flow-version-testing-workflow`).

## 4. Full Skill Index (Layer 2 execution skills)

### 4a. Stage Workflow Skills

| Skill | Intent / when to use | argument | Stage | Prerequisite |
|---|---|---|---|---|
| `/stage-test-matrix` | Condition × behavior test matrix (applies the ten coverage-techniques) | `TICKET-xxx`/`vX.X TICKET-xxx`/`vX.X` | Feature/Version | Version requires plan.md |
| `/stage-state-machine` | Mermaid state machine (legal + illegal transition coverage) | `TICKET-xxx`/`vX.X TICKET-xxx` | Feature/Version | test_matrix.md |
| `/stage-write-bdd` | BDD `.feature` (Modified diff / New whole file) | `TICKET-xxx`/`vX.X TICKET-xxx`/`vX.X` | Feature/Version | test_matrix.md |
| `/stage-ui-prototype` | Interactive HTML prototype | `TICKET-xxx`/`vX.X TICKET-xxx` | Feature/Version | test_matrix.md |
| `/stage-version-test-plan` | Version plan (fetch this version's feature list, assign leads, scope, integration + regression scope) | `vX.X` | Version entry | — |
| `/stage-tc-merge` | Merge back to the main library (the only one that can write to `testcases/`) | `vX.X` | Whole-version wrap-up | Released, no longer changing |

### 4b. Cross-Stage Review / Archiving

| Skill | Intent / when to use | argument |
|---|---|---|
| `/stage-bdd-review` | Independent subagent reviews BDD and scores /100 (report only) | `<TICKET-xxx｜version｜cases path>` |
| `/stage-jira-sync` | Sync test artifacts to a Jira TEST Sub-task | `<TICKET-xxx｜vX.X version>` |

### 4c. Standing Tools (not stage-bound, usable anytime)

| Skill | When to use | argument |
|---|---|---|
| `/tool-root-cause-analysis` | CS reported it, the ticket is already open, and you need to reproduce + confirm whether it's a bug (reproduce → confirm → privately judge frontend vs backend; by default no new ticket, root cause not written into the ticket) | `<symptom or existing TICKET-xxx>` |
| `/tool-open-qa-bug` | Caught a bug and need to open a report | none (natural language) |
| `/tool-scan-qa-risk` | Rate risk priority during sprint planning | `<sprint name>` or `<TICKET-xxx …>` |
| `/tool-qa-release-gate` | Version wrap-up / pre-release go/no-go release gate | `<version vX.X>` (depends on scan-qa-risk) |

### 4d. Automation & Engineering

| Skill | Intent / when to use | argument |
|---|---|---|
| `/auto-playwright-agentic-automation-workflow` | Add YouTube Web automation implementation to existing @auto scenarios | `<feature path｜@tag｜scenario name｜empty>` |
| `/auto-responsive-layout-check` | Responsive layout / overflow scan (standalone spec) | `<page path list｜empty>` |
| `/auto-console-error-collector` | Console error interception fixture | none |
| `/auto-test-impact-analyzer` | git diff → affected test subset (shrink CI) | `<base branch｜empty>` |
| `/auto-tc-version-diff` | Two-version BDD diff + re-test checklist | `<old version> <new version>` |
| `/auto-code-review` | Framework code review of the current branch diff (100-point scale) | none |
| `/auto-create-pull-request` | Generate a PR description and submit it | none |

## 5. Disambiguation Guide (global/plugin vs this project's skills)

The following slugs share names or overlap conceptually between the **global/plugin list** and this project's **`.claude/skills/`**. **This repo always uses the project version**:

| Scenario | ✅ Use the project skill | ❌ Don't mistakenly trigger the global/plugin one |
|---|---|---|
| Plan test scope | `/stage-test-matrix` (+ `/stage-version-test-plan`) | global `test-master` |
| Integration regression / release gate (Version wrap-up) | `/stage-version-test-plan` + `/tool-qa-release-gate` | global `regression-test`, `qa-signoff`, `smoke-test-analyzer` |
| Review cases | `/stage-bdd-review` | global `test-review` |
| Version-diff re-testing | project `/auto-tc-version-diff` | same-named global `tc-version-diff` |
| Impact analysis | project `/auto-test-impact-analyzer` | same-named global `test-impact-analyzer` |
| Code review | project `/auto-code-review` | same-named global / plugin `code-review` |

> Non-functional testing (performance / security / a11y / responsive / DB / load) goes through dedicated skills: `/performance-test-gen`, `/security-scan`, `/a11y-audit`, `/auto-responsive-layout-check`, `/auto-console-error-collector`. These **do not enter BDD** (see the "cross-boundary indicators" in `stage-test-matrix/references/coverage-techniques.md`).

## 6. Not Sure Which to Use?

- Just want to know **which skill to use** → `/flow-qa-router <describe scenario>` (picks 1 primary skill and hands off).
- Want to **be walked through a whole stage step by step** → `/flow-feature-testing-workflow`, `/flow-version-testing-workflow`.

## 7. Permission / Autonomy Boundary (single source)

Where to stop-and-ask vs. where to act autonomously. Orchestrators and stage skills **read this table**; do not re-derive per skill.

| Stop and ask first | Act autonomously (do NOT ask) |
|---|---|
| Advancing to the **next stage** (matrix → state machine → BDD → …) | **Execution details within the current stage** |
| Whether to do an **optional step** (state machine / prototype / review / archive) | **Reading the map**, **creating the artifact directory** |
| **Argument is unclear** (not a `TICKET-xxx` ticket, or not a `vX.X` version) | The **map-defined required step sequence** |
| **Outward-facing / hard-to-reverse writes**: editing `testcases/*.feature`, `/stage-jira-sync`, `git commit` / `git push` | Internal-only computation (e.g. risk scoring), moving artifacts into the version container |

**Notes**
- When `accept-edits` **or auto / bypass-permissions mode** is on and the user asked to run a whole stage/flow, run the required steps **continuously**; only pause at the "stop and ask" cases above. In auto mode the permission prompts disappear, so these four gates are the *only* remaining brake — honour them even harder.
- An existing artifact directory is a decision point → ask continue / overwrite / cancel.
- The `.feature` / Jira / commit-push gates are non-negotiable and override any "run continuously" instruction.
