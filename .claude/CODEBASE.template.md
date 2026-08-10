# Codebase Map (Template)

> First-time setup requires copying two templates:
> 1. Copy this file to `.claude/CODEBASE.md` and fill in your local paths
> 2. Follow the steps in `.claude/SECRETS_SETUP.md` to create `.claude/secrets.env` (used by jira-sync to upload attachments)
>
> Both files are already listed in .gitignore, maintained separately and not committed to git.
>
> The test target of this project is `https://www.youtube.com`; it does not depend on any private product repo.
> The table below is a template for "how to fill in your own environment"; you only need to enter a real repo if you adapt this framework to your own product.
> When targeting youtube.com, this file can be left entirely blank or keep the placeholders.

---

## Platform → Repo Path (fill in your own environment)

| Platform | Local Path | GitHub Repo | STG Branch |
|---|---|---|---|
| `<your-platform-1>` | `<your-local-path>/<your-repo-1>` | `<your-org>/<your-repo-1>` | `staging` |
| `<your-platform-2>` | `<your-local-path>/<your-repo-2>` | `<your-org>/<your-repo-2>` | `dev` |

> Each row = one repo whose business rules you want to cross-reference. Leave the whole table blank if there are none.

---

## Determining Impacted Repos (all tickets are TICKET-xxx)

The ticket prefix cannot distinguish products; you must read the Jira ticket summary / description / labels and judge for yourself:

| Basis for judgment | Impacted repos |
|---|---|
| Ticket mentions `<keyword for your product A>` | `<your-platform-1>` (+ related backend repo) |
| Ticket mentions `<keyword for your product B>` | `<your-platform-2>` (+ related backend repo) |
| Multiple products are impacted | all of the above |

If test_matrix.md has an explicit `platform` column, defer to that platform.

> When targeting www.youtube.com: no product repo lookup is needed. Just open `https://www.youtube.com` in a real browser and walk through it, treating the page's actual behavior as the source of truth for business rules.

---

## Step 0: Sync Process Before Reading Code

Each time a skill needs to read the codebase, execute the following in order:

### 1. Read the Jira ticket
```
mcp__atlassian__jira_get_issue({ issue_key: "{ticket}" })
mcp__atlassian__jira_get_issues_development_info({ issue_id: "{ticket}" })
```
- From `jira_get_issue`, get: feature description, AC, platform tags
- From `jira_get_issues_development_info`, get: linked branches, PR links

### 2. Determine impacted platforms + git pull
Based on the ticket content, determine which repos are impacted (see table above), and run against the corresponding repo:
```bash
git -C <your-local-path> pull origin <stg_branch>
```

> When targeting www.youtube.com: skip this step. Instead, open `https://www.youtube.com` in a browser and walk through the flow under test to confirm behavior.

### 3. Read the PR changes
For each linked PR:
```bash
gh pr view {PR_number} --repo <your-org>/<your-repo> --json title,body,files,additions,deletions
gh pr diff {PR_number} --repo <your-org>/<your-repo>
```
Extract the list of files changed from the diff, and only read those files afterward.

### 4. Read the relevant source files
Based on the file list from the PR diff + the Jira feature description, read selectively:
- The changed component / module itself
- The related type / interface definitions
- The related API route / controller

Do not blindly read the entire repo — only read the N files relevant to the feature.

> When targeting www.youtube.com: there is no private source to read. Treat the actual UI / behavior of `https://www.youtube.com` as authoritative, and confirm it in the browser firsthand.
