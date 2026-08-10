---
name: stage-jira-sync
description: Sync test artifacts to Jira by creating TEST Sub-tasks under the feature ticket and archiving them. Supports both Feature and Version stages. Triggers when the user says "upload test artifacts to Jira", "archive the cases", or "record this when testing is done". Stop This skill only "uploads test artifacts to Jira for archiving"; to "open a bug ticket" use tool-open-qa-bug.
argument-hint: <TICKET-xxx | vX.X [version]>
allowed-tools: Read, Bash, mcp__atlassian__jira_get_issue, mcp__atlassian__jira_create_issue, mcp__atlassian__jira_update_issue, mcp__atlassian__jira_transition_issue, mcp__atlassian__jira_get_transitions, Write
---

# jira-sync

Organize test artifacts into Jira TEST Sub-tasks and archive them under the corresponding feature ticket.
Automatically determine the stage and source path from the argument.

---

## Phase 1: Determine mode + confirm artifact path

| argument form | Mode | Source path | Parent ticket |
|---|---|---|---|
| `TICKET-xxx` | Feature | `features/TICKET-xxx/` | TICKET-xxx |
| `vX.X` or `vX.X version` | Version | `versions/vX.X/testcases/{ticket}/` | each TICKET-{ticket} |

```bash
# Feature
ls features/{ticket}/
find features/{ticket}/cases -name '*.feature' | sort

# Version — list each ticket subdirectory
ls versions/{version}/testcases/
```

> Version mode: each subdirectory under `testcases/` is treated as one Feature ticket; create a TEST Sub-task per ticket.

---

## Phase 2: Read artifacts

For each target directory, read the existing artifacts in parallel:

| Artifact | Required | Corresponding ticket |
|---|---|---|
| `cases/**/*.feature` | Yes | [TEST] Cases + BDD Review |
| `test_matrix.md` | Yes | [TEST] Test Matrix + Prototype |
| `state_machine.md` | Optional | [TEST] State Machine (skip if missing) |
| `bdd_review.md` | Optional | Merged into the top of the Cases ticket |
| `prototype.html` | Optional | Uploaded as an attachment to the Test Matrix ticket |

---

## Phase 3: Create TEST Sub-tasks

`issuetype: Sub-task`, `parent: {corresponding TICKET-xxx}`

### Ticket A: `[TEST] Cases + BDD Review` (always create)

1. BDD Review summary (add only if bdd_review.md exists; take the verdict + score, do not paste the full text; do not add "→ estimated XX+ after update", only write the actual score)
2. `----`
3. For each .feature file: use `{filename} (Modified / New)` as the section heading, and place the content in a ` ```gherkin ` code block (Jira ADF supports gherkin highlighting; the MCP-returned text displays as noformat, but the ADF `language` attribute is written correctly)

### Ticket B: `[TEST] Test Matrix + Prototype` (always create)

1. Involved projects + Figma link (pulled from the top of test_matrix.md)
2. Test matrix per dimension (keep table format)
3. Feature file mapping table, adding a "QA Test Cases" column → `{source path}/cases/...`

After creating, if prototype.html exists, upload it via the Jira REST API (MCP does not support attachments).
**Attachment upload is optional**: if credentials are missing, just skip it — do not block the entire sync and do not error out.

```bash
# Credential source: .claude/secrets.env (gitignored); skip the attachment if any variable is missing
source .claude/secrets.env 2>/dev/null
if [ -n "${JIRA_BASE_URL}" ] && [ -n "${JIRA_USER}" ] && [ -n "${JIRA_API_TOKEN}" ]; then
  curl -s -X POST \
    "${JIRA_BASE_URL}/rest/api/3/issue/{new ticket}/attachments" \
    -H "Authorization: Basic $(echo -n "${JIRA_USER}:${JIRA_API_TOKEN}" | base64)" \
    -H "X-Atlassian-Token: no-check" \
    -F "file=@{absolute path}/prototype.html"
else
  echo "SKIP_ATTACHMENT: missing curl credentials (JIRA_BASE_URL/JIRA_USER/JIRA_API_TOKEN), skipping prototype upload"
fi
```

- Upload succeeded → in Phase 5 mark "Attachment: prototype.html ✓"
- Skipped (missing credentials) → in Phase 5 mark "Attachment: prototype.html not uploaded (missing credentials, can be uploaded manually)"

### Ticket C: `[TEST] State Machine` (create only if state_machine.md exists)

Full text of state_machine.md (put the Mermaid diagram in a code block, keep table format)

> Version mode: each Feature ticket goes through Phase 3 separately and creates its own TEST Sub-tasks.

---

## Phase 4: Set Assignee + status

1. Look up transitions: `jira_get_transitions({one of the new tickets})`, find the ID for "Done" or "Release to PROD"
2. In parallel, for all newly created tickets:
   - `jira_update_issue` → `assignee: {reporter.email}` (obtained from the reporter in `jira_get_issue`)
   - `jira_transition_issue` → `transition_id: {Done}`

---

## Phase 5: Report

```
✅ Test artifacts synced to Jira ({Feature/Version} mode)

[TICKET-xxx]
  TICKET-xxxx  [TEST] Cases + BDD Review
  TICKET-xxxy  [TEST] Test Matrix + Prototype  (Attachment: prototype.html ✓ / not uploaded (missing credentials) / none)
  TICKET-xxxz  [TEST] State Machine            (or: no state_machine.md, skipped)

[TICKET-yyy]  ← multiple tickets only in Version mode
  ...

Assignee: {name} | Status: Done
```

---

## Rules

- `issuetype: Sub-task` (not Sub-task-bug)
- state_machine.md missing → skip Ticket C; prototype.html missing **or curl credentials missing** → skip the attachment (do not error out, note "not uploaded" in Phase 5)
- bdd_review.md missing → omit the Review section in Ticket A
- Description format: separate sections with `----`, keep tables as tables, put Gherkin in a ` ```gherkin ` code block, put other code in a ` ``` ` code block
- Version mode: create a separate set of TEST Sub-tasks for each Feature ticket (do not merge)
- Do not commit / push
