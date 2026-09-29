# Newcomer Checklist

| [← Workflow](04-workflow.md) | [Test Data Reference →](06-test-data.md) |
|:---|---:|
| Step 4: Run your first ticket | Step 6: Test data (reference) |

**Step 5 / 6**

---

## Day 1: Get set up

- [ ] Read the [README](../../README.md)
- [ ] Finish [Environment Setup](02-setup.md) (secrets.env, `npm install` in `youtube/`)
- [ ] Start `claude` at the repo root
- [ ] Run `/qa-context TICKET-1` and confirm `runs/TICKET-1/context.md` is written

---

## Day 2: Understand the flow

- [ ] Read [Skill System](03-skills.md) — `/qa-ticket`, its 8 stages, the standing tools
- [ ] Read [Workflow](04-workflow.md) — what a run looks like and where you decide
- [ ] Open [pipeline.html](../../pipeline.html)
- [ ] Read [`.claude/rules/gherkin.md`](../../.claude/rules/gherkin.md) — BDD writing and tag rules

---

## Day 3: Run one ticket end to end

- [ ] `/qa-ticket TICKET-xxx` and watch context → risk → cases
- [ ] Open `runs/TICKET-xxx/review.html` and go through the matrix, state machine and BDD tabs
- [ ] Reply "approved" (or request a change and watch it re-review)
- [ ] Check the merge result with `git diff testcases/`
- [ ] Do the manual checks listed in the Close section

---

## Self-check

If you can answer these, you're ready:

- Where does `/qa-ticket` stop for you? When else does it stop?
- How do you resume after an interruption?
- When is `testcases/` written, and by which skill?
- What do `# [changed]` and `# remove from main library on merge` do at merge time?
- What's the difference between `NOT_FEASIBLE` and `TC_STALE`, and where does each end up?
- What goes on the ticket created by `/tool-jira-sync`, and what goes in the attachment?
- When is `/tool-qa-release-gate` always a NO-GO?

---

## Resources

| What | Where |
|---|---|
| Stage → skill index | [`docs/qa-workflow-map.md`](../qa-workflow-map.md) |
| Visual overview | [`pipeline.html`](../../pipeline.html) |
| Gherkin rules | [`.claude/rules/gherkin.md`](../../.claude/rules/gherkin.md) |
| Automation rules | [`.claude/rules/youtube-automation.md`](../../.claude/rules/youtube-automation.md) |
| Test data | [06-test-data.md](06-test-data.md) |

---

## Next: the automation framework

→ **[YouTube Automation — Getting Started](../../youtube/docs/getting-started.md)**

---

| [← Workflow](04-workflow.md) | [Test Data Reference →](06-test-data.md) |
|:---|---:|
| Step 4: Run your first ticket | Step 6: Test data (reference) |
