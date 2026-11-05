---
name: token-budget
description: Measure and account for context and request cost before spending it — estimate a file's token size, keep the conversation from growing, write a checkpoint instead of a transcript, and report usage honestly. Use alongside frugal-session when a run is metered (CI batches, free tiers) or when a session is getting long.
license: MIT
compatibility: opencode
metadata:
  audience: builder-reviewer
  workflow: scheduled-batches
---

## The two costs

A run spends **requests** (one per model turn, billed or capped by the account)
and **tokens** (context, billed by volume and by the window).

Requests are the harder limit on free tiers, and the two are linked: every turn
re-sends the conversation so far, so the *same* tool call costs more at minute
30 than at minute 2. Long sessions are not linearly more expensive — they are
worse. That is why one small finished batch beats one long wandering one.

## Measure before you read

Bytes are a good proxy: **~4 characters per token** for English and code, so a
12 KB file is roughly 3,000 tokens, and `node_modules` is not "just a peek".

```bash
wc -c TODO.md                 # size before opening
git show <sha> --stat         # shape of a commit, not its content
git show <sha> -- path/to/f  # one file from it
grep -n "pattern" file        # the lines you need, with numbers
wc -l < log/log.md            # how long the history has grown
```

A file under ~4 KB is cheap to read whole. Over ~20 KB, read it in slices with
`offset`/`limit`, or `grep` for the part you need and read around it.

## Keep the conversation from growing

1. **Do not narrate.** One line of intent before a tool call is enough; the
   plan lives in `log/state.md`, not in the transcript.
2. **Do not paste what you just read.** Quote the line, not the file.
3. **Do not re-derive.** If the previous session logged the answer, trust the
   log and check only what changed.
4. **Do not keep a scratch pad in the conversation.** Write it to the file it
   belongs to (`log/state.md`, the project README) and move on.
5. **Do not summarise twice.** If `log/log.md` already has the entry for this
   batch, edit it; do not append a second one.

## Checkpoint instead of transcript

The cheapest context is the one you never have to load. Before a long stretch
of work, write the checkpoint so that a *fresh* session could continue:

```
status: building
item: P04-3
branch: opencode/todo-<run>-p04-3
phase: implementing
next: add the lead form and its empty state
notes: schema done, seed pending
```

A good checkpoint is worth more than a perfect memory of the session, because
the memory is discarded with the runner and the checkpoint is not.

## Report usage honestly

- Say what you actually ran, not what you assume passed.
- If a check could not run here (no browser, no network), say so — that is a
  fact about the run, and the reviewer needs it.
- If a run was cut short by the clock or by a rate limit, record that in
  `log/log.md` in one line. A silent truncation looks like laziness later.

## When to use me

Use me at the start of a metered run, when a session is more than an hour old,
or before reading anything large. `frugal-session` covers *how to work*; this
covers *what it costs and how to keep it small*.
