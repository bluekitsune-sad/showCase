# StorySpace

**Category:** 6 — I need something else
**Built for:** Readers, independent authors and digital publishers
**Label:** For individuals & customers
**Status:** Planned
**Folder:** `projects/11-storyspace`
**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite

## The problem

Independent authors sell PDFs that read badly on a phone. Readers lose their place, cannot bookmark, and have no reason to come back. Both sides need a proper reading experience, not a download link.

## What it does

- Browse a bookstore, open a sample chapter, and buy a book with a mock checkout.
- Read in a clean reader with adjustable type, save progress, bookmark lines and highlight passages.
- As an author, publish a book chapter by chapter and see how it sells.

## Scope

**In scope for v1**

- Bookstore: categories, search, curated shelves, book detail with sample chapter
- Reader: paginated and scroll modes, typography controls, progress persistence, bookmarks, highlights
- Personal library: purchased and saved books, continue-reading shelf, reading stats
- Reviews and ratings with moderation
- Author dashboard: books, chapters, cover art, pricing, draft/publish, sales
- Mock checkout, no real payment

**Out of scope for v1**

- EPUB/PDF import and export
- DRM or piracy protection
- Audiobooks
- Author payouts

## Data model

`Author`, `Book`, `Chapter`, `Category`, `BookCategory`, `Purchase`, `LibraryItem`, `ReadingProgress`, `Bookmark`, `Highlight`, `Review`, `Sale`.

Seed: 8 authors, 24 books with 6–12 chapters each, 3 readers with library items and progress, 40 reviews.

## Definition of done

- Clean-clone setup documented and working
- Lint, typecheck and build pass
- Reading progress survives sign-out and sign-in on a second device (same account)
- Reader is usable at 360 px with large type
- A reader cannot access an unpurchased book's full text through the API
- README explains the reader implementation and limits

## Notes for the build

Design direction: paper, not app — warm off-white, a real serif for body text, minimal chrome that recedes while reading.

Tricky parts: progress keyed to a stable location (chapter + character offset, not page number), typography controls that do not reflow into a broken layout, and entitlement checks on every chapter request.
