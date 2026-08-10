---
name: stage-version-test-plan
description: The first step of the Version stage — pull this version's tickets by Jira fixVersion, create the versions/{version}/ version container, and produce the initial plan.md + changes.md. Triggers when the user mentions "start collecting a version", "create the version container", "pull this version's tickets", "which features does this version include", "version plan". Usually called automatically by flow-version-testing-workflow.
argument-hint: <version vX.X, e.g. v4.16; i.e. the Jira fixVersion>
allowed-tools: Read, Write, Bash, mcp__atlassian__jira_search, mcp__atlassian__jira_get_issue
---

Version test plan helper. **Only creates the `versions/{version}/` skeleton and `plan.md`/`changes.md`**; cases/ is handled by `/stage-test-matrix` and `/stage-write-bdd`. plan.md covers Feature allocation + integration test flows + regression scope (settled in one pass at Version wrap-up). Forbidden: touching the cases/ main library / commit / push.

Working directory: `Playwright-Web-Agentic-Engineering-Automation`

---

# Part 1: Pull tickets + verify

## Step 1: Parse input

The argument is a version number `vX.X` (e.g. `v4.16`, lowercase v), which maps to the artifact container `versions/{version}/` and is also the Jira **fixVersion** value — pull the ticket scope directly with it, **do not scan the sprint** (the sprint is a long-running rolling backlog containing many historical tickets).

## Step 2: Environment pre-check (do not touch files)

Record: current branch, whether the working tree is clean, whether `feature/{version}` exists, whether `versions/{version}/` exists.

## Step 3: Pull this version's tickets by fixVersion

**3a Pull main tickets**:
- jql: `project = HC AND fixVersion = "{version}" AND issuetype != Sub-task`
- fields: summary/description/status/issuetype/parent/labels/assignee, maxResults:50
- Note: `issuetype != Sub-task` does not filter out `Sub-task-bug`; when grouping, classify by issue_type under the parent yourself
- 0 tickets → the fixVersion may not exist or the version number is wrong; list recent fixVersion candidates from `project = HC` for the user to confirm, do not guess blindly

**3b** For each main ticket, expand its sub-tickets (jql: `parent in ({main tickets})`, if 3a did not include them).

**3c** The pulled tickets may include some outside this framework's test scope (e.g. non-YouTube-facing, or old tickets that had a fixVersion attached later) → group and list them at Checkpoint 1 for the user to decide; the feature-area labels (search video / video playback / channel / search filters) are only for grouping reference.

## [Checkpoint 1] Confirm ticket scope

```
fixVersion "{version}" has N tickets total

### {group}
- {ticket} ({status}) — {summary}
  - {sub-ticket} — {summary}

### Presumed outside the Playwright-Web-Agentic-Engineering-Automation scope
- {ticket} — {reason}

Please confirm: (1) Are these N tickets this version's scope? Any to remove/add? (2) Agree to exclude the out-of-scope ones? Mark them as "not covered" in plan.md?
```

**Wait for an explicit user reply before proceeding to Part 2.**

---

# Part 2: Branch strategy

## [Checkpoint 2] Ask about the branch

```
git status: current branch {x} | working tree {clean/has N changes} | feature/{version} {does not exist/exists} | versions/{version}/ {does not exist/exists}

Which branch?
A. Stay on the current "{current_branch}"
B. Cut a new feature/{version} from main (Recommended)
C. Cut a new feature/{version} from the current branch
```

**Wait for the user to choose A/B/C before touching git.**

## Step 6: Execute the branch

Cut the branch per the choice; if the working tree is not clean, handle it first (stash/commit/carry over):

```bash
mkdir -p versions/{version}
```

---

# Part 3: Write the documents

## Step 7: Classify tickets (internal analysis)

- Feature tickets (with RD changes) → version container (versions/{version}/testcases/{ticket}/)
- Regression-type cases (cross-Feature, neighboring features) → versions/{version}/testcases/regression/
- Feature areas: search video / video playback / channel / search filters (can be multiple)
- Infer QA from the Jira assignee, or leave blank

## Step 8: Write versions/{version}/plan.md

```markdown
# {version} Version Test Plan
fixVersion: {version}
Branch: {branch}
Feature areas: {...}

## Feature allocation
| Feature ticket | Title | Lead QA |
|---|---|---|

## Scope per Feature
### {ticket} — {title}
- Affected areas: {search video / video playback / channel / search filters}
- Main function: {what changed}
- Jira: https://your-workspace.atlassian.net/browse/{ticket}

## Integration tests (cross-Feature end-to-end flows; Version wrap-up)
1. **{Flow A}** — Features: TICKET-XXXX + TICKET-ZZZZ
   - {step description} | Expected: {...}

## Regression tests (versions/{version}/testcases/regression/)
- `{path}` — {why regression}

## Risks
## Not covered (outside the Playwright-Web-Agentic-Engineering-Automation scope)
- {ticket} — {reason}
```

> The integration flows + regression scope rely on Checkpoint 3 to confirm with the user; do not invent cross-Feature flows yourself. When integration tests run, they reference each Feature's testcases/, not copies.

## Step 9: Write the versions/{version}/changes.md skeleton

```markdown
# {version} diff against the main library

## Version (grouped by Feature)
### {ticket} — {title}
**Modified**
- testcases/{ticket}/cases/{path}.feature — {what changed} (@changed-in-{version})
**New**
- testcases/{ticket}/cases/{path}.feature — {what was added} (@new-in-{version})

## Regression (not tied to a Feature, cross-Feature / neighboring modules)
**Modified**: testcases/regression/{path} — {reason for strengthening}
**New**: testcases/regression/{path} — {reason for filling the gap}
```

## [Checkpoint 3] Verify

```
Written: versions/{version}/plan.md, versions/{version}/changes.md

fixVersion {version} | feature areas {x} | Feature {N} tickets (QA allocated {X}/pending {Y}) | not covered {N} tickets

Please confirm: (1) Feature allocation (2) Lead QA (3) Risk additions (4) Not-covered assessment
              (5) Key integration test flows (cross-Feature chaining, at least one; if none, fill in "no integration flow")
              (6) Regression scope (affected neighboring modules; if none, fill in "no regression needed")

After confirming, run /stage-test-matrix vX.X TICKET-XXXX to add a test matrix for each Feature.
```

---

## Rules

- Version number format `vX.X` (e.g. v4.16); reject anything that violates it
- Always pull ticket scope with `fixVersion = "{version}"`; do not scan the whole sprint (a rolling sprint contains historical tickets, and even a scan would need to reverse-infer version boundaries from status)
- Part 1 does not touch git or files; if a branch with the same version number already exists → ask how to handle at Checkpoint 2
- Do not touch the cases/ main library; always write files with `Write`
