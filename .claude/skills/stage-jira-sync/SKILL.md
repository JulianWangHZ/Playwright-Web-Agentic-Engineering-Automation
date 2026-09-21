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

### Presentation style (readable × polished, applies to Ticket A / Ticket C)

The readers are PMs / designers, so the description must be "understandable at a glance + visually polished". Use Jira **native ADF visual elements**, not just plain table lines:

- **Feature purpose / conclusion as a Panel (colored info box)**: put the feature preamble in an ℹ️ info panel (blue); put the BDD Review verdict, per score, in a ✅ success panel (met) or ⚠️ warning panel (not met).
- **Type / status as colored emoji labels**: 🔵 smoke, 🟢 positive, 🔴 negative, 🟡 boundary; use ✅ / ❌ for the "Allowed?" column of state transitions.
- **Feature section headings with emoji**: `## 📋 {feature name} (New)`.
- **Tables**: bold headers, concise aligned columns; prefix the expected result with ✅ to guide the eye.
- **Clear layering**: feature → section → table; collapse overly long detail with Expand.
- **Fallback rule**: if the MCP ADF does not support an element (panel/lozenge) → degrade to emoji + bold + table; **never dump raw `{panel}` / `{status}` syntax for the PM to read**.

### Ticket A: `[TEST] Cases + BDD Review` (always create)

Content (**the readers are PMs / designers — always translate into plain language, never paste raw Gherkin**):

1. **BDD Review summary** (add only if bdd_review.md exists; take the verdict + score, do not paste the full text; do not add "→ estimated XX+ after update", only write the actual score).
2. `----`
3. **Each .feature file → one feature section** (**title uses the business name, not the filename**):
   - Section heading: `## 📋 {the business name after Feature: in that file} (New / Modified)` — e.g. `home_navigation.feature` → `## 📋 Home Navigation (New)`. **Never** use `xxx.feature` as the heading (the PM cannot map it to the AC).
   - Under the heading, place the **feature purpose** (the condensed three-line preamble) as an ℹ️ **info panel (colored info box)**: As a {role}, I want {goal}, so that {value} — the basis for the PM/designer to map ACs.
   - If the feature has `# ####` section groups → sub-group them with `### {section name}`.
   - **Each Scenario → one row in an acceptance table**:

     | # | Test scenario | Preconditions | Action | Expected result | Type |
     |---|---|---|---|---|---|

     - Test scenario = Scenario title (de-teched)
     - Preconditions = `Given` (incl. `Background`) condensed into plain words
     - Action = `When` (incl. `And`) condensed into one business action
     - Expected result = `Then` (incl. `And`) condensed into plain words
     - Type = inferred from tags into a **colored emoji label**: 🔵 smoke (`@smoke`), 🟢 positive, 🔴 negative, 🟡 boundary (`@boundary`) (execution/suite tags like `@auto`/`@regression` are **not shown** to the PM)
4. **Do not paste raw Gherkin code** (PMs/designers map ACs from the table; the raw `.feature` stays in the repo for QA/dev).

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

**Turn it into a state-transition table, do not paste the raw Mermaid** (PMs/designers cannot read diagram code). Convert the Mermaid diagram + the "transition coverage self-check" table of state_machine.md into one plain-language transition table:

| From | Trigger | To | Allowed? |
|---|---|---|---|

- One row per **legal transition** (one edge of the Mermaid), "Allowed?" = ✅
- One row per **illegal / unreachable transition**, "To" left as `—`, "Allowed?" = ❌ + a one-line reason (e.g. "cannot go back")
- If state_machine.md has a "new/modified UI element summary" → merge it as a short paragraph (component name / page it's on), omit the rest of the technical detail
- **Do not paste the Mermaid code block**; the raw state_machine.md stays in the repo for QA/dev

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
- Description format: separate sections with `----`, keep tables as tables; **the Cases ticket ([TEST] Cases) always renders as plain-language acceptance tables, never pastes raw Gherkin** (only the State Machine ticket's Mermaid / other code goes in a code block)
- Version mode: create a separate set of TEST Sub-tasks for each Feature ticket (do not merge)
- Do not commit / push
