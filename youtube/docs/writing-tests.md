# Writing Tests

| [← Architecture](architecture.md) |    [Running Tests →](running-tests.md) |
| :-------------------------------- | -------------------------------------: |
| Step 2: layer roles & design principles | Step 4: local, Docker, CI ways to run |

**Step 3 / 5**

---

## Concept: the full flow of a BDD test

A BDD test consists of three parts, **all of which are required**:

```
feature file (scenario) → step definitions (bridge) → Page Object (UI operations)
```

> [!IMPORTANT]
> **feature files are not written in this repo.**
> BDD Scenarios are authored by QA in the QA workflow, and after validation are merged into the main library `testcases/`.
> `youtube/` is only responsible for implementing step definitions and Page Objects.

**The flow for adding an automated test in youtube:**

Prerequisite: the corresponding Scenario has been merged into the main library `testcases/` (automation only reads the main library), and it is already tagged `@auto` (see "Automation scope: `@auto`" below).

**Recommended main path: orchestrate with the `/auto-playwright-agentic-automation-workflow` skill**—planner runs live to produce the evidence map → feasibility gate →
generator writes step + POM from the evidence map → verify → (only if it fails) healer. For the full flow, the three agents, and the evidence map format, see
**[Agentic Automation Flow](agentic-automation.md)**.

**The rest of this doc covers the manual path** (what you do yourself when not using the skill, which is also what the generator above actually does)—how to write each layer, naming,
selector sources, and conventions:

1. In `youtube/`, run `npx bddgen` — confirm which steps are not yet implemented
2. In `tests/ui/`, fill in the step definition
3. In `src/pages/`, add the missing Page Object method (or composite method)

### Automation scope: `@auto`

`playwright.config.ts`'s `defineBddConfig` sets `tags: "@auto"`—**Scenarios not tagged `@auto` do not generate a spec**, equivalent to an automatic skip:

- CI filtering by any tag subset (e.g. `--grep @search-results`) will only reach `@auto` Scenarios,
  so there is no need to maintain a separate exclusion tag like `@skip`
- The fixme list after bddgen = the real to-do of "tagged `@auto` but step not yet implemented";
  to move a Scenario in/out of automation scope, just add/remove this one `@auto` switch on the main library feature file
- (Advanced) to temporarily generate a different tag only, set `TAG=xxx`—`config` will override with `@${TAG}`

---

## Example: adding the "apply search filter" automation implementation

The following is taken from the main library `testcases/search-filters.feature` (an actual entry):

```gherkin
# testcases/search-filters.feature (main library, not in this repo)

@search-results @regression @auto @apply-video-type
Scenario: Results remain after applying the video-type filter
  Given I am on the results page for the search "playwright"
  When I open the search filters
  And I apply the filter "Videos"
  Then I should see video search results
```

---

### Step 1: run bddgen to confirm which steps are missing

```bash
npx bddgen
```

bddgen reads the main library `testcases/` and generates the spec files in `tests/.features-gen/` (containing only Scenarios tagged `@auto`), while listing which steps have no corresponding step definition.

> Before adding a new step, check whether an existing step has a synonym (`npx bddgen export` lists all registered steps).
> Rewriting into an existing wording is preferred over creating a new step.

---

### Step 2: fill in the missing steps in the step file

```typescript
// tests/ui/search-results.steps.ts

Given("I am on the results page for the search {string}", async ({ searchResultsPage }, query) => {
  await searchResultsPage.goto(query);
});

When("I open the search filters", async ({ searchResultsPage }) => {
  await searchResultsPage.openFilters();
});

When("I apply the filter {string}", async ({ searchResultsPage }, name) => {
  await searchResultsPage.applyFilter(name);
});

Then("I should see video search results", async ({ searchResultsPage }) => {
  await searchResultsPage.assertHasResults();
});
```

---

### Step 3: confirm the Page Object has the corresponding method

`SearchResultsPage` already has `goto()`, `openFilters()`, `applyFilter()`, `assertHasResults()` (see `src/pages/search-results.page.ts`).

