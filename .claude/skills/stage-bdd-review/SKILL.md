---
name: stage-bdd-review
description: For already-produced BDD .feature files (either the feature or version stage), dispatch an independent subagent to do quality review and scoring, comparing against test_matrix coverage, the gherkin.md spec, and ticket/code business rules, producing a score /100. If the score is <85 it auto-fixes and re-reviews, up to 4 rounds, until it passes or reports the current state. Triggers when the user mentions "review BDD, audit BDD, BDD score, check feature, help me look at these features, feature quality, bdd review". This skill only "reviews/scores" existing .feature files; to "newly author" a scenario use stage-write-bdd.
argument-hint: "<TICKET-xxx | version | cases path>"
allowed-tools: Read, Glob, Grep, Bash, Agent, Write, Edit, mcp__atlassian__jira_get_issue
model: sonnet
---

# bdd-review

Do quality review + scoring of the `.feature` files produced by `/stage-write-bdd` with an **independent subagent**, and **if the score is below 85, auto-fix and re-review, up to 4 rounds**.
BDD is often written within the same session, so self-review is biased -> always dispatch an independent subagent to review, not inheriting the main session's prior judgments; but **fixes** are performed by the main session (the independent subagent only scores, it does not edit files).

**Minimum bar is 85 points**; after passing you may still keep improving as warranted (a Verdict of Approve does not mean it cannot be better), but **only fix what is truly worth fixing** — see Phase 5's "verify first, then weigh cost/benefit".

