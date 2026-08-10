---
name: Commit
description: 'Per the .claude/rules/git-commit.md spec, read staged changes to generate a <type>(<scope>): <subject> commit message, then run git commit after confirmation. Handles commit only, not push (push/deploy goes to /ship).'
argument-hint: "[optional: specify a type or scope hint, e.g. fix docs, or a one-line message]"
---

**Goal**: Turn the current staged changes into a single commit that conforms to `.claude/rules/git-commit.md`.

**Steps**

1. Check the staged scope: `git diff --cached --stat`.
   - If there are **no** staged changes: run `git status --short` to show the current state, and use `AskUserQuestion` to ask the user whether to
     "add everything with `git add -A`" / "add only part (please specify paths)" / "cancel". If cancelled, stop.
   - If there are staged changes: proceed to the next step directly (do not add unstaged files on your own).

2. Read the full staged diff: `git diff --cached`. Analyze the **essence** of this change (what behavior changed, and why),
   not just the file names.

3. Determine the `<type>` (pick one, see git-commit.md):
   - `feat` new feature / new skill / new script · `fix` fixes incorrect behavior · `refactor` refactor without behavior change
   - `test` test cases · `chore` config / maintenance / dependencies · `docs` documentation / examples · `ci` CI/CD pipeline

4. Determine the `<scope>`: fill in the **smallest meaningful scope of the change** (skill name / `rules` / `e2e` / `scripts` / `docs`…).
   If it spans multiple scopes, omit the scope or use the nearest common parent.

5. Generate the `<subject>`:
   - All English, imperative verb (`add`, not `added`)
   - ≤ 72 characters, no trailing period
   - If the user passed arguments after `/commit`, prioritize their type/scope hint or message intent

6. Decide whether a body is needed:
   - Add a body only when the motivation for the change is **not obvious**, explaining "why" rather than "what", wrapped at 72 characters
   - For obvious small changes, do **not** add a body (prefer a single subject line only)

7. Use `AskUserQuestion` to present the full message (subject + optional body) to the user for confirmation:
   "commit as is" / "I want to change the message (please provide it)" / "cancel". If cancelled, stop and do not commit.

8. Run the commit: write the message to a temp file and use `git commit -F <file>` (to avoid escaping issues with multiline text and special characters),
   then run `git log -1 --stat` after committing to report the result.

9. Done. **Do not run `git push`** — when you need to push / trigger a deploy, run `/ship`.

**Principles**
- One semantically cohesive commit at a time; if the staged diff clearly covers multiple unrelated topics, remind the user to split it before continuing.
- Co-author attribution follows the repo's git configuration; this command does not add it on its own.
- Do not modify the product repo; this command only runs inside the authorized working repo.
