# Newcomer Checklist

| [← Workflow](04-workflow.md) | [YouTube Automation →](../../youtube/docs/getting-started.md) |
|:---|---:|
| Step 4: Feature → Version | Next stop: E2E automation framework |

**Step 5 / 5**

---

## Day 1: Get the environment up and run your first Skill

- [ ] Finish reading [README.md](../../README.md) — understand what the project is
- [ ] Complete [Environment Setup](02-setup.md) (CODEBASE.md, Jira MCP)
- [ ] Start Claude Code in `Playwright-Web-Agentic-Engineering-Automation/`: `claude`
- [ ] Run `/tool-scan-qa-risk TICKET-1352` to confirm Jira MCP can read the ticket
- [ ] Run `/stage-test-matrix TICKET-1352` to confirm Claude can produce a test matrix

---

## Day 2: Understand the architecture and the Skill system

- [ ] Read [Skill System](03-skills.md) — understand the skill system and argument format
- [ ] Read [Workflow](04-workflow.md) — understand the two Feature → Version stages
- [ ] Read [`docs/workflow.md`](../workflow.md) — deep dive into workflow rules (merge back, Modified/New)
- [ ] Read [`docs/skills.md`](../skills.md) — detailed documentation for each skill
- [ ] Read [`.claude/rules/gherkin.md`](../../.claude/rules/gherkin.md) — BDD authoring rules

---

## Day 3: Run through a full Feature workflow hands-on

Pick a ticket within your scope from Jira and walk through the full Feature workflow once:

- [ ] `/stage-test-matrix TICKET-xxx` — build the test matrix
- [ ] Manually confirm whether the matrix coverage is complete (any missing dimensions)
- [ ] `/stage-write-bdd TICKET-xxx` — write the BDD .feature
- [ ] `/stage-bdd-review TICKET-xxx` — review the BDD and look at the scoring report
- [ ] Confirm the `features/{ticket}/` structure is correct

---

## Key Knowledge Check

If you can answer these questions, you are up to speed:

**Concepts**
- Why is `testcases/` read-only? Who has permission to write to it?
- What is the difference between Modified BDD and New BDD? Why does Modified only write the diff?
- When can `/stage-tc-merge` be run? What happens if it runs too early?
- What is the purpose of the `# [added]` and `# [changed]` markers?

**Operations**
- How do you view the risk analysis of a ticket?
- What is the difference between `/stage-write-bdd v4.14 TICKET-1352` and `/stage-write-bdd TICKET-1352`?
- Where is the BDD Review report? Does it modify the .feature?
- When multiple people work on a Version in parallel, what do you do if the same .feature is modified by two Features?

---

## Common Resources

| Resource | Location |
|---|---|
| Workflow (full version) | [`docs/workflow.md`](../workflow.md) |
| Full skill documentation | [`docs/skills.md`](../skills.md) |
| Gherkin rules | [`.claude/rules/gherkin.md`](../../.claude/rules/gherkin.md) |
| QA visual pipeline | [`docs/qa-lifecycle.html`](../qa-lifecycle.html) |
| Jira project | your-workspace.atlassian.net (all tickets prefixed TICKET-xxx) |

---

## Next Step: YouTube E2E Automation

The BDD .feature files in Playwright-Web-Agentic-Engineering-Automation are ultimately implemented as automatically runnable Playwright tests inside `youtube/`.

If you want to learn more about E2E automation, read next:

→ **[YouTube Automation — Getting Started](../../youtube/docs/getting-started.md)**

---

| [← Workflow](04-workflow.md) | [YouTube Automation →](../../youtube/docs/getting-started.md) |
|:---|---:|
| Step 4: Feature → Version | Next stop: E2E automation framework |
