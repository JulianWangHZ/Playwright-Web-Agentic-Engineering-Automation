# Config Loader (read this file before execution)

When each Skill starts, it must first load `config.json` and carry the organization settings into the subsequent flow.

## Load order

1. Try reading `$HOME/.claude/qa-skill-config.json` (global settings)
2. If it does not exist, try reading `.qa-skill-config.json` at the current repo root
3. If neither exists → fall back to `markdown-only` mode

> The install script `install.sh` substitutes `{{variables}}` directly with the values from `config.json` when rendering the skill. This file only describes the logic for re-validating at runtime.

## Mode determination

| `config.mode` | Behavior |
|---------------|------|
| `full-mcp` | Impact report can go to a Sheet; CI config can be written back to the repo |
| `partial-mcp` | Wrap each MCP call in try/except; on failure, degrade to writing markdown |
| `markdown-only` | Never call MCP; report + CI filter string are all written to local `.md` |

> Note: TIA is fundamentally a **git + test-tool** operation and, in most cases, does not depend on MCP.

## test-impact-analyzer-specific variables

| Variable | Source | Example |
|------|------|------|
| `{{TIA_STRATEGY}}` | `test_impact.strategy` | `coverage` / `deps` / `path` / `auto` |
| `{{TIA_BASE_REF}}` | `test_impact.base_ref` | `main` |
| `{{TIA_FULL_RUN_TRIGGERS}}` | `test_impact.full_run_triggers` | `["config/**","*.lock",".github/**"]` |
| `{{TIA_SHARED_CORE_PATHS}}` | `test_impact.shared_core_paths` | `["src/core/**","src/utils/**"]` |
| `{{TIA_COVERAGE_MAP_PATH}}` | `test_impact.coverage_map_path` | `.testmondata` |
| `{{TIA_ALWAYS_INCLUDE}}` | `test_impact.always_include` | `["smoke_t0"]` |

## Shared variables (consistent with other skills)

| Variable | Source | Example |
|------|------|------|
| `` | `platforms.ios.repo` | `org/ios-app` |
| `` | `platforms.android.repo` | `org/android-app` |
| `{{BACKEND_PYTEST_ROOT}}` | `backend.pytest_project_root` | `services/api` |

## Strategy auto-detection (when strategy = auto)

| Detected | Chosen strategy |
|--------|---------|
| `.testmondata` or pytest + coverage | coverage-based (testmon) |
| `Result.xcresult` / `.profdata` | coverage-based (xccov) |
| `jacoco.exec` | coverage-based (JaCoCo) |
| `nx.json` / `turbo.json` / Bazel | dependency-graph |
| `jest.config` / `vitest.config` | coverage-based (findRelatedTests) |
| None of the above | path-heuristic (most conservative, errs toward over-running) |

## Missing-value degradation rules

| Missing setting / situation | Degradation behavior |
|------------------|---------|
| `test_impact.strategy` empty | auto-detect; if nothing detected → path-heuristic |
| `test_impact.base_ref` empty | default `main` |
| `test_impact.full_run_triggers` empty | default `config/**` · `*.lock` · CI yml (conservative safety net) |
| coverage map missing or stale | **fallback to full run** + prompt to rebuild the map |
| `test_impact.always_include` empty | at least include "the changed/added tests themselves" |
| No test tool detected | skip TIA, prompt "test suite structure unclear; recommend adopting coverage first" |
