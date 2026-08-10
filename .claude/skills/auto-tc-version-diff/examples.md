# tc-version-diff Examples

## Example 1: Feature → Version version diff (SEARCH-123 search filter feature)

**Input**:
```
/auto-tc-version-diff features/SEARCH-123/ versions/v1.3/testcases/
```

**Changelog output (`versions/v1.3/tc-changelog-feature-version.md`)**:

```markdown
# TC Changelog · SEARCH-123 Feature → Version

**Generated date**: 2026-06-22
**Comparison**: Feature (8 scenarios) → Version (11 scenarios)
**Net change**: +3 added / 0 removed / 2 modified

---

## 🆕 Added (must re-test)

- `[Feature: Search filters] Results are sorted by time after filtering by upload time` @search-results @filter-panel
- `[Feature: Search filters] Show a no-results message when no results match the filter` @search-results @filter-panel
- `[Feature: Search videos] Display a list of related videos after submitting a search` @search-results @keyword-search

## ✏️ Modified

### 🔴 High impact (must re-test)
- `[Feature: Search filters] Apply a filter`
  - Change: `Then` adds "the screen shows the applied filter tag"

### 🟡 Medium impact
- `[Feature: Search filters] Clear an applied filter`
  - Change: `When` changed to "click 'Clear all' in the filter panel"

## 🗑️ Removed (0)

None removed.

---

## 📋 Re-test Checklist

| Scenario | Type | Reason |
|----------|------|--------|
| Results are sorted by time after filtering by upload time | Added | New |
| Show a no-results message when no results match the filter | Added | New |
| Display a list of related videos after submitting a search | Added | New |
| Apply a filter | Modified 🔴 | Then changed |
| Clear an applied filter | Modified 🟡 | When changed |

**5 scenarios need re-testing in total**
```

---

## Example 2: Version → Version wrap-up (regression) version diff (v1.3 version comparison)

**Input**:
```
/auto-tc-version-diff versions/v1.3/testcases/ versions/v1.3/testcases/regression/
```

**Changelog output (`versions/v1.3/tc-changelog-version-regression.md`)**:

```markdown
# TC Changelog · v1.3 Version → wrap-up (regression)

**Generated date**: 2026-06-22
**Comparison**: Version (34 scenarios) → wrap-up regression (35 scenarios)
**Net change**: +1 added / 1 removed / 1 modified

---

## 🆕 Added (must re-test)

- `[Feature: Video playback] Display the correct title and channel name after the video loads` @watch @keyword-search

## ✏️ Modified

### 🟢 Low impact (no re-test)
- `[Feature: Search videos] Display a list of related videos after submitting a search`
  - Change: scenario title changed from "Search shows results" to "Display a list of related videos after submitting a search" (semantics unchanged)

## 🗑️ Removed

- `[Feature: Search videos] Search using voice input`
  - Reason: not supported when logged out; deferred to v1.4, out of scope for this version

---

## 📋 Re-test Checklist

| Scenario | Type | Reason |
|----------|------|--------|
| Display the correct title and channel name after the video loads | Added | New |

**1 scenario needs re-testing in total**
```
