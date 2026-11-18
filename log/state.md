# Session state

The checkpoint. Whoever ran last wrote this, and whoever runs next reads it **before doing anything else**. It is the reason a cut-off run can continue instead of starting over.

Rewrite this file. Never append to it. Only clear a state you wrote yourself — a reviewer that finds `status: idle` leaves it alone.

```
status: building
role: builder
run: 44419448086
item: P01-4a
branch: opencode/todo-44419448086-maison-cart
phase: committed
updated: 18 Nov 2026, 23:25 UTC
next: tick P01-4a, append the REVIEW entry and commit the handoff
notes: cart library, server actions, bag page, header count and README updated; lint, typecheck, build and a production smoke test pass
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
