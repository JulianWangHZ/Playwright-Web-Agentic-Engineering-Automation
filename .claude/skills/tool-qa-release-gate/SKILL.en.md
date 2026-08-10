---
name: qa-release-gate
description: Pre-release QA go/no-go gate. Aggregates signals — test pass rate, open P0/P1 bugs, regression results, blocker counts from security/compliance/a11y/performance/offline gates, flaky rate, cross-platform consistency — computes a readiness score, applies hard/soft gate rules to produce a go / no-go decision, and generates a signable sign-off document (with risk acceptance + conditional go). Trigger phrases — "sign-off", "signoff", "go no-go", "release readiness", "release gate", "QA gate", "can we ship", "readiness score", "release checklist". Pairs with: regression-test (upstream results), flaky-test-hunter (flaky must NOT block), security-scan / compliance-test / a11y-audit (gate sources), publish-regression (post-signoff).
disable-model-invocation: false
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
argument-hint: "[version] [--platform=ios|android|both] [--strict]"
---

# qa-release-gate (English)

> ⚙️ Read [`modules/config-loader.md`](./modules/config-loader.md) first.

## Why this skill exists

In the release flow:
- `regression-test` produces the **regression plan** (what to test)
- Various skills produce **their own gate reports** (security / compliance / a11y / perf / offline)
- `publish-regression` publishes the **test report**

But the crucial middle — "**can this version actually ship? based on what? who signed?**" — has no skill tying it together. It usually lives in someone's head, a Slack message, or a manual checklist.

> This is the missing piece between `regression-test → publish-regression`: turning sign-off from "feels okay" into "quantifiable, traceable, signed."

→ Aggregate signals → compute readiness → apply gates → produce go/no-go + sign-off doc.

## Not for

- ❌ Planning what to test — use `regression-test`
- ❌ Publishing reports to a dashboard — use `publish-regression`
- ❌ Finding flaky tests — use `flaky-test-hunter` (but this skill consumes its result)

## Aggregated signals

| Signal | Source | Default gate |
|------|------|----------|
| Test pass rate | smoke / regression | soft |
| Open **P0** bugs | JIRA | 🔴 **hard** (>0 → no-go) |
| Open P1 bugs | JIRA | soft (deduct + list risk) |
| Security blocker | `security-scan` | 🔴 **hard** |
| Compliance blocker | `compliance-test` | 🔴 **hard** |
| a11y Critical | `a11y-audit` | soft (industry may promote to hard) |
| Perf regression | `mobile-resource-test` | soft |
| Offline resilience fail | `offline-mode-test` | soft (payments may promote to hard) |
| Flaky rate | `flaky-test-hunter` | reference (**never blocks**) |
| Cross-platform consistency | iOS vs Android | soft |

## Hard vs soft gates

- **Hard gate**: any failure → **immediate no-go**, score ignored (P0 bug / security / compliance blocker)
- **Soft gate**: deducts readiness score + listed as risk, but can be **conditionally** waived by an authorized signer

> Guardrail: **flaky tests are never a hard gate** — a test that passes on rerun must not block release (route to `flaky-test-hunter` quarantine).

## Execution flow

### Phase 1: Collect signals
Query JIRA for open P0/P1 bugs by fixVersion; read local gate reports (`.claude/compliance`, `.claude/perf`, `.claude/offline`); parse CI junit results. Missing signals are marked "not provided" and treated as **risk** (never assumed pass).

### Phase 2: Apply gates + compute readiness
```
hard_gates = [P0_open > 0, security_blocker > 0, compliance_blocker > 0]
if any(hard_gates): decision = NO-GO   # score ignored
readiness = 100 - (soft gate deductions by weight)
decision = GO if readiness >= threshold and no hard gate
         = CONDITIONAL-GO if near threshold and risk accepted
         = NO-GO otherwise
```

### Phase 3: Produce sign-off doc
`qa-release-gate-{version}.md` with decision + readiness score, a gate-results table (type/status/notes), accepted-risk list (conditional-go conditions), post-release monitoring items, a sign-off signature table, and evidence links.

### Phase 4: Notify + archive
full-mcp posts the sign-off summary to the release Slack channel, @release owner; archives to `.claude/signoff/`. NO-GO lists "what's still missing to ship."

### Phase 5: Hand-off
GO / CONDITIONAL-GO triggers `publish-regression`. NO-GO blocks and routes back to `bug-report` / the relevant gate skills.

## Safety guardrails

- ✅ **Unprovided signals = risk** (never assume pass) — report marks "unverified"
- ✅ **Flaky never blocks** (rerun-pass ≠ real failure) but show the rate for judgment
- ✅ Hard gates **cannot be overridden by score** (P0/security/compliance fail = no-go)
- ✅ CONDITIONAL-GO **must record accepted risks + monitoring items + signers** (no blank waivers)
- ❌ Never auto-"sign" — the decision can be computed, but the **signature must be a human**

## ♿ Built-in a11y checks

- [ ] a11y Critical count feeds a gate (soft by default; gov/finance may promote to hard via config)
- [ ] Accepted a11y risks are explicitly listed under "post-release monitoring / next-version fix", never silently swallowed

## Config dependencies

| Key | Purpose | Default |
|---------|------|------|
| `qa_signoff.readiness_threshold` | min score for GO | 80 |
| `qa_signoff.hard_gates` | hard gates (any fail → no-go) | p0_bug / security_blocker / compliance_blocker |
| `qa_signoff.signoff_roles` | required signer roles | QA Lead / Release Owner |
| `qa_signoff.block_on_flaky` | does flaky block release | **false** (keep it) |

## Examples

See [`examples.md`](./examples.md).