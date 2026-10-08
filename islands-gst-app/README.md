# Islands GST Desk

A private Shopify app for The Islands that works out GST from the store's orders, inside Shopify admin.

Pick a month and click **Calculate**. The app reads that month's orders and leaves out test, cancelled, voided and dummy orders. It then works out GST line by line:

- **Apparel:** 5% when the price per piece before GST is ₹2,500 or less after discount, 18% above that.
- **Notice:** 18%.
- **Shipping:** at the highest rate in its order.
- **Split:** CGST + SGST for customers in your GST state, IGST for everyone else.

It gives you:

- the GST payable, with the IGST / CGST / SGST split
- an invoice register with GST invoice numbers (TI/26-27/0001 …) that carry on month to month once you lock a month
- the GSTR-1 tables (B2C small, B2C large, HSN, documents) and the GSTR-3B 3.1 and 3.2 figures
- a review list: test-looking orders, products without an HSN code, edited orders, totals that don't match
- **Download Excel for CA**, with the same sheets as the September pack

## How it's built

- `web/` is the whole app: one page that Shopify admin shows in its Apps section. It talks to Shopify directly through App Bridge (Shopify's "Direct API access"), so there is no server or database to run.
- Settings, HSN codes, dummy orders and locked months are saved in your store as app data (metafields on the app's installation). The first time the app opens it saves the starting values from `web/defaults.js`. These are September's HSN list, the four dummy orders, and September locked at invoices 0001–0042.
- `web/gst-engine.js` holds the GST rules. `npm test` checks them against September 2026: ₹52,043.68 taxable and ₹6,669.07 GST.
- Shopify's theme sync ignores this folder, so it doesn't affect the storefront theme.

## One-time setup (about 20 minutes)

You need a Shopify Partner account (free) and Node.js 20 or newer on your computer.

1. **Put the `web/` folder online.** Any static host with HTTPS works. Either:
   - Netlify: **Add new site → Deploy manually**, then drag the `web` folder in. Copy the address it gives you, for example `https://islands-gst.netlify.app`.
   - Or connect this repository to Netlify, Cloudflare Pages or Vercel. Set the root directory to `islands-gst-app/web` with no build command, and every push redeploys.
2. **Create the app** in the Shopify Dev Dashboard (dev.shopify.com): **Apps → Create app**, name it *Islands GST Desk*. Copy its **Client ID** from the app's Settings.
3. **Fill in the placeholders:**
   - In `web/index.html`, replace `REPLACE_WITH_CLIENT_ID` with the Client ID, then upload the `web` folder again.
   - In `shopify.app.toml`, replace `REPLACE_WITH_CLIENT_ID` and both `REPLACE-WITH-YOUR-HOST` addresses with the Client ID and the address from step 1.
4. **Release the app's settings.** In this folder run:
   ```
   npm install
   npm run deploy
   ```
   Log in when asked and pick the app. This gives it the permissions it needs: read orders, read products, and Direct API access.
5. **Choose custom distribution.** In the Dev Dashboard, open the app's Home. On the **Distribution** card choose **Custom distribution** and enter `n3q6da-0y.myshopify.com`. Click **Generate link**.
6. **Allow order addresses.** In the Dev Dashboard go to **API access requests → Protected customer data → Request access**. Select **Name** and **Address**, give the reason "Place of supply for GST returns and the invoice register", and save. Custom apps don't go through review.
7. **Install it.** Open the link from step 5 while logged in as the store owner and click **Install**.
8. Open **Shopify admin → Apps → Islands GST Desk**.

## Every month

1. Open the app. It calculates last month straight away.
2. Check the **Review** tab. Mark any test orders as dummy, and add HSN codes for new products under **Settings & HSN**.
3. Click **Download Excel for CA** and send it.
4. After the CA files, click **Lock … invoice numbers** so next month carries on from the last number.

## Things to know

- Shopify only lets apps read the **last 60 days** of orders. Run each month within 60 days. To go further back, request **Read all orders** under API access requests in the Dev Dashboard and add `read_all_orders` to the scopes in `shopify.app.toml`.
- Refunds and edits made after a month has closed are flagged. The app doesn't create credit notes for them; the CA decides.
- HSN codes are suggestions until the CA confirms them, especially Card Bar Refill (paper) and Untitled-01 (metal ornament).
- To change a rate or the GST state, use the app's **Settings & HSN** tab. To change the rules themselves, edit `web/gst-engine.js` and run `npm test`.
