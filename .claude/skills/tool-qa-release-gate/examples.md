# qa-release-gate Examples

## Example 1: Standard release decision

```
User: /tool-qa-release-gate v3.2.0
```

Execution:
1. Query JIRA: open P0/P1 for fixVersion = 3.2.0
2. Read local gate reports (compliance / perf / offline)
3. Parse regression CI results
4. Apply hard/soft gates → compute readiness → produce sign-off document

Output:
```
🚦 QA Sign-off · v3.2.0
Decision: ✅ GO (readiness 91/100, threshold 80)
Hard gates: P0=0 ✅ / security=0 ✅ / compliance=0 ✅
Soft: regression 99.1% ✅ / P1 open 1 (listed as risk) / flaky 0.8% (does not block)
→ Produced qa-release-gate-v3.2.0.md, awaiting QA Lead + Release Owner sign-off
```

## Example 2: Hard gate blocks (no-go)

```
User: Can we ship this version, v3.3.0
```

→ Detected 1 open P0 bug

Output:
```
🚦 Decision: 🔴 NO-GO
Reason: Hard gate failed — PROJ-1301 (P0) checkout amount calculation error, status In Progress
(readiness score ignored; a hard gate is a single-vote veto)

Still needed to ship:
- [ ] Close PROJ-1301 (or downgrade with written acceptance from the Release Owner — but P0 is not downgradable for release by default)
```

## Example 3: Conditional Go (has risk but can ship)

```
User: /tool-qa-release-gate v3.2.1 --platform=both
```

Output:
```
🚦 Decision: ⚠️ CONDITIONAL GO (readiness 83/100)
No hard gate blocking, but there are soft risks:
- P1 open ×2 (PROJ-1234 edge-case crash < 0.5% of users / PROJ-1240 copy text)
- a11y Critical ×1 (price contrast 4.2:1)
Required to record: accepted risks + post-release monitoring items + signers
→ Takes effect only after the Release Owner explicitly signs "I accept the above risks"
```

## Example 4: Strict mode (payments / government)

```
User: /tool-qa-release-gate v4.0.0 --strict
```

→ `--strict` promotes a11y Critical, offline write loss, and performance regression all to **hard gates**
→ Suitable for high-compliance scenarios such as payments / government / healthcare

## Example 5: Flaky does not block release (guardrail verification)

```
User: /tool-qa-release-gate v3.2.0
(CI has 6 flaky tests that pass on rerun)
```

Output:
```
🚦 Decision: ✅ GO
ℹ️ Flaky: 6 tests (2.1%) — not counted toward the release gate (passes on rerun ≠ real failure)
   Recommendation: use flaky-test-hunter to quarantine these 6 to avoid polluting the next decision
(If these 6 were mistaken for real failures, they would wrongly block a version that could otherwise ship)
```

## Example 6: markdown-only mode (solo / no JIRA)

```
User: /tool-qa-release-gate v1.4.0
(config.mode = markdown-only)
```

→ Does not query JIRA, does not post to Slack
→ Collects signals from local gate reports under `.claude/` + manually entered open bug counts
→ Writes the sign-off document to `.claude/signoff/tool-qa-release-gate-v1.4.0.md`
→ Leaves sign-off fields blank for manual entry (the decision can be computed, but the signature must be a human)

## Example 7: Handing off to publishing after release

```
User: v3.2.0 is signed off, let's publish the report
```

→ GO / CONDITIONAL-GO → triggers `publish-regression` to publish the regression report to the dashboard
→ Attaches the sign-off document link as well (traceable)