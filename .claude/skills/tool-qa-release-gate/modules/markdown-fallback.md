# Markdown Fallback Module (qa-release-gate)

> Use this module when any of the following is true:
> - `config.mode = markdown-only`
> - The JIRA / Slack MCP is unavailable or returns an error
> - The user explicitly requests "don't query JIRA / don't post to Slack"

## Output location

`.claude/signoff/`

## File set

```
.claude/signoff/
├── qa-release-gate-{version}.md   ← release decision + sign-off document
└── INDEX.md                  ← history of past releases (traceable)
```

## qa-release-gate-{version}.md structure

```markdown
---
version: v3.2.0
generated_at: {ISO8601}
decision: conditional-go    # go | conditional-go | no-go
readiness: 84
threshold: 80
hard_gates_passed: true
unverified_signals: [a11y]   # not provided → treated as risk
---

# QA Sign-off · {version} · {date}

## 🎯 Decision: {GO / CONDITIONAL GO / NO-GO}
Readiness: {score} / 100 (threshold {threshold})

## 🚦 Gate results
| Gate | Type | Status | Notes |
|------|------|------|------|
| P0 open bug | 🔴 hard | ✅/🔴 | |
| Security blocker | 🔴 hard | | |
| Compliance blocker | 🔴 hard | | |
| P1 open bug | soft | | |
| Regression pass rate | soft | | |
| a11y Critical | soft | ❔ unverified | treated as risk |
| Performance regression | soft | | |
| Offline resilience | soft | | |
| Flaky rate | reference | | does not block release |

## ⚠️ Accepted risks (required for conditional-go)
- {risk}: {impact scope} — {handling: hotfix / fix next version}

## 📋 Post-release monitoring items
- [ ] {monitor item}

## ❔ Unverified signals (treated as risk)
- {signal}: report not provided → recommend running {corresponding skill}

## ✍️ Sign-off (the decision can be computed, but the signature must be a human)
| Role | Name | Decision | Time |
|------|------|------|------|
| QA Lead | {to sign} | | |
| Release Owner | {to sign} | | |

## 📎 Evidence links
- regression / security / compliance / test CI (local path or link)
```

## INDEX.md template

```markdown
# QA Sign-off Index

| Version | Date | Decision | Readiness | Hard gates | Signed |
|---------|------|----------|-----------|------------|--------|
| v3.2.0 | 2026-06-02 | conditional-go | 84 | pass | to sign |
| v3.1.0 | 2026-05-15 | go | 93 | pass | ✅ |
| v3.0.0 | 2026-05-01 | no-go | — | P0 fail | — |
```

## Handing off to downstream flow

1. **GO / CONDITIONAL-GO**: manually trigger `publish-regression` to publish the report, attaching the sign-off link
2. **NO-GO**: follow the "what's still missing to ship" list back to each gate skill / `bug-report` to close the gaps
3. **After enabling full-mcp**: can switch to querying JIRA open bugs + posting to the Slack release channel
4. **Equivalence**: markdown mode's decision logic is identical to full-mcp; only the signal source (local report + manual entry vs. JIRA/CI automatic) and notification (local vs. Slack) differ