---
name: qa-context
description: Stage 1 of the qa-ticket pipeline — collect the facts for one ticket (Jira ticket and sub-tasks, design links, live target-site behavior, optional product repo, existing main-library features) into runs/{ticket}/context.md. Facts only; no risk judgment, no case design. Usually dispatched by /qa-ticket.
argument-hint: "<TICKET-xxx>"
allowed-tools: Read, Write, Bash, Grep, Glob, mcp__atlassian__jira_get_issue, mcp__atlassian__jira_search, mcp__atlassian__jira_get_issue_development_info, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_click, mcp__playwright__browser_type, mcp__playwright__browser_take_screenshot
---

# qa-context — collect the facts

Collect facts only, as the basis for later stages. Forbidden: editing product repos / commit / push.

## 1. Jira

`jira_get_issue` for summary / description / status / parent / issuetype / subtasks / labels; record design and PR links (`jira_get_issue_development_info`).

| issuetype | Also fetch |
|---|---|
| Story / Epic (with subtasks) | `jira_search` `parent={ticket}` |
| Sub-task | parent + all siblings |
| Task / Bug | nothing |

`Release to Staging` / `QA Testing` → describe current behavior; `To Do` / `In Progress` → mark "not implemented yet".

## 2. Design (only when the ticket links one)

Copying the link is not reading it. Use the design MCP when available to read layouts, field composition, click targets, states (active / disabled / empty), and list limits. No design tool → record the link and note "not read".

## 3. Target-site behavior (source of truth)

The product under test is `https://www.youtube.com` (guest / logged-out). Walk the behaviors the ticket touches with Playwright MCP and record what actually happens: pages, visible elements, empty states, error messages, URL changes. Behavior that cannot be confirmed stays `?` with the steps you tried.

## 4. Product repo (optional, auto-detected, never asked)

`.claude/CODEBASE.md` has a local repo path → pull the stg branch, read the related changes, and keep business rules as `file:line`. No mapping → skip; the ticket plus live site behavior is the truth. Never blocks.

## 5. Main-library mapping

`ls testcases/` to find the `.feature` files this ticket touches: exists → Modified, missing → New.

## Output `runs/{ticket}/context.md`

```markdown
# {ticket} — {full Jira title}
> Status: {status}

## Requirement summary
## Sub-tasks / related tickets
## Design (facts read from the design, or "not read")
## Target-site behavior (observed live)
| Behavior | Steps | Observed |
|---|---|---|
## Business rules (file:line / observed / ?)
## Main-library features
| Main-library file | Modified/New | What changes |
|---|---|---|
## In scope / Out of scope
```

When done, report: behaviors confirmed live, whether the design was read, count of `?`.