If it doesn't exist, add it to the Page Object:

```typescript
// src/pages/search-results.page.ts
private readonly filterSection = (name: string) =>
  this.filterDialog().getByRole("heading", { level: 4, name });

async assertFilterSectionVisible(name: string): Promise<void> {
  await expect(this.filterSection(name)).toBeVisible();
}
```

---

## Where locators come from: run the browser live first (live-probe)

**Principle: selectors always come from running the real DOM live.** YouTube is an external site with no source code to inspect, so selectors can only be extracted from the actual page.
Before implementing a step / POM for the first time, walk through the flow in the browser once following the scenario.

> On the `/auto-playwright-agentic-automation-workflow` main path, this live exploration is done automatically by the `playwright-test-planner` agent
> via Playwright MCP and captured into an evidence map (`evidence/{path}.md`); the generator implements directly from the
> locators in the evidence map. The playwright-cli below is a **manual fallback**—use it only when you are not using the skill and exploring yourself.

**Selector priority** (how to choose once you have the DOM):

1. `getByRole` / `getByLabel` (buttons, links, headings, etc. with a clear role + visible name)—the first choice on YouTube
2. `getByText` (only where copy is stable; note YouTube has i18n / regional differences)
3. **Forbidden**: structural CSS (`nth-child`, long class chains), XPath—the root of flakiness

> **YouTube has no `data-testid`**: a typical web project would prefer `data-testid`, but YouTube is an external site and we cannot ask dev to add testids, so all existing Pages use `getByRole` / `getByText`. Examples: video title `getByRole("heading", { level: 1 })`, subscribe button `getByRole("button", { name: "Subscribe", exact: true })`, filter panel `getByRole("dialog")`. A few stable structural selectors (e.g. video link `a[href*="/watch?v="]`) are acceptable when no semantic role is available, but use them cautiously.

### Manual fallback tool: playwright-cli (saves tokens, session persistent)

`@playwright/cli` is already a devDependency. A typical exploration flow (guest state, no storageState attached):

```bash
npx playwright-cli open                              # open the browser (daemon persistent)
npx playwright-cli goto https://www.youtube.com/...  # go to the target page
npx playwright-cli snapshot                          # aria tree + element refs (e5, e21...)
npx playwright-cli click e5                          # operate by ref
npx playwright-cli close
```

- YouTube tests are all **guest state**: open a fresh session, no `state-load` needed
- `snapshot` a page state only once; prefer snapshot over screenshots
- Full commands: `npx playwright-cli --help`

---

## Adding a Page Object

When you need to support a new page or feature:

```typescript
// src/pages/new-thing.page.ts
import { type Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class NewThingPage extends BasePage {
  // 1. selector declaration area at the top, centrally managed (obtained via live-probe, prefer getByRole)
  private readonly someElement = () =>
    this.page.getByRole("button", { name: "Do it" });

  constructor(page: Page) {
    super(page);
  }

  // 2. navigation method: enter page + wait for the key element to be visible
  async goto(): Promise<void> {
    await this.page.goto("/some-path");
    await expect(this.someElement()).toBeVisible();
  }

  // 3. method names use business language, not UI language
  // ✅ async assertResultVisible()   ❌ async clickSubmitButton()
  async doSomething(): Promise<void> {
    await this.someElement().click();
  }
}
```

Wait strategy red line: forbid `page.waitForTimeout(ms)`; use auto-wait / `waitForURL` (see the Wait strategy table in [architecture.md](architecture.md)).

After adding, you need to:

1. Add the fixture in the corresponding `src/fixtures/{domain}.fixtures.ts` (do not touch `test.fixtures.ts`)
2. It can then be used inside `createBdd(test)` in whichever step file needs it

---

## Adding a Fixture

For each new Page Object, add it to the **fixture file of the corresponding domain** (do not touch `test.fixtures.ts`):

