#!/usr/bin/env bash
# Usage: commit-and-push.sh "<message>" <path>...  (missing paths are ignored)
set -euo pipefail

message="$1"
shift
paths=()
for p in "$@"; do
  if [ -e "$p" ]; then paths+=("$p"); fi
done
if [ ${#paths[@]} -eq 0 ]; then
  echo "Nothing to add"
  exit 0
fi

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add -- "${paths[@]}"
if git diff --cached --quiet; then
  echo "No changes to commit"
  exit 0
fi
git commit -m "$message"

for attempt in 1 2 3; do
  if git pull --rebase --quiet && git push; then
    exit 0
  fi
  echo "push failed (attempt ${attempt}/3), retrying in $((attempt * 15))s"
  sleep $((attempt * 15))
done
echo "push failed after 3 attempts"
exit 1
