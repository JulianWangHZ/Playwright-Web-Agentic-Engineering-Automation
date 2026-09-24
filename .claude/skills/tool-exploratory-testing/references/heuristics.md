# Exploration heuristics

While exploring, ask yourself three questions: **Where to test? How to test? How to tell it's wrong?**
The charter picks only 3 directions + 2 exploration styles — don't run the full set as a checklist.

## 1. Where to test? (SFDIPOT)

Look at a feature from 7 directions so you don't just stare at the screen:

| Direction | Ask yourself | YouTube examples |
|---|---|---|
| What it's made of (Structure) | What parts does it have | watch page = player + description + comments + related videos; channel = home / videos / shorts / playlists tabs |
| What it does (Function) | What can a viewer do with it | search, filter, sort, play, seek, change quality, open channel |
| What data it handles (Data) | What is typed, stored, shown | keywords, durations, view counts, upload dates, timestamps (`t=`), special characters |
| What it connects to (Interfaces) | What talks to it | share links, embeds, URL parameters (`v=`, `list=`, `t=`, `search_query=`) |
| Where it runs (Platform) | Which device / environment | browser, viewport width, language, region |
| Who uses it, how (Operations) | Does everyone see the same thing | guest only here; region and language change content |
| Time-related (Time) | What changes over time | live vs VOD, "2 hours ago" labels, seek to start / end, long idle tab |

How to pick: search → Function / Data / Interfaces; watch page → Function / Data / Time; channel → Structure / Data / Platform.

## 2. How to test? (Tours)

Switch between exploration styles:

| Style | How | When |
|---|---|---|
| Break it on purpose (Saboteur) | offline, 5xx, rapid clicks, back or refresh mid-flow | every session (one of the two required) |
| Go where it broke before (Bad Neighborhood) | bugs cluster; dig around areas that already failed | when the ticket already has Bug subtasks (one of the two required) |
| Follow the URL (Deep link) | build URLs by hand and open them directly | anything driven by URL parameters |
| Follow one video (FedEx) | pick one video and check it on every page that shows it | search results ↔ watch page ↔ channel |
| Jump around (Landmark) | hop between main pages in different orders | many entry points, back / forward heavy |
| Back alleys (Back Alley) | the least-used features | filters combos, playlist edge pages, settings menus |

Pick 2 per session; one must be "break it on purpose" or "go where it broke before".

## 3. How to tell it's wrong? (FEW HICCUPPS)

There's no expected result to compare against, so ask these questions. Any "no" is a suspicion — follow it.

**Ask for every important area:**

- **Would a normal viewer find this odd?** (Users)
- **Does it match the ticket / spec / design?** (Claims)
- **Is it consistent with the rest of YouTube?** (Product) e.g. one filter resets on back and another doesn't → the first is probably a bug

**If there's time:**

- Seen a similar bug before? (Familiar problems)
- Can the behavior be explained? (Explainability)
- Does it match real-world common sense — time, counts, order? (World)
- Same as the last version? (History)
- Would it make the product look bad? (Image)
- How do comparable products do it? (Comparable products)
- Does it achieve what the feature is for? (Purpose)
- Any legal / privacy concern? (Statutes)

## 4. Attack lists

**Search input**

- empty, spaces only `"   "`, one character, very long (500+ chars)
- emoji `🙂`, mixed scripts, leading / trailing spaces
- search operators: `"exact phrase"`, `-exclude`, `#hashtag`, `@handle`
- `<img src=x onerror=alert(1)>`, `' OR '1'='1` — check console and page for execution

**URL parameters**

- `v=` invalid / removed / private video id
- `t=` negative, beyond duration, non-numeric (`t=abc`, `t=1h2m3s`)
- `list=` invalid, `index=` out of range
- duplicate parameters, unknown parameters, URL-encoded garbage

**State**

- open a deep link that skips earlier steps
- back / forward / refresh mid-flow, second tab with the same URL
- double-click a filter or result card
- apply filters → back → forward: are filters kept?
- leave the tab idle a long time, then interact

**Network**

- offline mid-playback, then back online
- 5xx on `/youtubei/` endpoints (search, next, browse) via `page.route`
- slow network: loading states and skeletons

## 5. What should be there but isn't

For every input ask: missing hint or validation? For every flow ask: missing confirmation or way back? For every list ask: is there an empty-state message? An error message? A way to recover?

## 6. Looks like a bug but isn't (rule out before concluding)

| Symptom | Actual cause |
|---|---|
| Consent / cookie dialog covers the page | region consent flow, dismiss and retest |
| Layout or labels differ between runs | A/B experiments on production |
| Pre-roll ad before playback, different each time | ads are non-deterministic |
| Video unavailable in one run only | region restriction or content removed |
| "Sign in to confirm you're not a bot" | rate limiting of automated traffic, slow down and retest |
| Related videos / results order changes | recommendations are personalized and non-deterministic |

If you can't rule it out, mark the finding "possibly environmental" and lower severity one level.
