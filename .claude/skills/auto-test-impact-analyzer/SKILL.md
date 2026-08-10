---
name: auto-test-impact-analyzer
description: From a git diff, compute which tests this change affects and run only the affected subset on PRs. This project is YouTube E2E (Playwright/TS, guest/logged-out). Triggers when the user mentions "TIA, affected tests, run only what changed, affected tests, speed up CI, selective test run, incremental testing".
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
argument-hint: "[--base=main]"
model: sonnet
---

# test-impact-analyzer

From a git diff, compute the affected test set and run only the necessary subset on PRs.

> TIA only speeds up the PR stage. merge to main / release always run the full suite.

## Two strategies

| Strategy | Precision | When to use |
|------|--------|------|
| **path-heuristic** | 🟠 coarse | change `src/pages/search-results.page.ts` → run the `.features-gen` specs corresponding to `testcases/search/*` |
| **feature-tag** | 🟡 medium | based on the changed Page Object / step, reverse-look up the `.feature` scenario tags that reference it |

Prefer feature-tag → path-heuristic.

> This project is Playwright BDD (`bddgen` generates specs from `.feature` + steps), mapping Page Object / step files to the scenarios that reference them.

## Phase 1: Get the diff

```bash
BASE="${1:-main}"
git diff --name-only "$(git merge-base $BASE HEAD)"...HEAD
```

## Phase 2: Build the impact map (youtube/ Playwright BDD)

```bash
# Path heuristic
# change src/pages/search-results.page.ts → run search-related scenarios in testcases/search/*
# change src/pages/watch.page.ts        → run watch-related scenarios in testcases/watch/*
# change tests/ui/search.steps.ts       → reverse-look up the .feature scenarios that use this step

# Shared-layer changes (BasePage / fixtures / utils) → full run
```

## Phase 3: Compute the affected test set

```
affected = ∅
for f in changed_files:
    if f is config / package-lock.json / playwright.config.ts / CI yml:
        → full run
    affected ∪= map(f)
affected ∪= the changed test files themselves
affected ∪= smoke T0 (always runs)
```

**Conditions that trigger a full run:**
- Changes to `package-lock.json` / `.github/workflows/` / `playwright.config.ts`
- Changes to the shared layer (BasePage / fixtures / utils)
- Changes to cross-scenario shared constants such as `src/data/tags.ts`

## Phase 4: Output report

```markdown
# Test Impact Report · PR #xxx · {date}

## Impact analysis
- Repo: youtube (Playwright BDD)
- Strategy: path-heuristic
- Changes: 2 files (src/pages/search-results.page.ts)
- Full suite: 87 tests
- Affected: 12 tests
- Safety net: not triggered

## Estimated savings
- Full run: ~6 min → affected only: ~50s (86% saved)

## What to run this time
BROWSER_CHANNEL=chrome npx playwright test (the .features-gen specs corresponding to testcases/search/*, 12 tests)
```

## Safety guardrails

- ✅ TIA only speeds up PRs; main / release run the full suite
- ✅ Changes to config / lockfile / playwright.config.ts → full run
- ✅ smoke T0 is always included
- ✅ Flaky quarantine tests are excluded
- ❌ path-heuristic errs toward over-running rather than under-running (better to over-run than miss a test)
