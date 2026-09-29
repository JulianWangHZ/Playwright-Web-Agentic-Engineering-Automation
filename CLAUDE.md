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
- Always write files with `Write`; the `testcases/` main library is written only by `qa-merge`, after case sign-off

## Workflow

One ticket, one line: `/qa-ticket TICKET-xxx` → context → risk → cases → ★sign-off (the only stop; signed-off cases merge back into `testcases/`) → scripts → run → review → close. Artifacts live in `runs/{ticket}/`; rerun `/qa-ticket TICKET-xxx` to resume after an interruption. Environment (dev/staging/prod) is an annotation, not a stage. Release sign-off: `/tool-qa-release-gate vX.X`.

**Stage skills and standing tools → single source of truth: [docs/qa-workflow-map.md](docs/qa-workflow-map.md).** Visual overview: [pipeline.html](pipeline.html).
