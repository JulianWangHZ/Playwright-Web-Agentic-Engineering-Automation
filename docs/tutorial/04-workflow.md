# Workflow

| [← Skill System](03-skills.md) | [Newcomer Checklist →](05-checklist.md) |
|:---|---:|
| Step 3: Which skills exist and how to use them | Step 5: Day 1/2/3 task list |

**Step 4 / 5**

---

## Three Workspaces

Before you start, remember the locations of the three workspaces:

| Workspace | Path | Description |
|---|---|---|
| Feature | `features/{ticket}/` | During single-feature development |
| Version | `versions/{version}/` | Cross-ticket version acceptance + integration regression |
| Main library | `testcases/` | Released stable cases (read-only) |

---

## Feature Stage (single feature ticket)

Begins when RD says "this ticket is Ready for QA".

```
1. /stage-test-matrix TICKET-xxx          → build the test matrix
2. /stage-state-machine TICKET-xxx   → draw the state machine (when there is state flow)
3. /stage-write-bdd TICKET-xxx             → write the BDD .feature
4. /stage-ui-prototype TICKET-xxx       → build the HTML prototype (for new UI)
5. /stage-bdd-review TICKET-xxx      → independent subagent reviews the BDD
6. Manual Feature testing
7. /stage-jira-sync TICKET-xxx       → sync artifacts to Jira
```

Output location: `features/{ticket}/`

---

## Version Stage (version integration + wrap-up sign-off)

When multiple Features enter a Version at the same time, plan them together; the wrap-up is done by one person who integrates and runs regression, then finally signs off and merges back.

```
1. /stage-version-test-plan v4.14       → build plan.md + changes.md
2. /stage-test-matrix v4.14 TICKET-xxx           → add the matrix for each Feature (parallel across people)
3. /stage-write-bdd v4.14 TICKET-xxx              → write the Version BDD for each Feature
4. /stage-bdd-review v4.14              → review all Version BDD
5. Manual Version testing + cross-feature integration + regression
6. /stage-jira-sync v4.14 stg           → sync to Jira
7. /tool-qa-release-gate v4.14          → pre-release gate (go/no-go)
8. /stage-tc-merge v4.14                → merge back to the main library after confirming no further changes
```

Output location: `versions/{version}/testcases/{ticket}/`; regression cases go in `versions/{version}/testcases/regression/{platform}/`

---

## tc-merge: Merge Back to the Main Library

`/stage-tc-merge` is the last step of the whole workflow, and the **only skill that can write to `testcases/`**.

It does three things:
1. Reads `changes.md`, scans all delta files, and lists the merge candidates
2. Executes the merge after you confirm (New = full-file copy, Modified = per-Scenario intelligent merge)
3. Deletes `versions/{version}/testcases/{ticket}/`

**Timing**: Run it only after the whole Version passes, `/stage-jira-sync` has finished, and **you have confirmed there will be no further changes**.

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
| Step 3: Which skills exist and how to use them | Step 5: Day 1/2/3 task list |
