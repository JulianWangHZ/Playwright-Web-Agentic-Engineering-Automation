---
name: tool-exploratory-testing
description: Exploratory testing session — after scripted tests (matrix / BDD / automation) are done, derive blind spots from what is already covered, then use a charter, risk-based time allocation and three question sets ("where to test / how to test / how to tell it's wrong") to explore YouTube in a real browser, surface bugs the scripts never thought of, and produce a session report with candidate bugs. Triggers when the user mentions "exploratory testing, exploratory, free testing, dig deeper after testing, find bugs we didn't think of, blind spots, one more exploration round, bug hunt, poke around". ⛔ To reproduce a known symptom use tool-root-cause-analysis; to file a confirmed bug use tool-open-qa-bug.
argument-hint: "<TICKET-xxx | vX.X TICKET-xxx> [--focus <area>] [--quick]"
allowed-tools: Read, Write, Bash, Grep, Glob, Skill, mcp__atlassian__jira_get_issue, mcp__atlassian__jira_search, mcp__playwright__*
model: sonnet
---

# tool-exploratory-testing

Scripted tests prove "what we thought of works"; exploratory testing finds "what we didn't think of". This skill is **blind-spot driven**: read what is already covered first, then spend the time where the scripts never went and the risk is high.

Forbidden: commit / push / editing `testcases/` / creating Jira tickets without the user's consent.

Method details (where to test, how to test, how to tell it's wrong, attack lists, false signals) → [`references/heuristics.md`](references/heuristics.md); output formats → [`references/report-template.md`](references/report-template.md).

---

## Parameters

| argument | Output directory |
|---|---|
| `TICKET-xxx` | `features/{ticket}/exploratory/{YYYY-MM-DD-HHmm}/` |
| `vX.X TICKET-xxx` | `versions/{version}/exploratory/{ticket}-{YYYY-MM-DD-HHmm}/` |

- Target is `https://www.youtube.com` in the guest (logged-out) state. It is production: **read-only** — no sign-in, no uploads, no comments, no reports/flags on real content.
- `--focus`: limit to one area (e.g. "search filters", "watch page seek").
- `--quick`: 15-minute single page / feature version — skip Phase 3, run only one tour in Phase 4. Default is 45 minutes.

---

## Phase 0: Load existing coverage (2 min)

Read in order (skip what's missing, never block):

1. `jira_get_issue({ticket})` — summary / description / AC / design links.
2. `test_matrix.md`, `state_machine.md` (under `features/` or `versions/`).
3. This ticket's `.feature` (first `versions/{version}/testcases/{ticket}/`, then the main library `testcases/`).
4. Existing bugs: `jira_search` for Bug subtasks under the ticket (summary + status).

Produce a **coverage list**: paths / state transitions / boundary values already covered by scenarios, plus known bugs. **Don't re-run these** during exploration unless probing an adjacent area.

---

## Phase 1: Charter (3 min) → ⏸ the only stop

1. Walk the main flow once as a real viewer (not testing — **using**): who is this for, what does success look like, what would make a viewer lose trust.
2. **Derive blind spots** against the coverage list — what the scripts don't cover:
   - state-machine transitions / illegal transitions with no scenario
   - factors the matrix only tested one at a time, never combined
   - cross-page data consistency (search result card ↔ watch page ↔ channel page)
   - things the AC doesn't mention but viewers would expect (negative space)
3. **Risk-based time**: P0 (playback, search correctness) 40%, P1 (core navigation, filters, channel content) 30%, P2 20%, P3 10%.
4. Pick **3** directions to test + **2** ways to explore (must include "break it on purpose" or "go where it broke before"), with reasons (see heuristics.md §1–2).
5. `Write` `charter.md`, then output:

```
🧭 Charter ({ticket} · youtube.com guest · {45/15} min)
   Top 3 blind spots: {…}
   P0 areas: {…}
   Where: {direction ×3}   How: {exploration style ×2}
Confirm to start; tell me if you want to change direction.
```

After the user confirms, run Phase 2–5 **straight through without stopping**.

---

## Phase 2: Environment ready (1 min)

| Purpose | Tool |
|---|---|
| Walk the real browser | `mcp__playwright__*` (not the project-level `playwright-test` MCP — it lacks `browser_run_code_unsafe` and screenshots) |
| Per page | `browser_console_messages` + `browser_network_requests` |
| Evidence | `browser_take_screenshot` → `screenshots/F-NN.png` |

Dismiss the consent dialog if one appears. If a tool fails twice, stop and report instead of retrying.

---

## Phase 3: Blind-spot map (6 min, skipped with `--quick`)

Walk each charter blind spot, one line per page into `session-log.md`:

`[HH:mm] [DISCOVERED] {page} — {observation} — Risk: P0-3`

Check **negative space** at the same time: missing labels / confirmations / error messages / empty states — log as soon as found.

---

## Phase 4: Dig in (25 min)

Split by the risk-based time. For each P0/P1 blind spot:

1. **Journey and data consistency**: after an action, compare the same video / channel on related pages (result card, watch page, channel tab, share link) — title, duration, view count, upload date. Still consistent after reload?
2. **Flow pressure**: skip steps via deep links, go back / forward mid-flow, refresh mid-playback, open the same URL in two tabs.
3. **Break it on purpose**: input attacks, double clicks, offline / 5xx (`page.route` injected via `mcp__playwright__browser_run_code_unsafe`), odd URL parameters.
4. **How to tell it's wrong**: would a viewer find this odd? Does it match the ticket / design? Is it consistent with the rest of YouTube? (heuristics.md §3)

Discipline:

- No finding in 5 minutes → **switch exploration style**; spot an inconsistency → **follow it to the end**.
- Log **why** you test something, not just what you did.
- "Didn't crash" ≠ "correct"; reproduce each suspicion **at least 2 times** before it counts as a finding, and record the rate if intermittent.
- Screenshot every finding immediately → `screenshots/F-NN.png`, note console / network errors.

---

## Phase 5: Report and hand off (4 min)

1. **Challenge yourself**: for each finding ask "would a real viewer care?" and rule out false signals (heuristics.md §6).
2. `Write` `report.md` (format in report-template.md). Severity uses the same Blocker / Critical / Major / Minor scale as `tool-open-qa-bug`; **when unsure, go one level lower**.
3. Output:

```
✅ Exploration done: {ticket} · {actual time} · {N} blind spots covered
   Candidate bugs: {N} (Blocker {a} / Critical {b} / Major {c} / Minor {d})
   F-01 {title} — {severity}
   …
   Suggested regression additions: {N} (findings that can become BDD)
   Not explored: {…}
Report: {report.md path}
Which ones to file? Reply F-01,F-03 → each goes through /tool-open-qa-bug
```

4. Only findings the user names are handed to `/tool-open-qa-bug` (with reproduction steps, expected, actual, environment, screenshot path). The rest stay in the report.
5. Findings that could become regression scenarios are only listed as suggestions; whether to add them via `/stage-write-bdd` is the user's call.

---

## Rules at a glance

- Blind spots first: don't re-run paths already covered by scenarios
- The only stop is the charter; always ask before filing a Jira ticket
- youtube.com is production: guest, read-only
- ONE FINDING = ONE entry; list it only with full evidence (screenshot + steps + console / network)
- Severity: lower rather than higher
- Rule out environment false signals (consent dialog, ads, region, experiments) before concluding
