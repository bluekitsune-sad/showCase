# SecureCheck

**Category:** 5 — I need cybersecurity help
**Built for:** Website owners, freelancers, startups and small businesses
**Label:** For individuals & customers
**Status:** Planned
**Folder:** `projects/09-securecheck`
**Stack:** Python 3.11 · FastAPI · Next.js · TypeScript · passive OWASP checks

## The problem

A small business owner has no idea whether their site is configured safely. Enterprise scanners cost more than the site did, report in jargon, and flag things that do not matter. They need a plain-English answer: what is risky, how risky, and what to do first.

## What it does

- Prove you control a domain, then run a passive assessment.
- Read a graded report: TLS, headers, cookies, DNS, dependency risk — each with severity and a fix.
- Download a PDF you could hand to a client.

## Scope

**In scope for v1**

- Target onboarding with ownership verification (DNS TXT or file challenge)
- Passive checks: DNS records, TLS certificate and protocols, HTTP security headers, cookie flags, public configuration
- Dependency risk from an uploaded `package.json` or `requirements.txt` against a bundled advisory snapshot
- Risk scoring with prioritised remediation
- AI-assisted explanation per finding, deterministic mock by default
- Scan history with a diff against the previous run
- PDF report export

**Out of scope for v1 (deliberately, and documented)**

- Exploitation, fuzzing, brute force, credential attacks
- Authenticated scanning of logged-in areas
- Continuous monitoring and alerting
- Scanning hosts the user has not verified

## Data model

`User`, `Target` (domain, verification state, token), `Scan`, `Check`, `Finding`, `FindingExplanation`, `DependencyReport`, `Report`.

Seed: three verified demo targets with completed scans, one unverified target to demonstrate the block, and a small dependency file with known advisories.

## Definition of done

- `make api` and `make web` start from a clean clone
- `ruff check .` and `pytest` pass
- Scanning an unverified target is refused by the API, not just the UI
- Every check is passive and documented in a methodology section
- Report is readable by a non-technical owner
- README states acceptable use clearly

## Notes for the build

Design direction: trustworthy, not alarmist — a graded score, severity colour used sparingly, plain-language summaries above technical detail.

Tricky parts: verification state must be server-side truth, checks must time out and fail soft, and the mock AI must explain the actual finding rather than emit generic text.
