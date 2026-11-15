@AGENTS.md

# Merging

Standing instruction from the repo owner (Shardul, 15 Nov 2026): merge every
pull request Claude opens automatically, without asking, once:

- the PR's checks (the Vercel build) are green on its latest commit,
- it has no merge conflict, and
- no reviewer has asked for changes or left an unresolved thread.

Mark a draft PR ready for review before merging. Use a regular merge commit.
If a check is red or something is unresolved, fix it or report it instead of
merging.
