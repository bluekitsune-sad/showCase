# CityBites

**Category:** 3 — I need a mobile app
**Built for:** Everyday diners and independent restaurants
**Label:** For individuals & customers
**Status:** Planned
**Folder:** `projects/05-citybites`
**Stack:** React Native · Expo · TypeScript · local mock API

## The problem

Finding dinner means juggling three apps and a phone call. Small restaurants have no affordable way to take direct orders, so they lose margin to aggregators or miss orders entirely.

## What it does

- Discover restaurants nearby, filter by cuisine, rating, price and delivery time.
- Build an order with customisations, check out, and follow it from "confirmed" to "delivered".
- Switch to the restaurant side and manage incoming orders and menu availability.

## Scope

**In scope for v1**

- Discovery feed with search, cuisine chips and sorting
- Restaurant detail with menu sections, item options and dietary tags
- Cart, delivery vs pickup, address selection, mock payment, order tracking states
- Account: sign in, order history, favourites, saved addresses, loyalty points
- Restaurant owner dashboard: order queue, menu availability, sales summary
- Runs in the browser through Expo web as well as on a device

**Out of scope for v1**

- Live rider tracking on a map
- Real payments and refunds
- Multi-restaurant carts
- Native push notifications (mock in web, documented)

## Data model

`Restaurant`, `MenuCategory`, `MenuItem`, `OptionGroup`, `Option`, `Cart`, `Order`, `OrderItem`, `OrderStatusEvent`, `Customer`, `Address`, `Favourite`, `LoyaltyTransaction`.

Seed: 12 restaurants with 8–20 menu items each, 6 customers, 5 completed orders, one live order per state.

## Definition of done

- `npm install` then `npm run web` shows the app in a browser
- Typecheck passes and `npx expo export --platform web` succeeds
- Every screen has empty, loading and error states
- Demo account documented
- README explains the mock API and the limits of the web build

## Notes for the build

Design direction: warm and appetising — food photography cards, rounded corners, one saturated accent, bottom tabs.

Tricky parts: option groups with min/max selection rules, cart price recalculation after option changes, and keeping the same code path for web and native (no platform-only APIs without a fallback).
