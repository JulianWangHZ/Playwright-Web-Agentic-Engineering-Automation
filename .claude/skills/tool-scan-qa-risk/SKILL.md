---
name: tool-scan-qa-risk
description: Sprint risk scan — rate each ticket HIGH/MED/LOW risk and output a risk matrix + test priority order. Triggers when the user mentions "risk scan, what to test first this version, test priority order, which ticket to watch, risk scan, risk assessment".
argument-hint: <sprint name or "TICKET-xxx TICKET-yyy ...">
allowed-tools: mcp__atlassian__jira_get_issue, mcp__atlassian__jira_search
model: haiku
---

Sprint risk scan assistant. Forbidden: commit / push / modifying repo code.

---

## Step 1: Fetch tickets

- **Sprint name** → first resolve the sprint id (same as /stage-version-test-plan Step 3a), then query `sprint = {id} AND issuetype != Sub-task`
- **Ticket number list** → run `jira_get_issue` for each, taking summary / description / labels

## Step 2: Scoring (computed internally, do not ask the user)

| Risk factor | +points |
|---|---|
| Affects core search / playback main flow | +3 |
| Adds or changes search filter logic | +2 |
| Video player behavior / stream loading | +2 |
| Cross-feature flow (search → playback → channel) | +2 |
| Complex state machine / filter combinations / sort branching | +1 |
| Pure UI adjustment / text change | +1 |
| Already covered by complete BDD cases | −1 |

Total ≥ 4 → 🔴 HIGH; 2–3 → 🟡 MED; ≤ 1 → 🟢 LOW

## Step 3: Output

```markdown
# {Sprint / ticket range} Risk Scan

Scan time: {date}

| Ticket | Title | Risk | Main cause | Test focus |
|---|---|---|---|---|
| TICKET-XXXX | ... | 🔴 HIGH | Search main-flow change | keyword search, results rendering, boundary |
| TICKET-YYYY | ... | 🟡 MED | Search filter logic | filter correctness, filter reset behavior |
| TICKET-ZZZZ | ... | 🟢 LOW | UI text adjustment | display correctness only |

## Suggested test order
1. 🔴 HIGH — run the full Feature first, verify main flow + edge cases
2. 🟡 MED — focus on trigger conditions and data correctness
3. 🟢 LOW — smoke test is enough

## Notes
{If there are cross-ticket dependencies / shared DB / conflicts in the same module on the same platform, list them}
```

After output, ask: **Do you want this turned into a Jira comment posted to the sprint plan ticket?**

---

## Rules

- If the argument is incomplete, ask (choose one: sprint name or ticket number list)
- Scoring is purely internal, do not ask the user (if a ticket description is too sparse → mark `?` and explain)
- Sprint id resolution is the same as /stage-version-test-plan (substring matching issue)
