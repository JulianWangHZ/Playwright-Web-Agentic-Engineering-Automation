# Workflow

| [← Skill System](03-skills.md) | [Newcomer Checklist →](05-checklist.md) |
|:---|---:|
| Step 3: Which skills exist and how to use them | Step 5: Newcomer checklist |

**Step 4 / 6**

> Interactive visual flow diagram: [pipeline.html](../../pipeline.html) · Which skill to use at each stage: [skills-guide.html](../skills-guide.html) · Stage → skill single source of truth: [qa-workflow-map.md](../qa-workflow-map.md)

---

## Three Workspaces

| Workspace | Path | Purpose |
|---|---|---|
| **Main testcases library** | `testcases/` | Released, stable cases — single source of truth |
| **Feature workspace** | `features/{ticket}/` | Single-feature development stage |
| **Version verification** | `versions/{version}/` | Cross-ticket Version integration + regression |

The main testcases library is **read-only** during development. Only `/stage-tc-merge` may write to it, and only after the whole version passes QA and is no longer changing.

---

## Step 1 — RD Ready: Create `features/{ticket}/`

After receiving a Jira ticket, create the Feature workspace in a fixed order:

```
1. test_matrix.md           ← list all scenarios
2. (validate the matrix, confirm nothing is missing)
3. state_machine.md         ← draw only after the matrix is validated
4. cases/{platform}/*.feature   ← write the BDD last
```

> **Do not skip the order.** Drawing the state machine before validating the matrix easily skews scope; writing cases before drawing the state machine easily misses boundaries.

`{platform}` = the product-under-test directory (this platform is `youtube`). When applied to multiple products, a single ticket can cover several platforms at once.

**BDD authoring principles**:
- **Modified** (a corresponding file already exists in the main library) → only write the Scenarios **added** or **changed** by this ticket, marking sections with `# [added]` / `# [changed]`
- **New** (no corresponding file in the main library) → write the whole file from scratch

**Skills**: `/stage-test-matrix` → `/stage-state-machine` (optional) → `/stage-write-bdd` → `/stage-ui-prototype` (optional) → `/stage-bdd-review` (optional)

---

## Step 2 — QA Feature Testing

Run the BDD in `features/{ticket}/cases/` against the dev environment.
Record test results in the Jira ticket. After it passes, mark `QA pass ft`.

After testing is complete, you can run `/stage-jira-sync` to sync the test artifacts to Jira, creating a TEST Sub-task under the feature ticket (Cases, Test Matrix + Prototype, State Machine) for archiving.

**Skill**: `/stage-jira-sync` (optional)

---

## Step 3 — Merge the Feature into the Version Container

When a ticket enters a Version, merge `features/{ticket}/` into the version container:

```
features/{ticket}/  →  versions/{version}/testcases/{ticket}/
```

After merging, the original `features/{ticket}/` can be deleted.

> This step does **not** update the `testcases/` main library. The main library is only updated after the whole version is released and `/stage-tc-merge` has run.

---

## Step 4 — QA Version Testing: Split by Feature Across the Team + Integration Regression

Branch `feature/v{version}` off main and create the `versions/{version}/` version container:

- Each Feature gets one folder under `versions/{version}/testcases/{ticket}/` (`test_matrix.md` + `{platform}/*.feature`)
- When the same file is touched by multiple Features: pick a primary owner, keep only one copy, and record the other ticket numbers in `changes.md`
- Write `versions/{version}/plan.md`, sectioned by Feature with an assigned lead QA
- Cross-feature integration tests reference `versions/{version}/testcases/` directly, without copying again
- Pure regression cases for neighboring modules go in `versions/{version}/testcases/regression/{platform}/`

**Skills**: `/stage-version-test-plan` → `/stage-test-matrix` → `/stage-state-machine` (optional) → `/stage-write-bdd` → `/stage-bdd-review` (optional) → `/stage-jira-sync` (optional)

Once the whole Version passes and is confirmed to no longer change, use `/tool-qa-release-gate vX.X` to run the pre-release release gate (go/no-go), then proceed to Step 5 merge back.

---

## Step 5 — Release: Merge Back to the Main Library

After the Version passes and is confirmed to no longer change, run `/stage-tc-merge vX.X` to merge back to the main library:

| Source | Target |
|---|---|
| `versions/{version}/testcases/{ticket}/cases/{platform}/{path}` | `testcases/{platform}/{path}` |

### Merge-Back Rules

#### New (the main library does not have this `.feature`)
This file does not exist in the main library at all, so merge = **copy the whole file into `testcases/`**.

#### Modified (the main library already has this `.feature`)
A Modified file under features/ is **diff-only**, containing only the Scenarios added or changed by this ticket. The merge is a **per-Scenario** operation, not a whole-file overwrite:

| Section marker | Does the main library have this Scenario? | Operation |
|---|---|---|
| `# [added]` | ❌ | Append to the corresponding section of the main library file |
| `# [changed]` | ✅ | Find the same-named Scenario in the main library and replace it with the new version |
| `# remove from main library on merge` | ✅ | Delete that Scenario block from the main library |

After the merge, the `# [added]` / `# [changed]` markers are removed from the main library file; `@changed-in-*` / `@new-in-*` version tags are never carried into the main library.

> **Why can't Modified files be overwritten whole?**
> The main library still contains Scenarios from other tickets; pasting the whole file would wipe them out.

#### After the Merge Completes
`/stage-tc-merge` automatically deletes `versions/{version}/testcases/{ticket}/` (keeping `versions/{version}/plan.md` and `changes.md`).

The version branch is kept as a historical snapshot and is no longer modified.

**Skill**: `/stage-tc-merge` (the only skill allowed to write to `testcases/`)

---

## Key Rules

| Rule | Reason |
|---|---|
| A ticket entering a Version must merge `features/{ticket}/` into the version container | Keep the Feature workspace clean |
| Do not edit the same case file across multiple active branches at once | Avoid merge conflicts |
| Multiple Features touching the same file → pick a primary owner, keep only one copy | Avoid duplication |
| The Version has multiple people testing features in parallel, with one person integrating + regressing at the end | Balance breadth and integration |
| Every layer must have a `test_matrix.md` | Traceability |
| Branch names use only `vX.X`; no personal names / dates / temp | Historical consistency |
| Only `/stage-tc-merge` can write to `testcases/` | Single source of truth |

---

## The Three Most Commonly Used Commands

The first ones newcomers reach for when getting started:

```bash
# View the risk analysis of a Feature ticket (writes no files)
/tool-scan-qa-risk TICKET-xxx

# Build the test matrix for a Feature ticket
/stage-test-matrix TICKET-xxx

# Write the BDD for a Feature ticket
/stage-write-bdd TICKET-xxx
```

---

| [← Skill System](03-skills.md) | [Newcomer Checklist →](05-checklist.md) |
|:---|---:|
| Step 3: Which skills exist and how to use them | Step 5: Newcomer checklist |
