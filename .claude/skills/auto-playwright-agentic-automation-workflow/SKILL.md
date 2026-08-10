---
name: auto-playwright-agentic-automation-workflow
description: YouTube automation implementation orchestration — add step definitions / Page Objects / fixtures for existing @auto scenarios in the main testcases/ library. Dispatch playwright-test-planner to first walk through each scenario live in a real browser, extract real locators, and produce an "implementation evidence map"; after passing the feasibility gate, dispatch playwright-test-generator to write code from the evidence map, run bddgen + playwright to verify, and dispatch playwright-test-healer for any remaining failures. Triggers when the user mentions "write YouTube automation, implement steps, add step definition, page object, run bddgen, youtube automation, automate a feature, playwright agentic, auto-fix tests, locator repair".
argument-hint: "<feature path | @tag | scenario name | empty=scan all gaps>"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
model: sonnet
---

# playwright-agentic-automation-workflow

Add automation implementation for **existing @auto scenarios** in the main `testcases/` library. Core principle: the `.feature` files have already been reviewed and verified via `/stage-test-matrix → /stage-write-bdd → /stage-bdd-review`, so **this workflow does not re-derive scenarios**; instead it takes existing scenarios, walks them through a real browser, extracts real locators, judges feasibility, and then writes code. This is live-probe-first, and also a hallucination-prevention measure (guarding against inventing nonexistent selectors / flows).

**Working directory is fixed at `youtube/`.** Only implement the automation layer (step / Page Object / component / fixture). This project is guest/logged-out, with **no** api / types / setup / auth / factory layers, and **must never write or modify `.feature` files** (the single source of truth is the main `testcases/` library, read-only). Follow `.claude/rules/youtube-automation.md` throughout.

> No commit / push (unless the user explicitly requests it). Always run `npm run check` after any automation change.

---

## Phase 0: Setup and scope definition

```bash
cd youtube
```

1. Read `.claude/rules/youtube-automation.md` (layering red lines, selector priority order) and `.claude/rules/gherkin.md`.
2. Confirm the source: target scenarios always come from the main library `../testcases/**/*.feature` (read-only).
3. Decide scope based on the argument:

   | argument | scope |
   |---|---|
   | feature path (e.g. `testcases/search/search-results.feature`) | all gap @auto scenarios in that file |
   | `@tag` (e.g. `@search-results`) | gap scenarios carrying that tag |
   | scenario name | a single scenario |
   | empty | scan all gaps (list them and confirm with the user before continuing) |

## Phase 1: Gap Discovery

```bash
npx bddgen export      # list registered steps (reuse first, avoid re-creating)
npx bddgen             # generate .features-gen, list missingSteps (= tagged @auto but step not implemented)
```

- For each scenario, list the missing layers (missing step / missing POM method / missing API client / missing fixture).
- For unknown DOM / API, **do not guess**; leave it to the Phase 2 planner to confirm live.
- For large scope, first "list them → confirm with the user → then continue".

## Phase 2–3: Live Exploration + Evidence Map

Dispatch **`playwright-test-planner`** (`Agent(subagent_type: "playwright-test-planner", ...)`), attaching:
- target feature path + gap scenario list
- summary of existing POM / step / component (which can be reused)

The planner uses Playwright MCP to walk each scenario live in a real browser and produces an **implementation evidence map** at `youtube/evidence/{feature relative path}.md` (verified locator per step + feasibility classification).

## Phase 3.5: Feasibility Gate

Read the evidence map produced by the planner and build a feasibility table:

| Scenario | feasibility | disposition |
|---|---|---|
| ... | `AUTOMATABLE` / `NEEDS_URL_SETUP` | → proceed to Phase 4 |
| ... | `NOT_FEASIBLE` | keep manual, do not implement; report the reason |
| ... | `TC_STALE` | stop, recommend returning to `/stage-write-bdd` to fix the `.feature`; suspected product bug goes through `/tool-open-qa-bug` |

- **Solo fast-path may self-review** to pass; for large scope or any `NOT_FEASIBLE` / `TC_STALE`, list them and confirm with the user before proceeding to code-gen.

## Phase 4: Generate

For scenarios that pass the gate, dispatch **`playwright-test-generator`**, attaching:
- target scenario list + evidence map path
- gap list + summary of existing POM/step/fixture

The generator hand-writes **step definitions + Page Objects + components + fixture registration** from the evidence map (following `youtube-automation.md`, tracing every selector back to the evidence map, not producing flat specs).

## Phase 5: Verify

```bash
npx bddgen                                   # confirm all steps are wired up, no missing
npx playwright test <the .features-gen spec subset for that feature>   # run only the relevant subset
npm run report                               # generate report (optional)
npm run check                                # tsc + prettier + eslint, must pass
```

All green → Phase 6. Any failure → Phase 7.

## Phase 6: Report / PR

Once green, go through the existing `/auto-create-pull-request` to open a PR (the PR description lists which scenarios were implemented, where the evidence maps live, and the required CI secrets). Hand the PR to a teammate for review (the code-quality gate).

## Phase 7: Heal (only for remaining failures, optional)

Dispatch **`playwright-test-healer`**, attaching the failing subset (`.features-gen` spec path or `--grep`). The healer inspects the real page at the failure point, classifies the root cause, fixes the POM/step layer, and re-runs.

**Guardrails**: suspected product bug → stop and go through `/tool-open-qa-bug`; need to change `.feature` → forbidden; same test not green after 3 rounds → stop; do not mask with `test.fixme()`; for persistent flakiness, recommend `@quarantine` + a Jira ticket.

---

## Hallucination prevention and human sign-off (throughout the workflow)

- **Every selector must trace back to the evidence map** — only locators the planner verified live may enter the code; the generator must not invent its own.
- **Two human gates**: the Phase 3.5 feasibility gate (before code-gen, reviewing whether it should/can be automated) plus PR review (after it runs green, reviewing code quality).
- **Source is read-only**: `.feature` files are only read from the latest main library; artifacts all live in `youtube/`, decoupled from the `.feature` lifecycle.
