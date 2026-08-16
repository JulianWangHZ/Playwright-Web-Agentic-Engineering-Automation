---
name: flow-version-testing-workflow
description: Version stage orchestrator — walks you through the flow of "confirming which features this version includes + cross-feature consolidation" (version plan → per-feature matrix/BDD → review → archive). Triggers when the user says "start assembling a version, what does this version test, run v4.16 from the start, version workflow, consolidate this version's features". argument = version number. Do NOT use me if you only want a single stage artifact—use the corresponding stage-* skill directly.
argument-hint: "<vX.X>"
allowed-tools: Read, mcp__atlassian__jira_get_issue, mcp__atlassian__jira_search
model: sonnet
---

# version-testing-workflow

**Layer 1 orchestrator**: walks the user through the **Version stage**—confirming **which features this version includes** (scope will change) and consolidating across features. Artifact container `versions/{version}/`.

**Core principle**: the orchestrator **does not execute** itself; it hands off step by step to Layer 2 skills. The source of truth for the sequence is `docs/qa-workflow-map.md`.

---

## Profile
You are a QA workflow guide for version consolidation. The user gives a version number; you first confirm which feature tickets this version includes, then walk through them per-ticket following the map's Version sequence.

## Workflow

1. Read `docs/qa-workflow-map.md` (Version stage sequence).
2. Confirm the artifact container `versions/{version}/`; if the argument is not `vX.X`, ask.
3. Walk through in order. **Permission boundary = `docs/qa-workflow-map.md` §7**: stop and ask only before advancing to the next stage, before an optional step, when the argument is unclear, or at an outward-facing write (`.feature` / Jira / commit / `tc-merge`). Reading the map, creating the version container, and the required steps within a stage are autonomous — do not ask. When `accept-edits` or auto mode is on and the user asked to run the whole flow, run the required steps continuously, pausing only at those gates.

   | # | Step | Hand off skill | Optional/Required |
   |---|---|---|---|
   | 1 | Version plan (pull this version's feature list, assign lead testers, scope) | `/stage-version-test-plan {version}` | Required |
   | 2 | Matrix for each feature ticket (merged into the version container) | `/stage-test-matrix {version} {ticket}` | Required (per-ticket) |
   | 3 | State Machine (draw only if the ticket has state flow) | `/stage-state-machine {version} {ticket}` | Optional |
   | 4 | Write/move BDD `.feature` | `/stage-write-bdd {version} {ticket}` | Required (per-ticket) |
   | 5 | BDD review and scoring | `/stage-bdd-review {version}` | Optional (recommended) |
   | 6 | Wrap-up: integration + regression matrix/BDD (cross-feature end-to-end flows, neighboring-module regression) | `/stage-test-matrix {version}` → `/stage-write-bdd {version}` | Required (after all features complete) |
   | 7 | go/no-go release gate (compute readiness, produce sign-off) | `/tool-qa-release-gate {version}` | Required (before release) |
   | 8 | Archive to Jira | `/stage-jira-sync {version} version` | Optional |
   | 9 | Merge back to main library (the only thing allowed to write `testcases/`) | `/stage-tc-merge {version}` | Required (after sign-off, once no more changes) |

4. After Step 1 completes, run 2–5 **per-ticket** following the version plan's feature list; after all features complete, run 6–9 for wrap-up. At each step give only the next command to run.
5. At the end, report: Version consolidation + integration/regression/sign-off complete, already merged back to the main library with `/stage-tc-merge`.

## Constraints
- **Don't execute, only orchestrate**; hand off to Layer 2 skills.
- **Read the sequence from the map**, don't hardcode.
- Scope will change: always go by the feature list produced by `/stage-version-test-plan`, not from memory.
- **Environment is orthogonal**: don't split steps by staging.
- Prerequisites not ready (wanting to run per-ticket matrix without a version plan) → block and point back to Step 1.
