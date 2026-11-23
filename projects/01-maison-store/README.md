# Maison Store

**Category:** 1 — I need a website
**Built for:** Independent fashion, accessory and lifestyle brands
**Label:** For individuals & customers
**Status:** In progress
**Folder:** `projects/01-maison-store`
**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite

## The problem

A small brand sells through Instagram DMs and a link tree. Orders get lost, sizes get double-sold, and the shop looks like a side project. They need a storefront that feels like a real label — and a checkout that does not make people leave.

## What it does

- Browse collections with filters, see a product in every size and colour, and add it to a cart that survives a refresh.
- Check out with an address form, a discount code and a mock payment step that ends in a real order record.
- Create an account and sign in. Your account home shows recent orders, with a full order list and a detail page that tracks each piece from processing to delivery. Keep a list of saved addresses, edit them, and choose which one is the default. Save pieces to a wishlist from any product page and find them again from your account.

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

`Collection`, `Product`, `Variant` (size, colour, SKU, stock), `Image`, `Customer`, `Address`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Discount`, `WishlistItem`, plus the home-page `Testimonial`, `Editorial` and `NewsletterSubscriber` records.

Seed: 4 collections, 24 products, 99 variants, 6 customers, 8 orders in different states, 2 discount codes.

## Run it locally

```bash
cd projects/01-maison-store
npm install
cp .env.example .env
npm run db:setup      # generate client, create SQLite schema, seed demo data
npm run dev           # http://localhost:3000
```

Useful scripts: `npm run db:reset` rebuilds the demo data from scratch, `npm run db:seed` reseeds without touching the schema, and `npm run build` produces a production build.

## Demo account / demo data

Sign in at `/account/sign-in` with `ada.winters@example.com` and the password `Maison2026!`; every seeded customer uses the same password. Create a new account at `/account/register`. Accounts live only in the local demo database and no email is sent. Once signed in, `/account` shows recent orders, `/account/orders` lists the full history, `/account/orders/<order-number>` shows the pieces, per-item status and a tracking timeline, and `/account/addresses` lists saved addresses with add, edit, delete and set-default controls. Ada has two seeded orders, one delivered and one in transit, so both states are visible, and her seeded addresses can be edited or extended from the account area. The storefront is public: open the home page, the collections index, the full catalogue at `/products`, any collection, any product, add a size to the bag, open `/cart`, then continue to `/checkout`. Two discount codes are seeded — `WELCOME10` takes 10% off over $100 and `ATELIER25` takes $25 off over $250. The payment step is mocked: any 13–19 digit card number, a future expiry and a 3–4 digit security code place an order without a charge, and the confirmation opens at `/checkout/<order-number>`.

Product photography is intentionally absent. Every product and collection image is a deterministic CSS gradient placeholder so the demo never requests an external asset. Add real captures in `public/` when photography exists.

## How it works

The app is a standard Next.js App Router project. `src/app/layout.tsx` holds the announcement bar, masthead with the collections mega-menu, and footer; the header is a small client component for the menu and keyboard handling. Lists and pages are server components reading Prisma directly.

Catalogue filters and sorting live in the query string, so a filtered view can be bookmarked and works without JavaScript; the product page is a client island only for the gallery and variant selection. The bag is a `Cart` row keyed by an HttpOnly cookie rather than browser storage: the first add creates it on the server, and quantity changes and removals revalidate the bag and the header count together, with variant stock enforced on the server. Accounts store a scrypt password hash and sign in with a signed, HttpOnly session cookie; the sign-in and registration forms validate on the server, and the header reads the session to greet a signed-in customer. Saved addresses are scoped to the signed-in customer and validated on the server; add, edit, delete and set-default keep exactly one address marked as the default. The wishlist is also scoped to the signed-in customer: saving or removing a piece is a server action that writes a `WishlistItem` row, guests see a sign-in prompt instead of a control, and the wishlist page reads only that customer's rows. Order history is read from the same `Order` and `OrderItem` records checkout writes, scoped to the signed-in customer on the server, so an order number from another account returns not found. The tracking timeline is derived from the order status and its placed date, with later steps marked expected. Checkout revalidates the cart, stock and discount code on the server, writes the order with line snapshots, decrements variant stock and clears the bag in one transaction; card fields are checked for shape only and never stored. The Prisma schema models the whole purchase path up front — collection, product, variant, cart, order, discount, wishlist — so later surfaces add behaviour rather than migrations. The home page reads its collections, featured products, testimonials and journal entries from Prisma, and the newsletter block validates an address on the server before writing a `NewsletterSubscriber` row. Nothing leaves the demo database. Money is stored as integer minor units and formatted at render time. `prisma/seed.ts` rebuilds the same catalogue on every run; order dates are relative to the day you seed.

## What I left out, and why

- **Account extras** — sign-in, the account home, order history, saved addresses and the wishlist work; account extras beyond those are still to come.
- **Photography** is replaced by generated gradients rather than hot-linked files, so the demo needs no external requests and no licensing questions.
- **Real payments** are out of scope for v1; the checkout step is mocked and no card data is stored.

## Definition of done

- `npm install && npm run dev` works from a clean clone after `npx prisma migrate dev && npm run seed`
- Lint, typecheck and production build pass
- Demo account documented, with a seeded order in transit
- Every in-scope feature works, including empty cart, out-of-stock and invalid-code states
- README has problem, walkthrough, stack, setup, screenshots and limits

## Notes for the build

Design direction: editorial and quiet — generous whitespace, one accent colour, serif display type against a clean sans. Product photography comes from `public/` placeholders generated as CSS gradients if no assets exist; never link to hot files.

Tricky parts: variant-level stock (not product-level), cart merging on sign-in, and discount validation that also runs server-side at checkout.
