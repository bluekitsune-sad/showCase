# Session state

The checkpoint. Whoever ran last wrote this, and whoever runs next reads it **before doing anything else**. It is the reason a cut-off run can continue instead of starting over.

Rewrite this file. Never append to it. Only clear a state you wrote yourself — a reviewer that finds `status: idle` leaves it alone.

```
status: building
role: builder
run: 45524500006
item: P01-6c
branch: opencode/todo-45524500006-maison-store
phase: handoff-committed
updated: 25 Nov 2026, 01:18 UTC
next: land opencode/todo-45524500006-maison-store on work
notes: route loading skeletons, account/checkout error boundaries and order not-found pages written; lint, typecheck and build pass
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
