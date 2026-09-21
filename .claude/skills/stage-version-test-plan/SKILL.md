---
name: stage-version-test-plan
description: First step of the Version stage — fetch tickets by Jira fixVersion, create the versions/{version}/ container, and produce an initial plan.md + changes.md. Triggered when the user mentions starting a version, building a version container, pulling version tickets, version plan, or release planning. Typically called automatically by flow-version-testing-workflow.
argument-hint: <version vX.X, e.g. v4.16 — matches the Jira fixVersion>
allowed-tools: Read, Write, Bash, mcp__atlassian__jira_search, mcp__atlassian__jira_get_issue
---

Version test plan assistant. **Only creates `versions/{version}/` and the `plan.md` / `changes.md` skeleton.** Cases go to `/stage-test-matrix` and `/stage-write-bdd`. Do not touch cases/, the main testcase library, commit, or push.

---

# Part 1: Fetch tickets & validate scope

## Step 1: Parse input

The argument is a version string `vX.X` (e.g. `v4.16`, lowercase v). This maps to the output container `versions/{version}/` and is used as the Jira **fixVersion** value — tickets are fetched directly by it. **Do not scan sprints** (sprints are rolling and include historical tickets).

## Step 2: Pre-flight check (no file changes)

Record: current branch, whether the working tree is clean, whether `feature/{version}` exists, whether `versions/{version}/` exists.

## Step 3: Fetch tickets by fixVersion

**3a — Fetch main tickets:**
- jql: `project = HC AND fixVersion = "{version}" AND issuetype != Sub-task`
- fields: summary / description / status / issuetype / parent / labels / assignee, maxResults: 50
- Note: `issuetype != Sub-task` does not filter `Sub-task-bug` — group these under their parent manually based on issue_type
- 0 results → fixVersion may not exist or version string is wrong; list recent fixVersion candidates from `project = HC` for the user to confirm

**3b** — For each main ticket, expand sub-tickets (jql: `parent in ({main tickets})`) if not already included.

**3c** — Some tickets may be outside the tracked scope (e.g. merchant-side features, old tickets with fixVersion back-filled). Group and surface these at Checkpoint 1 for the user to decide. Platform labels are for grouping only, not authoritative.

## [Checkpoint 1] Confirm ticket scope

```
fixVersion "{version}" — N tickets found

### {Group}
- {ticket} ({status}) — {summary}
  - {sub-ticket} — {summary}

### Likely out of scope
- {ticket} — {reason}

Please confirm: ① Are these N tickets the full scope for this version? Any to remove or add? ② Agreed to exclude out-of-scope tickets? Should they be noted as "not covered" in plan.md?
```

**Wait for an explicit reply before proceeding to Part 2.**

---

# Part 2: Branch strategy

## [Checkpoint 2] Ask for branch + basic info

```
Git status: current branch {x} | working tree {clean / N changes} | feature/{version} {not found / exists} | versions/{version}/ {not found / exists}

Please provide:
① Which branch?
   A. Stay on current "{current_branch}"
   B. Cut new feature/{version} from main (Recommended)
   C. Cut new feature/{version} from current branch
② QA lead (owner):
③ Target release date (YYYY-MM-DD):
```

**Wait for the user's reply before touching git.**

## Step 6: Execute branch

Apply the chosen option. If the working tree is not clean, resolve it first (stash / commit / carry over):

```bash
mkdir -p versions/{version}
```

---

# Part 3: Write documents

## Step 7: Classify tickets (internal analysis)

- Feature tickets (with RD changes) → version container (`versions/{version}/testcases/{ticket}/`)
- Regression cases (cross-feature, neighbouring modules) → `versions/{version}/testcases/regression/`
- Platform: pickday / join1 (may be both)
- QA owner: infer from Jira assignee, or leave blank

## Step 8: Write versions/{version}/plan.md

Generate from the template in `references/templates.md`, populating all known fields:
- `Owner`, `Target Release`, `Branch`: from the user's reply at Checkpoint 2
- `Scope`: one-sentence summary of the core change derived from ticket summaries; "Out of scope" and regression modules are filled at Checkpoint 3
- `Risk-based Prioritization`: derive P0 / P1 / P2 from the change surface and Integration Risk analysis
- `Integration Risk`: cross-ticket impact points; if none, write "All tickets are independent — no integration risk"
- `Dependencies & Blockers`: list known feature flags / staging build requirements; others filled at Checkpoint 3
- All other placeholders (Assumptions detail / Test Approach specifics / Exit Criteria numbers / Open Questions) stay as `{fill in}` for the QA to complete

> Regression modules, Integration Risk details, and Exit Criteria thresholds are confirmed at Checkpoint 3 — do not invent them.

## Step 9: Write versions/{version}/changes.md skeleton

```markdown
# {version} Changes vs Main

## Version (by feature ticket)
### {ticket} — {title}
**Modified**
- testcases/{ticket}/cases/{platform}/{path}.feature — {what changed} (@changed-in-{version})

**New**
- testcases/{ticket}/cases/{platform}/{path}.feature — {what was added} (@new-in-{version})

## Regression (not tied to a single feature — cross-feature / neighbouring modules)
**Modified**: testcases/regression/{path} — {reason for update}
**New**: testcases/regression/{path} — {reason for addition}

## Removed (exists in main but dropped this version)
- (none)

## Co-modified files (multiple features touching the same file)
- (none)
```

## [Checkpoint 3] Review

```
Written: versions/{version}/plan.md, versions/{version}/changes.md

fixVersion {version} | Platform {x} | Features {N} tickets (QA assigned {X} / unassigned {Y}) | Out of scope {N}

Please confirm or add:
① Out-of-scope tickets / modules (with reason)
② Modules that need regression (reason; if none, confirm "no regression needed — reason: {fill in}")
③ Any cross-ticket integration risks missed
④ Exit Criteria thresholds (automation pass rate % / max P1 open count)
⑤ Any additional Dependencies & Blockers (owner / deadline)
⑥ Open Questions (owner / deadline)
⑦ Out-of-scope ticket disposition (mark as "not covered" or exclude entirely)

Once confirmed, run /stage-test-matrix vX.X HC-XXXX to build the test matrix for each feature ticket.
```

---

## Rules

- Version format must be `vX.X` (e.g. v4.16) — reject anything that doesn't match
- Always fetch tickets with `fixVersion = "{version}"` — never scan the full sprint (rolling sprints contain historical tickets)
- Part 1 must not touch git or files; if a branch for this version already exists, raise it at Checkpoint 2
- Do not modify the cases/ library; always use `Write` for file output
