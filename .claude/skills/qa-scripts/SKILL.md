---
name: qa-scripts
description: Stage 5 of the qa-ticket pipeline — add automation for @auto scenarios in the testcases/ main library. The main session runs the planner per feature (walk each scenario live in a real browser, extract real locators into an implementation evidence map, judge feasibility), then the generator writes step definitions / Page Objects / fixtures from the evidence map; with multiple features, generators run as parallel subagents. Triggers on "write YouTube automation", "implement steps", "add step definition", "page object", "youtube automation", "automate a feature", "playwright agentic".
argument-hint: "<TICKET-xxx | feature path | @tag | scenario name | empty=scan all gaps>"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
---

# qa-scripts — planner → generator

The `.feature` files are signed off and merged into the main library, so this stage **does not re-derive scenarios**: take existing scenarios to the real page, extract real locators, judge feasibility, then write code. **Never write or modify `.feature` files.** No commit / push.

**Working directory is `youtube/`.** Only the automation layer (step / Page Object / component / fixture). The project is guest / logged-out with **no** api / types / setup / auth / factory layers. Follow `.claude/rules/youtube-automation.md`.

> Feasibility is about whether the UI can be driven and asserted — **always probe live first**. `NEEDS_URL_SETUP` = automatable, but the scenario needs a specific start URL / query parameters to reach its precondition.

## 0. Triage (don't default to the full pipeline)

| Situation | How to run |
|---|---|
| Single-scenario feasibility | live-probe directly, no full evidence map |
| Locator / wait fix on existing code | inline: inspect the real page → fix POM/step → run the subset (qa-run territory) |
| The user already gave the screen + scenario + location | act directly; don't re-explore |
| Batch of many scenarios (almost every ticket) | run steps 1–4 below |

## 1. Scope

```bash
cd youtube
```

- `TICKET-xxx` → the @auto scenarios in the main-library files mapped from `runs/{ticket}/cases/`; a feature path / `@tag` / scenario name works the same; empty → scan all gaps.
- The planner step does not read `youtube-automation.md` / `gherkin.md`; the generator step consults them as needed.
- Scenarios always come from `../testcases/**/*.feature` (read-only).

## 2. Gap discovery

```bash
npx bddgen export      # registered steps (reuse first)
npx bddgen             # missingSteps = tagged @auto but not implemented
```

List the missing layers per scenario (step / POM method / component / fixture). Unknown DOM → don't guess; leave it to the planner.

## 3. Planner → evidence map

The main session follows the body of `.claude/agents/playwright-test-planner.md`, **one feature at a time**: the first action is opening the browser, not reading POM / step code. The browser is a single session — no parallel runs, no subagent. After each feature, write its evidence map and report one line before the next.

It writes `youtube/evidence/{feature relative path}.md`: verified locator per step + feasibility:

| Verdict | Action |
|---|---|
| `AUTOMATABLE` / `NEEDS_URL_SETUP` | to the generator |
| `NOT_FEASIBLE` | stays manual; record the reason as a warning in `progress.md` |
| `TC_STALE` | no code; record as an open question; suspected product bug → suggest `/tool-open-qa-bug` |

**Do not stop to ask the user** (the qa-ticket pipeline has only the sign-off stop); verdicts are listed at close. When this skill is used directly on a large scope with `NOT_FEASIBLE` / `TC_STALE`, confirm once before the generator.

## 4. Generator

Write code following the body of `.claude/agents/playwright-test-generator.md` and `youtube-automation.md`. **Every selector must trace back to the evidence map; never invent one.**

| Feasible features | How |
|---|---|
| 1 | the main session writes it directly |
| ≥ 2 | 1. The main session writes the shared base (BasePage, fixture merge file, common steps, tags)<br>2. In one message, dispatch one `playwright-test-generator` subagent per feature with the scenario list, evidence map path, gaps, and shared-base summary; each writes only its own domain files and lists shared-file requests in its reply<br>3. The main session merges shared requests and runs `npm run check` |

## Report

```
Evidence maps: {paths}
AUTOMATABLE a | NEEDS_URL_SETUP b | NOT_FEASIBLE c (reason) | TC_STALE d
Added/changed: steps x, POMs y, fixtures z
Next: qa-run
```
