---
name: qa-run
description: Stage 6 of the qa-ticket pipeline — run the automation subset, audit for fake greens (assertions aligned to the evidence map + mutation check), and fix remaining failures in the main session (at most 2 rounds per test). Triggers on "run tests", "verify automation", "auto-fix tests", "locator repair", "rerun failing test", "healer".
argument-hint: "<TICKET-xxx | feature path | spec subset>"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# qa-run — verify → oracle audit → heal

Working directory `youtube/`. Never modify `.feature`; no commit / push.

**Run tests with the CLI, not the MCP**: `cd youtube && BROWSER_CHANNEL=chrome npx playwright test <subset>` (`BROWSER_CHANNEL=chrome` is the local workaround per `youtube-automation.md`; drop it under the official docker image). Run it bare, without `| tail`. Use the playwright-test MCP only for interactive locator extraction, after `test_list` confirms it's alive; on error fall back to the CLI.

## 1. Verify

```bash
npx bddgen                                         # all steps wired, none missing
npx playwright test <.features-gen subset for the feature>
npm run check                                      # tsc + prettier + eslint, must pass
```

Single run, no `--repeat-each`. All green → 2; failures → 3.

## 2. Oracle audit (anti-fake-green; only new or healed scenarios)

If a subagent wrote the code, the main session audits it; if the main session wrote it, re-read the evidence map and steps from disk instead of relying on memory from writing:
1. **Alignment**: compare each scenario's `Then` assertions with the oracle recorded in the evidence map; no weakened substitutes (asserting some text appears when the oracle is a list gaining a row). Oracles marked "not observable in the browser" stay `TODO`, never replaced by weak assertions.
2. **Mutation check**: per scenario, temporarily break one key assertion → run only that scenario → it **must turn red** → restore immediately (no rerun). Stays green = fake green; fix the assertion and redo this step.

## 3. Heal (remaining failures only)

Classify failures first: test defects (locator / wait / data) → the main session follows the body of `.claude/agents/playwright-test-healer.md`, one feature group at a time (the test environment is shared; no parallel runs, no subagent). Environment issues (site down, network) → ask the user first; not a bug.

Guardrails:
- A green failing subset = verification complete; no full rerun. Rerun only the affected subset when a shared POM/step changed.
- At most 2 rounds per failing test (diagnose + fix + rerun = one round); still red → stop and report the ruled-out causes.
- Suspected product bug → stop, suggest `/tool-open-qa-bug` (ask first).
- Never mask with `test.fixme()`; persistent flakiness → suggest `@quarantine` + a Jira ticket.
- Healed scenarios go back through step 2.

## Report

```
passed a | failed b (test defect x / suspected product bug y / environment z) | fake greens caught m
healer: fixed n, still red after 2 rounds k (root cause)
```
