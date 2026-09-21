# Subagent Dispatch Template (shared by the Feature / Version flows)

The flow orchestrators delegate the **heavyweight, pure-production stages** (test-matrix / state-machine / write-bdd / ui-prototype) to isolated-context subagents via `Task`; the main session only collects summaries — keeping the Figma dumps, repo pulls, and Grep passes contained inside the subagent, used once and discarded. This is the core lever against context bloat (writing artifacts to disk only solves "passing between stages"; it does not solve the token cost of "the production process itself").

## Dispatch rules

1. **State `model: sonnet` explicitly, never inherit** (if the main session runs a 1M-context model, an inheriting subagent blows up with no credits).
2. **`subagent_type: general-purpose`** (tools `*`, can Read/Write/Bash/Grep + Jira/Figma MCP — enough to read the SKILL.md and follow it, writing artifacts to disk).
3. **Dispatch one stage at a time, wait for its summary before the next** (the order cannot be skipped: drawing the state machine before the matrix is verified easily skews scope; writing cases before the state machine is drawn easily misses edge cases).
4. **Resolve every decision point up front before dispatch** (the subagent cannot ask the user): branch strategy, artifact-directory conflicts, the feature area under test, whether the state machine / prototype is needed — decided by the main orchestrator from the ticket + `git status`; only a destructive action (dirty branch, directory overwrite) stops to ask once.
5. **The subagent returns only a summary, never the full artifact**; the main orchestrator announces one line per stage (`▶ Test Matrix`) and does not stop.
6. **bdd-review / jira-sync / release-gate / tc-merge do NOT go through a subagent**: they run inline via the `Skill` tool — the first two carry their own subagent or must be presented, the latter two are gates / destructive writes. A subagent cannot dispatch another subagent and cannot use the Skill tool.

## Stage → stage-skill mapping

| Stage | stage-skill | Feature argument | Version argument |
|---|---|---|---|
| Test Matrix | `stage-test-matrix` | `TICKET-xxx` | `vX.X TICKET-xxx` (per-ticket) / `vX.X` (wrap-up integration + regression) |
| State Machine (optional) | `stage-state-machine` | `TICKET-xxx` | `vX.X TICKET-xxx` |
| Write BDD | `stage-write-bdd` | `TICKET-xxx` | `vX.X TICKET-xxx` / `vX.X` (wrap-up regression) |
| Interactive prototype (optional) | `stage-ui-prototype` | `TICKET-xxx` | `vX.X TICKET-xxx` |

## Prompt template

When dispatching a `Task`, fill in the prompt below (`{}` substituted by the main orchestrator):

```
You are the "{stage name}" executor of the QA flow, running in an isolated
context; write artifacts to disk and return only a summary.

Task: read `.claude/skills/{stage-skill}/SKILL.md` and follow its Phase/Step
exactly, with argument = "{argument}".

Already decided (do not re-ask, do not redo):
- Branch: {the branch already checked out}
- Artifact directory: {path} ({reuse / overwrite})
- Feature area / page under test: {...}

Constraints:
- You cannot interact with the user. Wherever the SKILL.md says "stop and ask",
  use that skill's documented default and record "which default was used and
  what would otherwise have been asked" in your returned summary.
- Follow the global rules in CLAUDE.md: no commit / push; if a product repo is
  configured you may fetch/pull/checkout to verify, otherwise confirm behavior
  by walking the target site live.
- Always Write artifacts to the given path; the main library testcases/ is read-only.

Return (≤10 lines, do not paste the full artifact): artifact paths, key numbers
(matrix rows / scenario count / remaining ? count), which defaults were used,
and any leftover ? or blocker.
```

## Auto-deciding optional steps (the main orchestrator decides while reading the ticket, without asking)

| Step | Signal required (dispatch only on a hit) |
|---|---|
| State Machine | the ticket / matrix has clear state transitions (status fields, review/booking/order lifecycle, legal + illegal transitions) |
| Interactive prototype | the ticket has a new UI page / flow, or carries a Figma link that needs design alignment |

When in doubt, **lean toward doing it** (the risk of skipping a needed state machine / prototype outweighs the cost of one extra subagent), and note the reason in the one-line announcement.
