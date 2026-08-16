# Bug Report Templates

## Jira Description Markdown Template (fixed format, structure must not be changed)

When creating a Bug, fill the description field with this Markdown (both `jira_create_issue` and `jira_update_issue` use Markdown, **not HTML**):

```markdown
**⚠️ [Current Problem]**

{the actual abnormal behavior observed, including the error message}

---

**💥 [Impact Scope]**

**Severity:** {Blocker / Critical / Major / Minor}

{proportion of affected users, affected functional modules, business impact}

---

**📎 [Attachments]**

{screenshot / recording / Console log / Network log links; write "None" if none}

---

**🧪 [Reproduction Steps]**

**Precondition:** {if any}

1. {step 1}
2. {step 2}
3. {step 3 (add or remove per the actual steps)}

---

**✅ [Expected Result]**

{the correct state that should be seen}

---

**🍀 [Test Environment]**

{dev / staging / pre-release / prod; may add branch name, browser, account type}

---

**📋 [Additional Information]**

**Initial attribution:** {Frontend / Backend / To be confirmed} ({platform, e.g. youtube}; reason: {one sentence})

**Reproduction rate:** {100% / intermittent (X/10 times) / specific conditions}

**First found in:** {branch name / sprint / version}

**Related Ticket:** {TICKET-xxx, TICKET-yyy; skip if none}

**Workaround:** {temporary workaround; skip if none}
```

---

## Ticket Field Mapping Table

| Jira field | Value |
|---|---|
| project | {PROJECT} |
| issuetype | Bug (subtask type) |
| parent | {TICKET-xxx} (feature ticket) |
| summary | `[Bug] {one-sentence title}` |
| description | The Markdown above (after filling in the actual content) |

> 💥 [Impact Scope] key points to fill in: which users are affected (all users / specific conditions), which core flow (video search / video playback / channel / search filters), and whether it blocks the main-line task.

---

## Markdown Fallback (when the Jira MCP is unavailable)

If a Jira ticket cannot be created, output the following Markdown for manual pasting:

```markdown
## [Bug] {title}

**Related ticket**: {TICKET-xxx}

### ⚠️ Current Problem
{actual abnormal behavior}

### 💥 Impact Scope
**Severity**: {Blocker / Critical / Major / Minor}
{proportion of affected users, functional modules, business impact}

### 📎 Attachments
{link or None}

### 🧪 Reproduction Steps
Precondition: {if any}

1. {step}
2. {step}

### ✅ Expected Result
{correct state}

### 🍀 Test Environment
{dev / staging / pre-release / prod}

### 📋 Additional Information
**Initial attribution**: {Frontend / Backend / To be confirmed} ({platform}; reason: {one sentence})
**Reproduction rate**: {100% / intermittent (X/10 times) / specific conditions}
**First found in**: {branch / sprint / version}
**Related Ticket**: {TICKET-xxx; skip if none}
**Workaround**: {temporary workaround; skip if none}
```
