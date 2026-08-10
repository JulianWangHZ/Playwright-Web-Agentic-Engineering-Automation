# Project Overview

| [← Back to README](../../README.md) | [Environment Setup →](02-setup.md) |
|:---|---:|
| Back to overview | Step 2: Installation and Setup |

**Step 1 / 6**

---

## What is Playwright-Web-Agentic-Engineering-Automation?

`Playwright-Web-Agentic-Engineering-Automation` is an **AI-native QA pipeline**, with `https://www.youtube.com` as the product under test.

Traditional QA work—writing test matrices, authoring BDD cases, tracking Jira tickets—is executed with the help of AI (Claude Code), while the QA engineer focuses on **quality decisions**: confirming the scope is correct, checking whether any cases are missing, and deciding whether to sign off.

> AI handles the tedious work; humans make the quality decisions.

---

## What is the product under test?

This project uses `https://www.youtube.com` as its single product under test, covering the full AI-native QA workflow.

| Product Under Test | Platform | Description |
|---|---|---|
| YouTube Web | `youtube` | `https://www.youtube.com` (guest/logged-out) |

> To apply this framework to your own product, swap the product under test for your own site and fill in your repo mapping in `.claude/CODEBASE.md`.

---

## Directory Structure

```
Playwright-Web-Agentic-Engineering-Automation/
├── .claude/
│   ├── skills/          ← AI skill definitions (full index in docs/qa-workflow-map.md)
│   └── rules/           ← Gherkin, commit, and PR format rules
├── docs/
│   ├── tutorial/      ← you are here (03-skills = full skill ref, 04-workflow = full workflow)
│   ├── qa-workflow-map.md  ← stage → skill single source of truth
│   └── skills-guide.html   ← which skill to use at each stage (interactive)
├── testcases/           ← Stable BDD case main library (single source of truth)
├── features/{ticket}/   ← Workspace during Feature development
├── versions/{version}/  ← Version acceptance workspace
└── youtube/  ← YouTube Web E2E automation framework
```

**The three most important concepts:**

1. **skills** — When you type a command like `/stage-test-matrix TICKET-123` in Claude Code, it is backed by a definition in `.claude/skills/`
2. **testcases/** — The main library of all released BDD cases, read-only (only `/stage-tc-merge` can write to it)
3. **versions/{version}/** — The temporary workspace for each version, cleared after merge

---

## The Six Stages of the QA Workflow

```
Test Planning → Case Generation → Feature Testing → Merge Back → Quality Gate → Sync
   /stage-test-matrix     /stage-write-bdd                    /stage-tc-merge    /tool-qa-release-gate    /stage-jira-sync
```

See Step 4 for the detailed workflow.

---

| [← Back to README](../../README.md) | [Environment Setup →](02-setup.md) |
|:---|---:|
| Back to overview | Step 2: Installation and Setup |
