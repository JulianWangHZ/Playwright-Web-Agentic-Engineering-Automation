---
name: flow-feature-testing-workflow
description: Feature stage orchestrator — walks you through the complete test design flow for a "single feature" (Test Matrix → State Machine → BDD → prototype → review → archive). Triggers when the user says "start testing this feature ticket, run the full feature flow, how to test one ticket, TICKET-xxx end to end, feature workflow". argument = feature ticket number. Do NOT use me if you only want a single stage artifact (matrix / state machine / BDD / prototype)—use the corresponding stage-* skill directly.
argument-hint: "<TICKET-xxx>"
allowed-tools: Read, Skill, mcp__atlassian__jira_get_issue
model: sonnet
---

# feature-testing-workflow

**Layer 1 orchestrator**: walks the user through the **Feature stage** (design and test a single feature). Testing the same feature in dev or staging both belong to this stage—**the environment is just an attribute, not a stage**.

**Core principle**: the orchestrator **runs the Feature stage end to end autonomously** — it invokes each Layer 2 stage skill in order (via the Skill tool) and advances automatically, **without asking whether an optional step is needed and without pausing between stages**. It still **delegates the actual work** to Layer 2 skills (does not re-implement matrix / BDD logic itself). The **only** mandatory stop is the `.feature` write confirmation in step 3. The stage sequence source of truth is `docs/qa-workflow-map.md` (not hardcoded in this file).

> **Autonomy override (this flow only)**: this flow deliberately overrides the `docs/qa-workflow-map.md` §7 gates for "advancing to the next stage" and "whether to do an optional step" — here both are autonomous. The **only** gates kept are: unclear argument (ask) and the `.feature` write confirmation (ask). Archiving to Jira (step 6) runs automatically. §7 is unchanged and still governs the version flow.

---

## Profile
You are a QA workflow guide for new-feature test design. The user gives a feature ticket, and following the map's Feature sequence, you walk them through it step by step, handing off to the corresponding skill at each step.

## Workflow

1. Read `docs/qa-workflow-map.md` (Feature stage sequence = the single source of truth).
2. Confirm the artifact directory `features/{ticket}/`; if the argument is not `TICKET-xxx`, ask.
3. Run steps 1–6 in order **autonomously and continuously** — invoke each stage skill via the Skill tool and advance automatically. Do **not** print a command for the user to run, do **not** ask whether an optional step is needed, and do **not** pause between stages. For optional steps, **you decide** from the ticket whether the condition applies (state flow? new UI?) and run or skip accordingly — silently. The **only** stops are: (a) the argument is not `TICKET-xxx` → ask; (b) before writing any `.feature` in step 3 → ask for confirmation (honours the global "confirm before editing `.feature`" rule).

   | # | Step | Invoke skill | Auto-run policy |
   |---|---|---|---|
   | 1 | Test Matrix (exhaustive coverage techniques) | `/stage-test-matrix {ticket}` | **Always** run |
   | 2 | State Machine (draw only if there is state flow) | `/stage-state-machine {ticket}` | **Auto-decide**: run if the ticket has state flow, else skip — don't ask |
   | 3 | Write BDD `.feature` | `/stage-write-bdd {ticket}` | **Always** run — **confirm before writing `.feature`** |
   | 4 | Interactive prototype (only for new UI / alignment) | `/stage-ui-prototype {ticket}` | **Auto-decide**: run if new UI / alignment needed, else skip — don't ask |
   | 5 | BDD review and scoring | `/stage-bdd-review {ticket}` | **Always** run |
   | 6 | Archive to Jira | `/stage-jira-sync {ticket}` | **Always** run (auto) |

4. Execute each step yourself by invoking the stage skill; between steps just report what ran and move on — no command prompts, no optional-step questions.
5. At the end, report: Feature stage complete, the next step can proceed to Version (`/flow-version-testing-workflow {version}`).

## Constraints
- **Delegate, don't re-implement**: run each step by invoking the Layer 2 stage skill — don't hand-build matrices / write BDD with your own logic. "Autonomous" means you invoke and advance without asking, **not** that you bypass the stage skills.
- **Read the sequence from the map**, don't hardcode (prevents drift).
- **Order cannot be skipped**: drawing the state machine before the matrix is verified easily skews scope; writing cases before the state machine is drawn easily misses edge cases.
- **Environment is orthogonal**: don't split steps by dev/staging; which environment testing runs in is an attribute of the test record.
- Prerequisites not ready (e.g. wanting to run state-machine without a test_matrix) → block and point back to the previous step.