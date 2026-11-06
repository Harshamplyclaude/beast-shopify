# MrBeast India store setup

The newly connected Shopify store becomes the MrBeast India store. Everything
it needs is on branch `claude/sleepy-mayer-bqk93w`.

## What is ready

- **Theme (v31):** the repo root (`assets/`, `config/`, `layout/`, `locales/`,
  `sections/`, `snippets/`, `templates/`). It is v30 from mrbeaststore.in plus
  pre-order support and a `collection.hoodies` template.
  - Pre-order: tag a product `pre-order`. The button reads "Pre-order", the note
    under it reads "Ships from 12 November" until 2026-11-12 and "Ships in 7 days"
    after, the note is added as a cart line property, and cards show a badge.
    Settings: Theme settings > Pre-orders.
- **Hoodies:** `hoodies.json` (API import) and `hoodies-mrbeast-india.csv` (manual
  Shopify import). 5 hoodies + 1 sweatshirt, 50 variants, cleaned of Islands
  branding, inventory policy CONTINUE, tagged `Pre-order`.

## Still to do in the new store

1. Upload the theme as an unpublished theme; the owner publishes it.
2. Products: the hoodies from `hoodies.json`, plus the tees from mrbeaststore.in
   (export them first if that store can be connected; otherwise ask for a CSV).
3. Collections with these handles (the theme links to them): `adults`, `kids`,
   `best-sellers`, `hoodies`. Assign templates `collection.adults`,
   `collection.kids`, `collection.bestsellers`, `collection.hoodies`.
4. Menus with these handles: `main-menu-1` (Shop, Learn, Watch),
   `header-categories`, `footer-support`, `footer-company`.
5. Pages: about, contact, faqs, shipping, returns-exchanges, track-your-order,
   size-guide, authenticity, reseller-policy, accessibility, philanthropy
   (template `page.philanthropy`).
6. Shipping: India only. Rs 100 flat below Rs 999, free from Rs 999.
   Delivery 3-7 days. Every product must be in the India delivery profile, or it
   shows as sold out.
7. Checkout branding (logo, black square buttons, Work Sans) and the favicon.
8. Policies: 30-day size exchanges, damaged items replaced, no change-of-mind
   returns, support email mrbeast@amplybrands.com.
