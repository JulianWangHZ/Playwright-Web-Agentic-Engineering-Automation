# Interactive prototype spec (prototype.html)

The prototype exists to **confirm requirements**: PM, design and QA agree on screens, states and flows before any automation is written. It is not a design file and not product code.

## When to build one

| Situation | What to do |
|---|---|
| New screen, redesign, form, multi-step flow, state-dependent display | Required |
| Copy or style change only, no flow change | Optional; state why in the review.html prototype tab |
| Pure API, batch, background job, data fix | Skip; state why, as above |

Pick the scope from the matrix and design yourself; do not stop to ask.

## How

1. Copy `../assets/prototype-starter.html` to `runs/{ticket}/prototype.html`.
   - The left review panel has two tabs: "Scenarios" (click to auto-play) and "Screens" (screen list with linked scenarios); ← → at the bottom switch screens.
   - The device on the right scales with the window and follows review.html's dark/light mode.
   - Do not apply `UI_BASE.md`; never change the starter's styles.
2. `<body>` settings:
   - `data-platform`: `web` (the target site; switch between a "Desktop" browser window and a "Mobile" web view) or `app` (native apps; iPhone 17 Pro frame only)
   - `data-title`: feature name; `data-subtitle`: one-line description
   - Product accent color: change `--tint` in `:root`
3. Inside `#screens`, one `<section class="screen">` per screen:
   - `data-id`: unique id (English kebab-case)
   - `data-name`: screen name in business language
   - `data-group`: left-panel group, e.g. "Main flow", "Error states"
   - `data-cases`: linked scenario ids, comma-separated
   - `data-note`: optional note in the left panel
   - `data-status="light"`: optional (app), white status bar text on dark screens
   - `data-url="/results"`: optional (web), path shown in the address bar
4. Make screens **actually interactive**:

   | Attribute or function | Effect |
   |---|---|
   | `data-go="<screen id>"` | Go to a screen (with back stack and push animation) |
   | `data-back` | Go back one screen |
   | `data-open="<id>"` | Stack an overlay on the current screen: `.sheet`, `.alert`, `.modal` (centered web dialog), `.viewer` (fullscreen viewer) |
   | `data-close` | Close the top overlay only (same as scrim click / Esc); switching screens closes all |
   | `data-toast="text"` | Show a toast |
   | `go(id)`, `back()`, `toast(text)`, `openOverlay(id)`, `closeOverlay()` | Use in a custom `<script>`, e.g. route to a success or error screen based on input |

   Inputs accept typing; `.switch` and `.segmented` toggle directly. To simulate rules (attempt counts, form validation), add a few lines to the `<script>` at the end of the file.

   **Dialogs, drawers and fullscreen viewers are always overlays stacked on the source screen**: write them inside the source screen's `<section>` and open with `data-open`; never make them separate `.screen`s. With stacked overlays (e.g. a confirm inside a dialog), closing removes only the top layer and leaves the rest as is.
5. Use the built-in components; no external CSS/JS/fonts:
   - Shared: `.card`, `.field` (add `.error`), `.btn` (`.block`, `.ghost`, `.plain`, `.destructive`, `disabled`), `.badge` (`.ok`, `.bad`, `.warn`), `.switch`, `.segmented`, `.empty`, `.sheet`, `.alert`, `.toast`, `.viewer` (`.bar` + `.media`)
   - App: `.nav` (`.bar`, `.back`, large title `h1`), `.content`, `.section-label`, `.tabbar`, `.group` + `.cell` (`.link`, `.detail`)
   - Web: `.site` > `.topbar` (`.brand`, `nav`, `.menu-btn`) + `.page`; `.cols` (`style="--cols:3"` sets columns), `.narrow`, `.only-desktop`, `.only-mobile`, `.modal` (`h2`, `.x` close button, `.actions`)
   - Web screens switch layout by **device width**: 700px and below is mobile. For finer differences use `@container vp (max-width: 700px) { … }`.

## Scenario demos (qa-scenarios)

After writing BDD, add demos for the scenarios in the JSON block with `id="qa-scenarios"` near the bottom of the file. When reviewing:
- Click a scenario on the left; the device starts from the `start` screen and plays the steps. While playing, click "Stop" or the title again to stop.
- Clicking any step fast-forwards the earlier steps, then plays from that step; the expected-result highlight stays after playback until you tap the screen, then you can keep interacting.
- The reset icon at the device's top right (↺, or key R) stops the demo, clears input and overlays, and returns to the first screen.

```json
[
  { "id": "TC-002", "title": "Search with no results shows an empty state", "start": "home",
    "steps": [
      { "kind": "given", "text": "I am on the home page", "actions": [] },
      { "kind": "when", "text": "I search for \"zzqxj\"", "actions": [{ "type": "#search", "text": "zzqxj" }, { "tap": "#search-btn" }] },
      { "kind": "then", "text": "I see \"No results found\"", "actions": [{ "expect": "#empty-state" }] }
    ] }
]
```

| Field | Description |
|---|---|
| `id` / `title` | Scenario id and Scenario title. Ids match review.html: `TC-001`, `TC-002`… in `.feature` order (see `review-page.md`) |
| `start` | Starting screen id |
| `device` | Optional (web): `desktop` or `mobile` |
| `steps[].kind` / `text` | `given`, `when`, `then` and the step text, copied from the feature (`And` joins the previous kind) |
| `steps[].actions` | Actions run in order |

| Action | Effect |
|---|---|
| `{ "type": "#selector", "text": "…" }` | Type character by character |
| `{ "tap": "#selector" }` | Show the tap point, then click |
| `{ "expect": "#selector" }` | Highlight the expected result |
| `{ "go": "screen id" }` | Go to a screen |
| `{ "call": "function name", "args": […] }` | Call a custom function to set up Given state (e.g. already failed 4 times) |
| `{ "wait": ms }` | Pause |

- Elements that are acted on or highlighted need an `id`.
- Reset custom state (e.g. counters) in `window.onScenarioReset`; it runs before every playback.
- **Every scenario needs a demo**:
  - Invisible rules (time passing, accumulating counts, concurrency, backend computation) get a small JS simulation, then `call` sets the state. E.g. `lockFor(899)` simulates "locked 14 min 59 s ago", then demo the actions and result as usual.
  - Only scenarios with **no UI at all** (pure backend schedules, export file contents) get `{ "id": "TC-009", "title": "…", "noUi": true, "reason": "Runs as a background schedule; no user-facing screen" }`; the reason is listed during review.
  - "Hard to build" is not a reason for `noUi`.

## Content

- **Screen source**: derive from the matrix and state machine. With a design file, layout and copy follow the design; where copy or interaction differs from the behavior observed in context.md, follow the observed behavior and note it in that screen's `data-note`.
- **States to cover**: every main-flow step, plus whatever the requirement and state machine include: empty state, validation error, business-rule block (quota used up, slot full), system error, no permission or signed out, disabled or in progress.
- **Copy**: use real copy from the ticket / design / live site; mark uncertain copy `(TBC)`.
- **Data**: realistic data ("Amy", "$12.99"), not "foo" or "test123".
- **Linked scenarios**: tag `data-cases` on as many screens as possible. A screen with no scenario means either a missing scenario or an unnecessary screen.

## Constraints

- Single HTML file, all CSS/JS inline, opens offline.
- Simulate front-end state and simple rules only; no real API calls.
- Do not copy product code or reference product assets.
