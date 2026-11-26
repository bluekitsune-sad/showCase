# Session state

The checkpoint. Whoever ran last wrote it, and whoever runs next reads it **before doing anything else**. It is the reason a cut-off run can continue instead of starting over.

Rewrite this file. Never append to it. Only clear a state you wrote yourself — a reviewer that finds `status: idle` leaves it alone.

```
status: idle
role: reviewer
run: 45842544543
item: -
branch: -
phase: -
updated: 26 Nov 2026, 15:13 UTC
next: builder takes the next unchecked TODO item (P01-1-r1)
notes: review queue empty at run 45842544543; cleared the stale reviewing checkpoint from run 45731689633 (branch gone, P01-6d/P01-6e verdicts landed in f8d9ce5)
```

**Fields**

| Field | Meaning |
| --- | --- |
| `status` | `idle` · `building` · `reviewing` |
| `role` | `builder` or `reviewer` — who owns the checkpoint |
| `run` | GitHub run id, so a log entry can be matched to a session |
| `item` | TODO id, or review entry id |
| `branch` | the `opencode/*` branch the work lives on |
| `phase` | `implementing` · `committed` · `handoff-committed` · `landing` · `checking` · `verdict` |
| `updated` | UTC timestamp from `date -u "+%-d %b %Y, %H:%M UTC"` |
| `next` | the single next action, in plain words |
| `notes` | anything half-done, skipped, or waiting |

Only what is committed and pushed survives a killed runner. Commit early, not at the end.
