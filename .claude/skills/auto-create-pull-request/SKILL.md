---
name: auto-create-pull-request
description: Generate a PR description from the current branch's commit history following the git-pr.md format, then run scripts/create-pull-request.sh to open it (auto-updates when a PR already exists). Includes test-layer / documentation impact analysis. Triggers when the user mentions "send PR, create PR, open PR, push PR, update PR".
allowed-tools: Bash, Read
argument-hint: "[--base=main] [--draft]"
model: sonnet
---

# create-pull-request

Generate a PR description from the commit history, then open or update the PR via `scripts/create-pull-request.sh`.

## Phase 1: Collect diff info

```bash
BASE="${1:-main}"
BRANCH=$(git branch --show-current)

git log --oneline "$BASE"...HEAD 2>/dev/null || git log --oneline
git diff --name-only "$BASE"...HEAD 2>/dev/null || git diff --name-only
git diff --stat "$BASE"...HEAD 2>/dev/null
```

## Phase 2: Analyze the change type

### A. Playwright-Web-Agentic-Engineering-Automation internal changes
- `.claude/skills/**` → skill added / modified
- `.claude/rules/**` → working rules
- `scripts/**` / `.github/workflows/**` → automation scripts
- `versions/**` / `features/**` / `testcases/**` → QA documents

### B. Test-layer / documentation impact

Determine which parts of this repo a skill change affects (the product under test, YouTube, is an external site with no separate product repo):

| Skill change | Affected area |
|-----------|---------------|
| matrix / bdd / state-machine | QA documents under features/ or versions/ |
| tc-merge | testcases/ main library |
| jira-sync | Jira ticket sync (no codebase change) |
| bdd-review | No codebase change (report only) |
| open-qa-bug | Jira tracking (no codebase change) |
| playwright-agentic-automation-workflow | youtube/ (this repo's E2E test layer) |

## Phase 3: Generate PR title and body

Produce the title and body following the `.claude/rules/git-pr.md` format.

**Title format**: `<type>(<scope>): <subject>` (≤ 72 characters)

**Body format**:
```markdown
## What
<!-- 1–3 sentences describing what this PR does -->

## Why
<!-- Motivation: requirement, ticket, or the problem it solves -->

## Code Changes
- `.claude/skills/xxx/SKILL.md`: description

**Test-layer impact (if any):**
- `youtube/src/pages/`: description

## Related Tickets
<!-- Jira ticket number, or N/A if none -->

## Test Plan
- [ ] Verification steps
```

## Phase 4: Run the shell script

> **Opening / updating a PR is an outbound action → before running, show the title + body to the user for confirmation and get approval first** (per the global rule: always ask before every commit / push / opening a PR).

```bash
chmod +x scripts/create-pull-request.sh

export PR_TITLE="<generated title>"
export PR_BODY="<generated body>"

./scripts/create-pull-request.sh "${BASE}" ${DRAFT_FLAG}
```

The script decides automatically:
- PR does not exist → `gh pr create`
- PR already exists → `gh pr edit` (updates title + body)

> **Re-run this skill after pushing new commits, and the PR description syncs automatically.**

## Phase 5: Output + chain into code review

1. Return the PR URL.
2. **Automatically chain into `/auto-code-review --base=<BASE>`** (invoked via `Skill("auto-code-review")`; replaces the nonexistent `claude-code-review.yml` CI): for the just-opened / updated PR, a judgment subagent runs deterministic checks on the spot → applies the rubric → produces a verdict → posts it back as a PR comment.
   - PR description contains "skip review" → do not chain.
   - Same head SHA already reviewed → auto-code-review short-circuits on its own and does not re-run.
3. Review is **advisory**: it only leaves comments, does not approve / merge; the final decision rests with a human.
