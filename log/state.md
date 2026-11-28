# Session state

The checkpoint. Whoever ran last wrote it, and whoever runs next reads it **before doing anything else**. It is the reason a cut-off run can continue instead of starting over.

Rewrite this file. Never append to it. Only clear a state you wrote yourself — a reviewer that finds `status: idle` leaves it alone.

```
status: idle
role: -
run: 46087559950
item: -
branch: -
phase: -
updated: 28 Nov 2026, 00:26 UTC
next: P01-3-r1 (return a real 404 for an unknown product slug)
notes: P01-1-r1 landed on work at 97c362c; one entry awaits the reviewer in REVIEW.md; products and checkout 404s remain tracked as P01-3-r1 and P01-4b-r1
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
