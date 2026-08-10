# Functional Test Design Techniques (Coverage Techniques)

> This file is the **single source of truth shared by test-matrix and bdd-review** (DRY):
> - `test-matrix`: when building the matrix, **apply each item in turn**, upgrading "add/remove per ticket" into "enumerate per technique".
> - `bdd-review`: when auditing, **check each item in turn** to see whether the matrix missed a technique it should have used (opens the GIGO loop).
>
> Adapted from naodeng/awesome-qa-skills' test-case-writing / functional-testing / requirements-analysis,
> taking only the **functional/business**-related items; non-functional dimensions are in the "cross-cutting pointers" section at the end and do not go into BDD.

---

## Profile

You are the QA designer producing the test matrix. The goal is not "test whatever you think of," but to **systematically enumerate condition combinations per the techniques below**, so the matrix is complete at the source and does not rely on the author's memory.

## Skills (techniques the matrix must apply item by item)

Each technique includes "when applicable / when it can be judged N/A"; during the self-check, judge each item in turn — no blank checkboxes.

### 1. Equivalence Partitioning
- **What to do**: split each input domain into valid / invalid classes, take one representative value from each as a row, rather than exhaustively enumerating same-class values.
- **Applicable**: there are input fields, options, amounts, quantities, identity types, or other classifiable inputs.
- **N/A**: purely display-type screens with no input.
- Example: search keyword (normal text / empty string / very long string / special characters / no-result string).

### 2. Boundary Value Analysis
- **What to do**: for each ordered input/threshold, test the **boundary, boundary−1, boundary+1**.
- **Applicable**: any rule with a numeric/date/time threshold, a count limit, or a duration range (result count, video duration filter, upload time range).
- **N/A**: unordered categorical input (use equivalence partitioning instead).
- Example: search filter "upload time" threshold (today / this week / this month boundaries); search-result per-page count limit (limit, limit−1, limit+1).

### 3. Decision Table
- **What to do**: list **combinations of multiple conditions** in a table with the corresponding output behavior; use it to replace the current "role × condition → behavior" that has only a two-dimensional skeleton.
- **Applicable**: interactions of multiple conditions (search filters: how combinations of upload time × type × duration × sort affect the search results).
- **N/A**: a single condition, no combined interaction.
- Example: `filter type ∈ {video, channel, playlist} × sort ∈ {relevance, upload date, view count}` → one row per combination.

### 4. Positive / Negative / Exception Paths (Happy / Negative / Error Path)
- **What to do**: for each business action, **at least one each**: success, blocked by a business rule (negative), system/network error (exception).
- **Applicable**: all submittable/triggerable business actions. **This is the biggest current gap — the matrix often has only the happy path.**
- **N/A**: purely read-only display (still needs a negative case: no results / empty state).
- Example: submit search → results / no results shows empty state / on network error shows an error and does not crash.

### 5. Error Guessing
- **What to do**: use experience to add common error-prone scenarios (duplicate submit, quick back navigation, timeout, special characters, very long strings, copy-paste, timezone/cross-day).
- **Applicable**: all forms, submissions, and time-related flows.
- **N/A**: extremely simple static screens.

### 6. State Transition
- **What to do**: when there is a clear state transition, **delegate to `/stage-state-machine`**; here the matrix only flags "this ticket has state transitions → see state_machine.md".
- **Applicable**: display/flow changes with state (video playback: loading → playing → paused → ended; search → apply filter → clear).
- **N/A**: a single operation with no state transition.

### 7. Role × Permission Matrix (Role / Permission)
- **What to do**: for the same feature, list the expectation for each different role in turn.
- **Applicable**: features whose visibility/operability differs across multiple roles.
- **N/A**: YouTube is a single "user" role in guest/logged-out state with no permission branches — judged N/A in most cases.

### 8. Environment Variance (Environment)
- **What to do**: when behavior differs across prod / stg / pr, list them separately (an existing dimension, included in the list).
- **Applicable**: feature flags, environment settings, or data differences that cause different behavior.
- **N/A**: behavior is consistent across all three environments.

### 9. Data Lifecycle / CRUD
- **What to do**: for a data object, add coverage for create / read / update / delete + **empty state / first record / large volume**.
- **Applicable**: any feature with a list or data display (search-result list, channel video list — empty state / first record / large-volume scroll loading).
- **N/A**: pure action trigger with no data list.

### 10. Pairwise / Orthogonal (multi-factor combination convergence)
- **What to do**: when multiple factors (e.g. 3 conditions each with multiple values) cause a combination explosion, use pairwise to converge to representative combinations rather than the full Cartesian product.
- **Applicable**: ≥3 independent conditions where all combinations are too many.
- **N/A**: few conditions (just list them all with a decision table).
- ⚠️ **gherkin.md forbids Scenario Outline / Examples**: present combinations as **matrix rows**; each row later becomes a discrete scenario, do not expand parametrically in the feature.

## Constraints (hard constraints)

- **Only functional/business scenarios go into BDD.** Every row enumerated by the techniques should be user-perspective and declaratively Gherkin-able.
- **Self-check each technique item by item**: applicable → produce the corresponding matrix row; N/A → **note the reason** (must not be left blank, must not be skipped).
- **Non-functional items are not expanded into scenarios**, only flagged as a pointer per "cross-cutting pointers".
- Do not conflict with `gherkin.md`: no Scenario Outline, i18n not included in coverage for now, CMS backend is optional (not counted as a gap).

## Cross-cutting Pointers (non-BDD — flag only, pointing to the dedicated skill)

When one of the following dimensions is detected, flag one pointer line in a separate small section of the matrix; **do not write a scenario, do not count it in the coverage score**:

| Detected | Pointed-to dedicated skill |
|---|---|
| Performance / high traffic / response time | `/performance-test-gen` (a dedicated skill for DB / load will be created later) |
| Security / permission bypass / injection | `/security-scan` |
| Accessibility | `/a11y-audit` |
| Responsive / layout break / overflow | `/auto-responsive-layout-check` |
| JS exceptions / console errors | `/auto-console-error-collector` |

## Coverage self-check table (artifact: paste into test_matrix.md; bdd-review checks it back)

```markdown
### Coverage-technique self-check
| Technique | Applicable? | Corresponding matrix row / reason for N/A |
|---|---|---|
| Equivalence Partitioning | ✅/N/A | |
| Boundary Value Analysis | ✅/N/A | |
| Decision Table | ✅/N/A | |
| Positive/Negative/Exception Paths | ✅/N/A | |
| Error Guessing | ✅/N/A | |
| State Transition | ✅/N/A | (→ state_machine.md) |
| Roles/Permissions | ✅/N/A | |
| Environment Variance | ✅/N/A | |
| Data Lifecycle/CRUD | ✅/N/A | |
| Pairwise/Orthogonal | ✅/N/A | |

### Cross-cutting pointers (non-BDD)
- {dimension} → {dedicated skill}
```
