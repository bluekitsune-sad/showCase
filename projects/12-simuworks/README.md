# SimuWorks

**Category:** 6 — I need something else
**Built for:** Corporate training departments and educational organisations
**Label:** For businesses & enterprises
**Status:** Planned
**Folder:** `projects/12-simuworks`
**Stack:** TypeScript · React · Vite · simulation engine · browser-only

## The problem

Compliance and business training is a slide deck with a quiz at the end. Nobody remembers it, and there is no evidence anyone can apply a decision under pressure. Training teams want practice, not another video.

## What it does

- Play a quarter-by-quarter business simulation: read the situation, spend budget, make a call, live with the consequence.
- See the result explained — which KPI moved, why, and what a better decision would have considered.
- As an admin, build a new scenario with decisions and effects, publish it to a cohort, and review results.

## Scope

**In scope for v1**

- Scenario schema, seed scenario, deterministic tick engine with seeded randomness
- Player flow: briefing, decision cards, resources, four quarters, results
- Scoring across profit, cash, morale and reputation, with an end-of-run report
- Admin scenario builder with validation and publishing
- Cohort assignment, per-player progress, leaderboard, achievements
- Training analytics dashboard

**Out of scope for v1**

- Multiplayer or live sessions
- Real 3D or Unity build (this is a web simulation by design — see the PRD)
- LTI / LMS integrations
- Custom scenario scripting language beyond the editor

## Data model

Simulation state lives in typed objects: `Scenario`, `Quarter`, `Decision`, `Effect`, `Kpi`, `Run`, `Turn`, `Cohort`, `Player`, `Achievement`. Persisted in localStorage for the demo, with an exportable run file.

Seed: one complete four-quarter scenario ("Northwind Retail"), 18 decisions, 5 achievements.

## Definition of done

- `npm install && npm run dev` works from a clean clone
- Lint, typecheck, unit tests for the engine and web build pass
- The same seed always produces the same run
- A player can finish a full scenario in under 10 minutes
- Admin can create, validate and publish a scenario
- README explains the scoring model, determinism and limits

## Notes for the build

Design direction: boardroom, not arcade — restrained charts, decision cards with consequences previewed only after choosing, one strong accent for the chosen path.

Tricky parts: the engine must be pure and deterministic (seeded RNG, no `Date.now()` inside scoring), effects must compose predictably, and the admin builder must validate against every reachable state.
