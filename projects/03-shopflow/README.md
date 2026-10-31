# ShopFlow

**Category:** 2 — I need a business application
**Built for:** Small shops, retailers and local businesses
**Label:** For individuals & customers
**Status:** Planned
**Folder:** `projects/03-shopflow`
**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite

## The problem

A local shop tracks stock in a notebook and sales in a calculator. Nobody knows what actually sold last month, what is about to run out, or whether the shop made money. Existing POS software is expensive and built for chains.

## What it does

- Ring up a sale in seconds: search or scan, adjust quantity, take payment, print a receipt.
- See stock drop in real time, with low-stock alerts and a full movement history.
- Open reports and answer "what did I earn this month, and on what?"

## Scope

**In scope for v1**

- Product and category management with variants and stock levels
- Stock adjustments with reason codes and an audit trail
- POS screen: fast search, barcode input, cart, discounts, customer attach, atomic sale completion
- Purchases and suppliers: purchase orders, goods received, supplier balances
- Receipts, printable layout, barcode/label generation
- Reports: sales, profit, expenses, top products, stock value, CSV export
- Single-shop auth with cashier and manager roles

**Out of scope for v1**

- Multi-branch / multi-register sync
- Card terminal integration (payment is recorded, not processed)
- Accounting export beyond CSV
- Customer loyalty programme

## Data model

`User` (role), `Category`, `Product`, `Variant`, `StockMovement`, `Sale`, `SaleItem`, `Payment`, `Customer`, `Supplier`, `Purchase`, `PurchaseItem`, `Expense`, `Shift`.

Seed: 8 categories, ~40 products, ~120 variants, 60 historical sales across 90 days, 6 suppliers, 10 purchases, 15 expenses.

## Definition of done

- Clean-clone setup documented and working
- Lint, typecheck and build pass
- A sale cannot oversell stock under concurrent submits
- Receipt prints cleanly at thermal width and in A4 preview
- Reports reconcile with seeded sales to the cent
- README explains the stock movement model and known limits

## Notes for the build

Design direction: fast and legible — big tap targets, high contrast, keyboard shortcuts for the POS screen, no decorative animation in the sale path.

Tricky parts: stock must move through one function only (`recordStockMovement`), sales must be transactional, and money is stored in minor units everywhere.
