---
name: qa-merge
description: After case sign-off, merge runs/{ticket}/cases/ .feature files back into the testcases/ main library. New files are copied; Modified files are merged scenario by scenario ([added] inserted, [changed] replaced, marked scenarios removed). The only skill allowed to write testcases/. Called by /qa-ticket after sign-off; also usable directly on "merge back", "merge into main library", "tc merge", "update main library".
argument-hint: "<TICKET-xxx>"
allowed-tools: Read, Write, Bash
---

# qa-merge — merge back into the main library

**The only skill allowed to write `testcases/`.** Forbidden: commit / push.

Prerequisite: `runs/{ticket}/cases/` has `.feature` files and `progress.md` records the case sign-off (called directly without sign-off → ask the user first).

## 1. Merge plan

```bash
find runs/{ticket}/cases -name '*.feature' | sort
```

Path mapping: `runs/{ticket}/cases/{relative}` → `testcases/{relative}`.

- Not in the main library → New
- In the main library → Modified

List the plan, then merge (from /qa-ticket the cases are already signed off, so don't stop again; when called directly, show the user the plan first):

```
Merge plan ({ticket}):
New N: testcases/{relative}
Modified M: testcases/{relative} (added a / changed b / removed c scenarios)
```

## 2. Merge

### New
1. `mkdir -p` the parent directory.
2. Read the delta → Write to `testcases/{relative}`, dropping `# [added]` style markers.

### Modified

| Delta content | Action |
|---|---|
| Scenario under `# [added]` | insert after the matching section divider (`# ####…`); no matching section → append to the end |
| Scenario under `# [changed]` | find the same `Scenario: {title}` (exact match) and replace the whole block |
| Scenario with `# remove from main library on merge` | find the same-name Scenario and delete the whole block |
| Feature header (notes / Feature / preamble / Background) | take the delta's version |

- `[changed]` with no same-name Scenario → treat as `[added]` and mention it in the report.
- A same-name main-library Scenario changed by someone else after this run started (`git log -1 --format=%cd -- testcases/{relative}` later than the runs/ directory) → stop and show both versions to the user.
- No `# [added]` / `# [changed]` markers remain after merging.

## 3. Verify + report

```bash
cd youtube && npx bddgen
```

```
Merged into testcases/ ({ticket})
New N | Modified M (added a / changed b / removed c)
bddgen: ✅ / ❌ {error}
```

`runs/{ticket}/cases/` stays (used later by scripts and Jira sync).
