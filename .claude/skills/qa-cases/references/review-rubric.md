# Case review spec (review-rubric)

See also: `qa-cases/SKILL.md` §6 (when the review runs) and `qa-ticket/SKILL.md` §Case sign-off (what happens after it passes).

BDD is usually written by the same session, so self-review is biased → **always dispatch an independent subagent to score**; the reviewer scores only and never edits files, fixes go back to the designer. Minimum 85 points, at most 4 rounds.

## 1. Ground truth for the reviewer (paste as-is, do not pre-judge)

1. Full text of every `runs/{ticket}/cases/**/*.feature`, labelled Modified / New
2. `test_matrix.md`, `state_machine.md` (if any), `risks.md`
3. `.claude/rules/gherkin.md`
4. Jira ticket summary / description / AC / key comments (from context.md)
5. **Main-library counterparts of Modified files — full text, never a summary**: a summary hides "this is already covered by an existing Scenario" and causes false Critical findings
6. Verified business rules / observed behavior (from matrix / context; do not re-probe)
7. `references/coverage-techniques.md`

Never tell the reviewer which round this is or hint at an expected score.

## 2. Reviewer prompt

```
You are a Senior QA Engineer specializing in reviewing the quality of Gherkin BDD .feature files. Center on the "requirement -> matrix -> scenario" traceability, not on the code files as your frame.

## Review target (ticket {ticket}, Modified/New per main library)
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
3. Gherkin spec (20): score per the passed-in gherkin.md rules. Key checks: the three Scenario-level tag categories (page tag required, @smoke/@regression/@auto test level required, scenario tag required); tags are lowercase kebab-case with no whitespace; forbid @P0 / version tag / Scenario name as a tag / Scenario Outline; Feature-level preamble required; backend-bypass Scenarios (hitting the API directly to bypass the frontend) are a violation and should be marked Critical; CMS features do not need a page code path and may be omitted (not counted as a gap); English G/W/T; each Scenario runs independently.
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

## 3. Fix loop when below 85

1. **Verify first, don't accept blindly**: check each Critical / Major against the matrix, state machine, full main-library text, and observed behavior. Common false positives come from summarized ground truth or a dropped qualifier. False positive → don't fix; add one line with the evidence at the top of the next round.
2. **Weigh whether it's worth fixing**:

   | Situation | Action |
   |---|---|
   | Critical / missing a scenario the matrix explicitly requires | fix, highest priority |
   | Major and cheap to fix | fix |
   | Minor the reviewer marked optional / style | usually skip |
   | Tag not kebab-case / contains spaces / `@boundary` misused | fix (mechanical rule, always) |

   List skipped items with a one-line reason.
3. **Verify tags with a script after fixing**, never by eye:

```bash
python3 - <<'EOF'
import re, glob
bad = 0
for path in glob.glob("runs/{ticket}/cases/**/*.feature", recursive=True):
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
            bad_format = not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", name)
            forbidden = bool(re.fullmatch(r"(p[0-3]|v?\d+(\.\d+)+)", name, re.I))
            if bad_format or forbidden:
                print(f"{path}:{i}: @{name} violation (format={bad_format} forbidden={forbidden})")
                bad += 1
print(f"{bad} violations total")
EOF
```

4. Re-collect ground truth (main library always full text) → dispatch a **brand-new** independent reviewer → stop at ≥ 85 or after 4 rounds.

## 4. Final report `runs/{ticket}/bdd_review.md`

Written once, final state only: no round numbers, no score history, no "expected after fixes".

```markdown
# {ticket} — BDD Review
> Reviewed: {date} | Files: N | Total: X/100 | Verdict: {Approve/Request Changes/Comment}

### 📊 Total: X / 100
{dimension table}
### ✅ Strengths
### 🚨 Issues
{verified-but-not-worth-fixing leftovers; any Critical still open after 4 rounds must be marked "unresolved"}
### 🕳️ Coverage gaps
### 🔍 Technique coverage self-check
### 📋 Verdict
```
