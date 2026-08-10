---
name: stage-write-bdd
description: Feature / Version two-stage Gherkin BDD .feature authoring. argument: TICKET-xxx -> Feature; vX.X TICKET-xxx -> Version; vX.X -> Version wrap-up (regression only). Triggers when the user mentions "write BDD, write feature, write scenario, BDD authoring". This skill only "authors" .feature files; to "review/score" existing features use stage-bdd-review; to run the full flow use the corresponding flow-*-testing-workflow.
argument-hint: "<TICKET-xxx | vX.X TICKET-xxx | vX.X>"
allowed-tools: Read, Write, Bash, mcp__atlassian__jira_get_issue
---

BDD authoring assistant. Auto-detects Feature / Version stage from the argument. Forbidden: touching the testcases/ main library / Scenario Outline / fabricating scenarios / commit / push.

---

## Phase 0: Detect stage + path

| argument | Stage | Prerequisite | Output path |
|---|---|---|---|
| `TICKET-xxx` | Feature | `features/{ticket}/test_matrix.md` | `features/{ticket}/cases/{platform}/*.feature` |
| `vX.X TICKET-xxx` | Version (a ticket merged in) | `versions/{version}/testcases/{ticket}/test_matrix.md` | `versions/{version}/testcases/{ticket}/cases/{platform}/*.feature` |
| `vX.X` | Version wrap-up (regression only) | `versions/{version}/plan.md` | `versions/{version}/testcases/regression/{platform}/*.feature` |

Ask if the argument is incomplete. Prerequisite missing -> prompt to first run `/stage-test-matrix` (Feature/Version) or `/stage-version-test-plan` (Version wrap-up).

**Version wrap-up note**: Integration test BDD is **not written** — at run time directly reference all of `testcases/` + `testcases/regression/`; this skill only handles pure regression.

---

## Step 1: Inventory sources

**Feature:**
```bash
ls -R testcases/{platform}/ 2>&1  # check whether the main library has it
```
Read the "Feature file mapping table" in `features/{ticket}/test_matrix.md`, take the Modified/New markers + matrix dimensions.

**Version:**
```bash
ls -R features/{ticket}/cases/ 2>&1
ls -R versions/{version}/testcases/{ticket}/ 2>&1
```

| features/cases/ has .feature | version container has .feature | Action |
|---|---|---|
| Yes | No | Move mode (git mv) |
| No | No | Rewrite mode |
| — | Yes | Ask the user: augment / overwrite / skip |

Read the "Feature file mapping table" in `versions/{version}/testcases/{ticket}/test_matrix.md`.

**Version wrap-up (regression):**
Read the Regression section of `changes.md` (Modified/New list) + `testcases/regression/test_matrix.md` (if present) + `plan.md`.

## Step 2: Compare against the main library + list items

For each target file `ls cases/{platform}/{path}.feature`:
- Exists in main library -> **Modified** (Read the main library file as a starting point, then modify/augment)
- Not in main library -> **New** (write from scratch)
- Marker disagrees with source -> raise it

Confirm the list before continuing:
```
About to process ({stage}, {ticket/version}, N files total):
Modified (M files): {target path} <- {main library path} (modify/augment)
New (K files): {target path} (write whole file)
Move (Version): features/{ticket}/cases/... -> versions/{version}/testcases/{ticket}/cases/...
```

## Step 3: Move (Version move mode)

```bash
git mv features/{ticket}/cases/{platform}/{path}.feature versions/{version}/testcases/{ticket}/cases/{platform}/{path}.feature
```

After moving cases/, the remaining artifacts under `features/{ticket}/` (bdd_review.md, prototype.html, etc.) are all `git mv`'d into `versions/{version}/testcases/{ticket}/`, then delete `features/{ticket}/` — once a ticket enters a version, the single source of truth is the version container; features/ keeps no files, **no need to ask**.

## Step 4: Collect data (run in parallel)

