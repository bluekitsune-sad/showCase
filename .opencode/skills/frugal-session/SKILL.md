---
name: frugal-session
description: Keep a run inside a small request budget by reading narrowly, never re-reading, writing files once, and stopping cleanly. Use when the model allowance is metered per request (GitHub Actions builders and reviewers, free tiers, long agent sessions).
license: MIT
compatibility: opencode
metadata:
  audience: builder-reviewer
  workflow: scheduled-batches
---

## What I do

I cut the number of model requests a session needs to reach the same result.
Requests, not minutes, are what exhaust an allowance: every tool call is one
round trip, and a session that wanders costs two or three times what a session
that plans costs.

## Rules

**Orient before you touch anything.**
1. `log/state.md`, then the one queue file you need, then the spec for the item.
2. Read a directory listing or `grep -n` before opening a file.
3. Read a file with `offset`/`limit` around the part you need. Never a whole
   tree, never "just in case".

**Never pay for the same information twice.**
4. Do not read a file you have already read this session. You have it.
5. Do not re-run a check after an edit that cannot affect it.
6. Do not re-verify a claim the previous run already verified and logged;
   check what changed, not what is stable.

**Write once, not five times.**
7. Draft the file in your head, then write it complete. A `write` costs one
   request; five `edit` calls on the same file cost five.
8. Group related edits into the commit they belong to instead of committing
   after each one.

**Keep outputs small.**
9. Summarise command output in your own words. Never echo a whole log,
   lockfile, build report or directory listing back into the conversation.
10. Use `--stat`, `--oneline`, `grep -c` and `| tail` instead of full dumps.
11. Do not paste large file contents into `log/log.md`. One line per fact.

**Finish, don't explore.**
12. Decide the scope before the first edit, and stop when it works.
13. Refactoring something you were not asked about is the most expensive thing
    you can do here — and the reviewer will send it back anyway.
14. When the clock is nearly up, land what works. Half a verified item beats
    two unfinished ones, because resuming costs the fixed cost all over again.

## When to use me

Load me at the start of a scheduled builder or reviewer session, or any time a
run is close to a daily request cap. If a task genuinely needs wide reading
(a first scaffold, a migration), say so and read wide once — just do not do it
twice.
