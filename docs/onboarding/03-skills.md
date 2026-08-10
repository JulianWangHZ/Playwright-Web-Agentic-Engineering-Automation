# Skill System

| [← Environment Setup](02-setup.md) | [Workflow →](04-workflow.md) |
|:---|---:|
| Step 2: Installation and Setup | Step 4: Feature → Version |

**Step 3 / 5**

---

## What is a Skill?

A skill is a command definition stored in `.claude/skills/`, triggered inside Claude Code with `/skill-name`.

```
/stage-test-matrix TICKET-1352       ← build a test matrix for TICKET-1352
/stage-write-bdd v4.14 TICKET-1352    ← write the Version BDD for TICKET-1352 in v4.14
/stage-tc-merge v4.14       ← merge the Version cases of v4.14 back into the main library
```

---

## Argument Format

Every skill automatically determines the stage from the argument format, so **you do not need to remember different commands**:

| Argument | Stage | Example |
|---|---|---|
| `TICKET-xxx` | Feature | `/stage-test-matrix TICKET-1352` |
| `vX.X TICKET-xxx` | Version | `/stage-write-bdd v4.14 TICKET-1352` |
| `vX.X` | Whole version (Version wrap-up) | `/stage-tc-merge v4.14` |

---

## Skill Quick Reference

For the full skill index see [docs/qa-workflow-map.md](../qa-workflow-map.md) (includes `/flow-qa-router`, the various `*-testing-workflow` skills, `/tool-qa-release-gate`, and more; only the commonly used ones are listed here).

> 🗺️ **Interactive visual version**: [skills-guide.html](../skills-guide.html) — which skill to use at each stage, and when, on a single page.

### Workflow Skills (use in workflow order)

| Skill | Purpose | When to Use |
|---|---|---|
| `/stage-test-matrix` | Test Matrix | First step after receiving a Jira ticket |
| `/stage-state-machine` | State Machine (optional) | When there is state flow |
| `/stage-write-bdd` | Write BDD .feature | After the matrix is confirmed |
| `/stage-ui-prototype` | HTML prototype (optional) | New UI modules |
| `/stage-version-test-plan` | Version test plan | First step entering Version |
| `/stage-tc-merge` | Merge back to main library | After the whole Version passes |

### QA Tool Skills (available at any time)

| Skill | Purpose |
|---|---|
| `/stage-bdd-review` | Independent subagent reviews BDD, scores /100 |
| `/stage-jira-sync` | Sync test artifacts to a Jira TEST Sub-task |
| `/tool-open-qa-bug` | RIDER-format bug report |
| `/tool-scan-qa-risk` | Risk matrix analysis |
| `/auto-code-review` | PR code review, 100-point scale |
| `/auto-create-pull-request` | Generate a PR description and create the PR |

---

## Running Your First Skill

Confirm Claude Code has been started in the `Playwright-Web-Agentic-Engineering-Automation/` directory, then try running:

```
/tool-scan-qa-risk TICKET-1352
```

Claude will read the Jira ticket TICKET-1352 and produce a risk matrix analysis. This skill does not write any files, making it ideal for getting familiar with the workflow the first time.

---

## The Modified / New Concept in BDD

The .feature files produced by `/stage-write-bdd` come in two modes, which newcomers most easily confuse:

| Mode | When | What to Write |
|---|---|---|
| **New** | The main library `testcases/` has no matching file | Write the entire .feature from scratch |
| **Modified** | The main library already has a matching file | **Write only the Scenarios added or changed by this ticket**, marked with `# [added]` / `# [changed]` |

Modified is not a full-file rewrite; it is diff-only. It is intelligently merged into the main library only at merge time (`/stage-tc-merge`).

---

| [← Environment Setup](02-setup.md) | [Workflow →](04-workflow.md) |
|:---|---:|
| Step 2: Installation and Setup | Step 4: Feature → Version |
