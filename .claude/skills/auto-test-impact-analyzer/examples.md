# test-impact-analyzer examples

## Example 1: Python PR runs only affected (testmon)

```
User: /auto-test-impact-analyzer --base=main --platform=python
```

Execution:
1. `git diff --name-only main...HEAD` → changed `src/payment/charge.py` + `tests/test_charge.py`
2. `pytest --testmon` reads `.testmondata` for the reverse lookup
3. Compute the affected set + safety-net check (no config/lockfile change)

Output:
```
📊 Strategy: coverage-based (testmon)
Full suite 842 tests → affected 37 tests
⏱ ~14min → ~1.2min (91% saved)
▶️ Running this time: test_charge / test_refund / test_payment_api ... (37)
🛡 Safety net not triggered; next full-run calibration: tonight's nightly
```

## Example 2: Safety net triggered → fallback to full run

```
User: /auto-test-impact-analyzer
(this PR changed poetry.lock + config/settings.py)
```

Output:
```
🛡 Safety net triggered → full run of 842 tests
Reason: changed poetry.lock (dependency change) + config/settings.py (blast radius can't be bounded statically)
TIA does not risk narrowing the scope; changes like these always run in full.
```

## Example 3: Monorepo (nx affected)

```
User: /auto-test-impact-analyzer --strategy=deps
(monorepo, changed packages/auth)
```

→ `npx nx affected -t test --base=main`
→ Dependency-graph reverse lookup: auth is depended on by web-app + admin → run the tests of these three projects
→ The other 12 packages are skipped

## Example 4: iOS xccov

```
User: /auto-test-impact-analyzer --platform=ios
```

→ Parse the coverage from `Result.xcresult` → reverse-look up the test targets for the diff-hit files
→ Generate an `.xctestplan` that enables only the affected targets
→ ⚠️ Change to a design-system shared component → a11y tests fall back to a full run

## Example 5: Calibration (measure escape rate)

```
User: Confirm TIA didn't miss any tests
```

→ Compare the last 10 runs: TIA subset results vs nightly full-run results
→ Compute escape rate = (failures the full run caught but TIA didn't run) / all failures

Output:
```
📈 Last 10 calibrations: escape rate 0% (TIA missed nothing)
If >0 → loosen the rules (add the corresponding paths to full_run_triggers or shared_core_paths)
```

## Example 6: No coverage map (path heuristic fallback)

```
User: /auto-test-impact-analyzer --strategy=path
```

→ No coverage map / dep graph → use naming rules
→ change `src/payment/*` → run `tests/**/payment*`, `tests/**/*payment*`
→ Clearly labeled "coarse strategy, errs toward over-running"; recommend adopting testmon to improve precision

## Example 7: markdown-only mode

```
User: /auto-test-impact-analyzer
(config.mode = markdown-only)
```

→ Does not call MCP
→ Writes the impact report to `.claude/test-impact/impact-report-{pr}.md`
→ Outputs the affected list as a filter string you can paste directly into CI (pytest -k / gradle --tests)
