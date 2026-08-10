# Newcomer Checklist

| [← Workflow](04-workflow.md) | [Test Data Reference →](06-test-data.md) |
|:---|---:|
| Step 4: Feature → Version | Step 6: Test data (reference) |

**Step 5 / 6**

---

## Part 1 · Get set up and run your first skill

- [ ] Finish reading [README.md](../../README.md) — understand what the project is
- [ ] Complete [Environment Setup](02-setup.md) (CODEBASE.md, Jira MCP)
- [ ] Start Claude Code in `Playwright-Web-Agentic-Engineering-Automation/`: `claude`
- [ ] Run `/tool-scan-qa-risk TICKET-1352` to confirm Jira MCP can read the ticket
- [ ] Run `/stage-test-matrix TICKET-1352` to confirm Claude can produce a test matrix

---

## Part 2 · Learn the architecture and the skill system

- [ ] Read [Skill System](03-skills.md) — the skill system, argument format, and the full skill reference
- [ ] Read [Workflow](04-workflow.md) — the two Feature → Version stages plus the full workflow rules (merge back, Modified/New)
- [ ] Read [`.claude/rules/gherkin.md`](../../.claude/rules/gherkin.md) — BDD authoring rules

---

## Part 3 · Practice a full feature workflow

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
| Workflow (full detail) | [`04-workflow.md`](04-workflow.md) |
| Full skill reference | [`03-skills.md`](03-skills.md) |
| Gherkin rules | [`.claude/rules/gherkin.md`](../../.claude/rules/gherkin.md) |
| QA visual pipeline | [`pipeline.html`](../../pipeline.html) |
| Jira project | your-workspace.atlassian.net (all tickets prefixed TICKET-xxx) |

---

## Next Step: Test Data Reference

Before diving into the automation framework, skim how this project organizes its test data (Step 6).

→ **[Test Data Reference](06-test-data.md)**

---

| [← Workflow](04-workflow.md) | [Test Data Reference →](06-test-data.md) |
|:---|---:|
| Step 4: Feature → Version | Step 6: Test data (reference) |
