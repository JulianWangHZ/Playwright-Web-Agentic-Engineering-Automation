---
name: qa-risk
description: Risk assessment — in single-ticket mode it is stage 2 of the qa-ticket pipeline, reading context.md and writing runs/{ticket}/risks.md (risk items + level + test focus); in multi-ticket mode (fixVersion / sprint / ticket list) it outputs HIGH/MED/LOW per ticket and a test order. Triggers on "risk assessment", "risk scan", "what to test first this release", "test priority", "which ticket to watch".
argument-hint: "<TICKET-xxx | vX.X | sprint name | \"TICKET-1 TICKET-2\">"
allowed-tools: Read, Write, mcp__atlassian__jira_get_issue, mcp__atlassian__jira_search
---

# qa-risk — risk assessment

Forbidden: commit / push / editing repo code. Scoring is internal; never ask the user. Too little information → mark `?` and explain.

## Scoring

| Risk factor | + |
|---|---|
| New data storage / migration | +3 |
| New API endpoint | +2 |
| Third-party integration (auth / payment / messaging / embeds) | +2 |
| Cross-product flow | +2 |
| Complex state machine / cooldown / A-B split | +1 |
| Pure UI tweak / copy change | +1 |
| Main library already fully covers it | −1 |

Total ≥ 4 → 🔴 HIGH; 2–3 → 🟡 MED; ≤ 1 → 🟢 LOW

---

## Single-ticket mode (`TICKET-xxx`, used by qa-ticket)

Read `runs/{ticket}/context.md` (missing → return `blocked`, run qa-context first).

Break the ticket into **concrete risk items** (not just one total): for each, what could break, why, and how to test it. Sources: changes, business rules, observed site behavior, design states, existing main-library coverage.

Output `runs/{ticket}/risks.md`:

```markdown
# {ticket} risk assessment
Total: {n} → {🔴 HIGH | 🟡 MED | 🟢 LOW} ({main reason})

| # | Risk | Level | Basis (file:line / ticket / observed) | Test focus |
|---|---|---|---|---|
| R1 | Search submit does not navigate to results | HIGH | observed: Enter key on home | submit via Enter and button |

## Deferred (with reason)
## Non-functional aspects (pointer only, not in BDD)
- {performance/security/a11y/responsive/concurrency/console}: {where and why it matters}
```

Every HIGH risk must map to a matrix row in qa-cases; deferred ones need a reason.

---

## Multi-ticket mode (`vX.X` / sprint name / ticket list, standalone)

1. Fetch tickets:
   - `vX.X` → `jira_search` `project = {PROJECT} AND fixVersion = "{version}" AND issuetype != Sub-task` (`Sub-task-bug` is not excluded; group it under its parent); 0 results → list recent fixVersion candidates for the user, don't guess.
   - sprint name → resolve the sprint id first (substring names can collide; list multiple matches for the user), then `sprint = {id} AND issuetype != Sub-task`.
   - ticket list → `jira_get_issue` for each.
2. Score each ticket.
3. Output (in chat, or to a file when asked):

```markdown
# {scope} risk scan ({date})

| Ticket | Title | Risk | Main reason | Test focus |
|---|---|---|---|---|

## Suggested test order
1. 🔴 HIGH — run the full /qa-ticket, main flow + edge cases
2. 🟡 MED — focus on triggers and data correctness
3. 🟢 LOW — smoke only

## Notes
{cross-ticket dependencies / shared data / same-module conflicts}
```

Then ask: post this as a Jira comment on the sprint planning ticket?
