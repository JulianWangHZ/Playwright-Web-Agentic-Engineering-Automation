---
name: auto-responsive-layout-check
description: YouTube responsive layout scanning techniques — detect horizontal overflow, text truncation, element overlap, undersized touch targets, image distortion, and breakpoint-boundary bugs across multiple viewports. Mobile-first web focused. Triggers when the user mentions "responsive, responsive design, RWD, breakpoint, mobile view, overflow, horizontal scroll, broken layout, layout shift, touch target, viewport, font-size overflow" and needs to implement automation on YouTube. Adapted from Pramod/responsive-layout-breaker, aligned with the layering and red lines in youtube-automation.md.
argument-hint: "<page path list | empty=scan main consumer pages>"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# responsive-layout-check

Perform **responsive layout scanning** for YouTube (mobile-first web). The core pain point: empty layouts all look fine; **real content + breakpoint boundaries** are what break layouts. Horizontal overflow is the single check with the highest return on investment.

**Working directory is fixed at `youtube/`.** Responsive scanning is a **technical sweep, not a business scenario** — place standalone Playwright specs (not BDD; business stakeholders do not need to read them) and **do not write `.feature` files**. Follow `.claude/rules/youtube-automation.md` throughout.

---

## Red-line alignment (conflicts resolved during adaptation)

| Original skill approach | Adapted for this project |
|---|---|
| Bundled test framework + 20+ hardcoded viewport table | viewport list goes in `src/data/` (mirroring `tags.ts`/`endpoints.ts`); specs go in `tests/responsive/` |
| BDD-agnostic generic examples | **Not implemented as BDD** (no business semantics); standalone specs in `tests/responsive/` |
| overflow detection inline in the test | encapsulated in `src/utils/overflow-detector.ts` (pure utility, mirroring `element-wait.utils.ts`) |
| Bundled console output | use `createLogger` (youtube-automation.md §11), not `console.*` |

- Page paths to scan are parameterized, defaulting to the main pages (matching the actual routes of the existing `HomePage`/`SearchResultsPage`/`WatchPage`/`ChannelPage`).
- This project is **guest/logged-out**; navigate directly to the target URL with `page.goto()` to start a page, no storageState / login.
- Native locators; Traditional Chinese comments should only explain "why".

## Seven core insights (what to test)

1. **Breakpoint boundaries fail most often** — test breakpoint−1 / breakpoint / breakpoint+1, not the midpoint
2. **Content-driven bugs** — use real (or near-realistic length) data, not empty states
3. **Horizontal overflow is the most critical** — the single most worthwhile item to test; do it first
4. **CSS px ≠ device px** — set viewport sizes in CSS px to match real devices
5. **Test portrait and landscape separately** — test each of portrait / landscape
6. **Dynamic content triggers reflow** — verify again after modal / accordion expansion
7. **Minimum touch target size** — WCAG recommends 44×44 CSS px

## Core techniques

### 1. Horizontal overflow detection (priority)
Compare `document.scrollWidth` vs `document.documentElement.clientWidth`; if it overflows, use `getBoundingClientRect()` to identify **which specific element** exceeds by how many px, and report a locatable diagnostic message.

- Encapsulate in `src/utils/overflow-detector.ts`: input `page`, return list of overflowing elements + their overflow amounts.

### 2. Breakpoint-boundary scanning
For each key breakpoint, use `page.setViewportSize()` to set the −1 / 0 / +1 widths, run overflow + visibility assertions at each, and catch bugs at the moment media queries switch.

### 3. Touch target size
Scan the bounding boxes of interactive elements (button / link / input) and flag those under 44×44 CSS px. Can be cross-checked with `/a11y-audit` (WCAG 2.5.5).

### 4. Image scaling / layout
Verify images scale proportionally without distortion (naturalWidth/Height ratio), and that font size and line-height stay within a readable range.

## Placement and shape of artifacts

| Artifact | Location | Description |
|---|---|---|
| viewport list | `src/data/viewports.ts` | device profile constants (iPhone/Android/tablet/desktop CSS px) |
| overflow detection | `src/utils/overflow-detector.ts` | pure utility, `page` → overflow diagnostics |
| scan spec | `tests/responsive/*.spec.ts` | standard Playwright spec, parameterized viewport × page path |
| log | use `createLogger` from `src/utils/logger.ts` | not `console.*` |

> Start with **horizontal overflow only** (insight 3, highest ROI); add the other techniques as needed, not all at once (YAGNI).

## Workflow

1. Read `.claude/rules/youtube-automation.md` and `.claude/rules/gherkin.md` (confirm this kind of sweep is not implemented as BDD).
2. Create `src/data/viewports.ts` + `src/utils/overflow-detector.ts`.
3. Create `tests/responsive/overflow.spec.ts`, parameterized over viewport × target page path.
4. Verify:

```bash
cd youtube
BROWSER_CHANNEL=chrome npx playwright test tests/responsive/    # run only the responsive subset
npm run check                                               # tsc + prettier + eslint, must pass
```

## Guardrails

- Suspected real layout-break bug found → go through `/tool-open-qa-bug` to file a ticket (attach viewport + overflowing element + screenshot); do not hack the spec to make it pass.
- Reuse the existing `playwright-smart-reporter` "keep on failure only" screenshot strategy; do not build a separate screenshot mechanism.
- Unknown page route → do not guess; confirm in a real browser first (live-probe).
- Do not commit / push (unless the user explicitly requests it).
