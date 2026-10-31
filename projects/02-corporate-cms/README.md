# Corporate Digital Presence

**Category:** 1 — I need a website
**Built for:** Established companies, agencies and organisations with content to manage
**Label:** For businesses & enterprises
**Status:** Planned
**Folder:** `projects/02-corporate-cms`
**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite · MDX content

## The problem

A company's site is rebuilt by an agency every time marketing wants to change a paragraph. Content lives in a PDF and three inboxes. They need a site their own editors can run, with case studies and news that publish without a developer.

## What it does

- Read the public site: services, leadership, case studies, insights, contact.
- Sign in as an editor, edit a case study in draft, preview it, publish it, and see the change on the live site.
- Submit the contact form and watch the lead appear in the internal inbox with an owner assigned.

## Scope

**In scope for v1**

- Public pages: home, services, about, team, case studies index/detail, insights index/detail, contact
- File-based content (MDX) for marketing pages, database content for case studies and articles
- CMS dashboard: draft/publish, revision history, media library, SEO fields per page
- Lead inbox with statuses, assignment and notes; spam-resistant contact form
- SEO: metadata per page, Open Graph, JSON-LD, sitemap, RSS
- Role-based access: editor, publisher, admin

**Out of scope for v1**

- A visual page builder
- Multi-language content
- Email marketing integration (mock transport only)
- Real analytics provider (a single documented hook only)

## Data model

`User` (role), `Page`, `Revision`, `CaseStudy`, `Article`, `Tag`, `MediaAsset`, `Lead`, `LeadNote`, `SiteSetting`.

Seed: 6 marketing pages, 4 case studies, 6 articles, 8 team members, 12 leads, 3 users (editor, publisher, admin).

## Definition of done

- Clean-clone setup documented and working
- Lint, typecheck and build pass
- Editors cannot publish; publishers can; unauthenticated users can only read
- Draft content never leaks into the public site or sitemap
- README documents the content model, roles and limits

## Notes for the build

Design direction: confident corporate — restrained palette, strong typographic hierarchy, large case-study imagery, no stock-photo clichés.

Tricky parts: revision history that is readable (not a diff dump), previewing drafts without publishing, and keeping sitemap/SEO metadata honest when content is a draft.
