# Architecture

| [← Getting Started](getting-started.md) |         [Writing Tests →](writing-tests.md) |
| :-------------------------------------- | ------------------------------------------: |
| Step 1: install & first run             | Step 3: feature → step → Page Object        |

**Step 2 / 5**

---

> [!IMPORTANT]
> **`youtube/` has no feature files of its own.**
> BDD cases are managed centrally by the Playwright-Web-Agentic-Engineering-Automation main testcases library (`testcases/`), which `playwright.config.ts` reads directly; no local copy is made.
> To add or modify a BDD case, follow the QA workflow—**do not create `.feature` files in this directory**.

---

## Design philosophy

This framework is built around three core principles:

1. **BDD declarative**: feature files describe business intent (WHAT), not UI operations (HOW)
2. **Layer separation**: each layer only does its own job, with no cross-layer coupling
3. **Centralized feature management**: the single source of truth for BDD cases is `testcases/`; the automation framework only consumes feature files, it does not own them

> YouTube is an external site; tests run in **guest state** directly against www.youtube.com—no login setup, no storageState, no test data seeding.

---

## Layer diagram

### Code layering

```
  ../testcases/**/*.feature
  (main library — single source of truth, read-only for automation)
        │
        │ npx bddgen: only @auto scenarios are generated;
        │ scenarios with unimplemented steps are marked fixme and skipped (missingSteps: skip-scenario)
┌──────────────────────▼──────────────────┐
│   tests/.features-gen/*.spec.js         │  ← generated artifact (gitignored, do not edit by hand)
└──────────────┬──────────────────────────┘
               │ maps to (hand-written)
┌──────────────▼──────────────────────────┐
│         tests/ui/*.steps.ts             │  ← business language → code bridge (includes assertions)
│  Given("I open the watch page for video {string}") │
└──────────────┬──────────────────────────┘
               │ calls (injected via fixture)
┌──────────────▼──────────────────────────┐
│           src/pages/*.ts                │  ← Page Object (encapsulates UI operations)
│  WatchPage.goto(videoId)                │
│    → go to /watch?v=... → wait for title │
│  WatchPage.assertLikeShareVisible()     │
└──────┬───────────────┬──────────────────┘
       │ uses          │ uses
┌──────▼────────────┐ ┌▼─────────────────────────────┐
│ src/components/   │ │ src/utils/                   │
│ BaseComponent     │ │ logger · string ·            │
│ (reusable base)   │ │ element-wait                 │
└───────────────────┘ └──────────────────────────────┘
```

> `src/api/base/ApiClient.ts` is a generic HTTP wrapper base; no domain API client currently uses it—it is kept as an extension point should we later call the YouTube Data API. The current BDD tests do not go through it.

### Project execution flow

There is only one project:

```
ui     BDD UI tests (consumes tests/.features-gen; engine/device determined by BROWSER / DEVICE)
```

There is no setup / teardown / api project—guest state needs no login prerequisite or data seeding. `tests/seed.spec.ts` is not a project but the exploration start page for Playwright MCP's `planner_setup_page` / `generator_setup_page` (see [Agentic Automation Flow](agentic-automation.md)).

---

## Layer responsibilities

### feature files — business scenarios (Gherkin, main library read-only)

**youtube does not maintain a local feature copy.** `playwright.config.ts` reads the Playwright-Web-Agentic-Engineering-Automation main library directly, **and only reads this layer**:

| Source                      | Purpose                             |
| --------------------------- | ----------------------------------- |
| `../testcases/**/*.feature` | Stable main library (single source of truth) |

Existing features (4 total):

| feature file                   | Scenarios covered                                                    |
| ------------------------------ | ------------------------------------------------------------------- |
| `search.feature`               | Home-page keyword search leading to results page, guest home top bar/nav |
| `watch.feature`                | Watch page title/player, interaction buttons (subscribe/like/share)  |
| `channel.feature`              | Channel page info (name/subscriber count/subscribe button), content tabs |
| `search-filters.feature`       | Search filter panel categories, apply video-type filter              |

This eliminates drift: after testcases/ is updated, changes take effect automatically with no manual sync needed.

