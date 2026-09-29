# Review page spec (review.html)

`runs/{ticket}/review.html`: collects the ticket's test design into **one standalone HTML file**. Used at the /qa-ticket sign-off stop, and attached to the Jira ticket by `tool-jira-sync`. The ticket itself carries only the AC; anyone who wants detail opens this file.

## Style: copy `review-template.html`

`review-template.html` is the reference (example data: TICKET-001 YouTube video search). **Copy the whole file** and replace only the content:

- Never change `<style>`, `<script>`, class names, DOM structure, or tab order; do not apply UI_BASE or add your own styles.
- Dark/light toggle, hash-based tabs, acceptance-list search / filter / check progress, and BDD copy buttons are handled by the template JS — keep it as is.
- Delete blocks that don't apply (e.g. no prototype) entirely; never leave empty shells.

## Content mapping

| Tab | Template block | Source |
|---|---|---|
| Header | kicker, title, meta, status pill | `{ticket}`, Jira title, generation time; status "Awaiting sign-off" before, "Signed off · who · when" after |
| 1 How it was built | `.flow` 8 stations | station names as in the template; each station `done / here / todo` per `progress.md` stage; outputs from the artifacts |
| | `.flow .design-branch` | matrix rows, state transitions, prototype screens ("Not applicable" if none), BDD scenarios, review score |
| | Coverage `.figures` | scenarios, HIGH-risk scenarios, HIGH risks covered x/y, matrix rows covered x/y, transitions, manual checks |
| | Scope `.sources` | sources from `context.md` (issue / site / design / code …) |
| | Risks & coverage `.risk-list` | `risks.md`: id, level (HIGH → `tag p0`, MED → `tag p1`, LOW → `tag`), title, impact, mapped scenarios, covered / deferred / uncovered |
| | Design techniques `.techniques` | technique self-check from `test_matrix.md`, one cell each; not applicable → `class="na"` with the reason |
| | Independent review `.score` | total from `bdd_review.md`, per-dimension bars (`.bars`, width = score/max), leftover issues |
| | Open questions, warnings | matrix open questions, `progress.md` warnings; delete the row when empty |
| 2 Test matrix | `.matrix` | one block per matrix in `test_matrix.md`; last column maps scenarios; uncovered rows get `class="skip"` with the skip reason |
| 3 State machine | `.diagram` + transition table | `state_machine.md`: mermaid as `flowchart LR` (template style); allowed transitions first, then blocked ones |
| 4 Prototype | `.proto-frame` | with `prototype.html` → use `srcdoc` on the iframe (escape `&` and `"`) so the page stays a single file for Jira; without → state why not applicable |
| 5 Acceptance list | `.feature` / `.scenario` | one section per `.feature`; grouped by `# ####` sections; one card per Scenario: Given / When / Then as plain bullets; tags show scenario tags, type, `@boundary`, `@smoke`, manual |
| 6 BDD features | `.file-block` | raw `.feature` text, coloured line by line with the template's `g-kw` / `g-step g-given|when|then` / `g-tag` / `g-str` / `g-cmt`; hidden textarea holds the raw text for copying |

Scenario ids: number `TC-001`, `TC-002`… in `.feature` order, used only for cross-links on this page (`#acceptance/case-TC-001`), never written into `.feature` tags.

## Rules

- Only transform existing artifacts; **never write new content**. Regenerate when sources change (after qa-cases fixes, or when jira-sync finds review.html older than `cases/`).
- HTML-escape all text.
- After generating, open it once in a browser and confirm all six tabs switch and no block is empty.
