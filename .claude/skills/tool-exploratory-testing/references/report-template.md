# Output formats

Session directory:

```
{session-dir}/
├── charter.md
├── session-log.md
├── report.md
└── screenshots/F-NN.png
```

## charter.md

```markdown
# Charter — {ticket} {summary}

- Target: youtube.com (guest, read-only) | Time box: {45/15} min
- Coverage sources: {test_matrix / .feature / Bug subtasks; mark "none" if missing}

## Context
- What it does: {one sentence}
- Who uses it: {viewer type}
- What would break trust: {worst case}

## Blind spots (not covered by scripts)
| # | Blind spot | Source (why it's a blind spot) | Risk | Time |
|---|---|---|---|---|

## Test directions
- Where: {direction ×3} — {reason}
- How: {exploration style ×2} — {reason}
```

## session-log.md

One event per line, appended as it happens:

```
[HH:mm] [PHASE] Charter confirmed
[HH:mm] [DISCOVERED] Search results — no message when all filters exclude everything — Risk: P1
[HH:mm] [WHY] Testing back navigation because the duration filter chip disappears on return
[HH:mm] [FINDING] F-01 Duration filter lost after back navigation (2/2 reproduced)
[HH:mm] [SWITCH] "Follow one video" found nothing in 10 min, switching to "Break it on purpose"
```

## report.md

```markdown
# Exploratory testing report — {ticket}

- Date: {YYYY-MM-DD} | Target: youtube.com (guest) | Browser: {…} | Time: {N} min

## Summary
{2–3 sentences: what was explored, the most important finding, overall confidence}

## Coverage map
| Area | Risk | Status (explored / partial / not explored) | Findings | Notes |
|---|---|---|---|---|

## Candidate bugs

### F-01: {component} {result} when {condition}
- Severity: {Blocker/Critical/Major/Minor} — {affected viewers + impact}
- Reproduction rate: {2/2 · intermittent 1/3}
- Preconditions: {URL / viewport / region}
- Steps:
  1. …
- Expected: {…}
- Actual: {…}
- Evidence: `screenshots/F-01.png`; console: {…}; network: {status + endpoint}
- Regression candidate: {yes → one-line suggested scenario | no → reason}

## Observations (not bugs, but worth raising)
- {UX concerns, unclear spec → questions for PM}

## Not explored
- {area} — {reason: time / region / needs sign-in}
```

Severity follows `tool-open-qa-bug/rider-format.md`; when unsure go one level lower.
