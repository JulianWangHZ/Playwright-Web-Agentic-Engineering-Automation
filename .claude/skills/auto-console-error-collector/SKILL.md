---
name: auto-console-error-collector
description: Console error interception techniques during YouTube testing — use a Playwright fixture to collect console errors/warnings, uncaught exceptions, and unhandled promise rejections, with classification + severity grading + a known-errors allowlist, giving every E2E an extra layer of JS error protection for free. Triggers when the user mentions "console error, JS error, uncaught exception, uncaught, unhandled rejection, page error, frontend error, capture console, error interception, error monitoring" and needs to implement it on YouTube. Adapted from Pramod/console-error-hunter, aligned with the layering and red lines in youtube-automation.md.
argument-hint: "<empty=create/review console fixture>"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# console-error-collector

**Incidentally intercept console errors** for YouTube E2E. Core value: zero intrusion — once a fixture is attached, every existing UI test gets an extra layer of protection for free, surfacing the silent bugs where "the page actually threw a JS exception but no test asserted on it".

**Working directory is fixed at `youtube/`.** This skill creates a fixture shared across tests; it does not modify any `.feature` file and does not change business assertions. Follow `.claude/rules/youtube-automation.md` throughout.

---

## Red-line alignment (conflicts resolved during adaptation)

| Original skill approach | Adapted for this project |
|---|---|
| Bundled fixture framework | goes in `src/fixtures/console.fixtures.ts`, merged into `test.fixtures.ts` via `mergeTests()` (youtube-automation.md §7) |
| Writing the fixture in `test.fixtures.ts` | **forbidden** — `test.fixtures.ts` only does merging (§7 red line) |
| Reporting output via `console.*` | use `createLogger` (§11); JSON report hooks into the existing `playwright-smart-reporter` |
| Raw error objects leaking into assertions | expose only clean types externally (encapsulate internal details) |

- The fixture listens to `page.on('console')` + `page.on('pageerror')`, storing message / category / severity / timestamp / source file location.
- **Console errors do not fail the test by default** — first "collect + report", and let the user decide whether to upgrade critical pages to hard assertions (avoiding a flood of legacy warnings blocking CI on day one).

## Error classification and severity

| category | example | default severity |
|---|---|---|
| uncaught_exception | `Uncaught TypeError` | critical |
| unhandled_rejection | promise not caught | critical |
| network_failure | console errors corresponding to 4xx/5xx | high |
| cors / csp | cross-origin / CSP violation | high |
| react_error | React warning / missing key | medium |
| third_party | third-party script noise | low |
| unknown | unclassified | info |

## Known-errors allowlist

Maintain a list of benign message patterns (e.g. `ResizeObserver loop limit`, DevTools hints), **with an optional expiry date** to force periodic re-review and prevent the allowlist from growing unbounded and masking real problems.

- Goes in `src/data/known-console-errors.ts` (centralized as constants, mirroring `tags.ts`).

## Placement and shape of artifacts

| Artifact | Location | Description |
|---|---|---|
| collector fixture | `src/fixtures/console.fixtures.ts` | listens to console/pageerror, provides `getCriticalErrors()` / `getByCategory()` / `formatReport()` |
| clean error types | `src/errors/console.types.ts` | `ClassifiedError` (message/category/severity/timestamp/source/step); this project has no types layer, so types go in the existing `src/errors/` |
| allowlist | `src/data/known-console-errors.ts` | pattern + optional expiry date |
| merge point | `src/fixtures/test.fixtures.ts` | add just one `mergeTests(...)` line, do not write the fixture body |
| report | hooks into `src/reporters/playwright-smart-reporter.ts` | attach a console error summary on failure, do not build a separate reporter |

## Workflow

1. Read `.claude/rules/youtube-automation.md` (§6 Raw/Clean, §7 fixtures, §11 logging).
2. Create `src/errors/console.types.ts` (clean types) + `src/data/known-console-errors.ts` (allowlist).
3. Create `console.fixtures.ts` (listen + classify + allowlist filtering + report).
4. Add the console fixture to the `mergeTests()` in `test.fixtures.ts` (**only add the merge, do not write the fixture**).
5. Verify:

```bash
cd youtube
npx bddgen                                        # confirm step types are correct after the fixture is merged in
npx playwright test <any existing UI spec subset>        # observe that console errors are collected/reported
npm run check                                      # tsc + prettier + eslint, must pass
```

> ⚠️ After changing a step's fixture dependencies (adding a destructured fixture), you must re-run `bddgen`, otherwise it will be undefined at runtime. If you only attach global collection and the step does not destructure the new fixture, this issue does not apply.

## Guardrails

- A reliably reproducible critical console error collected → go through `/tool-open-qa-bug` to file a ticket; do not stuff it into the allowlist to mask it.
- Only put **confirmed benign** noise in the allowlist; give each entry an expiry date where possible and re-review periodically.
- Do not fail tests by default; when upgrading a critical page to a hard assertion, add it individually and explicitly, not with a global blanket rule that blocks CI.
- Do not commit / push (unless the user explicitly requests it).
