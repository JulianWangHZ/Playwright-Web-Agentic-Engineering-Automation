# Markdown Fallback Module (test-impact-analyzer)

> Use this module when any of the following holds:
> - `config.mode = markdown-only`
> - No MCP, or the user explicitly requests "local output only"
> - (Most TIA cases only need git + test tools and do not depend on MCP anyway)

## Output location

`.claude/test-impact/`

## File set

```
.claude/test-impact/
├── impact-report-{pr|sha}.md   ← this run's impact analysis report
├── affected-filter.txt         ← filter string that can be pasted directly into CI
├── calibration.json            ← escape-rate history of full run vs TIA subset
└── INDEX.md                    ← entry point to past analyses
```

## impact-report-{pr}.md structure

```markdown
---
base: main
head_sha: {sha}
strategy: coverage-based
changed_files: 3
full_suite: 842
affected: 37
safety_fallback: false        # true = full run
estimated_saving_pct: 91
---

# Test Impact Report · {pr/sha} · {date}

## 📊 Impact analysis
- strategy / changed files / full suite vs affected count

## ⏱ Estimated savings
- full run ~{x}min → subset ~{y}min ({pct}% saved)

## ▶️ What to run this time
[affected test list]

## 🛡 Safety net
- Full run triggered? Trigger reason?
- Is the coverage map up to date?

## 📈 Calibration
- Last full-run calibration time + escape rate
```

## affected-filter.txt (feed straight into CI)

Output the matching filter per platform; CI runs `$(cat affected-filter.txt)` directly:

```
# pytest
-k "test_charge or test_refund or test_payment_api"
# gradle
--tests "com.app.payment.*"
# jest
--findRelatedTests src/payment/charge.ts src/payment/refund.ts
```

## calibration.json (escape-rate history)

```json
{
  "runs": [
    {"date":"2026-06-02","tia_ran":37,"full_failures":2,"tia_caught":2,"escaped":0,"escape_rate":0.0}
  ]
}
```

> `escaped > 0` means TIA missed a failure that only the full run caught → you must loosen the rules (add the corresponding paths to `full_run_triggers` / `shared_core_paths`).

## INDEX.md template

```markdown
# Test Impact Index

| Date | Base..Head | Strategy | Full/Affected | Saving | Fallback |
|------|-----------|----------|---------------|--------|----------|
| 2026-06-02 | main..a1b2c3 | coverage | 842/37 | 91% | no |
| 2026-06-01 | main..d4e5f6 | coverage | 842/842 | 0% | yes (lockfile) |
```

## Handoff to downstream flows

1. **CI**: the PR job reads `affected-filter.txt` and runs only the subset; the main/nightly job runs the full suite and updates `calibration.json` + the coverage map
2. **release**: hands off to `qa-release-gate` for a full run every time; TIA does not participate in the release gate
3. **flaky**: the affected set subtracts the quarantine list from `flaky-test-hunter`
4. **equivalence**: markdown mode's analysis logic is identical to full-mcp; the only difference is writing the report locally vs uploading to a Sheet
