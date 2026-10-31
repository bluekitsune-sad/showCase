# Maison Store

**Category:** 1 — I need a website
**Built for:** Independent fashion, accessory and lifestyle brands
**Label:** For individuals & customers
**Status:** Planned
**Folder:** `projects/01-maison-store`
**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite

## The problem

A small brand sells through Instagram DMs and a link tree. Orders get lost, sizes get double-sold, and the shop looks like a side project. They need a storefront that feels like a real label — and a checkout that does not make people leave.

## What it does

- Browse collections with filters, see a product in every size and colour, and add it to a cart that survives a refresh.
- Check out with an address form, a discount code and a mock payment step that ends in a real order record.
- Sign in to see order history and tracking, save addresses and keep a wishlist.

## Scope

**In scope for v1**

- Product catalogue, categories, filters (price, size, colour, availability) and sorting
- Product detail with variants, gallery, size guide and related products
- Persistent cart, discount codes, checkout with server-side validation
- Mock payment (no real charge) and order confirmation
- Accounts, order history, order tracking, saved addresses, wishlist
- Editorial home page, newsletter block, responsive premium design

**Out of scope for v1**

- Real Stripe charges and webhooks (interface is ready, provider is mocked)
- Returns and refunds workflow
- Multi-currency and tax engines
- Product reviews with moderation

## Data model

`Collection`, `Product`, `Variant` (size, colour, SKU, stock), `Image`, `Customer`, `Address`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Discount`, `WishlistItem`.

Seed: 4 collections, ~24 products, ~90 variants, 6 customers, 8 orders in different states, 2 discount codes.

## Definition of done

- `npm install && npm run dev` works from a clean clone after `npx prisma migrate dev && npm run seed`
- Lint, typecheck and production build pass
- Demo account documented, with a seeded order in transit
- Every in-scope feature works, including empty cart, out-of-stock and invalid-code states
- README has problem, walkthrough, stack, setup, screenshots and limits

## Notes for the build

Design direction: editorial and quiet — generous whitespace, one accent colour, serif display type against a clean sans. Product photography comes from `public/` placeholders generated as CSS gradients if no assets exist; never link to hot files.

Tricky parts: variant-level stock (not product-level), cart merging on sign-in, and discount validation that also runs server-side at checkout.
