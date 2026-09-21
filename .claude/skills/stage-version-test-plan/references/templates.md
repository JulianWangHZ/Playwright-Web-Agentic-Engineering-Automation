# version-test-plan output templates

## plan.md

```markdown
# {version} Test Plan

Owner: {fill in} | Target Release: {date} | Branch: {branch}

---

## Assumptions

Conditions assumed to be true throughout testing. If issues appear after release, check here first — was it a wrong assumption or an actual bug?

- {e.g. staging data structure matches production}
- {e.g. feature flag behaviour matches the RD spec}
- {e.g. tests default to guest / logged-out state unless a ticket explicitly involves authentication}

---

## Scope

The core change in this version is {one sentence}.

Testing focus is on {area}, because {why this is the highest-risk area}.

**Out of scope:**
- {ticket / module}: {reason, e.g. backend-only / already verified in previous release / acceptable risk}

**Modules requiring regression:**
- {module}: because {this version's changes affect it here}
- None → explicitly state "No regression needed — reason: {fill in}"

---

## Test Approach & Strategy

Testing strategy for this version:

- **New features**: exploratory first to confirm the main flow, then verify against BDD scenarios
- **Changed existing behaviour**: regression first — confirm nothing is broken
- **High-risk areas** (see Risk-based Prioritization): manual testing primary, automation supporting
- **Stable modules**: run automation directly, skip redundant manual passes

Trade-off rule when time is short: {e.g. protect the main flow first; ship P2 issues with a known risk accepted}

---

## Entry Criteria

All of the following must be in place before testing starts — stop and wait if any are missing:

- [ ] All ticket builds deployed to staging by RD
- [ ] Smoke test passes (main flows do not crash)
- [ ] Feature flags enabled on staging and confirmed by RD
- [ ] All items in Dependencies & Blockers checked off

---

## Risk-based Prioritization

| Priority | Risk | Why high risk | Test strategy |
|---|---|---|---|
| P0 | {e.g. ticket breaks existing flow} | {impacts existing user behaviour} | {manually verify all known scenarios} |
| P1 | {e.g. TICKET-A × TICKET-B conflict} | {both tickets modify the same initialisation flow} | {run cross-ticket scenarios manually} |
| P2 | {e.g. UI detail breaks in a specific browser} | {limited impact, workaround available} | {run automation, skip extra manual pass} |

---

## Integration Risk

These tickets may interact when combined:

- {TICKET-A} × {TICKET-B}: {specific impact point}
- No cross-ticket risk → explicitly state "All tickets are independent — no integration risk"

---

## Exit Criteria (How We Know We're Done)

The following standards have been aligned with {stakeholder}:

- Automation pass rate ≥ {X}%
- P0 open = 0
- P1 open ≤ {N}, each with a clear ship / no-ship decision
- {version-specific criteria}
- Not blocking release: {e.g. P2 issues do not block, but must be logged for the next version}

---

## Dependencies & Blockers

Must be resolved before testing can start — each item has an owner:

- [ ] {e.g. feature flag must be enabled on staging by RD | owner: {RD} | deadline: {date}}
- [ ] {e.g. staging build ≥ {version}, current version: {fill in}}

---

## Open Questions

Unresolved items — each has an owner and a deadline, stays open until answered:

- {question} | owner: {who} | due: {date}
```

---

## changes.md (initial skeleton)

```markdown
# {version} Changes vs Main

When merging back:
- `testcases/{ticket}/cases/{platform}/{path}` → strip first two levels → `cases/{platform}/{path}`
- `testcases/regression/{platform}/{path}` → strip first level → `cases/{platform}/{path}`

Modified / New is determined from this file, not folder structure.

## Version (by feature ticket)

### {ticket} — {title}
**Modified**
- testcases/{ticket}/cases/{platform}/{path}.feature — {what changed} (@changed-in-{version})

**New**
- testcases/{ticket}/cases/{platform}/{path}.feature — {what was added} (@new-in-{version})

## Regression (not tied to a single feature — cross-feature / neighbouring modules)
**Modified**: testcases/regression/{path} — {reason for update}
**New**: testcases/regression/{path} — {reason for addition}

## Removed (exists in main but dropped this version)
- (none)

## Co-modified files (multiple features touching the same file)
- (none)
```
