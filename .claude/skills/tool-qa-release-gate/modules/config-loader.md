# Config Loader (read this file before execution)

Every skill must load `config.json` at startup to bring organization settings into the downstream flow.

## Load order

1. Try to read `$HOME/.claude/qa-skill-config.json` (global settings)
2. If it doesn't exist, try to read `.qa-skill-config.json` at the current repo root
3. If neither exists → fall back to `markdown-only` mode

> The install script `install.sh` substitutes `{{variables}}` directly with values from `config.json` when rendering the skill. This file only describes the logic for re-validating at runtime.

## Mode determination

| `config.mode` | Behavior |
|---------------|------|
| `full-mcp` | Query JIRA open bugs, post to the Slack release channel, sign-off can go to a Sheet |
| `partial-mcp` | Wrap each MCP call in try/except and degrade on failure; mark missing signals as "unverified" |
| `markdown-only` | Do not call MCP at all; collect from local gate reports + manually entered bug counts, write sign-off to a local `.md` |

## qa-release-gate specific variables

| Variable | Source | Example |
|------|------|------|
| `{{SIGNOFF_READINESS_THRESHOLD}}` | `qa_signoff.readiness_threshold` | `80` |
| `{{SIGNOFF_HARD_GATES}}` | `qa_signoff.hard_gates` | `["p0_bug","security_blocker","compliance_blocker"]` |
| `{{SIGNOFF_ROLES}}` | `qa_signoff.signoff_roles` | `["QA Lead","Release Owner"]` |
| `{{SIGNOFF_BLOCK_ON_FLAKY}}` | `qa_signoff.block_on_flaky` | `false` |

## Shared variables (consistent with other skills)

| Variable | Source | Example |
|------|------|------|
| `{PROJECT}` | `jira.project_key` | `PROJ` |
| `https://your-workspace.atlassian.net` | `jira.instance_url` | `https://company.atlassian.net` |
| `` | `slack.release_channel_id` | `C0ZZZ` |
| `` | `slack.user_id` | `U0XXX` |
| `` | `platforms.ios.repo` | `org/ios-app` |
| `` | `platforms.android.repo` | `org/android-app` |

## Gate signal source mapping

| Gate | Signal source (priority: MCP → local report) |
|------|-----------------------------------|
| P0/P1 open bug | JIRA JQL (fixVersion) → manual entry |
| security blocker | security-scan report under `.claude/` |
| compliance blocker | `.claude/compliance/compliance-report.md` |
| a11y Critical | a11y-audit report |
| Performance regression | `.claude/perf/mobile-resource-report.md` |
| Offline resilience | `.claude/offline/offline-resilience-report.md` |
| flaky rate | flaky-test-hunter output (reference, does not block) |
| Test pass rate | CI junit xml |

## Missing-value degradation rules

| Missing setting / signal | Degradation behavior |
|------------------|---------|
| `qa_signoff.readiness_threshold` | default 80 |
| `qa_signoff.hard_gates` | default p0_bug / security_blocker / compliance_blocker |
| `qa_signoff.block_on_flaky` | default **false** (strongly recommended; flaky should not block release) |
| Any gate signal **not provided** | mark "unverified" and **treat as risk** (do not assume pass), include as a conditional condition |
| `jira.project_key` missing | switch to manually entering the open bug count |
| `slack.release_channel_id` missing | skip the Slack notification, only produce the document |
| `qa_signoff.signoff_roles` missing | default to the two roles QA Lead / Release Owner |