```typescript
// src/fixtures/watch.fixtures.ts (example: watch domain)

import { test as base } from "playwright-bdd";
import type { Page } from "@playwright/test";
import { WatchPage } from "../pages/watch.page";

type WatchFixtures = {
  watchPage: WatchPage;
};

export const watchTest = base.extend<WatchFixtures>({
  watchPage: async ({ page }: { page: Page }, use) => {
    await use(new WatchPage(page));
  },
});
```

When adding a brand-new domain, create `src/fixtures/{domain}.fixtures.ts`, then import it in `test.fixtures.ts` and add it to `mergeTests()`.

---

## Step Definition sharing and Background

### Can steps be shared across features?

**Yes, and they should be designed this way.** All step definitions in `tests/ui/` are global; any feature can use them. The same business step should be defined only once:

```
tests/ui/
├── home.steps.ts            # Home: open home, top bar/nav/Sign in visible, search
├── search-results.steps.ts  # Search results page: results assertion, open filters, apply filter
├── watch.steps.ts           # Watch page: open video, title/player/interaction-button assertions
└── channel.steps.ts         # Channel page: open channel, name/subscriber-count/tab assertions
```

Cross-feature sharing: e.g. `I should see video search results` is used by both `search.feature` and `search-filters.feature`, and is defined only once.

---

### When does a Given go into Background?

There is only one criterion: **whether this Given step is commonly needed by 100% of the Scenarios in this feature file.**

| Situation                                    | Approach                       |
| -------------------------------------------- | ------------------------------ |
| All Scenarios in this file need the same Given | ✅ Put it in `Background:`    |
| Only some Scenarios need it                  | ❌ Write the Given per-Scenario |

```gherkin
# ✅ Background used correctly: all Scenarios in this feature start from the same video
Background:
  Given I open the watch page for video "jydYq7oAtD8"

# ❌ Background used incorrectly: not all Scenarios need it (over-sharing)
Background:
  Given I open the YouTube home page   # only search-type Scenarios need it, should not be in Background
```

**Practical judgment**: only consider moving a Given into Background if you find it repeated in every Scenario of the same feature.

> **Guest state**: YouTube tests do not log in, so there is no step like "Given I am logged in"; `search.feature` even has a scenario dedicated to testing the guest home Sign in entry.

---

## BDD declarative principle (important)

A step describes **user intent**, not UI operations:

```gherkin
# ✅ Declarative (correct)
When I open the search filters

# ❌ Imperative (forbidden)
When I click the "Search filters" button
And I wait for the filter panel to appear
```

**How to judge**: if a business action needs multiple steps to express, add a composite method to the Page Object (e.g. `applyFilter()` internally does "click option + wait for URL to carry sp param"), rather than expanding it in the feature.

`And` can be used, but each step must still be declarative (a business condition or intent), not a UI operation.

---

## Tag usage rules

feature file tag rules are owned by the QA workflow (page tags, test-level tags, scenario tags). What the automation side needs to know are the **workflow key tags**:

| Tag           | Workflow meaning                                                          |
| ------------- | ------------------------------------------------------------------------ |
| `@auto`       | The single switch for entering/leaving automation scope; without it no spec is generated |
| `@smoke`      | Core happy path, the first verification point after deployment, keep the count small     |
| `@regression` | Must run in regression, added to almost all scenarios                    |
| `@quarantine` | Known flaky, temporarily quarantined: runs locally, auto-excluded in CI (`grepInvert`); must attach a ticket number |

Page tags (used by the current 4 features): `@home`, `@search-results`, `@watch`, `@channel`.

**When referencing a tag in code, always use the `Tags` constants in `src/data/tags.ts`, never write a bare string** (existing: `Tags.smoke`, `Tags.regression`, `Tags.search`, `Tags.watch`, `Tags.channel`, `Tags.quarantine`, etc.; see that file for the full list).

---

| [← Architecture](architecture.md) |    [Running Tests →](running-tests.md) |
| :-------------------------------- | -------------------------------------: |
| Step 2: layer roles & design principles | Step 4: local, Docker, CI ways to run |
