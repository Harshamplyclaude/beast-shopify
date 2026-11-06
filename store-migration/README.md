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
  Shopify import). 5 hoodies + 1 sweatshirt, 45 variants, cleaned of Islands
  branding, inventory policy CONTINUE, tagged `Pre-order`.

## Done in My Store 2 (3xiikx-bi.myshopify.com), 6 Nov 2026

- Theme "Beast Store 2.0 - v31" (unpublished): the uploaded v30 plus the 7 v31
  files; checksums match the repo.
- 6 hoodie/sweatshirt products created from `hoodies.json`, active, on the
  Online Store, inventory policy CONTINUE, 100 units each at the Delhi location.
- Collections: `hoodies` (tag Hoodies or Sweatshirts, template hoodies) and
  `best-sellers` (vendor contains MrBeast/Beast, sorted best-selling, template
  bestsellers).
- Menus: main-menu-1, header-categories, footer-support, footer-company.
- Pages: about, faqs, authenticity, shipping, returns-exchanges,
  track-your-order, size-guide, reseller-policy, accessibility, contact
  (updated, template contact), contact-us, philanthropy (template philanthropy).
- Shipping: India, Standard Rs 100 up to Rs 998.99, Free from Rs 999.

Blocked for the connector (owner does these in admin): checkout branding,
policies (text in `policies.md`), publishing the theme.

## Tees copied from mrbeaststore.in, 6 Nov 2026

- Source: `https://mrbeaststore.in/products.json?limit=250`, raw copy in
  `mrbeaststore-products.json` (29 products, one page).
- **29 of 29 created**, none skipped, none failed: 16 adult tees and 13 kids
  tees, 340 variants, 498 images. None of the source handles matched the 6
  existing hoodies, so nothing was skipped. Created with `productSet`, keeping
  the source title, handle, description, vendor (MrBeast), type (T-Shirt), tags,
  options (Size / Color), prices, SKUs, weights (200 g, or 100 g for the Split
  Tee) and image alt text. Each variant has its colour image. The source has
  none for 3 variants, Neon Panther Tee White L/XL/XXL, so those have none here
  either. No source variant has a compare-at price.
- All 29 are ACTIVE and published to the Online Store.
- **Stock:** products.json has no stock counts. All 340 source variants showed
  as available, so every tee variant is **untracked** (inventory tracking off,
  policy DENY) and stays buyable. **The owner must enter real stock counts**
  (turn on tracking per variant and set quantities at the Delhi location), or
  the tees can oversell.
- Collections (smart, published):
  - `adults` "Adults", template `adults`: tag `Adults`. 22 products: the 16
    adult tees plus the 6 hoodies/sweatshirt, which were already tagged
    `Adults`.
  - `kids` "Kids", template `kids`: tag `Kids`. 13 products.
  - `best-sellers`: unchanged; the tees' vendor is MrBeast, so it now has 35
    (6 hoodies + 29 tees).
  - `hoodies`: unchanged, 6.
- Theme, hoodies, menus, pages and shipping were not touched.

## Still to do in the new store

1. Upload the theme as an unpublished theme; the owner publishes it.
2. Products: done (6 hoodies, 29 tees). Still to do: real stock counts for the
   tees.
3. Collections: done (`adults`, `kids`, `best-sellers`, `hoodies` with their
   templates).
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
