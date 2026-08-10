#!/usr/bin/env bash
# create-pull-request.sh
# Push current branch and create or update the PR.
# Usage: ./scripts/create-pull-request.sh [base_branch] [--draft]
#
# If a PR already exists for this branch, updates the title + body.
# PR title/body must be passed via environment variables:
#   PR_TITLE   - PR title (required)
#   PR_BODY    - PR body markdown (required)

set -euo pipefail

BASE="${1:-staging}"
DRAFT_FLAG=""
if [[ "${2:-}" == "--draft" ]]; then
  DRAFT_FLAG="--draft"
fi

BRANCH=$(git branch --show-current)

if [[ -z "$BRANCH" ]]; then
  echo "ERROR: Not on a branch (detached HEAD?)" >&2
  exit 1
fi

if [[ -z "${PR_TITLE:-}" ]] || [[ -z "${PR_BODY:-}" ]]; then
  echo "ERROR: Set PR_TITLE and PR_BODY environment variables before running." >&2
  echo "  export PR_TITLE='feat(scope): subject'"
  echo "  export PR_BODY=\$(cat pr_body.md)"
  exit 1
fi

echo "→ Pushing branch '$BRANCH' to origin..."
git push -u origin "$BRANCH"

# Check if PR already exists for this branch
EXISTING=$(gh pr view "$BRANCH" --json number,url 2>/dev/null || true)

if [[ -n "$EXISTING" ]]; then
  PR_NUM=$(echo "$EXISTING" | jq -r '.number')
  PR_URL=$(echo "$EXISTING" | jq -r '.url')
  echo "→ PR #$PR_NUM already exists. Updating title and body..."
  gh pr edit "$PR_NUM" --title "$PR_TITLE" --body "$PR_BODY"
  echo ""
  echo "✅ Updated: $PR_URL"
else
  echo "→ Creating new PR against '$BASE'..."
  PR_URL=$(gh pr create \
    --base "$BASE" \
    --title "$PR_TITLE" \
    --body "$PR_BODY" \
    $DRAFT_FLAG)
  echo ""
  echo "✅ Created: $PR_URL"
fi
