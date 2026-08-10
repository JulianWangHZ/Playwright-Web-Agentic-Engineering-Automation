---
name: tool-open-qa-bug
description: When a bug is found during testing, collect information, de-duplicate, and create a Bug subtask under the feature ticket. Triggers when the user mentions "open a bug ticket", "report a problem", "this has a problem", "bug report", or "the test failed".
argument-hint: <TICKET-xxx>
allowed-tools: mcp__atlassian__jira_get_issue, mcp__atlassian__jira_create_issue, mcp__atlassian__jira_search, mcp__atlassian__jira_add_comment
model: haiku
---

# open-qa-bug

Helps create a correctly formatted Bug subtask under a Jira feature ticket.

Format specification is in [`rider-format.md`](./rider-format.md), output templates are in [`templates.md`](./templates.md), and examples are in [`examples.md`](./examples.md).

---

## Phase 1: Information Collection

### 1-1. Read the feature ticket

`jira_get_issue({TICKET-xxx})` — get summary / description / status.

### 1-2. Collect information from the tester

```
Ticket {TICKET-xxx}: {summary} ({status})

Please provide:
1. Bug title (one sentence)
2. Current problem — what abnormal behavior was actually observed
3. Reproduction steps — step by step (the more specific the better)
4. Expected result — what should normally be seen
5. Test environment (dev / staging / pre-release / prod)
6. Attachments (screenshot / recording / Console log link; skip if none)
```

Proactively follow up if incomplete; format requirements are in `rider-format.md`.

---

## Phase 2: De-duplication Check

```
jira_search JQL:
  project = HC AND issuetype = Bug AND text ~ "{keyword}" AND status != Done
  ORDER BY created DESC LIMIT 5

jira_search JQL:
  parent = {TICKET-xxx} AND issuetype = Bug
```

| Result | Action |
|---|---|
| Same bug found | Add a comment with supplementary info, do not create a duplicate ticket |
| Similar bug found | List it for the user to confirm; if confirmed, continue and reference the old ticket |
| No similar bug | Proceed to Phase 2.5 |

---

## Phase 2.5: Initial Frontend/Backend Attribution

Based on the bug symptoms, make an initial judgment on whether it belongs to the **frontend** or **backend**, to avoid assigning the wrong person when creating the ticket. The judge maps the target against the product repo table in `CLAUDE.md` (YouTube: the `youtube` frontend E2E test framework).

### Decision rules

| Symptom characteristic | Initial attribution |
|---|---|
| Display error / layout / RWD breakage / unresponsive button / player UI anomaly / copy text / i18n | **Frontend** |
| Wrong search results / filter results don't match / video load failure / wrong channel data / API 5xx | **Backend** |
| A "should-block-but-didn't" bypass gap (backend failed to validate what it should) | **Backend** |
| Frontend didn't block, but backend correctly blocked it (pure experience issue) | **Frontend** |
| Symptom spans layers or evidence is insufficient | **To be confirmed** (list suspects on both sides and let the user choose) |

### Output format (for user confirmation)

```
🔎 Initial attribution: {Frontend / Backend / To be confirmed}
   Platform: {youtube}
   Confidence: {High / Medium / Low}
   Reason: {one sentence pointing to which symptom characteristic}
   Needs the other side to co-investigate: {Yes (state which side) / No}
```

- **When confidence is low or attribution is to be confirmed, the user must make the final call** before proceeding to Phase 3; do not decide the attribution unilaterally.
- User overrides the initial judgment → defer to the user.
- The initial result (platform + reason) is carried into 3-3 to look up the assignee, and written into the attribution field in `templates.md`.

---

## Phase 3: Quality Confirmation + Ticket Creation

### 3-1. Automatic pre-creation check

- [ ] Title clearly expresses the problem
- [ ] Reproduction steps can be executed step by step
- [ ] Clear contrast between expected vs actual behavior
- [ ] Test environment is filled in
- [ ] No subjective descriptions ("very slow" → "load exceeds 5 seconds")

If anything is missing → prompt to supplement it before creating the ticket.

### 3-2. Preview confirmation

Assemble the body per the `templates.md` format and give a plain-text summary to the user for confirmation. **Do not create the ticket before confirmation.**

### 3-3. Look up the RD Assignee

Based on the **platform from the Phase 2.5 initial judgment**, look up the assignee of the same-platform subtask under the parent ticket:

```
jira_search JQL:
  parent = {TICKET-xxx} AND summary ~ "{2.5 initial platform keyword}" ORDER BY created ASC LIMIT 5
```

Take the first result that has an assignee as the assignee for the new ticket. If no result is found or the initial judgment is "To be confirmed", leave it blank and remind the user to assign it manually when reporting.

### 3-4. Create the Bug Subtask

```
jira_create_issue:
  project:    HC
  issuetype:  Sub-task-bug (the subtask bug type of the HC project)
  parent:     {TICKET-xxx}
  summary:    "[{platform}-{function}] {title}"
  assignee:   {RD name / email found in 3-3}
  description: the Markdown format from templates.md (fixed, do not change)
```

After creation, report:

```
✅ Bug subtask created
Ticket: {new ticket number} — [Bug] {title}
Parent ticket: {TICKET-xxx}
Link: https://your-workspace.atlassian.net/browse/{new ticket number}
```

---

## Rules

- If the argument is unclear, ask
- **De-duplication first**: if the same ticket is found → add a comment, do not create a duplicate
- **Do not create the ticket before the Phase 3-2 confirmation**
- The description Markdown structure is fixed (see `templates.md`, do not modify it yourself); both `jira_create_issue` and `jira_update_issue` accept Markdown, not HTML
- If issuetype creation fails → use `jira_get_field_options` to look up the correct name, then retry
