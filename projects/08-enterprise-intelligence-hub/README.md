# Enterprise Intelligence Hub

**Category:** 4 — I have an AI idea
**Built for:** Operations, finance and compliance teams processing documents at volume
**Label:** For businesses & enterprises
**Status:** Planned
**Folder:** `projects/08-enterprise-intelligence-hub`
**Stack:** Python 3.11 · FastAPI · Next.js · TypeScript · background jobs · RAG

## The problem

A finance team re-types numbers from invoices into a spreadsheet every month. Compliance reads contracts one by one. Nobody trusts an automated number they cannot verify, so automation stalls at the pilot stage.

## What it does

- Upload a batch of invoices and contracts, and watch classification and extraction run with visible progress.
- Open a document, see every extracted field with its confidence and the exact source text, and correct what is wrong.
- Approve the batch; the monthly report generates itself, with an audit trail of who changed what.

## Scope

**In scope for v1**

- Batch ingestion, document type classification, metadata extraction
- Field extraction with confidence and source highlighting
- Human verification queue that records corrections
- Rule-based approval routing and a reviewer inbox
- Automated report generation (scheduled and on demand) with PDF export
- Knowledge-base search across processed documents
- Audit log, usage monitoring, API keys for integrations

**Out of scope for v1**

- Real ERP/accounting connectors
- OCR for scanned paper
- Model training or fine-tuning
- Multi-tenant billing

## Data model

`Tenant`, `Document`, `DocumentType`, `Extraction`, `ExtractedField`, `Verification`, `Workflow`, `WorkflowStep`, `Review`, `Report`, `ReportRun`, `AuditEntry`, `ApiKey`, `UsageRecord`.

Seed: three tenants' worth of tenants collapsed to one demo tenant, 40 documents across 4 types, 12 pending reviews, 3 completed reports.

## Definition of done

- `make api` and `make web` start from a clean clone
- `ruff check .` and `pytest` pass
- A background job is visible from queued to finished without a page refresh loop
- Every AI field shows its source span and confidence
- Corrections are attributable and visible in the audit log
- README explains the pipeline, job model and limits

## Notes for the build

Design direction: instrument panel — a queue on the left, document and fields in the centre, audit and confidence on the right. Numbers tabular, no decoration.

Tricky parts: jobs must be resumable and idempotent, extraction confidence must come from a real signal (not a random number), and the mock provider must still produce structured, verifiable output.
