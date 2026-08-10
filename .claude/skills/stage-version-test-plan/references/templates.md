# version-test-plan output templates

## plan.md

```markdown
# {version} Version Test Plan

fixVersion: {version}
Branch: {branch name}
Feature areas: {search video / video playback / channel / search filters}

## Feature allocation

| Feature ticket | Title | Lead QA |
|---|---|---|
| TICKET-XXXX | {title} | {QA name or pending} |

## Scope per Feature

### TICKET-XXXX — {full Jira title}
- Affected areas: {search video / video playback / channel / search filters}
- Main function: {what changed / was added}
- Jira: https://your-workspace.atlassian.net/browse/TICKET-XXXX

## Risks
- {insufficient coverage of a new module / cross-platform sync / third-party integration, etc.}

## Not covered (outside the Playwright-Web-Agentic-Engineering-Automation scope)
- {ticket} — {reason (CMS / email / pending PM alignment, etc.)}
```

---

## changes.md (initial skeleton)

```markdown
# {version} diff against the main library

On merge back:
- `testcases/{ticket}/cases/{path}` → drop the first two levels → `testcases/{path}`
- `testcases/regression/{path}` → drop the first level → `testcases/{path}`

Determine Modified / New from this file (not from the folder).

## Version (grouped by Feature)

### TICKET-XXXX — {title}
**Modified**
- testcases/TICKET-XXXX/cases/{path}.feature — {what changed} (@changed-in-{version})

**New**
- testcases/TICKET-XXXX/cases/{path}.feature — {what was added} (@new-in-{version})

## Regression (not tied to a Feature, cross-Feature / neighboring modules)
**Modified**: testcases/regression/{path} — {reason for strengthening}
**New**: testcases/regression/{path} — {reason for filling the gap}

## Removed (in the main library but deprecated in this version)
- (none)

## Shared file changes (multiple Features affecting the same file)
- (none)
```
