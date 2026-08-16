---
name: tool-qa-release-gate
description: Version wrap-up / pre-release QA release gate (go/no-go gate). Aggregates test pass rate, open bugs, scan-qa-risk and check-qa-sanity results, computes a readiness score, and produces a signable sign-off document. Trigger phrases — "release gate", "sign-off", "go no-go", "release readiness", "release check", "can we ship", "release decision".
allowed-tools: Read, Grep, Glob, Write, Edit, Bash, mcp__atlassian__jira_search
argument-hint: "<version vX.X>"
model: sonnet
---

# qa-release-gate

Final QA release decision before a version ships.

## Release signals

| Signal | Source | Gate type |
|------|------|----------|
| Open P0 bug (Blocker) | Jira TICKET-xxx | 🔴 **Hard** (>0 → immediate no-go) |
| Open P1 bug (Critical) | Jira TICKET-xxx | Soft (deduct score) |
| Version test pass rate (incl. integration + regression) | `versions/{v}/plan.md` | Soft |
| scan-qa-risk high-risk items | `/tool-scan-qa-risk` output | Soft |

## Phase 1: Collect signals

```
jira_search JQL:
  project = {PROJECT} AND fixVersion = "{version}" AND priority in (Highest, High) AND status != Done
```

> If `fixVersion` is unset, the query returns empty results instead of an error (a silent failure).
> Fallback JQL (using the sprint name instead):
> `project = {PROJECT} AND sprint = "{sprintName}" AND priority in (Highest, High) AND status != Done`
> Prefer fixVersion; if the result is empty, automatically switch to the sprint fallback and inform the user.
```bash
cat versions/{v}/plan.md 2>/dev/null
ls versions/{v}/signoff/ 2>/dev/null
```

Mark any missing signal as "not provided" and **do not assume it passed**.

## Phase 2: Apply gate rules + compute readiness

```
Hard gates:
  P0 (Blocker) open > 0 → NO-GO (score ignored)

Readiness = 100
  - each open P1 bug: -10
  - Version pass rate, per 5% below target: -5
  - scan-qa-risk HIGH not covered: -10 each
  - check-qa-sanity Critical fail: -15 each

GO             if readiness ≥ 80 and no hard gate
CONDITIONAL-GO if 70 ≤ readiness < 80 and risk is acceptable
NO-GO          otherwise
```

## Phase 3: Produce sign-off document

Output to `versions/{v}/signoff/tool-qa-release-gate-{v}.md`:

```markdown
# QA Sign-off · v{X.X} · {date}

## Decision: {GO / CONDITIONAL-GO / NO-GO}
Readiness: {score} / 100 (threshold 80)

## Gate results
| Gate | Type | Status | Notes |
|------|------|------|------|
| P0 open bug | 🔴 Hard | ✅ 0 | — |
| P1 open bug | Soft | ⚠️ 2 | TICKET-xxx / TICKET-yyy |
| Version pass rate (incl. integration + regression) | Soft | ✅ 98% | |
| scan-qa-risk HIGH | Soft | ⚠️ 1 | DB migration not fully covered |
| check-qa-sanity | Soft | ✅ | all Critical pass |
| Flaky rate | Reference | 1.2% | does not block release |

## Accepted risks (Conditional Go conditions)
- TICKET-xxx (P1): {notes} — impact < X%, hotfix scheduled for next version

## Post-release monitoring items
- [ ] {monitoring item}

## Sign-off
| Role | Name | Decision | Time |
|------|------|------|------|
| QA Lead | {to sign} | | |
| Release Owner | {to sign} | | |

## Evidence links
- Version plan: `versions/{v}/plan.md`
- scan-qa-risk report
- check-qa-sanity report
```

## Safety guardrails

- ✅ Treat unprovided signals as risk, marked "unverified"
- ✅ A hard gate cannot be overridden by the score
- ✅ Flaky **does not block release** (but show the rate)
- ✅ CONDITIONAL-GO must record accepted risks + monitoring items + signers
- ❌ Never auto-sign; the decision can be computed, but **the signature must be a human**
- ❌ On NO-GO, list "what's still missing to ship" and track it with `/tool-open-qa-bug`
