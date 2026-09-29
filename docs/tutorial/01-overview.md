# Project Overview

| [← Back to README](../../README.md) | [Environment Setup →](02-setup.md) |
|:---|---:|
| Back to overview | Step 2: Installation and setup |

**Step 1 / 6**

---

## What is Playwright-Web-Agentic-Engineering-Automation?

An end-to-end AI QA engineering pipeline. Reading tickets, assessing risk, writing the test matrix, writing BDD, writing automation and running tests are done by AI agents (Claude Code); QA engineers focus on **quality decisions**: are the cases right, is anything missing, can we ship.

It uses **`https://www.youtube.com`** (guest / logged-out) as the live target. To adopt it, swap the target for your product URL.

> AI handles the tedious work; humans make the quality decisions.

---

## Directory structure

```
Playwright-Web-Agentic-Engineering-Automation/
├── .claude/
│   ├── skills/          ← qa-ticket pipeline and standing tools
│   ├── agents/          ← automation planner / generator / healer
│   └── rules/           ← Gherkin, automation, commit, PR rules
├── docs/
│   ├── tutorial/        ← you are here
│   └── qa-workflow-map.md ← stage → skill index
├── pipeline.html        ← visual pipeline overview
├── testcases/           ← BDD main library (single source of truth)
├── runs/{ticket}/       ← per-ticket workspace (git-ignored)
└── youtube/             ← YouTube Web E2E automation
```

**The three things that matter most:**

1. **`/qa-ticket TICKET-xxx`** — the only command to remember. One ticket from start to close, stopping only once at case sign-off.
2. **`runs/{ticket}/`** — every artifact for that ticket; `progress.md` records where it is, so rerunning `/qa-ticket TICKET-xxx` resumes.
3. **`testcases/`** — the main library, written only by `qa-merge` after sign-off; read-only otherwise.

---

## The pipeline at a glance

```
/qa-ticket TICKET-xxx
context → risk → cases → ★sign-off → scripts → run → review → close
 facts     risks   design   merge      automate   verify  code review  verdict
```

Before a release, `/tool-qa-release-gate vX.X` makes the go / no-go call for the version. Details in Step 4.

---

| [← README](../../README.md) | [Environment Setup →](02-setup.md) |
|:---|---:|
| Back to overview | Step 2: Installation and setup |
