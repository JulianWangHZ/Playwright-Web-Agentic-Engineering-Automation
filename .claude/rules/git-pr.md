---
name: git-pr
description: Pull Request title and description format for this project
---

# Pull Request Format

## Title

Same format as the commit message subject:

```
<type>(<scope>): <subject>
```

Example: `feat(open-qa-bug): add impact, root cause and severity sections`

## Description Template

```markdown
## What
<!-- What this PR does, in one to three sentences -->

## Why
<!-- Why this change is needed; which requirement or issue it addresses -->

## Code Changes
<!-- When relevant, list key codebase changes, format: `path` — description -->
- `path/to/file`: describe the change
- `path/to/file`: describe the change

## Related Tickets
<!-- TICKET-xxx -->

## Test Plan
- [ ]
- [ ]
```

## Rules

- **What** describes the change itself, without repeating the title
- **Why** describes the motivation, and may link a Jira ticket or discussion background
- **Code Changes** lists meaningful codebase changes (may be omitted for config-only or docs-only PRs)
- **Test Plan** lists verification steps so the reviewer knows how to test
- Irrelevant sections may be omitted

## Example

```markdown
## What
Add impact severity (Blocker/Critical/Major/Minor), root cause analysis,
and additional info sections to the open-qa-bug skill and its reference files.

## Why
Bug reports lacked structured severity classification and root cause guidance,
making it harder for developers to prioritise fixes.

## Code Changes
- `.claude/skills/tool-open-qa-bug/SKILL.md`: updated Phase 3 checklist to include impact + root cause
- `.claude/skills/tool-open-qa-bug/rider-format.md`: added 💥 Impact and 🔍 Root Cause sections
- `.claude/skills/tool-open-qa-bug/templates.md`: updated HTML template and markdown fallback
- `.claude/skills/tool-open-qa-bug/examples.md`: updated all 3 examples with new sections

## Related Tickets
TICKET-1234

## Test Plan
- [ ] Run `/tool-open-qa-bug TICKET-xxx` and verify output includes severity and root cause blocks
- [ ] Confirm HTML format matches Jira description preview
```
