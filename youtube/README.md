# YouTube Automation

E2E automation testing framework for YouTube Web (guest / logged-out state).

**Tech Stack:** TypeScript · Playwright · playwright-bdd · Docker

---

## Newcomers start here

|    Step    | Doc                                              | What you'll learn                                                       |
| :--------: | ------------------------------------------------ | ----------------------------------------------------------------------- |
| **Step 1** | **[Getting Started](docs/getting-started.md)**   | Environment install, Docker setup, run your first test                  |
|   Step 2   | [Architecture](docs/architecture.md)             | Layer responsibilities, BDD declarative principle, why it's designed this way |
|   Step 3   | [Writing Tests](docs/writing-tests.md)           | How to write and the conventions for each layer of a new BDD test       |
|   ↳ Advanced | [Agentic Automation Flow](docs/agentic-automation.md) | The full flow for auto-filling implementation with the `/auto-playwright-agentic-automation-workflow` skill |
|   Step 4   | [Running Tests](docs/running-tests.md)           | All ways to run: local, Docker, CI                                      |
|   Step 5   | [Onboarding Checklist](docs/onboarding.md)       | Confirm you can contribute independently                                |

**[Start from Step 1 → Getting Started](docs/getting-started.md)**

> Experienced and just need the commands: jump straight to [Running Tests](docs/running-tests.md).

---

## Quick start (3 steps)

> Prerequisite: you are already inside the `Playwright-Web-Agentic-Engineering-Automation/` repo. `youtube/` is a subdirectory of it with its own `package.json`.

```bash
# 1. Enter the directory and install dependencies
cd youtube
npm install && npx playwright install chromium

# 2. Run the tests (guest state runs directly against www.youtube.com, no account / .env needed)
npm test
```

> If your machine cannot download the Playwright bundled Chromium, use system Chrome instead:
> `BROWSER_CHANNEL=chrome npx playwright test --project=ui`

---

## Directory structure

> **feature files are not in this repo**: the single source of truth for BDD `.feature` files is the Playwright-Web-Agentic-Engineering-Automation main testcases library `../testcases/`,
> which `playwright.config.ts` reads directly (only `@auto` scenarios are used to generate specs).

```
youtube/
├── src/
│   ├── api/base/          # ApiClient base (HTTP wrapper; no domain client yet)
│   ├── components/        # BaseComponent (reusable UI component base)
│   ├── data/              # tags (test tag constants)
│   ├── errors/            # Custom Error classes
│   ├── fixtures/          # Playwright fixtures (Page object injection; modular)
│   ├── pages/             # Page Object Model
│   └── utils/             # logger, string, element-wait
├── tests/
│   ├── ui/                # BDD step definitions (*.steps.ts)
│   ├── seed.spec.ts       # MCP exploration start page (home page), for planner/generator agent
│   └── .features-gen/     # bddgen-generated specs (gitignored, do not edit by hand)
├── config/
│   └── test.config.ts     # Environment settings (URL, timeout, retry, etc.)
├── Dockerfile
├── docker-compose.yml
└── playwright.config.ts
```

---

## Common commands

```bash
npm test                        # Run all tests
npm run test:ui                 # Run BDD UI tests only
npm run test:smoke              # Run @smoke only
npm run test:regression         # Run @regression only
npm run test:search             # Run @search-results only
npm run test:watch              # Run @watch only
npm run test:channel            # Run @channel only
ENV=prod npm test               # Specify environment (dev / sit / prod, all point to youtube.com)
BROWSER=webkit DEVICE="iPhone 14" npm run test:ui   # Specify engine / device (mobile view)
docker compose run --rm test    # Run with Docker
npm run report                  # Open HTML report (smart-report.html)
```

---

## Environment mapping

YouTube is an external production site with no multiple environments; all three `ENV` values point to the same web site, and `api` points to the YouTube Data API v3.

| ENV             | Web                     | API                                       |
| --------------- | ----------------------- | ----------------------------------------- |
| `dev`           | https://www.youtube.com | https://www.googleapis.com/youtube/v3     |
| `sit` (default) | https://www.youtube.com | https://www.googleapis.com/youtube/v3     |
| `prod`          | https://www.youtube.com | https://www.googleapis.com/youtube/v3     |
