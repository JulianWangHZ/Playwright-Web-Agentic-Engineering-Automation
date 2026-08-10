# Test Data Reference

| [← Newcomer Checklist](05-checklist.md) | [YouTube Automation →](../../youtube/docs/getting-started.md) |
|:---|---:|
| Step 5: Checklist | Next stop: E2E automation framework |

**Reference material** (not a workflow step)

---

> This page documents how this project's E2E automation organizes its test data. The product under test is `https://www.youtube.com` (guest/logged-out), so no private account or backend test data is required.
> The source of truth is `config/`, `src/data/`, and `src/setup/` in `youtube/`; this page is a human-readable summary, and the actual values follow the code. To change test data, change the corresponding file—do not edit only this page.

---

## 1. Environment URLs

URLs are selected by `config/test.config.ts` based on `ENV`. Only one base URL is needed.

| ENV | Web |
|---|---|
| `prod` (default) | https://www.youtube.com |

You only need to set `BASE_URL` manually to override the URL.

> **Principle**: All behavior follows the actual UI of www.youtube.com. There is no logged-in state and no private API; when you need to verify behavior, walk through it directly in the browser.

---

## 2. Accounts

This project tests www.youtube.com entirely in the **guest/logged-out state**, requiring no test account, OTP, or SMS.

If you apply the framework to your own product and need a logged-in state, we recommend:

- Route accounts / credentials through environment variables (see `.env.example`); **do not** hardcode them in code or docs.
- Put sensitive values in `.claude/secrets.env` (already listed in `.gitignore`).

---

## 3. Test Target Pages

Test pages focus on the site's stable entry points, avoiding dependence on individual content that changes frequently:

| Page | URL | Purpose |
|---|---|---|
| Home | `https://www.youtube.com` | Main entry point, navigation, search entry |
| Search results | `https://www.youtube.com/results?search_query=<keyword>` | Search behavior verification |

> Individual video / channel page content changes, so keep test scenarios focused on stable flows like "search → results list" and avoid brittle assertions.

---

## 4. Test Data Specification Principles

Three layers—understand this section and you understand how test data works:

1. **UI tests do not hardcode volatile content**: rely mainly on stable URLs / structural selectors, avoiding text assertions that break when the site is redesigned.
2. **Parameters go through environment variables**: search keywords, target URLs, etc. are overridden via env (see `.env.example`), so swapping test data does not require code changes.
3. **Worker isolation**: during parallel testing each worker uses an independent browser context, avoiding cross-contamination of state.

---

## 5. Full Coverage Point Quick Reference

Environment variables you can set to swap test data without touching code (see `.env.example`):

```
ENV / BASE_URL              # Environment and site
SEARCH_QUERY                # Search keyword
```

---

| [← Newcomer Checklist](05-checklist.md) | [YouTube Automation →](../../youtube/docs/getting-started.md) |
|:---|---:|
| Step 5: Checklist | Next stop: E2E automation framework |
