# Session state

The checkpoint. Whoever ran last wrote it, and whoever runs next reads it **before doing anything else**. It is the reason a cut-off run can continue instead of starting over.

Rewrite this file. Never append to it. Only clear a state you wrote yourself — a reviewer that finds `status: idle` leaves it alone.

```
status: reviewing
role: reviewer
run: 46087559950
item: P01-1-r1
branch: opencode/review-46087559950-p01-1-r1
phase: verdict
updated: 28 Nov 2026, 00:30 UTC
next: land the P01-1-r1 approval on work, then set idle
notes: P01-1-r1 approved; npm ci, db:setup, lint, typecheck, build pass; proxy smoke gives 404 for unknown collection slugs and 200 for valid ones
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
