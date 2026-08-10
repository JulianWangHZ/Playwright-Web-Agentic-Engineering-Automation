---
name: test-impact-analyzer
description: Test Impact Analysis (TIA) — from a git diff, compute which tests are affected by the change and run only that subset on PRs to cut CI time. Supports coverage-based (pytest-testmon / xccov / JaCoCo / jest --findRelatedTests), dependency-graph (nx affected / Gradle / Bazel), and path-heuristic strategies, with a built-in safety net (changes to shared/config/lockfiles → full run; periodic full-run calibration). Trigger phrases — "test impact", "TIA", "affected tests", "run only changed tests", "cut CI time", "speed up CI", "selective test run", "testmon", "nx affected", "incremental testing". Pairs with: flaky-test-hunter (exclude flaky from the affected set), tc-to-pytest (pytest coverage source), qa-release-gate (release still runs full; TIA only speeds PRs).
disable-model-invocation: false
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
argument-hint: "[--base=main] [--strategy=coverage|deps|path] [--platform=python|ios|android|js]"
---

# test-impact-analyzer (English)

> ⚙️ Read [`modules/config-loader.md`](./modules/config-loader.md) first.

## Why this skill exists

Static test tiers (e.g. @smoke/@regression tags) mean each PR still runs the **whole tier**. When your PR touches one function in the payment module yet waits for 800 tests, that's waste.

TIA asks the dynamic question: "**this diff changed X → which tests does it affect → run only those.**"

> Tiering is "which tests matter" (static); TIA is "which tests this change touches" (dynamic, per-PR). Complementary: tiers frame the candidates, TIA narrows to the affected subset.

→ Compute the affected test set from a diff, generate CI config to run only the subset, with a safety net so nothing slips through.

## Not for

- ❌ Final gate at release / merge-to-main — **always run full** (TIA only speeds the PR stage)
- ❌ Tiny suites (< 2 min) — overhead isn't worth it
- ❌ Deciding which tests should exist / their tier — handled by the @smoke/@regression tag rules

## Three impact-mapping strategies

| Strategy | How | Precision | Tools |
|------|--------|--------|------|
| **coverage-based** | existing coverage map: which test covers which line → reverse-lookup diff-hit lines | 🟢 highest | `pytest-testmon` · `coverage.py` · iOS `xccov` · Android JaCoCo · `jest --findRelatedTests` · `vitest related` |
| **dependency-graph** | import/module graph: change module A → tests depending on A (reverse closure) | 🟡 medium | `nx affected` · Gradle · Bazel · Turborepo |
| **path-heuristic** | naming/path rules: change `src/payment/*` → run `tests/payment/*` | 🟠 coarse | grep / glob (fallback) |

> Priority: coverage map if present → else dep graph → else path heuristic (most conservative, over-includes).

## Execution flow

### Phase 1: Get the diff
```bash
git diff --name-only "$(git merge-base ${1:-main} HEAD)"...HEAD
git diff --unified=0 "$(git merge-base ${1:-main} HEAD)"...HEAD   # for line-level coverage hits
```

### Phase 2: Build/read the impact map
- **Python:** `pytest --testmon` (auto-maintains `.testmondata`) or `coverage.py --cov-context=test`
- **iOS:** `xcrun xccov view --report --json` → map functions/lines to test targets
- **Android:** parse `jacoco.exec` + class→test map
- **JS/TS:** `jest --findRelatedTests <files>` / `npx nx affected -t test --base=main`

### Phase 3: Compute the affected set (with safety net)
```
affected = ∅
for f in changed_files:
    if f matches SAFETY_FALLBACK (config/CI/lockfile/shared-util): return FULL_RUN
    affected ∪= map(f)
affected ∪= changed_test_files     # changed/added tests always run
affected ∪= smoke_T0               # core smoke always runs
affected −= quarantined_flaky      # don't let flaky pollute
```
**Hard rules → full run:** changes to `config/`, CI files, dependency lockfiles (`Podfile.lock` / `package-lock.json` / `*.gradle` / `poetry.lock`); shared-core paths; **stale** coverage map; large-scale test-file churn.

### Phase 4: CI config + estimated savings
A `test-impact-report.md` with strategy, changed files, full-suite vs affected counts, estimated time saved, the exact list to run, and calibration status. Emit the affected list as pytest `-k` / xctestplan skips / Gradle `--tests` / jest args.

### Phase 5: Guardrails & calibration
- **PR:** run the TIA subset (fast)
- **merge-to-main / nightly:** run full (calibrate + catch anything TIA missed)
- **release:** full (via `qa-release-gate`; TIA doesn't gate)
- coverage map refreshed and cached/committed on full runs

## Safety guardrails

- ✅ **TIA only speeds PRs, never replaces full** — main / release always run full
- ✅ Changes whose blast radius can't be bounded statically (config / lockfile / shared core) → **full fallback**
- ✅ Stale coverage map → distrust, **full run + rebuild**
- ✅ Changed/added tests + smoke T0 are **always included**
- ✅ Periodic full calibration measures the **escape rate** (missed-by-TIA, caught-by-full); >0 → loosen rules
- ❌ Never claim "100% precise" — it's probabilistic acceleration + a safety net

## ♿ Built-in a11y checks

- [ ] Any **UI component change** always pulls the matching **a11y tests** into the affected set (a11y effects cross components; static diff misses the chain)
- [ ] Design-system / shared-component / theme changes → a11y tests go **full fallback** (contrast/text-size impact is broad)

## Config dependencies

| Key | Purpose | Default |
|---------|------|------|
| `test_impact.strategy` | coverage / deps / path | auto |
| `test_impact.base_ref` | diff base | main |
| `test_impact.full_run_triggers` | globs that force full run | config/ · *.lock · CI yml |
| `test_impact.shared_core_paths` | paths treated as shared core | [] |
| `test_impact.always_include` | always-run tests | smoke_t0 |

## Examples

See [`examples.md`](./examples.md).