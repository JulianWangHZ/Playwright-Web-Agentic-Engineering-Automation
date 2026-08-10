---
name: stage-tc-merge
description: The final step of a version — merge each Feature's approved BDD cases from versions/{version}/testcases/ back into the testcases/ main library. New files are copied directly; Modified files are smart-merged (append new, override changes, remove scenarios marked for removal). Triggers when the user mentions "merge back to main library", "tc merge", "merge back", "update main library", or "testcases update". Stop This is the "last step" of a version release and writes into the testcases/ main library — do not use outside a merge-back context; for the full Version testing flow use flow-version-testing-workflow.
argument-hint: <vX.X>
allowed-tools: Read, Write, Bash
---

BDD main-library merge helper. Merges the Version's approved .feature files back into `testcases/`. **This is the only skill allowed to write into `testcases/`**. Forbidden: touching versions/ artifacts / commit / push.

**When to run**: after all Version BDD (including integration + regression) has been reviewed and signed off, `/stage-jira-sync` has run, and you have confirmed there will be no further changes.

---

## Phase 0: Confirm prerequisites

```bash
ls versions/{version}/testcases/
ls versions/{version}/changes.md
```

changes.md missing → stop, prompt to run `/stage-version-test-plan` first.

---

## Phase 1: Inventory changed files

Read `versions/{version}/changes.md` and pull all Modified / New items from the "Version (grouped by Feature)" section.

At the same time, scan the delta files that actually exist:
```bash
find versions/{version}/testcases -name '*.feature' | sort
```

**Path conversion rule**:
```
versions/{version}/testcases/{ticket}/cases/{relative}
                              ↓
testcases/{relative}
```

**Group by target path** (a single target may have deltas from multiple Features):

```
target: testcases/search.feature
  delta 1: testcases/TICKET-1352/cases/search.feature  [Modified]
  delta 2: testcases/TICKET-1955/cases/search.feature  [Modified]

target: testcases/search-filters.feature
  delta 1: testcases/TICKET-1352/cases/search-filters.feature  [New]
  delta 2: testcases/TICKET-1663/cases/search-filters.feature  [Modified]
```

After grouping, list a confirmation checklist:
```
Merge-back list ({version}):

New (copy directly, {N} items):
  testcases/{relative} ← testcases/{ticket}/cases/{relative}

Modified (smart merge, {M} targets, {K} deltas total):
  testcases/search.feature ← TICKET-1352 + TICKET-1955
  testcases/watch.feature ← TICKET-1352 + TICKET-1635
  ...

Confirm and start merging?
```

Wait for user confirmation.

---

## Phase 2: Execute the merge

### New files

1. Confirm `testcases/{relative}` does not exist (if it already exists → ask the user: overwrite / skip / handle as Modified)
2. Confirm the directory exists: `mkdir -p testcases/{parent dir of relative}`
3. Read the full delta → Write to `testcases/{relative}`

### Modified files

Process each delta in the Feature order given in changes.md:

**Read:**
- Existing main library: `testcases/{relative}` (the first delta uses the main library; subsequent deltas use the merge result from the previous round)
- Delta: `testcases/{ticket}/cases/{relative}`

**Merge rules:**

| Delta marker | Action |
|---|---|
| Scenario under a `# [New]` section | Find the corresponding section divider (`# ##...##`) and append the Scenario after it; if no matching section is found → append to the end of the file |
| Scenario under a `# [Changed]` section | Find the same-named Scenario in the main library (`Scenario: {title}` exact match) and replace the entire Scenario block |
| Scenario with a `# remove from main library on merge` comment | Find the same-named Scenario in the main library and delete the entire Scenario block |
| Feature header (page path / Feature / preamble / Background) | Update per the delta version (may contain copy updates) |
| Tag (@changed-in-{version} / @new-in-{version}) | **Remove on merge**, do not carry into the main library |

**Conflict handling:**
- The same Scenario changed by two deltas → list both versions and ask the user which to keep (or continue after a manual merge)
- A delta marked as "Changed" but no same-named Scenario found in the main library → treat as "New" and prompt to confirm

Write the merge result to `testcases/{relative}`.

---

## Phase 3: Clean up versions/{version}/testcases/

After the merge is confirmed correct, delete all versions/{version}/testcases/ subdirectories for this version (Jira is already synced; no need to keep them locally):

```bash
rm -rf versions/{version}/testcases/{ticket1}
rm -rf versions/{version}/testcases/{ticket2}
# ... all tickets
```

Keep: `versions/{version}/plan.md`, `versions/{version}/changes.md`.

## Phase 4: Verify + report

```bash
find testcases -name '*.feature' | sort
ls versions/{version}/
```

```
Merged back into the testcases/ main library ({version})

New      N items: {list}
Modified M items ({K} deltas): {list}
Conflicts: {N} (manually confirmed / pending confirmation)
Version tags removed: @changed-in-{version}, @new-in-{version}

Cleanup: versions/{version}/testcases/ deleted
Kept: plan.md, changes.md

Next: after confirming the testcases/ content is correct, open a git PR (feature/{version} → main)
```

---

## Rules

- **The only skill allowed to write `testcases/`**; all other skills treat the main library as read-only
- Ask if the argument is ambiguous; changes.md missing → stop
- Delta order follows the Feature listing order in changes.md (do not reorder on your own)
- New file target already exists → ask first, do not overwrite directly
- Version tags (@changed-in-* / @new-in-*) are always removed on merge
- Do not decide conflicts on your own; always stop and ask the user
- Always write files with `Write`; do not commit / push
