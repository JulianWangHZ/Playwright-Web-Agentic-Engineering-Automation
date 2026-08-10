# Environment Setup

| [← Project Overview](01-overview.md) | [Skill System →](03-skills.md) |
|:---|---:|
| Step 1: What is Playwright-Web-Agentic-Engineering-Automation | Step 3: Which skills exist and how to use them |

**Step 2 / 6**

---

## Prerequisites

- macOS (Windows not supported yet)
- Claude Code CLI installed (`claude --version` works)
- GitHub CLI installed (`gh --version` works)
- Node.js 20+ (`node --version` works)

---

## Step 1: Clone the repo

```bash
git clone https://github.com/JulianWangHZ/Playwright-Web-Agentic-Engineering-Automation.git
cd Playwright-Web-Agentic-Engineering-Automation
```

---

## Step 2: Create the Codebase Map (can be left empty)

```bash
cp .claude/CODEBASE.template.md .claude/CODEBASE.md
```

This project uses `https://www.youtube.com` as its product under test, so **no private product repo is required**. This file can be left entirely empty or keep its placeholders.

You only need to open `.claude/CODEBASE.md` in an editor and fill in the local paths of your repos if you are applying this framework to your own product:

```markdown
| <your-platform-1> | <your-local-path>/<your-repo-1> | staging |
| <your-platform-2> | <your-local-path>/<your-repo-2> | dev     |
...
```

> Repos you have not cloned can be left empty and filled in later when you need to look up business rules. When www.youtube.com is the product under test, confirm behavior by walking through it directly in the browser.

---

## Step 3: Configure Jira MCP

Skills such as `/stage-test-matrix`, `/stage-jira-sync`, and `/tool-scan-qa-risk` need to read Jira tickets, which requires configuring the Atlassian MCP server.

Add the following to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-atlassian"],
      "env": {
        "ATLASSIAN_EMAIL": "your Jira email",
        "ATLASSIAN_TOKEN": "your Atlassian API token",
        "ATLASSIAN_SITE_URL": "https://your-workspace.atlassian.net"
      }
    }
  }
}
```

Atlassian API token: [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)

---

## Step 4: Configure jira-sync attachment upload credentials (optional)

`/stage-jira-sync` needs REST API credentials when uploading prototype.html attachments.

```bash
cp .claude/secrets.template.env .claude/secrets.env
```

Open `.claude/secrets.env` and fill in:

```env
JIRA_EMAIL=your Jira email
JIRA_API_TOKEN=your Atlassian API token
JIRA_BASE_URL=https://your-workspace.atlassian.net
```

> `secrets.env` is already in `.gitignore` and will not be committed to git.

---

## Step 5: Verify the setup

Start Claude Code in the `Playwright-Web-Agentic-Engineering-Automation/` directory:

```bash
claude
```

Try running any skill:

```
/stage-test-matrix TICKET-1352
```

If Jira MCP is configured correctly, Claude should start reading the contents of TICKET-1352.

---

## FAQ

**Q: `/stage-test-matrix` says it cannot find the Jira ticket**
→ Confirm that `ATLASSIAN_TOKEN` in the MCP server config is correct and that the account has access to that ticket.

**Q: I do not see the skill commands after starting Claude Code**
→ Confirm the working directory is `Playwright-Web-Agentic-Engineering-Automation/` (the level that contains `CLAUDE.md`).

**Q: Which repos should I put in `.claude/CODEBASE.md`?**
→ When www.youtube.com is the product under test, it can all be left empty. If applying to your own product, first fill in the scope you currently own, leave the rest empty, and add more when a skill cannot find a business rule.

---

| [← Project Overview](01-overview.md) | [Skill System →](03-skills.md) |
|:---|---:|
| Step 1: What is Playwright-Web-Agentic-Engineering-Automation | Step 3: Which skills exist and how to use them |
