# Running Tests

| [← Writing Tests](writing-tests.md) | [Onboarding Checklist →](onboarding.md) |
| :---------------------------------- | --------------------------------------: |
| Step 3: feature → step → Page Object |               Step 5: confirm you can contribute independently |

**Step 4 / 5**

---

## Local run

### Basic commands

```bash
# All tests (= bddgen + playwright test)
npm test

# Run everything with the browser shown (debug)
npm run test:headed

# Run BDD UI tests only (--project=ui)
npm run test:ui

# Run smoke only (quick environment check)
npm run test:smoke

# Run regression only
npm run test:regression

# Run by page
npm run test:search    # --grep @search-results
npm run test:watch     # --grep @watch
npm run test:channel   # --grep @channel

# Pre-commit check (type-check + format:check + lint)
npm run check
```

> **`@auto` prerequisite**: bddgen only generates specs for scenarios in the main library tagged `@auto`,
> so any `--grep` filters within the `@auto` subset—a scenario not tagged `@auto` can't be reached no matter what tag you use.

### Switching environment

YouTube has no multiple environments; all three values point to www.youtube.com. The switch is kept for framework consistency:

```bash
ENV=sit npm test     # default
ENV=prod npm test
```

### Switching browser and device

Engine and device are determined by environment variables and the `ui` project follows as one unit; the default is chromium desktop:

```bash
# Engine: chromium (default) / webkit / firefox
BROWSER=webkit npm test

# Device emulation: any Playwright devices key, freely combinable with BROWSER
DEVICE="iPhone 14" npx playwright test --project=ui --grep @watch --workers=2
BROWSER=webkit DEVICE="iPhone 14" npx playwright test --project=ui

# npm shortcuts for common sizes (equivalent to the DEVICE forms above)
npm run test:mobile   # DEVICE="iPhone 14" (width 390)
npm run test:tablet   # DEVICE="iPad (gen 7)" (width 810)

# When the machine can't download bundled Chromium, use system Chrome (chromium only)
BROWSER_CHANNEL=chrome npx playwright test --project=ui
```

> There is only one convention: **use `--flag` to select a test subset (`--project` / `--grep` / `--workers`),
> use uppercase environment variables to change the execution environment (`ENV` / `BROWSER` / `DEVICE` / `HEADLESS` / `BROWSER_CHANNEL`)**.

- When `DEVICE` is not specified, use the engine's desktop preset (Desktop Chrome / Safari / Firefox), so the UA matches the engine
- firefox does not support `isMobile` emulation (config removes it automatically): when running mobile devices you only get viewport + mobile UA, no touch emulation
- `BROWSER_CHANNEL=chrome` is only effective with chromium
- webkit / firefox require `npx playwright install webkit firefox` on first use
- To run multiple engines, run them in separate passes (`BROWSER=webkit npm run test:ui` × N)

### Debug mode

```bash
# Show the browser (see the actual operations)
HEADLESS=false npm test

# Run a single feature file only
npx bddgen && npx playwright test --grep "watch"

# See more log
LOG_LEVEL=debug npm test
```

### View the test report

```bash
npm run report
# Opens smart-report.html (produced by playwright-smart-reporter)
```

---

## Docker run

Use this when you don't want to install Node.js / Playwright locally; suited for CI/CD or quick verification:

```bash
docker compose run --rm test

# Specify environment
docker compose run --rm test sh -c "ENV=prod npm test"

# Run smoke only
docker compose run --rm test npm run test:smoke
```

Test results (HTML report + screenshots) are output to the local `smart-report.html` and `test-results/`.

### Rebuild the image (when dependencies change)

```bash
docker compose build
```

---

## CI (GitHub Actions)

CI runs with `CI=true`; in this case the reporter additionally outputs `test-results/junit.xml` and `test-results/results.json`, and the `ui` project automatically excludes `@quarantine` (`grepInvert: /@quarantine/`).

Common CI scripts:

```bash
npm run test:ci          # CI=true PARALLEL_WORKERS=8 npm test (full)
npm run test:ci:smoke    # CI=true, run only the @smoke happy-path
```

Guest-state tests need no secrets (no account / .env needed).

---

## Clean cache

```bash
npm run clean
# Deletes: test-results/ smart-report.html test-history.json tests/.features-gen/ .auth/
```

---

## Command Combination Cookbook

> [!IMPORTANT]
> **All commands must run in the `youtube/` directory** (run `cd youtube` first).
> Running `npx playwright` from the Playwright-Web-Agentic-Engineering-Automation root resolves to a different package and produces `error: unknown command 'test'`.

> [!IMPORTANT]
> **"Generate spec" and "run tests" are two independent actions and two different commands; don't conflate them:**
>
> ```bash
> npx bddgen            # Action 1 "generate spec": read main library .feature → produce tests/.features-gen/*.spec.js
> npx playwright test   # Action 2 "run tests": run the already-generated specs in tests/.features-gen/
> ```
>
> - `npx playwright test` runs the **already-generated files**; it does **not** regenerate automatically—if a feature changed but you didn't re-run `npx bddgen`, you run the **old spec**
> - When to re-run `npx bddgen`: the main library `.feature` changed, you just pulled code, or `--grep` doesn't select the scenario you expect
> - `npm test` / `npm run test:ui` and other scripts already chain "generate → run" into one; **when using bare `npx playwright test`, you must run `npx bddgen` yourself first**
> - To pass a flag after `npm run xxx`, you must add `--`, e.g. `npm run test:ui -- --workers=2`

The following examples all assume you have already run `npx bddgen` (the spec is up to date).

### Pick tests by scope

