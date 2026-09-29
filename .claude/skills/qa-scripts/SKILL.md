---
name: qa-scripts
description: Stage 5 of the qa-ticket pipeline — add automation for @auto scenarios in the testcases/ main library. Dispatch playwright-test-planner to walk each scenario live in a real browser, extract real locators into an implementation evidence map and judge feasibility, then dispatch playwright-test-generator to write step definitions / Page Objects / fixtures from the evidence map. Triggers on "write YouTube automation", "implement steps", "add step definition", "page object", "youtube automation", "automate a feature", "playwright agentic".
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
| Single-scenario feasibility | live-probe inline in the main session, no planner |
| Locator / wait fix on existing code | inline: inspect the real page → fix POM/step → run the subset (qa-run territory) |
| The user already gave the screen + scenario + location | act directly; don't dispatch an agent to re-explore |
| Batch of many scenarios (almost every ticket) | run steps 1–4 below |

## 1. Scope

```bash
cd youtube
```

- `TICKET-xxx` → the @auto scenarios in the main-library files mapped from `runs/{ticket}/cases/`; a feature path / `@tag` / scenario name works the same; empty → scan all gaps.
- The main session does not read `youtube-automation.md` / `gherkin.md` in full upfront; the generator consults them as needed.
- Scenarios always come from `../testcases/**/*.feature` (read-only).

## 2. Gap discovery

```bash
npx bddgen export      # registered steps (reuse first)
npx bddgen             # missingSteps = tagged @auto but not implemented
```

List the missing layers per scenario (step / POM method / component / fixture). Unknown DOM → don't guess; leave it to the planner.

## 3. Planner → evidence map

Dispatch **`playwright-test-planner`** with: feature path + gap scenario list + start URL. **Do not attach existing POM / step summaries** — the planner's first action is opening the browser, not reading code. Multiple features → one planner per feature, at most 4 in parallel.

It writes `youtube/evidence/{feature relative path}.md`: verified locator per step + feasibility:

| Verdict | Action |
|---|---|
| `AUTOMATABLE` / `NEEDS_URL_SETUP` | to the generator |
| `NOT_FEASIBLE` | stays manual; record the reason as a warning in `progress.md` |
| `TC_STALE` | no code; record as an open question; suspected product bug → suggest `/tool-open-qa-bug` |

**Do not stop to ask the user** (the qa-ticket pipeline has only the sign-off stop); verdicts are listed at close. When this skill is used directly on a large scope with `NOT_FEASIBLE` / `TC_STALE`, confirm once before the generator.

## 4. Generator

Dispatch **`playwright-test-generator`** for feasible scenarios with: scenario list + evidence map path + gaps + summary of existing POM / step / fixture. **Every selector must trace back to the evidence map; never invent one.**

Multiple features in parallel: first one generator for the shared base (BasePage, fixture merge file, common steps, tags), then one per feature writing only its own domain files, then one to merge shared requests and run `npm run check`.

## Report

```
Evidence maps: {paths}
AUTOMATABLE a | NEEDS_URL_SETUP b | NOT_FEASIBLE c (reason) | TC_STALE d
Added/changed: steps x, POMs y, fixtures z
Next: qa-run
```
