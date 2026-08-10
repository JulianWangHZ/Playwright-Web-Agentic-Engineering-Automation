# Playwright-Web-Agentic-Engineering-Automation

An end-to-end AI QA engineering pipeline (Agentic AI Testing Pipeline): from reading tickets, test planning, BDD, and Playwright automation through to release sign-off, driven entirely by AI agents. It uses `https://www.youtube.com` as the live target.

## Codebase (Environment Setup)

To let the AI query the business rules from the source code of the product under test, copy `.claude/CODEBASE.template.md` to `.claude/CODEBASE.md` (git-ignored) and fill in your own product repo mapping and local paths. When targeting `https://www.youtube.com`, no product repo is needed — confirm behavior by walking through the browser live instead.

## Jira (Ticket Reference)

- MCP tools: `mcp__atlassian__jira_get_issue` / `mcp__atlassian__jira_search`
- Ticket numbers use the generic format **`TICKET-xxx`** (replace with your own Jira workspace and ticket prefix when adopting this in practice)
- Read the ticket summary / description / labels to judge the impact scope and test areas

## Business Rule Lookup

When you hit a `?` (unclear spec): if a product repo is configured (see Codebase), use the **Explore agent + Grep** to search that repo's source code for the `file:line`; otherwise walk through the target site URL of the product under test to confirm actual behavior, or check the existing `.feature` files / Page Objects in this repo. If nothing is found, keep the `?` and note the keywords you tried.

## Global Rules

- No commit / push (always ask the user first)
- If unsure, ask; do not invent scenarios
- Only change what was requested: to fix a bug, fix the bug — do not casually refactor unrelated code
- If it can be solved simply, do not overdo it: do not design abstraction layers for hypothetical future needs
- Always verify after changes: for automation changes, run `npm run check` (tsc + lint); for `.feature` changes, run `npx bddgen` to confirm there are no errors
- Always write files with `Write`; always ask the user for confirmation before editing `testcases/*.feature`

## Workflow

See **[pipeline.html](pipeline.html)** for the visual overview of the entire pipeline; see **[skills-guide.html](docs/skills-guide.html)** for **which skill to use at each stage and when**.

The core is organized into stages by **work intent** (the dev/staging/prod environment is an orthogonal attribute — the same feature is tested across multiple environments):

| Intent Stage | What you're doing | Directory | argument |
|---|---|---|---|
| **Feature** | Design and test a single feature | `features/{ticket}/` | `TICKET-xxx` |
| **Version** | Decide which features a version includes + aggregation / regression / sign-off | `versions/{version}/` | `vX.X TICKET-xxx` / `vX.X` |

Which skill to use, the stage sequence, and disambiguation → see [docs/qa-workflow-map.md](docs/qa-workflow-map.md).

> **Two-layer architecture**: Layer 1 orchestration (`/flow-qa-router` dispatches · `/flow-feature-testing-workflow` / `/flow-version-testing-workflow`); Layer 2 execution (test-matrix / write-bdd / … individual skills). Unsure which to use → run `/flow-qa-router <describe the situation>`.