> Forbidden: modifying the main library `testcases/` / `commit` / `push`. **Allowed**: when the score is <85, directly fix the `.feature` files under `features/`・`versions/` (within this skill's auto-fix loop), without stopping to ask throughout, and finally list what was changed each round in the report.

---

## Phase 1: Locate artifacts (stage-agnostic)

Based on the argument, determine the stage and root directory, and find the `.feature` files + same-level ground truth:

| argument | Root directory | Stage |
|---|---|---|
| `TICKET-xxx` (and `features/TICKET-xxx/` exists) | `features/TICKET-xxx/` | Feature |
| version / `versions/...` path | `versions/{version}/` (root) | Version |
| direct cases path given | that path | determined by path |
| no argument | ask the user, or glob the most recently modified `features/*/cases` | — |

```bash
# list the feature files to review + ground truth
find {root}/cases -name '*.feature' | sort
ls {root}/test_matrix.md {root}/state_machine.md 2>/dev/null
```

`test_matrix.md` does not exist -> stop, prompt "without test_matrix, coverage cannot be scored; please first run the corresponding `/stage-test-matrix`".

## Phase 2: Collect ground truth (as the basis for the reviewer; do not pass judgment yourself first)

Collect in parallel and pass to the subagent verbatim:

1. **All `.feature` contents** (Read each file)
2. **`test_matrix.md`** (dimension table, the Modified/New in the Feature file mapping table, remaining `?`)
3. **`state_machine.md`** (if present)
4. **`.claude/rules/gherkin.md`** (tag rules, prohibitions, principles)
5. **Jira ticket**: `jira_get_issue` (summary/description/AC/comments)
6. **Main library comparison** (Modified files): `testcases/{relative path}.feature` — **paste the full text, do not summarize**. Testing found: summarizing the main library content makes the reviewer miss that "this scenario is actually already covered by some existing Scenario and does not need to go into the diff", causing it to misjudge as a gap or fabricate one (a Critical false positive). The cost of pasting the full text is far lower than a round of back-and-forth caused by a false positive.
7. Business rules `file:line`: take directly from the verified references in `test_matrix.md` (do not re-search the repo; anything not in the matrix is listed as to-be-checked)
8. **`.claude/skills/stage-test-matrix/references/coverage-techniques.md`** (technique list): give the reviewer a yardstick for "auditing the completeness of the matrix itself" — not only checking whether the scenarios fully cover the matrix, but also checking back whether the matrix missed a technique it should have applied

## Phase 3: Dispatch an independent reviewer subagent

```
Agent(
  description: "Independent BDD feature review",
  subagent_type: "general-purpose",
  prompt: "<see the reviewer prompt template below>"
)
```

### Reviewer Prompt template

```
You are a Senior QA Engineer specializing in reviewing the quality of Gherkin BDD .feature files. Center on the "requirement -> matrix -> scenario" traceability, not on the code files as your frame.

## Review target (ticket {ticket}, stage {Feature/Version})
{paste the full content of each .feature file, marking Modified / New}

## Ground Truth
- test_matrix dimensions and coverage table: {paste}
- state_machine (if present): {paste}
- gherkin.md rules: {paste tag rules + prohibitions + principles}
- Jira ticket: {summary / description / AC / key comments}
- Main library comparison (original content of Modified files): {paste}
- Verified business rules (file:line): {paste the references from the matrix}
- Functional test design technique list (coverage-techniques.md): {paste}

## Scoring dimensions (100 total)
1. Source traceability (20): can every Scenario be traced to the ticket or a test_matrix dimension? Any fabrication (explicitly forbidden by gherkin.md)?
2. Matrix coverage + technique completeness (25): **check both layers**. (a) scenario ⊇ matrix: map each dimension/row of test_matrix ↔ Scenario, list uncovered (gaps) and surplus. (b) matrix ⊇ techniques: against the ten techniques in coverage-techniques.md, check back whether **the matrix itself missed a technique it should have used** (e.g. only a happy path, missing negative/exception; a numeric threshold exists but no boundary value; multiple conditions but no decision table exhaustion) — this is the key to opening the "closed loop over the matrix" GIGO, and a matrix missing a technique should be scored as a coverage gap. If the matrix's "coverage technique self-check table" marks N/A, verify the reason holds.
3. Gherkin spec (20): score per the passed-in gherkin.md rules. Key checks: the four Scenario-level tag categories (module tag required, page tag required, @smoke/@regression/@auto test level required, scenario tag optional); forbid @P0 / version tag / English tag / Scenario name as a tag / Scenario Outline; Feature-level preamble required; backend-bypass Scenarios (hitting the API directly to bypass the frontend) are a violation and should be marked Critical; CMS features do not need a page code path and may be omitted (not counted as a gap); Chinese G/W/T; each Scenario runs independently.
4. Business rule correctness (20): do the Then assertions match the file:line rules (e.g. isAllowed should block "other/null")? Is the copy consistent with the code (if inconsistent, follow the code and flag it)?
5. Clarity / executability (10): title includes behavior + expectation, steps stay close to the user's viewpoint (do not write the API layer, do not write developer operations), specific data in double quotes, Then is verifiable.
6. Modified appropriateness (5): contains only the Scenarios added or changed by this ticket, no unrelated existing Scenarios mixed in? No duplication against the main library comparison (the changed version replaces the main library, not an extra copy)? Is "not yet implemented" that is now implemented annotated as removed at merge back?

## Output format (follow strictly)

### 📊 Total: X / 100
| Dimension | Score | One line |
|---|---|---|
| Source traceability | a/20 | |
| Matrix coverage + technique completeness | b/25 | |
| Gherkin spec | c/20 | |
| Business rule correctness | d/20 | |
| Clarity/executability | e/10 | |
| Modified appropriateness | f/5 | |

### ✅ Strengths
- concrete bullet points

### 🚨 Issues
**Critical** (would cause missed testing or wrong verification, must fix)
- [file › Scenario name] issue + suggestion
**Major** (strongly recommend fixing)
- [file › Scenario name] issue + suggestion
**Minor** (small issues)
- [file › Scenario name] issue

### 🕳️ Coverage gaps (against test_matrix)
| Dimension/row | Status | What is missing |
|---|---|---|
| e.g. Dimension 3 guest gender determination | ❌ | has a Scenario but the assertion logic contradicts the business rule |

### 🔍 Technique coverage self-check (against coverage-techniques.md, auditing the matrix itself)
| Technique | Applied in matrix | If missing, suggested matrix row/Scenario to add |
|---|---|---|
| Equivalence partitioning | ✅/❌/N/A | |
| Boundary value analysis | ✅/❌/N/A | |
| Decision table | ✅/❌/N/A | |
| Positive/negative/exception paths | ✅/❌/N/A | |
| Error guessing | ✅/❌/N/A | |
| State transition | ✅/❌/N/A | |
| Role/permission | ✅/❌/N/A | |
| Environment differences | ✅/❌/N/A | |
| Data lifecycle/CRUD | ✅/❌/N/A | |
| Pairwise/orthogonal | ✅/❌/N/A | |
> ❌ (should have been used but was not) counts against dimension 2; N/A requires verifying the reason holds. For non-functional aspects, only confirm the matrix has a "cross-cutting metrics" pointer; do not score it here.

### ➕ Suggested Scenarios to add (paste-ready, following gherkin.md)
```gherkin
(give complete Gherkin for each suggested scenario, marking which file it belongs in)
```

### 📋 Verdict
- ✅ Approve: no Critical, coverage complete
- 🔄 Request Changes: has Critical or multiple Major / obvious coverage gaps
- 💬 Comment: pure suggestions, non-blocking
```

## Phase 4: Review the first-round result (do not write files)

The subagent result is **not written to the report file yet**; only record this round's score and Issues internally (do not adjust the score, do not edit the .feature files).

> Forbidden: writing every round's raw result into `bdd_review.md` — the report file keeps only the **final version**, no process log (see Phase 6).

Total ≥ 85 -> skip Phase 5, go straight to the Phase 6 final report. Total < 85 -> go to Phase 5.

## Phase 5: Below 85 auto-fix and re-review (up to 4 rounds, done internally, not written per round)

The first round already ran in Phase 3/4; here is the loop body from round 2 onward. **Repeat the following steps each round**:

### 5.1 Verify first, do not take it at face value

For each Critical / Major reported this round, **verify whether it is real before making any change**:

- Go back and compare against `test_matrix.md`, `state_machine.md`, the verified `file:line` — is this "gap" actually already covered by an existing main-library Scenario (does not need to go into the diff)? Is this "fabricated" scenario actually recorded in the matrix, just missing from the Phase 2 ground-truth summary?
- Common false-positive sources: Phase 2 shortened the main-library full text to a summary, or omitted a dimension's qualifying note (e.g. "reuse the empty-state component already implemented in ticket XX"). **This is exactly why the Phase 2 rule requires pasting the full text rather than a summary** — if this round is still a summary, first re-fill it to full text and verify again.
- After verification, judged a false positive -> **do not fix**, but add a brief note at the top of the next round's report explaining "why this is a false positive" (with concrete basis), so the score gap is traceable and not just your own say-so.
- After verification, judged real -> go to 5.2.

### 5.2 Weigh whether it is worth fixing

Not every Major/Minor is worth the time to fix. Basis for judgment:

| Situation | Handling |
|---|---|
| Critical / a scenario the matrix explicitly requires is genuinely missing | fix, highest priority |
| Major and low fix cost (change one assertion line, add one Scenario) | fix |
| Minor and the reviewer itself noted "not mandatory" / "acceptable" / "style suggestion" | usually skip, unless the cost is extremely low |
| Minor is a subjective style preference and does not conflict with existing main-library conventions | skip, do not chase a perfect score |
| tag length exceeds 4-8 chars / mixes English / `@boundary` "hard to automate" definition misused | fix (mechanical rule violation, low cost, must fix) |

Skipped items must be listed in the report with a line on "why it was judged not worth fixing", do not silently omit them.

### 5.3 Execute the fixes

Use `Edit` to directly modify the corresponding `.feature` (only items this skill judged real and worth fixing). After fixing, **mechanically verify the tag rules with a script**, do not count by eye (easy to miscount, itself a common error source):

```bash
python3 - <<'EOF'
import re, glob
bad = 0
for path in glob.glob("{root}/cases/**/*.feature", recursive=True):
    with open(path, encoding="utf-8") as f:
        lines = f.readlines()
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        # basis for identifying a tag line: starts with @, next line is a Scenario:
        if not stripped.startswith("@"):
            continue
        if i >= len(lines) or not lines[i].strip().startswith("Scenario:"):
            continue
        for t in stripped.split():
            name = t.lstrip("@")
            if name in ("smoke", "regression", "auto", "boundary"):
                continue
            has_english = bool(re.search(r'[a-zA-Z]', name))
            length = len(name)
            if has_english or length > 8:
                print(f"{path}:{i}: @{name} violation (english={has_english} length={length})")
                bad += 1
print(f"{bad} violations total")
EOF
```

### 5.4 Re-collect ground truth (be sure to use full text, not a summary)

Re-run Phase 2, **always paste the full content for the main-library comparison** (learning from last round's lesson: summaries are the root of false positives). Use the latest fixed version for the `.feature` content.

### 5.5 Dispatch a brand-new independent subagent to re-review (done internally, not written to file)

Same as Phase 3, **do not tell the reviewer which round this is**, do not hint at an expected score, do not draw the conclusion for it. Re-run independently and cleanly. This round's result is recorded internally only, **not written to the report file**.

Score ≥ 85 or already reached 4 rounds -> stop the loop, go to the Phase 6 final report. Otherwise go back to 5.1.

## Phase 6: Write the final report (the only file write, final version only, no process log)

`Write` -> `{root}/stage-write-bdd_review.md` (Feature: `features/{ticket}/stage-write-bdd_review.md`; Version: `versions/{version}/stage-write-bdd_review.md`).

**This is the only time the whole skill writes the report file** — no matter how many rounds ran, the file content presents only the final state of the last round, does not write "which round", does not write process logs like "evolution: 77→79→94". The verification/false-positive elimination/fix decisions along the way need not be written into the report file (if the user wants to see them they can ask in the conversation); the report file itself only answers "how good is this `.feature` right now".

Report file format (consistent with the Phase 3 reviewer output format, applying the last round's scoring and Issues):

```markdown
# {ticket/version} — BDD Review ({Feature/Version})
> Review time: {date} ｜ Files reviewed: N ｜ Total: X/100 ｜ Verdict: {Approve/Request Changes/Comment}
> Compared against: test_matrix.md / state_machine.md / gherkin.md

### 📊 Total: X / 100
{dimension table, same as reviewer output format}

### ✅ Strengths
{last round's Strengths}

### 🚨 Issues
{items from the last round's report that, after verification, were judged real but not worth fixing on cost/benefit grounds; fixed items are not listed (because they no longer exist in the file)}
{if the 4-round cap was reached with Critical still unresolved -> must list them and clearly mark "unresolved", do not downplay}

### 🕳️ Coverage gaps (against test_matrix)
{gaps still present in the last round; already-filled ones are not listed}

### 🔍 Technique coverage self-check (against coverage-techniques.md)
{techniques the matrix still misses in the last round; if all applied or filled in, write "all ten techniques applied or reasonably N/A"}

### 📋 Verdict
- {Approve/Request Changes/Comment}
```

> Forbidden: after `Total`, do not add "→ estimated XX+ after update", only write the actual reviewed score; forbidden to keep round numbers or score-evolution records in the report file.

## Final report (the terminal message in the conversation, not the content written to the file)

```
Produced {root}/stage-write-bdd_review.md
Total: X/100 ｜ Verdict: {Approve/Request Changes/Comment}
{if multiple rounds ran, you may briefly report in the conversation: ran R rounds total, Critical N | Major M (x fixed, y false positives eliminated, z judged not worth fixing) — this process info is stated in the conversation only, not written into the report file}
{if still <85 after 4 rounds: honestly explain where it is stuck, what problems remain, why it was judged not worth spending more rounds, and hand back to the user to decide}
Next: {passed 85 -> can sync directly or proceed to the next step; below 85 -> list the follow-up options the user can choose}
```

---

## Rules

- Always dispatch an **independent subagent** to review, to avoid self-review bias; pass complete ground truth (**the main-library comparison must be full text, not a summary**), do not draw the conclusion for the reviewer, do not reveal the round number
- **The report file is written only once at the end** (Phase 6); each round's review result along the way is handled internally/in the conversation only, not written per round into `bdd_review.md`; only a score <85 enters the Phase 5 fix loop, and fixes are limited to the `.feature` files under `features/`・`versions/`, **do not touch the main library `testcases/`**, no commit / push
- Always verify before fixing (Phase 5.1): it may be a false positive caused by incomplete ground truth, not something to take at face value
- Whether to fix depends on cost/benefit (Phase 5.2): mechanical rule violations (tag length/English/@boundary misuse) must be fixed; subjective style Minors that the reviewer itself says are not mandatory may be skipped, but state the reason
- Loop cap is 4 rounds; always verify tags with a script, do not count by eye
- Coverage is measured by the `test_matrix.md` dimensions; no test_matrix -> stop. **But at the same time audit the completeness of the matrix itself against `stage-test-matrix/references/coverage-techniques.md`** (a matrix missing a technique it should use = a coverage gap, counted in dimension 2) — do not let the "closed loop over the matrix" let a missed test slip through at the source
- Copy/behavior conflicts follow the **code** (flag them), not the ticket or Figma
- The stage is determined by the path (`features/` = Feature; `versions/{version}/` (root, plan.md is here) = Version), and both stages share the same scoring dimensions
