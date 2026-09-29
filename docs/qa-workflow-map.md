# QA Workflow Map (single source of truth)

## Main flow: one ticket, one line

```
/qa-ticket TICKET-xxx
context → risk → cases → ★sign-off (the only stop; merge on sign-off) → scripts → run → review → close
```

Artifacts live in `runs/{ticket}/`; rerun `/qa-ticket TICKET-xxx` to resume from the stage recorded in `progress.md`. Environment (dev/staging/prod) is an annotation, not a stage.

| Stage | Skill | Artifact |
|---|---|---|
| 1 context | `qa-context` | `context.md` |
| 2 risk | `qa-risk` | `risks.md` |
| 3 cases | `qa-cases` | `test_matrix.md`, `state_machine.md`, `cases/*.feature`, `prototype.html`, `bdd_review.md`, `review.html` |
| 4 sign-off | `qa-ticket` → `qa-merge` | merged into `testcases/` |
| 5 scripts | `qa-scripts` | `youtube/evidence/`, step / POM / fixture |
| 6 run | `qa-run` | test results |
| 7 review | `auto-code-review` | verdict |
| 8 close | `qa-ticket` (main session) | Close section of `progress.md` |

All stages run in the main session in order, reporting each step; subagents are used only for the independent BDD reviewer (cases) and per-feature generators when there are ≥ 2 features (scripts).

Any single stage can be run on its own by calling its skill.

## Standing tools

| When | Skill |
|---|---|
| Pre-release sign-off / post-deploy sanity checklist | `/tool-qa-release-gate vX.X` |
| Rank several tickets by risk | `/qa-risk vX.X` |
| Found a bug, file it | `/tool-open-qa-bug` |
| Reproduce a reported issue | `/tool-root-cause-analysis` |
| Hunt blind spots after scripted testing | `/tool-exploratory-testing TICKET-xxx` |
| Sync artifacts to Jira | `/tool-jira-sync TICKET-xxx` |
| Open a PR | `/auto-create-pull-request` |

Stage details: [tutorial/04-workflow.md](tutorial/04-workflow.md). Skill arguments: [tutorial/03-skills.md](tutorial/03-skills.md). Visual overview: [../pipeline.html](../pipeline.html).

## Paths

| Item | Path |
|---|---|
| Main library | `testcases/` |
| Automation root | `youtube/` |
| Automation rules | `.claude/rules/youtube-automation.md` |
| Agents | `playwright-test-planner` / `-generator` / `-healer` |
| Browser MCP (facts) | `playwright` (`mcp__playwright__*`): stages 1 and 3 walk the live site to confirm behavior |
| Browser MCP (automation) | `playwright-test` (`mcp__playwright-test__*`): stages 5–6 agents extract locators and run / debug tests |
