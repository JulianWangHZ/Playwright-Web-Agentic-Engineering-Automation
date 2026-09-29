---
name: tool-qa-release-gate
description: Pre-release QA gate (go/no-go) and post-deploy sanity checklist. Pulls this release's tickets by Jira fixVersion, aggregates each ticket's runs/{ticket}/progress.md Close section, open bugs and HIGH-risk coverage, computes a readiness score and produces a sign-off document with a critical-path sanity checklist. Triggers on "release gate", "sign-off", "go no-go", "release readiness", "can we ship", "sanity check", "post-deploy check", "smoke checklist".
allowed-tools: Read, Grep, Glob, Write, Bash, mcp__atlassian__jira_search, mcp__atlassian__jira_get_issue
argument-hint: "<version vX.X> [--sanity-only]"
---

# qa-release-gate

The final pre-release decision. Forbidden: commit / push / editing repo code.

## Phase 1: Collect

1. Release tickets: `jira_search` `project = {PROJECT} AND fixVersion = "{version}" AND issuetype != Sub-task`.
   - An unset fixVersion returns empty without an error → list recent fixVersion candidates for the user, or fall back to the sprint name and say so.
2. Open bugs: `project = {PROJECT} AND fixVersion = "{version}" AND issuetype in (Bug, Sub-task-bug) AND status != Done`, split by priority into P0 (Highest/Blocker) and P1 (High/Critical).
3. For each ticket read the Close section of `runs/{ticket}/progress.md`: verdict, automation pass/fail, manual checks, HIGH-risk coverage. No Close section → mark the ticket "/qa-ticket not finished".

Missing signals are marked "not provided" and **never assumed to pass**.

## Phase 2: Gate + readiness

```
Hard gate: open P0 > 0 → NO-GO (score ignored)

Readiness = 100
  - each open P1 bug: -10
  - each ticket with verdict ❌: -15; ⚠️: -5
  - each ticket with /qa-ticket not finished: -10
  - each uncovered HIGH risk: -10
  - each unresolved automation failure: -5

GO             readiness ≥ 80 and no hard gate
CONDITIONAL-GO 70 ≤ readiness < 80 and risk acceptable
NO-GO          otherwise
```

## Phase 3: Post-deploy sanity checklist

Take steps from each ticket's `@smoke` scenarios (`runs/{ticket}/cases/` or the main library); fall back to the Jira AC. Write them at the "click here / type this / see that" level.

| Type | Priority |
|---|---|
| Third-party integrations, new APIs / data writes, cross-platform flows | 🔴 Critical |
| New feature main flow, new pages / components | 🟡 High |
| UI tweaks / copy / styling | 🟢 Normal |

`--sanity-only` → produce only this section, skip Phase 2.

## Phase 4: Output `releases/{version}.md`

```markdown
# QA Sign-off · {version} · {date}

## Decision: {GO / CONDITIONAL-GO / NO-GO}
Readiness: {score} / 100 (threshold 80)

## Gate results
| Gate | Type | Status | Notes |
|---|---|---|---|
| Open P0 bugs | 🔴 Hard | | |
| Open P1 bugs | Soft | | |
| Ticket QA verdicts | Soft | | |
| HIGH-risk coverage | Soft | | |

## Ticket status
| Ticket | Title | QA verdict | Manual checks | Notes |
|---|---|---|---|---|

## Accepted risks (required for CONDITIONAL-GO)
## Post-deploy sanity checklist
### 🔴 Critical (must pass)
- [ ] {ticket} {action} → expected: {result}
### 🟡 High
### 🟢 Normal
## Post-release monitoring
## Sign-off
| Role | Name | Decision | Time |
|---|---|---|---|
| QA Lead | {pending} | | |
| Release Owner | {pending} | | |
```

## Guardrails

- A hard gate can never be overridden by the score; missing signals count as risk
- The decision can be computed, but **the signature is always a human's**; never auto-sign
- On NO-GO, list "what is still needed to ship"