**`@auto` is the single switch for entering/leaving automation scope** (`defineBddConfig`'s `tags: "@auto"`, overridable via the `TAG` environment variable):

- Scenarios not tagged `@auto` do not generate a spec; no `--grep` can reach them
- Scenarios tagged `@auto` but with steps not yet implemented → `missingSteps: "skip-scenario"` marks them fixme and skips them, without blocking other tests
- On failure, the report attaches a Fix with AI prompt (`aiFix.promptAttachment`)

feature files describe only **business behavior**, not UI operation details:

```gherkin
# ✅ Declarative: describes intent
Given I open the watch page for video "jydYq7oAtD8"

# ❌ Imperative: describes operations (forbidden)
When I open the browser and enter the URL "/watch?v=jydYq7oAtD8"
And I wait for the title to load
```

Feeling like multiple imperative steps are needed to complete one business action → **that is a signal the Page Object needs a composite method**, not something to expand as detail in the feature.

---

### `tests/ui/*.steps.ts` — Step Definitions

**Sole responsibility**: turn Gherkin steps into calls on Page Objects.

- Do not operate `page` directly
- Do not write selectors
- Do not write logic beyond assertions

```typescript
// ✅ Correct: call a Page Object method
Given("I open the watch page for video {string}", async ({ watchPage }, videoId) => {
  await watchPage.goto(videoId);
});

// ❌ Wrong: operate page directly
Given("I open the watch page for video {string}", async ({ page }, videoId) => {
  await page.goto(`/watch?v=${videoId}`); // a step should not be written this way
});
```

---

### `src/pages/` — Page Object Model

**Responsibility**: encapsulate all UI operation logic.

- selectors are defined in the "selector declaration area" at the top of the Page (centralized editing), returning locators via getter functions
- provide business-semantic method names (`goto()`, `openFilters()`, `assertLikeShareVisible()`)
- **Composite method**: combine multiple UI steps into a single business action

```typescript
// SearchResultsPage — composite: apply filter = click option + wait for URL to carry sp param
async applyFilter(name: string): Promise<void> {
  await this.filterOption(name).click();
  await this.page.waitForURL(/[?&]sp=/);
}
```

**Naming and directory conventions**

| Item        | Rule                            | Current state                                |
| ----------- | ------------------------------- | -------------------------------------------- |
| Class name  | `{PascalCase}Page`              | `WatchPage`, `SearchResultsPage`, etc.       |
| File name   | `{kebab-case}.page.ts`          | `watch.page.ts`, `search-results.page.ts`, etc. |
| Directory   | split into subdirectories by domain as pages grow | currently flat: `src/pages/*.ts`          |

Existing Pages: `BasePage` (base), `home.page.ts`, `search-results.page.ts`, `watch.page.ts`, `channel.page.ts`.

> **Selector reality**: YouTube is an external site with no `data-testid` we control. So selectors always use semantic queries (`getByRole` / `getByText` / `getByLabel`), e.g. `getByRole("heading", { level: 1 })` for the video title and `getByRole("button", { name: "Subscribe", exact: true })` for the subscribe button. `playwright.config.ts`'s `testIdAttribute` being set to `data-test-id` is only a default and is not used in practice.

**Wait strategy**

Playwright has built-in auto-wait for most operations; choose the correct waiting method by the following rules:

| Scenario              | How to use                          | Note                                       |
| --------------------- | ----------------------------------- | ------------------------------------------ |
| Assert UI state       | `expect(locator).toBeVisible()`     | Playwright auto-wait, most common          |
| After navigating to a new page | `page.waitForURL(pattern)` | Confirm the URL has transitioned before proceeding |
| **Forbidden**         | `page.waitForTimeout(ms)`           | Arbitrary sleep is the root of flaky tests |

```typescript
// ✅ Wait for URL to stabilize after navigation (YouTube adds an sp param after applying a filter)
await this.filterOption(name).click();
await this.page.waitForURL(/[?&]sp=/);

// ✅ Wait for the key element to be visible after entering the page before proceeding
await this.page.goto(`/watch?v=${videoId}`);
await expect(this.videoTitle()).toBeVisible();

// ❌ Forbidden
await this.page.waitForTimeout(2000);
```

---

### `src/components/` — reusable UI components

**Responsibility**: encapsulate UI blocks shared across pages.

- always extend `BaseComponent` (constructor only takes `Page`), do not depend on other Page Objects
- do not couple to test infra (do not touch `testInfo`)

Current state: only the base `BaseComponent` exists, no concrete components yet—extract them when a cross-page shared block appears.

---

### `src/fixtures/` — Playwright Fixtures

**Responsibility**: dependency injection. A test only declares what it needs (`watchPage`); it does not need to `new` anything itself.

```typescript
// step auto-injects watchPage
Given("I open the watch page for video {string}", async ({ watchPage }, videoId) => { ... });
```

**Modular fixture structure** (prevents a God File):

```
src/fixtures/
├── home.fixtures.ts            # HomePage
├── search-results.fixtures.ts  # SearchResultsPage
├── watch.fixtures.ts           # WatchPage
├── channel.fixtures.ts         # ChannelPage
└── test.fixtures.ts            # mergeTests() entry, only merges, defines no fixture
```

`test.fixtures.ts` is only responsible for merging; all fixtures are defined in the per-domain files:

```typescript
// src/fixtures/test.fixtures.ts
export const test = mergeTests(
  homeTest,
  searchResultsTest,
  watchTest,
  channelTest,
);
export { expect } from "@playwright/test";
```

When adding a page: add the fixture in `{domain}.fixtures.ts`, do not touch `test.fixtures.ts`.
When adding a domain: create a new `{domain}.fixtures.ts`, import it, and add it to `mergeTests()`.

---

## Switching test environments

Select the target environment via the `ENV` environment variable. YouTube has no multiple environments; all three values point to the same site. This switch is kept for framework consistency and future extension.

| ENV             | Web                     | API                                   |
| --------------- | ----------------------- | ------------------------------------- |
| `dev`           | https://www.youtube.com | https://www.googleapis.com/youtube/v3 |
| `sit` (default) | https://www.youtube.com | https://www.googleapis.com/youtube/v3 |
| `prod`          | https://www.youtube.com | https://www.googleapis.com/youtube/v3 |

```bash
ENV=prod npm test
```

---

## Switching browser engine and device

Engine and device use environment variables, with a **single parameter source, and the `ui` project follows as one unit**; device presets are not hard-coded in the project. The convention in one line: **use `--flag` to select a test subset, use uppercase environment variables to change the execution environment**—this is also Playwright's officially recommended pattern for custom parameters (config reads `process.env`):

| Environment variable | Value                                              | Default                        |
| -------------------- | -------------------------------------------------- | ------------------------------ |
| `BROWSER`            | `chromium` / `webkit` / `firefox`                  | `chromium`                     |
| `DEVICE`             | any Playwright devices key (e.g. `"iPhone 14"`)    | the engine's desktop preset    |
| `BROWSER_CHANNEL`    | `chrome` (use system Chrome, only for chromium)    | unset                          |

Design points:

- **Engine and size decoupled**: does not use the device preset's `defaultBrowserType`; `browserName` is always determined by `BROWSER`, so any size can pair with any engine (e.g. webkit + iPhone 14 ≒ Mobile Safari)
- **When `DEVICE` is not specified**, use the engine's desktop preset (Desktop Chrome / Safari / Firefox), ensuring the UA matches the engine
- **firefox exception**: Playwright's firefox does not support `isMobile` emulation; config automatically removes it from the preset—when running mobile devices you only get viewport + mobile UA, no touch
- **Parameter guardrail**: a mistyped `BROWSER` / `DEVICE` throws directly and lists the available values, with no silent fallback
- **System Chrome fallback**: when the machine cannot download bundled Chromium, set `BROWSER_CHANNEL=chrome` to use system Chrome (only effective with the chromium engine)
- Common sizes are wrapped as `npm run test:mobile` / `test:tablet`

For example run commands see [running-tests.md](running-tests.md).

---

## Logging format

The logger supports two output modes, chosen automatically by environment:

| Condition                       | Format                     | Purpose                 |
| ------------------------------- | -------------------------- | ----------------------- |
| Local (default)                 | Human-readable + ANSI color | Quick to read while developing |
| `CI=true` or `LOG_FORMAT=json`  | NDJSON (one JSON per line) | Machine parsing, feed monitoring |

Fields are fixed (`timestamp / level / context / message`), with `data` and `error` optional, making it easy for Datadog / CloudWatch / ELK to filter and alert on `level` and `context`.

To force JSON locally (e.g. to test the log pipeline):

```bash
LOG_FORMAT=json npm test
```

---

## Report: playwright-smart-reporter

The default reporter is `playwright-smart-reporter`, which produces:

- `smart-report.html`: a self-contained HTML report (screenshots, failure clustering, historical trends), titled "Playwright Web E2E Reporter"
- `test-history.json`: history record (keeps the last 10 runs, for the trend chart)

In CI mode it additionally outputs `test-results/junit.xml` and `test-results/results.json`.

Screenshots and traces follow Playwright's official config (`screenshot: "only-on-failure"` + `trace: "retain-on-failure"`, see `use` in `playwright.config.ts`): none kept on pass, kept only on failure. Failure screens and traces are embedded and presented by `playwright-smart-reporter`; no custom step-by-step screenshot hook is written.

---

## Test Quarantine mechanism

Known flaky tests should not turn CI red, but they must not simply be deleted either—the problem is still there. The approach:

1. Add a `@quarantine` tag to the Scenario in the `.feature` file (the scenario itself must still have `@auto`, otherwise it won't be generated at all)
2. Attach a ticket number explaining the reason
3. It still runs locally (so you can debug); the CI `ui` project skips it automatically (`grepInvert: /@quarantine/`)

```gherkin
# Instability reason: remove after confirmation
@watch @regression @auto @quarantine
Scenario: Interaction buttons intermittently do not show on certain videos
  ...
```

**Usage rules**:

- `@quarantine` must always have a ticket tracking the root cause
- Remove the tag immediately after fixing; do not leave it long-term
- Audit the `@quarantine` count once per Sprint; more than 5 is treated as a quality signal

---

| [← Getting Started](getting-started.md) |         [Writing Tests →](writing-tests.md) |
| :-------------------------------------- | ------------------------------------------: |
| Step 1: install & first run             | Step 3: feature → step → Page Object        |
