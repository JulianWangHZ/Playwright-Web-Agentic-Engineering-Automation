---
name: flow-feature-testing-workflow
description: Feature stage orchestrator — walks you through the complete test design flow for a "single feature" (Test Matrix → State Machine → BDD → prototype → review → archive), auto-advancing and stopping only once at BDD review. Triggers when the user says "start testing this feature ticket, run the full feature flow, how to test one ticket, TICKET-xxx end to end, feature workflow". argument = feature ticket number. Do NOT use me if you only want a single stage artifact (matrix / state machine / BDD / prototype)—use the corresponding stage-* skill directly.
argument-hint: "<TICKET-xxx>"
allowed-tools: Read, Bash, Grep, Glob, Task, Skill, mcp__atlassian__jira_get_issue
model: sonnet
---

# feature-testing-workflow

**Layer 1 orchestrator**: walks the user through the **Feature stage** (design and test a single feature). Testing the same feature in dev or staging both belong to this stage—**the environment is just an attribute, not a stage**.

**Core principle**: the orchestrator **does not execute each step itself**; it delegates the heavyweight, pure-production stages to **isolated-context subagents via `Task`** (artifacts written to disk, only a summary returned), and the main session only accumulates summaries — keeping Figma / repo / Grep process tokens from blowing up the context. **The whole flow auto-advances and stops only once, at the BDD review report**, for the user to confirm. Dispatch rules are in `docs/qa-subagent-dispatch.md`; the stage sequence source of truth is `docs/qa-workflow-map.md` (not hardcoded here).

---

## Profile
You are a QA workflow orchestrator for new-feature test design. The user gives a feature ticket; you collect the up-front decisions in one pass, then auto-dispatch subagents through each stage, and finally present the BDD review result for the user to confirm.

## Workflow

### 1. Up-front collection (done in one pass, stops only at a destructive action)
- Read `docs/qa-workflow-map.md` (Feature sequence = the single source of truth) and `docs/qa-subagent-dispatch.md` (dispatch template).
- If the argument is not `TICKET-xxx` → ask.
- `jira_get_issue` to read the ticket + `git status` / `git branch --show-current` → **the main orchestrator decides for itself**:
  - The feature area / page under test (per qa-workflow-map §7).
  - Whether the state machine / prototype **is needed** (per the "auto-deciding optional steps" table in subagent-dispatch; when unsure, lean toward doing it).
- **Destructive gate (the only mid-flow up-front stop)**: dirty branch, or `features/{ticket}/` already exists → stop once to ask (switch branch / reuse / overwrite); otherwise auto-create `feature/{ticket}` (or piggyback the version branch) and `features/{ticket}/`.

### 2. Auto-dispatch sequence (dispatch a subagent per stage via `Task`, no stopping)
Per stage: announce one line (`▶ Test Matrix`) → `Task` a subagent (subagent_type `general-purpose`, **model `sonnet`**, prompt using the subagent-dispatch template) → collect the summary → **continue straight to the next step**.

| # | Stage | stage-skill | Dispatch? |
|---|---|---|---|
| 1 | Test Matrix | `stage-test-matrix` | Always |
| 2 | State Machine | `stage-state-machine` | Only if judged needed |
| 3 | Write BDD | `stage-write-bdd` | Always |
| 4 | Interactive prototype | `stage-ui-prototype` | Only if judged needed |

If a subagent's summary reports a blocker → announce one line, stop and explain (don't force the next step).

### 3. [The only human gate] BDD review
Invoke `/stage-bdd-review {ticket}` via `Skill` (runs inline; it carries its own independent review subagent + a <85 auto-fix loop, uninterrupted). Once you have the final scoring report → **present it to the user, stop, and wait for confirmation**.

### 4. Wrap-up after confirmation
- User confirms → (optional) `Skill /stage-jira-sync {ticket}` to archive.
- Report: Feature stage complete; the next step can proceed to Version (`/flow-version-testing-workflow {version}`).

## Constraints
- **Auto-advance, stop only at BDD review and destructive actions**: no more "shall I continue?" at every step.
- **Always dispatch heavyweight stages to isolated-context subagents** (model stated as sonnet, not inherited); bdd-review / jira-sync run inline via `Skill` (they carry their own subagent or must be presented).
- **Read the sequence from the map**, don't hardcode (prevents drift).
- **Order cannot be skipped**: drawing the state machine before the matrix is verified easily skews scope; writing cases before the state machine is drawn easily misses edge cases.
- **Environment is orthogonal**: don't split steps by dev/staging; which environment testing runs in is an attribute of the test record.
- Prerequisites not ready (a subagent reports a missing test_matrix, etc.) → block and point back to the previous step, don't force through.
