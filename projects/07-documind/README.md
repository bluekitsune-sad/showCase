# DocuMind

**Category:** 4 — I have an AI idea
**Built for:** Students, researchers, freelancers and anyone drowning in PDFs
**Label:** For individuals & customers
**Status:** Planned
**Folder:** `projects/07-documind`
**Stack:** Python 3.11 · FastAPI · Next.js · TypeScript · local embeddings (RAG)

## The problem

A 90-page report takes an afternoon to read and a week to forget. Chatbots answer from general knowledge, not from the document in front of you, and they do not show where an answer came from. People need answers they can check.

## What it does

- Drop in a PDF or text file and get a structured summary with the document's own structure preserved.
- Ask a question and get an answer with inline citations that jump to the exact passage.
- Turn the document into notes and flashcards, then export them.

## Scope

**In scope for v1**

- Upload with type/size validation and text extraction
- Chunking with overlap, local embeddings, SQLite-backed index
- Cited Q&A over one document or a selection of documents
- Summary, key-information extraction, notes and flashcards
- Conversation history per document
- Deterministic mock LLM by default; real provider behind an env flag

**Out of scope for v1**

- OCR for scanned images
- Multi-user accounts and sharing
- Fine-tuning or model hosting
- Audio transcription

## Data model

`Document` (filename, pages, status), `Chunk` (text, page, embedding), `Conversation`, `Message` (role, content, citations), `Note`, `Flashcard`, `Job`.

Seed: three sample documents (a research paper, a contract, a product manual) already indexed so the demo works on first load.

## Definition of done

- `make api` and `make web` both start from a clean clone
- `ruff check .` and `pytest` pass
- Answers cite page and passage; a citation opens the right text
- No API key needed for the demo; mock mode is the default
- README explains the retrieval pipeline, evaluation fixtures and limits

## Notes for the build

Design direction: reading-first — a document panel beside a conversation panel, generous line height, citations as quiet superscripts that expand into a source card.

Tricky parts: chunk boundaries should respect paragraphs, retrieval must be honest about "not in the document", and the mock model must vary by question so the demo does not look canned.
