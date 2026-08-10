---
name: auto-code-review
description: Run a Playwright-Web-Agentic-Engineering-Automation framework code review on the current branch's diff (or a specified PR). Dispatch an independent judgment subagent that runs deterministic checks on the spot (cross-skill dead references / bddgen / npm check), then applies a 100-point rubric, synthesizes a verdict (APPROVE / APPROVE_WITH_FIXES / BLOCK), and posts it back to the PR when appropriate. Triggers when the user mentions "code review, review PR, PR review, help me look at the PR", or when auto-create-pull-request finishes opening a PR.
argument-hint: "[--base=<branch>] (default main)"
allowed-tools: Read, Bash, Glob, Grep, Agent
model: sonnet
---

# code-review

**Two-stage** (trimmed for this prose-first skill/rule repo, not a direct copy of the code-base version):

1. **Gate** (zero token): empty diff / bypass / same SHA already reviewed → short-circuit immediately.
2. **judgment subagent** (independent, inherits sonnet by default): the subagent itself runs deterministic checks with Bash (cross-skill dead references, and bddgen / npm check when needed), then applies the rubric to produce a verdict.

Review is **advisory**—the authority to merge / commit / push stays with a human. This skill does not touch git; it only leaves comments.

---

## Phase 0: Gate

```bash
BASE="${1:-main}"
HEAD_SHA=$(git rev-parse HEAD)
# Include untracked new files (newly added skill sub-files like reviewer-prompt.md are not in git diff)
CHANGED=$( { git diff --name-only "$BASE"...HEAD; git ls-files --others --exclude-standard; } | sort -u )
```

Evaluate in order; stop as soon as one matches:
- **Empty diff** (`CHANGED` is empty) → return "No changes, review skipped".
- **bypass**: the diff or PR description contains "skip review" → return "Review skipped".
- **one-shot per SHA**: if there is a matching PR that already has a comment containing the `<!-- auto-code-review:${HEAD_SHA} -->` marker → return "This commit has already been reviewed".

> This repo's skill / rule markdown **is the product itself**, so do **not** skip the judgment just because it is "documentation only"—the judgment always runs (unless one of the three gates above matches).

---

## Phase 1: Collect the diff

```bash
git log --oneline "$BASE"...HEAD
git diff --stat "$BASE"...HEAD
```

Read the full content of every changed file to feed the subagent's judgment.

---

## Phase 2: Dispatch the judgment subagent (independent, to avoid self-review bias)

```
Agent(
  description: "Playwright-Web-Agentic-Engineering-Automation PR code review",
  subagent_type: "general-purpose",
  prompt: <Read .claude/skills/auto-code-review/reviewer-prompt.md and substitute placeholders>
)
```

> **model**: unspecified by default, inherits the orchestrator (sonnet)—so it can also run in environments without 1M-context / Opus credits. Only add `model: "opus"` when you need deeper reasoning and the environment has credits (note: opus in this environment is 1M context and will fail outright without credits).

Placeholder substitution:
- `{BASE}` ← base branch
- `{CHANGED_FILES}` ← the `CHANGED` list
- `{DIFF_AND_FILES}` ← the full content of the changed files (labeled with filenames)

The subagent **runs the deterministic checks with Bash itself** (cross-skill dead references always run; bddgen / npm check run conditionally based on what the diff touches). Any FAIL becomes an internal single-veto `BLOCK`; the last line outputs `VERDICT: APPROVE|APPROVE_WITH_FIXES|BLOCK`. Parse that line as the final verdict.

---

## Phase 3: Output + post back to the PR

1. **Always** output the full report to the user (English).
2. **Print for you only by default.** Only when the current branch has a matching **open PR** (`gh pr view --json number,url` succeeds) do you post a comment to leave a trail:

```bash
gh pr comment "$PR_NUMBER" --body "$(cat <<EOF
<!-- auto-code-review:${HEAD_SHA} -->
${REPORT}

**Final verdict: ${FINAL_VERDICT}** (advisory; merge authority stays with a human)
EOF
)"
```

3. Posting a comment is non-destructive (leaves an opinion, does not touch code / git history), so run it directly when there is a PR; no `gh` / not logged in / no PR → **skip posting, output only, do not error**.

---

## Rules

- Review is advisory: **do not approve / merge / commit / push**; the final authority stays with a human.
- The judgment always runs (prose is the product); do not skip for documentation-only changes. Save tokens via bypass + same-SHA deduplication.
- Deterministic checks run on the spot in the subagent; a FAIL is a single veto to BLOCK.
- Base branch defaults to `main`; override with `--base=staging`.
