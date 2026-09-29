---
name: tool-jira-sync
description: Sync test artifacts to Jira — create one TEST Sub-task under the feature ticket whose description holds only PM-readable acceptance criteria, with review.html (matrix / state machine / prototype / BDD) attached as supporting detail. Source runs/{ticket}/. Offered by /qa-ticket at close; also usable directly. Triggers on "upload test artifacts to Jira", "archive the cases", "record the test result". ⛔ Archiving only; to file a bug use tool-open-qa-bug.
argument-hint: "<TICKET-xxx>"
allowed-tools: Read, Write, Bash, mcp__atlassian__jira_get_issue, mcp__atlassian__jira_create_issue, mcp__atlassian__jira_update_issue, mcp__atlassian__jira_transition_issue, mcp__atlassian__jira_get_transitions
---

# jira-sync

One ticket: **the ticket body = acceptance criteria (for the PM)**, **the attachment = review.html (for anyone who wants detail)**. No commit / push.

> Ticket keys follow your Jira project (`TICKET-xxx` is a placeholder); the sub-task key is assigned by Jira from the parent's project.

## Phase 1: Check artifacts

```bash
ls runs/{ticket}/
find runs/{ticket}/cases -name '*.feature' | sort
```

- No `.feature` → stop, run `/qa-cases` first.
- `review.html` missing, or older than any file in `cases/` → regenerate it per `.claude/skills/qa-cases/references/review-page.md`.

## Phase 2: Build the description (readers are PMs / designers)

Plain language only — **no Gherkin, no Mermaid, no matrix**.

1. **Verdict panel**: ✅ success panel (review ≥ 85) or ⚠️ warning panel, one sentence + score; actual score only, no "expected after fixes".
2. One line: "Matrix, state machine, prototype and raw BDD are in the attached `review.html` (download and open in a browser)".
3. `----`
4. **One section per .feature**:
   - Heading `## 📋 {business name after Feature:} (New / Modified)` — **never** the file name.
   - ℹ️ info panel under the heading: As a {role}, I want {goal}, so that {value}.
   - `# ####` sections in the feature → `### {section}` sub-groups.
   - One row per Scenario:

     | # | Acceptance scenario | Precondition | Action | Expected result | Type |
     |---|---|---|---|---|---|

     Scenario = title in plain words; precondition = Given (incl. Background) in plain words; action = When condensed into one business action; expected = Then in plain words, prefixed with ✅; type = 🔵 smoke (`@smoke`) / 🟢 positive / 🔴 negative / 🟡 boundary (`@boundary`); `@auto` / `@regression` are not shown.
   - Modified files list only the Scenarios this ticket added or changed.

**Fallback rule**: MCP ADF doesn't support a panel → degrade to emoji + bold + table; never dump raw `{panel}` / `{status}` syntax on the PM.

## Phase 3: Create the ticket

`jira_create_issue`: `issuetype: Sub-task` (not Sub-task-bug), `parent: {ticket}`, summary `[TEST] {feature ticket title} acceptance`. Then `jira_get_issue` to check the description; if newlines were stored as literal `\n`, overwrite with `jira_update_issue`.

## Phase 4: Attach review.html

The MCP cannot upload attachments; use REST:

```bash
source .claude/secrets.env 2>/dev/null
if [ -n "${JIRA_BASE_URL}" ] && [ -n "${JIRA_USER}" ] && [ -n "${JIRA_API_TOKEN}" ]; then
  curl -s -X POST \
    "${JIRA_BASE_URL}/rest/api/3/issue/{new ticket}/attachments" \
    -H "Authorization: Basic $(echo -n "${JIRA_USER}:${JIRA_API_TOKEN}" | base64)" \
    -H "X-Atlassian-Token: no-check" \
    -F "file=@{absolute path}/runs/{ticket}/review.html"
else
  echo "SKIP_ATTACHMENT: missing JIRA_BASE_URL/JIRA_USER/JIRA_API_TOKEN"
fi
```

Missing credentials never block: the ticket is still created; report "review.html not uploaded, drag it into the ticket manually" with the absolute path.

## Phase 5: Assignee + status

1. `jira_update_issue` → assignee = the feature ticket's reporter (from `jira_get_issue`).
2. `jira_get_transitions` → find "Done" (or your release status) → `jira_transition_issue`.

## Report

```
✅ {new ticket} [TEST] {title} acceptance (parent {ticket})
AC: N feature sections, M scenarios
Attachment: review.html ✓ / not uploaded ({absolute path}, attach manually)
Assignee: {name} | Status: Done
```
