# Environment Setup

| [← Project Overview](01-overview.md) | [Skill System →](03-skills.md) |
|:---|---:|
| Step 1: What this project is | Step 3: Which skills exist and how to use them |

**Step 2 / 6**

---

## Prerequisites

macOS (Windows not supported yet).

- Claude Code CLI (`claude --version`)
- GitHub CLI (`gh --version`)
- Node.js 20+ (`node --version`)
- uv (`uvx --version`, for the Jira MCP)
- Google Chrome (headless runs use the system Chrome via `BROWSER_CHANNEL=chrome`)

---

## Step 1: Clone the repo

```bash
git clone https://github.com/JulianWangHZ/Playwright-Web-Agentic-Engineering-Automation.git
cd Playwright-Web-Agentic-Engineering-Automation
cd youtube && npm install && cd ..
```

---

## Step 2: Codebase map (can stay empty)

```bash
cp .claude/CODEBASE.template.md .claude/CODEBASE.md
```

With `https://www.youtube.com` as the product under test, **no product repo is needed** — `qa-context` confirms behavior by walking the site live. When adopting this for your own product, fill in your repo paths; `qa-context` then pulls them and reads business rules as `file:line`. Empty entries never block.

---

## Step 3: Jira credentials

```bash
cp .claude/secrets.template.env .claude/secrets.env
```

Fill in both groups in `.claude/secrets.env` (same account, same token):

```env
# Jira MCP (without these the MCP starts but exposes 0 tools)
JIRA_URL=https://your-workspace.atlassian.net
JIRA_USERNAME=you@example.com
JIRA_API_TOKEN=your API token

# /tool-jira-sync attachment upload (review.html)
JIRA_USER=you@example.com
JIRA_BASE_URL=https://your-workspace.atlassian.net
```

API token: [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens). Details in [`.claude/SECRETS_SETUP.md`](../../.claude/SECRETS_SETUP.md). `secrets.env` is git-ignored.

---

## Step 4: MCP servers

The repo ships a `.mcp.json`:

| Server | Used by | Needed when |
|---|---|---|
| `atlassian` | every skill that reads or creates tickets | always |
| `playwright` | `qa-context` / `qa-cases` live checks on the target site | always |
| `playwright-test` | planner / generator / healer agents | writing automation (run `npm install` in `youtube/` first) |

---

## Step 5: Verify

```bash
claude
```

```
/qa-context TICKET-1
```

Claude reads the ticket and writes `runs/TICKET-1/context.md` → setup works.

---

## FAQ

**Q: Can't read the Jira ticket / no `jira_*` tools**
→ Check `secrets.env` has `JIRA_URL` / `JIRA_USERNAME` (the most common cause), then the token and your access to the ticket. Restart Claude Code after changes.

**Q: The Jira MCP works in the terminal but not in VS Code**
→ VS Code launched from the Dock doesn't have `~/.local/bin` on its PATH, so it can't find `uvx`. Run `ln -s ~/.local/bin/uvx /opt/homebrew/bin/uvx`, then Reload Window.

**Q: I don't see `/qa-ticket` and the other commands**
→ Start Claude Code at the repo root (the directory with `CLAUDE.md`).

---

| [← Project Overview](01-overview.md) | [Skill System →](03-skills.md) |
|:---|---:|
| Step 1: What this project is | Step 3: Which skills exist and how to use them |