```bash
# Run a single page tag (the most common form of the UI subset)
npx playwright test --project=ui --grep @watch

# Run the union of multiple tags (OR)
npx playwright test --project=ui --grep "@search-results|@channel"

# Run the intersection of tags (AND, regex lookahead): smoke on the search results page
npx playwright test --project=ui --grep "(?=.*@search-results)(?=.*@smoke)"

# Run a single scenario (by title text, partial match supported)
npx playwright test --project=ui --grep "open the watch page shows title and player"

# Run a single feature file (points to the generated spec)
npx playwright test --project=ui tests/.features-gen/watch.feature.spec.js

# See which tests would run first (without executing) — a good friend when tuning grep conditions
npx playwright test --project=ui --grep @watch --list
```

### Compose the execution environment (environment variables × flag, freely combined)

```bash
# mobile view + throttle to 2 workers (a common combo for RWD verification)
DEVICE="iPhone 14" npx playwright test --project=ui --grep @search-results --workers=2

# Mobile Safari emulation (webkit engine + iPhone size)
BROWSER=webkit DEVICE="iPhone 14" npx playwright test --project=ui --grep @watch

# firefox desktop running smoke
BROWSER=firefox npx playwright test --project=ui --grep @smoke

# System Chrome + mobile + headed observation (single worker to see it clearly)
BROWSER_CHANNEL=chrome DEVICE="iPhone 14" HEADLESS=false npx playwright test --project=ui --grep @smoke --workers=1

# Rotate through three engines verifying the same subset (run in separate passes)
for b in chromium webkit firefox; do BROWSER=$b npx playwright test --project=ui --grep @watch; done
```

### Catch flaky / re-run

```bash
# Re-run only the previous round's failed tests
npx playwright test --project=ui --last-failed

# Run the same test 5 times to verify stability (when you suspect flaky)
npx playwright test --project=ui --grep "open the watch page shows title and player" --repeat-each=5

# Locally inspect quarantined @quarantine (CI excludes them automatically, but they run normally locally)
npx playwright test --project=ui --grep @quarantine

# Turn off retry to see the most authentic failure (default local 1 retry masks intermittent issues)
RETRY_COUNT=0 npx playwright test --project=ui --grep @watch
```

### Utilities

```bash
# List all registered step definitions (look up synonyms before writing a step)
npx bddgen export

# Debug mode (Playwright Inspector step-by-step execution)
HEADLESS=false npx playwright test --project=ui --grep "scenario name" --debug

# Keep the trace on failure (set TRACE_ON_FAILURE=true to trigger, replay later with the trace viewer)
TRACE_ON_FAILURE=true npx playwright test --project=ui --grep @watch
npx playwright show-trace test-results/**/trace.zip

# Generate a locator (browser recording, helps find selectors)
npx playwright codegen https://www.youtube.com
```

---

## Debug tools

When a test fails, choose the tool by severity:

### Level 1: Check the Report (fastest)

```bash
npm run report
```

smart-report.html provides: the failing step, screenshots, failure clustering, and historical trends. Failing cases also attach a trace (`retain-on-failure`), which can be replayed with `npx playwright show-trace`. Most problems can be seen right here.

### Level 2: Playwright Inspector (UI not as expected)

```bash
HEADLESS=false npx playwright test --project=ui --debug --grep "scenario name"
```

The browser opens and pauses at the first step, so you can execute step by step and inspect DOM state in real time.

### Level 3: Codegen (selector not found)

```bash
npx playwright codegen https://www.youtube.com
```

Operate the target UI in the browser, and Codegen auto-generates the corresponding locator. Copy it and paste into the Page Object.

### Level 4: Claude Code analysis (logic or architecture problem)

```bash
# Launch Claude Code in the Playwright-Web-Agentic-Engineering-Automation/ directory
claude

# Common prompts:
# "This test failed with the error below, help me find the cause: [paste error message]"
# "Help me add an assertCommentsVisible() method to WatchPage"
# "Does this step definition violate the declarative principle? [paste code]"
```

Claude Code can:

- Read the report results and analyze failure causes
- Generate a new Page Object method based on existing patterns in `src/pages/`
- Check whether a step conforms to declarative BDD principles
- Trace selectors that broke due to a YouTube redesign

### Level 5: Playwright MCP (complex interaction problems)

If a Playwright MCP server is installed, Claude Code can directly control the browser to screenshot, click, and read the DOM in real time, suited for selector exploration like "help me confirm the current role/name of the YouTube search filter panel".

> To **generate / add automation implementation for an existing `@auto` scenario**, use the `/auto-playwright-agentic-automation-workflow` skill:
> the planner agent runs live via Playwright MCP to produce an evidence map, and the generator writes step + POM from it.
> For the full flow see [Agentic Automation Flow](agentic-automation.md).

---

## Execution flow explanation

`npm test` actually does two things:

```
1. bddgen
   ../testcases/**/*.feature → tests/.features-gen/*.spec.js (only @auto, auto-generated)

2. playwright test (only one project)
   └── project: ui → tests/.features-gen/*.spec.js (BDD UI tests; engine/device use BROWSER / DEVICE)
```

Guest-state tests need no prerequisite project (no setup / login / data seeding). `tests/seed.spec.ts` is not in the project list; it is only used as an exploration start page by Playwright MCP's planner/generator agent (see [Agentic Automation Flow](agentic-automation.md)).

---

| [← Writing Tests](writing-tests.md) | [Onboarding Checklist →](onboarding.md) |
| :---------------------------------- | --------------------------------------: |
| Step 3: feature → step → Page Object |               Step 5: confirm you can contribute independently |
