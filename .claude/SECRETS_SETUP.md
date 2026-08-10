# Secrets Setup Guide

`secrets.env` stores the Jira REST API credentials used by the `jira-sync` skill to upload attachments (`prototype.html`).  
MCP does not support attachment uploads, so Claude runs curl + Basic Auth to call the Jira REST API instead.

---

## Steps

### 1. Copy the template

```bash
cp .claude/secrets.template.env .claude/secrets.env
```

### 2. Get a Jira API Token

1. Log in to Jira (your-workspace.atlassian.net)
2. Click your avatar in the top right → **Account settings**
3. Left menu → **Security**
4. Find **API tokens** → **Create and manage API tokens**
5. Click **Create API token**, enter a name (such as `Playwright-Web-Agentic-Engineering-Automation`), and copy the generated token

### 3. Fill in secrets.env

Open `.claude/secrets.env` and replace the placeholders with your details:

```env
JIRA_USER=your-email@example.com
JIRA_BASE_URL=https://your-workspace.atlassian.net
JIRA_API_TOKEN=paste the token you just copied
```

---

## Notes

- `secrets.env` is already listed in `.gitignore` and **will not be version-controlled**; do not manually `git add` this file
- The token is only shown once at creation time, so copy it immediately; if lost, you must create a new one
- The token is bound to your account's permissions; remember to delete old tokens in your Atlassian account settings when you leave or rotate credentials
