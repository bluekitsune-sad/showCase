# FieldForce

**Category:** 3 — I need a mobile app
**Built for:** Logistics, maintenance and field-service companies
**Label:** For businesses & enterprises
**Status:** Planned
**Folder:** `projects/06-fieldforce`
**Stack:** React Native · Expo · TypeScript · offline-first queue

## The problem

Field staff work in basements, warehouses and rural sites with no signal. Paper job sheets come back illegible, attendance is a phone call, and photos arrive days later in a group chat. Dispatchers have no idea what is actually happening today.

## What it does

- A technician opens the app, sees today's jobs, checks in on site, works the checklist, attaches photos, and completes the job — with or without signal.
- A manager assigns work, sees who checked in where, and reviews completion rates.
- Anything done offline syncs when the connection returns, with conflicts surfaced rather than silently lost.

## Scope

**In scope for v1**

- Demo sign-in, employee profile, job list and job detail with checklist
- GPS check-in/out with geofence radius and graceful permission denial
- Photo and document capture with compression and upload queue
- Offline persistence, queued mutations, sync with visible state
- Manager view: assignments, completion rate, check-in map
- Runs in the browser through Expo web as well as on a device

**Out of scope for v1**

- Real-time push dispatch
- Route optimisation
- Payroll and timesheet export
- Background location tracking beyond check-in/out

## Data model

`Employee`, `Job`, `JobChecklistItem`, `CheckIn`, `Attachment`, `SyncMutation`, `Assignment`, `Client`.

Seed: 8 employees, 30 jobs across statuses, 40 checklist items, 20 check-ins, 20 attachments.

## Definition of done

- `npm install` then `npm run web` shows the app in a browser
- Typecheck passes and `npx expo export --platform web` succeeds
- Airplane mode test documented: create a job update offline, reconnect, confirm sync
- Permission-denied path works and is explained in the UI
- README explains the offline model, conflict rules and limits

## Notes for the build

Design direction: glove-friendly — large controls, high contrast, one clear primary action per screen, offline state always visible.

Tricky parts: the mutation queue must be idempotent (client-generated IDs), sync must be resumable, and the geofence check must not block a check-in when GPS is unavailable — it flags instead.
