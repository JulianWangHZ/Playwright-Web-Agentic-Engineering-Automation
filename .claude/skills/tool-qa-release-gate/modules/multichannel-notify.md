# Multi-channel Notify Module (Slack / Telegram / Line)

> Notifications for the release decision (go/no-go). Slack goes through MCP (posts to `slack.release_channel_id`); **Telegram / Line have no MCP, so they use the Bot API (curl, via the Bash tool)**.
> `config.notifications.enabled_channels` decides which channels to send to, and they **can coexist**.

## Enablement determination

```python
channels = config["notifications"]["enabled_channels"]   # e.g. ["slack","telegram"]
```

Event: a QA sign-off decision is produced (GO / CONDITIONAL-GO / NO-GO).

## Telegram (Bot API)

```bash
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
  --data-urlencode "parse_mode=Markdown" \
  --data-urlencode "text=${MESSAGE}"
```

Template (Markdown):
```
🚦 *QA Sign-off* — {version}
Decision: {decision} (readiness {score}/100)
Hard gates: P0={p0} / security={sec} / compliance={comp}
{conditional_risk_line}
Details: {report_url_or_path}
```

## Line (Messaging API push)

```bash
curl -s -X POST https://api.line.me/v2/bot/message/push \
  -H "Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg to "$LINE_TO" --arg text "$MESSAGE" \
        '{to:$to, messages:[{type:"text", text:$text}]}')"
```

Template (plain text, swap emoji ✅/⚠️/🔴 based on the decision):
```
🚦 QA Sign-off — {version}
Decision: {decision} (readiness {score}/100)
All hard gates passed: {hard_pass}
{conditional_risk_line}
```

## Safety guardrails

- ❌ Always read tokens from config; never write them into skill files / logs / commits
- ✅ **NO-GO must always be sent** (blocking a release is an important signal; a notification failure must be prominently surfaced, never silent)
- ✅ curl failure → log and degrade; if any one channel fails, the others are still sent
- ✅ A notification is only an announcement, **not a sign-off** — the signature must be a human (see the SKILL guardrails)

## Missing-value degradation

| Missing | Behavior |
|------|------|
| `enabled_channels` does not include telegram/line | do not send that channel |
| `telegram.bot_token`/`chat_id` empty | skip Telegram |
| `line.channel_access_token`/`to` empty | skip Line |
| All channels missing | only produce the local sign-off document (same as markdown-fallback) |
| `curl`/`jq` not present | skip that channel and prompt to install |