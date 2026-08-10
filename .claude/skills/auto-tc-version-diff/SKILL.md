---
name: auto-tc-version-diff
description: Compare BDD feature file differences between two versions (Added / Modified / Removed scenarios) and produce a changelog and a re-test checklist. Triggers when the user mentions "TC version diff, TC version bump, compare v0.2 v0.3, which scenarios to re-run, re-test checklist, version differences".
allowed-tools: Read, Grep, Glob, Write, Bash
argument-hint: "<old version path or ticket> <new version path or ticket>"
model: sonnet
---

# tc-version-diff

Compare the BDD scenario differences between two versions and produce a changelog plus a re-test checklist.

## Input Forms

| Form | Example |
|------|---------|
| Two feature directories | `features/SEARCH-100/` `features/SEARCH-200/` |
| Two versions of testcases | `testcases/` + `versions/v1.2/testcases/` |
| Two explicitly listed .feature files | `old.feature` `new.feature` |
| Single ticket (auto-compare Feature → Version) | `<ticket>` |

## Phase 1: Extract Scenarios From Both Versions

Read both `.feature` files (or entire directories) and extract every Scenario:

```
key = Feature name + Scenario name (used as the comparison ID)
fields = tags, Given/When/Then steps
```

Ignore blank lines, Background, and language declarations.

## Phase 2: Classify Differences

| Type | Rule | Re-test Decision |
|------|------|------------------|
| 🆕 **Added** | key is in the new version but not the old | **Must run** |
| 🗑️ **Removed** | key is in the old version but not the new | Confirm whether it is truly deprecated |
| ✏️ **Modified** | same key but content changed | Decided by the affected field |
| ✅ **Unchanged** | completely identical | Already tested, no re-test needed |

**Modified breakdown:**

| Changed content | Impact level | Re-test Decision |
|-----------------|--------------|------------------|
| `Then` (expected result) changed | 🔴 High | **Must re-test** |
| `When` (action steps) changed | 🟡 Medium | Re-test |
| `Given` (preconditions) changed | 🟡 Medium | Re-test |
| Tags changed | 🟢 Low | Re-classify, usually no re-test |
| Title tweak (semantics unchanged) | 🟢 Low | No re-test |

## Phase 3: Produce the Changelog

Output to `versions/{v}/tc-changelog-{old}-{new}.md` (or `features/{ticket}/tc-changelog.md`):

````markdown
# TC Changelog · <ticket> v0.2 → v0.3

**Generated date**: {date}
**Comparison**: v0.2 ({N} scenarios) → v0.3 ({M} scenarios)
**Net change**: +{A} added / {R} removed / {C} modified

---

## 🆕 Added (must re-test)

- `[Feature: Search videos] Display a list of related videos after searching` @search-results @keyword-search
- `[Feature: Video playback] Click a search result to enter the watch page and start playback` @watch @keyword-search

## ✏️ Modified

### 🔴 High impact (must re-test)
- `[Feature: Search videos] Submit a search with a keyword`
  - Change: `Then` expected result adds "should display the number of search results"

### 🟡 Medium impact
- `[Feature: Search filters] Filter search results by upload time`
  - Change: `When` step changed to "open the filter panel and select 'Today'"

### 🟢 Low impact (no re-test)
- `[Feature: Channel] View the channel home page`
  - Change: title tweak

## 🗑️ Removed

- `[Feature: Search videos] Search using voice input` (not supported when logged out; removed)

---

## 📋 Re-test Checklist

| Scenario | Type | Reason |
|----------|------|--------|
| Display a list of related videos after searching | Added | New |
| Click a search result to enter the watch page and start playback | Added | New |
| Submit a search with a keyword | Modified 🔴 | Then changed |
| Filter search results by upload time | Modified 🟡 | When changed |

**{N} scenarios need re-testing in total**
````

## Safety Guardrails

- ✅ Only Write the changelog file (never touch the original .feature files)
- ❌ Do not run the re-tests automatically (the user decides after reviewing the changelog)
- ❌ Do not merge or modify any .feature content

## Integration

```
Spec change / ticket update
   ↓
/stage-write-bdd writes the new scenarios
   ↓
/auto-tc-version-diff {old version} {new version}   ← this skill
   ↓
Re-test checklist → fill back into versions/{v}/plan.md
   ↓
/tool-qa-release-gate confirms re-tests are complete before the release gate
```
