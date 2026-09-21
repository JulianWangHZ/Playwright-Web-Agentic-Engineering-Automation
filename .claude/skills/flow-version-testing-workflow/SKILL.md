---
name: flow-version-testing-workflow
description: Version stage orchestrator — walks you through the flow of "confirming which features this version includes + cross-feature consolidation" (version plan → per-feature matrix/BDD → review → integration/regression → release gate → archive → merge), auto-advancing between features and stopping only at the 3 human gates (scope confirm / release sign-off / merge to library). Triggers when the user says "start assembling a version, what does this version test, run v4.16 from the start, version workflow, consolidate this version's features". argument = version number. Do NOT use me if you only want a single stage artifact—use the corresponding stage-* skill directly.
argument-hint: "<vX.X>"
allowed-tools: Read, Bash, Grep, Glob, Task, Skill, mcp__atlassian__jira_get_issue, mcp__atlassian__jira_search
model: sonnet
---

# version-testing-workflow

**Layer 1 orchestrator**: walks the user through the **Version stage**—confirming **which features this version includes** (scope will change) and consolidating across features. Artifact container `versions/{version}/`.

**Core principle**: the orchestrator **does not execute the heavyweight stages itself**; it delegates the pure-production stages (test-matrix / state-machine / write-bdd) to **isolated-context subagents via `Task`** (artifacts to disk, summary back), and the main session only accumulates summaries. **The flow auto-advances across features and stops only at the 3 human gates**: ① confirm scope, ② release sign-off, ③ merge to the main library. Dispatch rules are in `docs/qa-subagent-dispatch.md`; the sequence source of truth is `docs/qa-workflow-map.md`.

---

## Profile
You are a QA workflow orchestrator for version consolidation. The user gives a version number; you confirm the feature list at Gate ①, then per-ticket auto-dispatch subagents through matrix / (state machine) / BDD (+ inline review), then run the wrap-up integration + regression, then stop at Gate ② for release sign-off, and finally Gate ③ to merge back to the library.

## Workflow

### Gate ① [human] Confirm version scope
1. Read `docs/qa-workflow-map.md` (Version sequence) and `docs/qa-subagent-dispatch.md` (dispatch template).
2. If the argument is not `vX.X` → ask. Auto-create the container `versions/{version}/` (a directory create is not a destructive gate).
3. `Skill /stage-version-test-plan {version}` (runs inline; pulls the feature list, assigns leads, scope, integration + regression scope) → **present the plan to the user, stop, wait for confirmation of the feature list** (scope changes, so it must be confirmed, not remembered).

### Per-ticket auto-dispatch (loop over each changed ticket in the confirmed list, no stopping)
Only tickets **changed** in this version re-run; unchanged tickets reuse existing Feature-stage artifacts. For each ticket, in order (announce one line per stage, `Task` a subagent per the dispatch template, model `sonnet`, collect summary, continue):

| # | Stage | stage-skill | argument | Dispatch? |
|---|---|---|---|---|
| 1 | Test Matrix | `stage-test-matrix` | `{version} {ticket}` | Always |
| 2 | State Machine | `stage-state-machine` | `{version} {ticket}` | Only if state flow |
| 3 | Write BDD | `stage-write-bdd` | `{version} {ticket}` | Always |
| 4 | BDD review | `stage-bdd-review` | `{version}` (or ticket cases path) | inline `Skill` (not a subagent) |

### Wrap-up (after all features complete, no stopping)
- `Task` `stage-test-matrix {version}` then `stage-write-bdd {version}` for the **integration** (cross-feature end-to-end) + **regression** (neighboring-module) matrix and BDD.

### Gate ② [human] Release sign-off
- `Skill /tool-qa-release-gate {version}` (computes readiness, produces the go/no-go sign-off; depends on scan-qa-risk artifacts) → **present the sign-off to the user, stop, wait for the go decision**.

### Gate ③ [human] Merge back to the main library
- (optional) `Skill /stage-jira-sync {version} version` to archive.
- `Skill /stage-tc-merge {version}` (the only thing allowed to write `testcases/`) → **confirm with the user before this destructive write**, then merge.
- Report: version consolidation + integration/regression/sign-off complete, merged back to the main library.

## Constraints
- **Auto-advance between features/stages, stop only at the 3 gates** (scope / sign-off / merge) and destructive actions.
- **Always dispatch the heavyweight stages to isolated-context subagents** (model stated as sonnet, not inherited); version-test-plan / bdd-review / release-gate / jira-sync / tc-merge run inline via `Skill` (gates or destructive writes — a subagent cannot use Skill).
- **Read the sequence from the map**, don't hardcode.
- Scope will change: always go by the feature list produced by `/stage-version-test-plan`, not from memory.
- **Environment is orthogonal**: don't split steps by staging.
- Prerequisites not ready (wanting per-ticket matrix without a confirmed plan) → block and point back to Gate ①.
