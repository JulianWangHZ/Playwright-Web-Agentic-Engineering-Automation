---
name: tool-root-cause-analysis
description: When a problem reported by CS or an external source (the ticket is usually already created) is handed over, attempt to reproduce it, establish the reproduction steps, confirm it reproduces reliably, and use that to confirm whether it is a bug and to privately judge frontend vs backend ownership. By default do not create a new ticket. Root cause and code localization only privately assist your judgment; never write them into Jira and never provide them to development. Triggers when the user mentions "CS reported, customer complaint, help me confirm whether it is a bug, help me reproduce, how is this triggered, root cause, localize the problem".
argument-hint: <CS-reported symptom or existing TICKET-xxx ticket number>
---

# tool-root-cause-analysis

A CS/externally reported problem is handed over -> **reproduce -> establish reproduction steps -> confirm reliable reproduction -> confirm "this is a bug" + privately judge frontend/backend**.

The product under test is YouTube Web (guest/logged-out E2E test framework); see `CLAUDE.md` for the target -> repo mapping.

## When to use (don't pick the wrong skill)

- ✅ **This skill**: problems reported by CS/customer support/external sources, where **the ticket is usually already created**. Your job is "reproduce + confirm this is genuinely a bug + privately judge frontend/backend". **By default do not create a new ticket.**
- ❌ Found by QA yourself and you need to **create a new** bug report -> use `/tool-open-qa-bug` directly; you do not need this skill.

## ⛔ Top red line (violations are treated as serious errors)

- **The root cause and code localization in Phase 4 are output in the conversation only, for your (QA) judgment**. **Never write them into a Jira ticket, never put them into the handoff content passed to `tool-open-qa-bug`, and never provide them in any form to development or development's AI.**
  - Reason: a root cause with a direction will be misread by the development-side AI, leading to fixes that make things worse. **What development needs is a "reproducible symptom", not "your guess at the cause".**
- **Modifying any product repo code is forbidden**. Reproduction and verification may only read via `git fetch`/`pull`/`checkout`/`git show` (see the global rules in `CLAUDE.md`).
- **No successful reproduction, no root cause analysis**; no confirmation from you, no ticket.

---

## Phase 1: Understand the symptom

- argument is `TICKET-xxx` -> read the ticket with `jira_get_issue`; if natural language -> use the description directly.
- Clarify the minimum four items; if any is missing, ask:
  1. Symptom (what abnormal behavior was actually observed, including error messages)
  2. Trigger scenario (which page/flow/account type/data condition)
  3. Expected (what it should normally be)
  4. Environment (dev / staging / pre-release / prod)

---

## Phase 2: Attempt reproduction (hypothesis-driven, don't try blindly)

### 2a. Generate reproduction hypotheses (narrow the scope first)

When the CS steps are unclear, first list candidate trigger factors based on the symptom + product, ranked "most suspicious -> least suspicious":

```
🧭 Factor matrix (symptom: {CS description})
   Search conditions: keyword type / empty keyword / special characters / very long string / no-result keyword
   Content state: removed video / private video / age-restricted / live vs regular video / channel with no videos
   Filter combinations: multiple stacked filters / sort after filtering / filter reset / filter retained after going back
   Environment: browser / slow network / region-specific content restrictions
   Boundaries: search character limit / empty value / special characters
```

- **If you can read the product code, read the error branch and reason backward** (`git show <branch>:<file>`): find "what condition leads to this symptom" and turn the hypothesis from a "guess" into "the code says so" -- this is the fastest path to a hit.
- Rank by suspicion level and try the most suspicious first.

### 2b. Verify one by one by actually walking through

Choose the method per product and reproduce starting from the most suspicious hypothesis:

| Product | Method |
|---|---|
| `youtube` | Playwright MCP walks through a real browser (guest/logged-out, https://www.youtube.com) |

- In the guest/logged-out state, reproduce directly by walking through the browser; no account or setup data is needed.
- **Record every hypothesis hit/miss** and progressively converge on the minimal reproduction path.
- If all hypotheses are tried without a hit (fallback) -> go to Phase 3 and mark it "intermittent/conditions unknown", listing all factors and paths tried.

---

## Phase 3: Establish and confirm the reproduction steps

- Converge Phase 2 into a single **clean minimal reproduction path**, and re-run it in full at least once to verify stability.
- Output it for your confirmation:

```
🔁 Reproduction steps (re-run #{n}: {success/failure})
   Preconditions: {account/data/environment}
   1. {action} -> {observation}
   2. {action} -> {observation}
   …
   Symptom: {the abnormal behavior that consistently appears}
   Reproduction rate: {100% / intermittent X/n / specific conditions}

Are these the correct reproduction steps? (Only proceed to the ownership judgment after confirmation.)
```

- **Do not proceed until you confirm**. If you say the steps are wrong -> go back to Phase 2 and redo.

---

## Phase 4: Root cause analysis + frontend/backend localization (🔒 private conversation output only)

> This section is clearly marked; it is **only for you to see and only to assist your judgment**. It does not go into the ticket, is not handed off, and does not leak out:

```
🔒 [For QA judgment only · Do not write into the ticket · Do not give to development]
   Frontend/backend ownership: {frontend / backend / to be confirmed}
   Product: {youtube}
   Confidence: {high / medium / low}
   Symptom-level rationale: {one sentence pointing at an observable symptom -- this sentence is the only judgment basis allowed into the ticket}
   -- The following is purely for your private judgment; leaking it is forbidden --
   Suspected layer / file / function: {inference from reading the code via git}
   Supporting evidence: {code snippet / API behavior / log}
```

- You may read product repo code as supporting evidence (`git show <branch>:<file>` avoids switching branches), but **read only, do not modify**.
- If you later add a comment to the existing ticket, **include only "reproduction steps + symptom-level ownership"**; the suspected files/functions always stay in the conversation and never enter the ticket.

---

## Phase 5: Confirm the conclusion (by default do not create a new ticket)

Successful reproduction = confirmation that "this is a bug". Output the conclusion for you:

```
✅ Confirmed conclusion: {is a bug / is not a bug / cannot be reliably reproduced}
   Reproduction steps: see Phase 3
   Environment: {…}
   🔒 Private frontend/backend ownership (not in the ticket): {frontend / backend / to be confirmed · symptom-level rationale}
```

- **The ticket was already created by CS (argument is an existing ticket number)**: by default **do not create a new ticket**. Whether to add a "✅ Reproduced" comment on that ticket (containing only the **reproduction steps + symptom-level ownership**, with the **root cause not entering the ticket and no direction given to development**) is your decision; add it only if you say so.
- **Cannot be reliably reproduced**: report "cannot reproduce" + all paths tried, so you can decide whether to send it back to CS or mark it intermittent.
- **Exception -- after confirmation you find there is no corresponding ticket at all and one needs to be created**: only then suggest switching to `/tool-open-qa-bug` (not the default path).

---

## Rule quick reference

- Root cause / code localization = private to the conversation, never enters Jira, never given to development -- **top red line**
- Do not draw the "is a bug" conclusion without a successful reproduction
- Product code is read-only, no modification (modification requires separate per-instance authorization)
- **By default do not create a new ticket** (the CS ticket already exists); adding a comment to the existing ticket requires your consent and includes only the reproduction steps + symptom-level ownership; only go to `/tool-open-qa-bug` if a new one truly needs to be created
