# Getting Started

| [← README](../README.md) | [Architecture →](architecture.md) |
| :----------------------- | --------------------------------: |
| Back to overview         | Step 2: layer roles & design principles |

**Step 1 / 5**

> Prerequisite: you already have a local checkout of the `Playwright-Web-Agentic-Engineering-Automation` repo. `youtube/` is a subdirectory of it with its own `package.json`.

---

## Choose how to run

| Method             | Suited for                                   | Requires                          |
| ------------------ | -------------------------------------------- | --------------------------------- |
| **Local run**      | Daily development, debug, writing new tests  | Node.js 20+, Playwright browsers  |
| **Docker run**     | One-off verification, restoring the CI environment, not wanting to install Node | Docker Desktop  |

> Tests all run in **guest state**, directly against www.youtube.com—**no account, no `.env` needed**.

---

## Method 1: Local run

### Prerequisites

| Tool    | Version | Check     |
| ------- | ------- | --------- |
| Node.js | 20+     | `node -v` |
| npm     | 10+     | `npm -v`  |

**Installing Node.js:** [nvm](https://github.com/nvm-sh/nvm) is recommended (it can manage multiple versions)

```bash
nvm install 20
nvm use 20
```

Or download the LTS version directly from [nodejs.org](https://nodejs.org).

### Installation steps

```bash
# Enter the automation directory (starting from the Playwright-Web-Agentic-Engineering-Automation root)
cd youtube

# Install npm dependencies
npm install

# Install Playwright browsers (only needs to run once; Chromium is about 200MB)
npx playwright install chromium

# (Optional) only needed to run BROWSER=webkit / firefox
npx playwright install webkit firefox
```

> Playwright browsers are installed in the system cache (`~/.cache/ms-playwright`), not in `node_modules`.
> After updating the Playwright version, re-run this command.

> [!NOTE]
> **When you cannot download the bundled Chromium, use system Chrome instead.**
> Some local environments (corporate networks / proxies) cannot download Playwright's bundled Chromium. Use the system-installed Chrome instead:
>
> ```bash
> BROWSER_CHANNEL=chrome npx playwright test --project=ui
> ```
>
> `BROWSER_CHANNEL=chrome` is only effective with the chromium engine (webkit / firefox have no channel concept).

---

## Method 2: Docker run

### Prerequisites

**Docker Desktop** (includes Docker Engine + Docker Compose)

| Platform | Download                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| macOS    | [docs.docker.com/desktop/install/mac-install](https://docs.docker.com/desktop/install/mac-install/)         |
| Windows  | [docs.docker.com/desktop/install/windows-install](https://docs.docker.com/desktop/install/windows-install/) |
| Linux    | [docs.docker.com/desktop/install/linux-install](https://docs.docker.com/desktop/install/linux-install/)     |

After installing, confirm Docker is working:

```bash
docker --version        # Docker version 27.x.x or above
docker compose version  # Docker Compose version v2.x.x or above
docker run hello-world  # should print "Hello from Docker!"
```

> Docker Desktop must stay running (running in the background is fine).

### How to use

```bash
cd youtube
docker compose run --rm test
```

The first run pulls the official Playwright image (`mcr.microsoft.com/playwright:v1.58.2-noble`, about 1.6GB); subsequent runs use the cache.

**Docker's advantage:** browser version and OS environment are identical to CI, eliminating the "passes locally, fails in CI" problem.

---

## Environment variables (all optional)

Guest-state tests have no required environment variables. The following are all optional, used to override default behavior:

```env
# Environment target (default sit; all three values point to www.youtube.com)
ENV=sit                  # dev | sit | prod

# Browser display (default headless, set false when debugging)
HEADLESS=true

# Log verbosity (default info; debug shows operation details)
LOG_LEVEL=info

# Use system Chrome when bundled Chromium can't be downloaded (chromium only)
BROWSER_CHANNEL=chrome
```

When you need fixed values, put them in `.env` (`config/test.config.ts` loads them via dotenv), but usually just prefix the command with the environment variable.

---

## Run your first test

```bash
# Local
npm run test:smoke

# When the machine can't download bundled Chromium
BROWSER_CHANNEL=chrome npx playwright test --grep @smoke

# Docker
docker compose run --rm test npm run test:smoke
```

Smoke tests finish in about 1–2 minutes. If they all pass, the environment is set up correctly.

```bash
# Open the HTML report (with screenshots)
npm run report
```

---

## Verify installation integrity

```bash
# TypeScript type check (should report no errors)
npx tsc --noEmit

# BDD step generation (should show no missing step warnings)
npx bddgen

# Lint check
npm run lint
```

---

## Common issues

> [!WARNING]
> **Without WebKit installed locally you cannot run `BROWSER=webkit` (Safari engine emulation).**
> The default install only installs Chromium; WebKit / Firefox are **separately downloaded engines**, and running without them errors out directly:
>
> ```
> browserType.launch: Executable doesn't exist at .../ms-playwright/webkit-xxxx/...
> ```
>
> Fix: `npx playwright install webkit firefox` (once is enough).
> Also note: Playwright's webkit is a **WebKit engine emulation (≒ Safari behavior)**, not driving the
> Safari on your computer—so it is unrelated to whether you have Safari installed or which version it is.

**`browserType.launch: Executable doesn't exist` (Chromium)**
→ The bundled Chromium was not downloaded successfully. Use system Chrome: `BROWSER_CHANNEL=chrome npx playwright test --project=ui`.

**`bddgen` errors with `No steps found`**
→ A step definition has a syntax error or wrong import path. Check the error's `file:line`.

**Test can't find an element / intermittent failures**
→ YouTube is an external site; selectors use semantic queries (`getByRole` / `getByText`) and will change with site redesigns or region/locale differences. Re-run with `HEADLESS=false LOG_LEVEL=debug` to observe the actual page; if necessary, run the browser live to re-extract the locator (see [writing-tests.md](writing-tests.md)).

**`docker compose run` errors with `Cannot connect to the Docker daemon`**
→ Docker Desktop is not running. Launch it from the applications list and retry.

**Playwright browser version mismatch (local vs Docker behave differently)**
→ Confirm the machine's `@playwright/test` version matches the `Dockerfile`'s image tag (currently `v1.58.2`).
→ When you suspect a version issue, use the Docker run as the arbitration baseline.

---

| [← README](../README.md) | [Architecture →](architecture.md) |
| :----------------------- | --------------------------------: |
| Back to overview         | Step 2: layer roles & design principles |