- **Jira**: `jira_get_issue` to fetch the ticket + sub-tickets
- **Business rules**: YouTube is an external site (https://www.youtube.com, guest/logged-out state), no in-house repo; walk the target site to corroborate behavior, write confirmed items directly, mark unconfirmable ones `?`
- **state_machine.md** (if present), **prototype.html** (if present)
- **Figma design**: if test_matrix references a Figma node, or the ticket has a Figma link not yet actually read -> read it with the figma MCP before writing Scenarios (`get_metadata` to probe the frame -> `get_screenshot`/`get_design_context` to read key regions); UI details (fields/destinations/states/empty states/list limits) follow the design, do not rely only on the ticket description or matrix text

## Step 5: Write Scenarios

### Modified (already in main library) — write the diff only
1. Read the main library `testcases/{platform}/{path}` to understand the existing Scenario list and Feature header
2. Identify the Scenarios affected by this ticket/version:
   - **Added**: not in the main library, brought by this ticket's new functionality
   - **Changed**: in the main library, but behavior changed (steps or assertions need updating)
3. **Write only the above two categories**; keep the Feature header intact; mark sections with `# [Added]` or `# [Changed]`
4. Existing Scenarios entirely unrelated are **not written in**; a "not yet implemented" item that is now implemented and in the main library -> annotate "remove from main library at merge back"

### New (not in main library)
Write from scratch; `Background:` extracts shared prerequisites; cover the happy path + main errors + edge cases.

### Gherkin principles
Follow `.claude/rules/gherkin.md`. Tag rule highlights:
- Scenario-level four tag categories: module tag (required) + page tag (required) + test level @smoke/@regression/@auto (required) + scenario tag (optional)
- **Module tag path rule**:
  - Feature: relative path after `features/{ticket}/cases/` joined by `_`
  - Version: relative path after `testcases/{ticket}/` joined by `_` (without version/ticket number)
  - Version wrap-up (regression): relative path after `testcases/regression/` joined by `_` (without version number)
- Feature level: add a role tag only when there are multiple roles; YouTube guest/logged-out state has a single user, so omit the role tag, and the preamble simply states "As a user"
- Forbidden: @P0 / version tag / English tag / Scenario name as a tag / Scenario Outline / backend-bypass Scenarios

## Step 6: Conflict / unclear -> stop and ask

Ticket vs code mismatch / Figma vs code copy differs (default follow code, but ask) / ticket too abstract / test_matrix disagrees with the main library.

## Step 7: Coverage check

Confirm item by item that every matrix dimension in test_matrix has a Scenario covering it.

## Step 8: Update changes.md (Version only)

Add the .feature files to the corresponding section of `versions/{version}/changes.md`:
- Version -> Feature section (Modified/New + @changed-in-{version}/@new-in-{version} tag)
- Version wrap-up (regression) -> Regression section (fix Modified/New markers if they disagree with the actual main library state)

## Report

```
BDD written ({stage}, {ticket/version}, N files total)
Modified M | New K | Moved L (Version)
Coverage: ✅ X dimensions / ⚠️ Y dimensions (reason)
changes.md updated (Version)
Next: {by stage}
  Feature -> /stage-bdd-review (optional) or /stage-jira-sync
  Version -> after all Features are done, run Version wrap-up (/stage-test-matrix vX.X to produce the integration+regression matrix -> /stage-write-bdd vX.X to produce regression BDD)
  Version wrap-up (regression) -> /stage-bdd-review (optional) or /stage-jira-sync
```

---

## Rules

- Ask if the argument is unclear; prerequisite missing -> first run the corresponding skill
- Determine Modified/New by comparing against the main library; YouTube is an external site with no in-house repo, so walk the target site to corroborate behavior
- Version: merge features/{ticket}/ into the version container `versions/{version}/testcases/{ticket}/` using `git mv` (preserve history)
- Always `Write` files, never touch the cases/ main library; every Scenario must have a source
