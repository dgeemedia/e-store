# Elorge Store

Marketplace for Elorge Technologies Limited (RC 9521453): factories, farms, importers, wholesalers and makers sell to wholesalers, retailers and everyday buyers. Next.js 15 + Sanity (content & orders) + Flutterwave (payments) + Resend (email) + Telegram (alerts & live chat).

## 1. Run it locally
```
pnpm install
cp .env.example .env.local     # fill in at least the Sanity values
pnpm dev                       # store: localhost:3000   Studio: localhost:3000/studio
```
Add `http://localhost:3000` to your Sanity project's CORS origins (allow credentials). Test the production build with `pnpm build && pnpm start` (the install and offline features only run in production).

## 2. Environment variables (`.env.local` and Vercel)
| Variable | What / where to get it |
|---|---|
| NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET | sanity.io/manage (dataset: production) |
| SANITY_API_TOKEN | Sanity > API > Tokens > Editor (server only) |
| NEXT_PUBLIC_SITE_URL | `https://elorgestore.org` in production |
| FLUTTERWAVE_SECRET_KEY | Flutterwave > Settings > API (test key first, live key at launch) |
| FLUTTERWAVE_SECRET_HASH | random string you generate; same value in Flutterwave > Webhooks |
| RESEND_API_KEY, EMAIL_FROM | resend.com; verify elorgestore.org first |
| OWNER_EMAIL | where YOU get new-order / quote / review emails |
| TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID | @BotFather, then getUpdates (see section 5) |
| TELEGRAM_WEBHOOK_SECRET | random letters/numbers; used for live chat webhook |
| SANITY_WEBHOOK_SECRET | random string; used in the Sanity webhook URL |
| AUTH_SECRET | random string (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`); signs customer logins. Changing it logs everyone out |
| AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET | optional Google sign-in (see section 5) |
| AUTH_FACEBOOK_ID, AUTH_FACEBOOK_SECRET | optional Facebook sign-in (see section 5) |
| BREVO_API_KEY | optional: email goes through Brevo first (free plan: 300/day), Resend is the fallback |
| WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WA_TEMPLATE_PAID, WA_TEMPLATE_SHIPPED, WHATSAPP_LANG | optional WhatsApp order updates for customers who opt in (see section 5) |
| TERMII_API_KEY, TERMII_SENDER_ID, TERMII_CHANNEL | optional SMS for phone login (see Feature switches in section 5) |
| AUTO_REFUND | `false` until you have tested a cancellation; `true` = cancelled paid orders are refunded automatically |
| NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_META_PIXEL_ID | optional analytics (load only after a visitor accepts cookies) |

Generate secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 3. Where to put what in Studio (`/studio`)
Everything optional is hidden on the site until you fill it in, so nothing looks broken while you build up content.

| Studio place | What goes there |
|---|---|
| **Site Settings** | **foreign currencies and rates**, WhatsApp number, phone, email, address, RC number, **social links** (Instagram, Facebook, TikTok, X, YouTube, LinkedIn, Telegram), delivery fees (Lagos / other), per-kg rates, free-delivery threshold, truckload threshold, VAT %, moving banner phrases, **intro video**, **3 photos for the "Who we serve" cards** |
| **Sellers** | Each partner: name, type, logo, tagline, about text, commission %, "Paid partner" tick |
| **Products** | Photos, short + full description, specs, options (colour/size), unit price, pack price/size/name, volume discounts, warranty, dispatch time, weight, stock |
| **Flash Sales & Promos** | Timed sale with tag text (e.g. BLACK FRIDAY) and promo prices |
| **Lightning Deals** | 3-5 minute first-click deals with a unit limit and promo code prefix |
| **Discount Codes** | % or naira off, minimum spend, max uses, dates |
| **Orders** | Set status (paid, shipped, delivered, cancelled), carrier, tracking note; tick "Paid to seller?" (pay sellers BEFORE collecting goods) |
| **Orders to ship / Low stock / Reviews to approve** | Ready-made work lists |
| **Bulk Quote Requests, Seller Applications, Logistics Applications, Chat history** | Inbound leads |
| **Customers (accounts)** | Customers who signed in: name, phone, saved addresses |
| **Sales** tab | 30-day sales, best sellers, low stock, amounts owed to sellers |

## 4. Partner onboarding sheet (collect this from every seller before listing)
- Legal business name, RC number, contact person and phone
- Product list with: name, unit price, pack size and pack price, volume discounts, weight, warranty terms, dispatch time
- Photos (see below) and permission in writing to use them
- Who supplies the invoice and delivery documents; who handles warranty claims and returns
- Commission % you agreed, and their company bank account details (you pay them in full BEFORE collecting each order)
- Whether they sell through other distributors (agree on pricing in writing)

**Photo standard:** square, at least 1000x1000, plain background, 3 to 5 per product, no other marketplace's watermark, only images you have the right to use.

### 4a. Pre-launch plan: sign partners and list products first
Everything you need to approach partners is in the **`partner-kit`** folder: the one-page partner summary (Word), WhatsApp and email outreach messages, and the two spreadsheets partners fill in.

1. Choose 2 to 4 launch partners (start with the manufacturers you already work with) and aim for 20 to 40 products in total.
2. Meet each with a one-page summary: how the site works, what it costs them (advert fee, commission or nothing), that you pay them in full before each collection, and what you need from them.
3. Send each the **product sheet** (`import-templates/products-template.csv`, plus `sellers-template.csv` for their company details) and the photo standard above. They return the filled sheet and a folder of photos.
4. Load it on your test site (4b), then ask each partner to confirm in writing (a WhatsApp message is fine) that their prices, descriptions and photos are correct.
5. Sign the agreement before any product goes public. Then follow the go-live checklist (section 6).

### 4b. Bulk listing from spreadsheets
Instead of typing every product in Studio, partners fill a spreadsheet and you load it with one command. Open the templates in Excel or Google Sheets, delete the EXAMPLE rows, and save as **CSV (UTF-8)**.
- **Sellers sheet columns:** name, type (Manufacturer, Farm, Importer, Wholesaler, Retailer, Fashion / Maker, Other), tagline, about, commission_percent, logo, featured, sponsored.
- **Products sheet columns:** seller (must match a seller name), name, category (use one of the site's categories), short_description, full_description (one paragraph per line), unit_price, pack_price, pack_size, pack_label, volume_tiers (`12:900;100:800` = from 12 units N900 each, from 100 units N800 each), warranty_months, dispatch_time (Ships in 24 hours / Ships in 2-3 days / Ships in 5-7 days / Bulk orders: 7-14 days), weight_kg, stock (empty = not tracked), options (`Colour=Black|Red;Size=S|M|L`), specs (`Power=60W;Battery=12h`), images (file names in your images folder or web addresses, separated by `;`, first one is the main photo), featured, active.
- **Run it** (needs `SANITY_API_TOKEN` and the project ID in `.env.local`):
  1. Put the CSV files and an `images` folder together, for example in a folder called `import-data`.
  2. Practice run, writes nothing: `pnpm import --sellers import-data/sellers.csv --products import-data/products.csv --images import-data/images --dry-run`
  3. Fix any row it reports (it names the row and the problem).
  4. Real run: the same command without `--dry-run`. Items that already exist are skipped, so you can re-run safely after fixing errors.
  5. `--update` refreshes the text and price fields of items that already exist from the sheet (it never touches images, stock or sold counts).
- Every product needs at least one photo. Products appear on the live site as soon as they are imported and active, so check them in Studio first, or import with `active` set to `no` and switch them on later.
- Sellers created this way start with a placeholder commission of 0 unless the sheet says otherwise; check each seller's page in Studio.

### 4c. What your partner agreement should cover (checklist for your lawyer, not legal advice)
- Who the parties are (company names, RC numbers, signatories) and what products and price list the agreement covers; who may change prices and how much notice you get; any minimum resale price.
- Exclusivity and channel conflict: whether they may sell the same products through distributors or other sites, and at what prices.
- How you order (PAY FIRST, THEN COLLECT): for each customer order you confirm stock, receive a pro-forma invoice, pay the seller in full, and collect the goods only after the seller confirms payment in writing. Agree lead times, stock confirmation, cut-off times, minimum quantities, how fast the seller must confirm receipt of payment, and what happens when something is out of stock.
- Documents with every purchase: invoice, signed delivery waybill and any customs or duty paperwork their arrangement requires. Agree who pays any duty and that you receive the paper with each collection.
- Quality, warranty and returns: warranty length, who repairs or replaces faulty goods and how fast, and what happens with defective batches.
- Approvals and compliance: check which product approvals (for example NAFDAC or SON) apply to each category, and who holds them.
- Liability and insurance: damage in transit, product liability, and who is responsible when.
- Money: commission or advert fee; payment in full BEFORE collection by bank transfer to the seller's company account named in the agreement; the seller must refund or credit any payment for goods it cannot supply within an agreed number of days; and what happens when you cancel a customer order after paying (refund, credit or loss) and when a delivery is damaged or wrong.
- Photos and brand: permission to use their logo, product photos and descriptions on the site and in social media and ads.
- Customer data, confidentiality, how long the agreement lasts, how either side ends it, how disputes are settled and which law applies (Nigeria).

### 4d. Money flow: customers pay first, you pay sellers first, then you collect
1. **Customer pays online** (Flutterwave). The order turns **paid** in Studio and your Telegram alert lists what to pay each seller and says "Pay sellers BEFORE collecting goods". Pickup, delivery and lightning-deal orders are all prepaid; nothing is released on credit.
2. **Confirm stock and get a pro-forma invoice** from each seller for that order.
3. **Pay the seller in full** by bank transfer to the company account named in your agreement. Keep the proof of payment and tick **Paid to seller?** on the order. Studio shows two work lists: **Step 1: pay sellers** (customer paid, seller not yet paid) and **Step 2: ready to collect and ship** (seller paid).
4. **The seller confirms payment received** in writing (a WhatsApp message is fine). Only then collect the goods, with the seller's final invoice, a signed delivery waybill and any customs or duty paperwork.
5. **Dispatch** (Elorge Logistics or a partner), then set the order to **shipped** and add the tracking note.
- **Protect yourself, because you pay before you receive:** pay only against a pro-forma invoice for a specific confirmed order; confirm stock before paying; start with small orders with new sellers; check the account name matches the seller and confirm any change of bank details by phone before paying; and have the agreement say undelivered goods are refunded within a set number of days.
- **Pickup orders:** hand over goods only when the order shows **paid** and the buyer gives the order reference.
- **Bulk and truckload quotes:** send a pro-forma invoice and release goods only after the payment (or the agreed deposit and balance) is confirmed in your bank account, not just shown on a screenshot.

## 5. Integrations (set up once the site is live on HTTPS)
- **Flutterwave webhook:** URL `https://elorgestore.org/api/webhook`, secret hash = FLUTTERWAVE_SECRET_HASH.
- **Sanity webhook (shipped emails, cancellations):** manage > API > Webhooks > create. URL `https://elorgestore.org/api/order-updated?secret=SANITY_WEBHOOK_SECRET`, dataset production, trigger Create + Update, filter `_type == "order"`, projection `{_id}`, POST, drafts off.
- **Telegram alerts:** create a bot with @BotFather; press Start on it and send "hi"; open `https://api.telegram.org/bot<TOKEN>/getUpdates` (note the word `bot`) and copy `chat.id`. Test: `https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<ID>&text=test`.
- **Live chat (visitors on site, you on Telegram):** after deploying, open once: `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://elorgestore.org/api/telegram&secret_token=<TELEGRAM_WEBHOOK_SECRET>`. Reply to a visitor by long-pressing their message in Telegram > Reply.
- **Live chat troubleshooting:** open `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`. Empty `url` = webhook not registered (or you are testing on localhost, where Telegram cannot reach you). `last_error_message` with 403 = TELEGRAM_WEBHOOK_SECRET in Vercel differs from the secret_token you registered (redeploy after changing it); 404 = the site is not deployed with `/api/telegram`; 500 = check Vercel logs (Sanity token / project id). You must use Telegram's **Reply** on the visitor's tagged message. After each reply the bot answers "Delivered to visitor #xxxxxx"; no such line means your reply did not reach the site. For local testing only: `deleteWebhook`, set `TELEGRAM_POLL=true`, restart `pnpm dev`.
- **Product feed** for Meta (Facebook/Instagram) Commerce Manager and Google Merchant Center: `https://elorgestore.org/feeds/products.xml` (refreshes hourly). Check what each platform supports in Nigeria before investing time.
- **Automatic refunds (`AUTO_REFUND`):** keep `false` until tested. Test with Flutterwave TEST keys: pay a test order, set it to **cancelled** in Studio, then confirm stock returns and Telegram reports "Refund started automatically" (with `true`) or "Refund NOT sent" (with `false`). Only then set `true` in Vercel and redeploy. It refunds the FULL total (including delivery), starts the moment you change the status, can fail (for example low Flutterwave balance; read the Telegram message), and does not undo seller payouts you already made. Partial refunds: do them by hand in Flutterwave.
- **Google Analytics (`NEXT_PUBLIC_GA_ID`):** analytics.google.com > create property "Elorge Store" (time zone Lagos, currency NGN) > Web stream for elorgestore.org > copy the Measurement ID (`G-XXXX`). Test: open the live site in a private window, press Accept on the cookie notice, check Reports > Realtime.
- **Meta Pixel (`NEXT_PUBLIC_META_PIXEL_ID`):** business.facebook.com > Events Manager > Connect data sources > Web > Meta Pixel > name it, enter the site address, skip the install-code steps (the site already loads it), copy the Pixel ID. Test with the Meta Pixel Helper Chrome extension or Events Manager > Test events.
- Both analytics tools load only after a visitor accepts the cookie notice, so numbers will read lower than real traffic. Both `NEXT_PUBLIC_` values need a redeploy to take effect.
- **Customer accounts (Google, Facebook, email code):** set `AUTH_SECRET`. Customers can always still check out as guests. Email login sends a 6-digit code (valid 10 minutes, 5 tries) through Brevo/Resend. Orders appear in "My account" by matching the order email. Customers can delete their saved profile and addresses themselves.
  - *Google:* Google Cloud console > APIs & Services > OAuth consent screen, then Credentials > OAuth client ID (Web). Authorised redirect URIs: `https://<your-domain>/api/auth/callback/google` (add the test AND the live domain). Put the client ID/secret in `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.
  - *Facebook:* developers.facebook.com > create app > add Facebook Login > Valid OAuth Redirect URI `https://<your-domain>/api/auth/callback/facebook`. Put App ID/secret in `AUTH_FACEBOOK_ID` / `AUTH_FACEBOOK_SECRET`. Until the app is switched to Live (which can require a privacy policy URL and business verification) only people with a role on the app can log in, so test with your own account first.
  - A login button only shows when its ID variable is set.
- **Email with Brevo (optional):** brevo.com > verify your sending domain (add the DKIM/SPF records) > SMTP & API > create an API key > `BREVO_API_KEY`, with `EMAIL_FROM` on the verified domain. Free plan: 300 emails/day; reports say a Brevo footer may appear on free emails (check). If Brevo fails or is not set, the site falls back to Resend. Orders, shipped notices, login codes and owner alerts share this allowance, so watch it on big sale days.
- **WhatsApp order updates (optional):** Meta Business account > WhatsApp > API setup: get the phone number ID (`WHATSAPP_PHONE_ID`) and a permanent token (`WHATSAPP_TOKEN`). Create two message templates and wait for approval: `order_confirmed` with body "Hello {{1}}, your Elorge Store order {{2}} is confirmed. Total: {{3}}. Thank you!" and `order_shipped` with body "Hello {{1}}, your order {{2}} has shipped with {{3}}." (change `WA_TEMPLATE_PAID` / `WA_TEMPLATE_SHIPPED` if you name them differently; keep exactly 3 variables). Messages go only to customers who tick "Send my order updates on WhatsApp" at checkout. Meta charges per conversation and may change its API version, so check current pricing and docs.
- **Foreign-currency payments:** Studio > Site Settings > "Foreign currencies": add USD/GBP/EUR/CAD with naira-per-unit rates. Prices stay in naira; the buyer sees "You will be charged USD 20.50" at your rate. Update rates yourself and build in a margin. Your Flutterwave account must have each currency enabled, and the webhook verifies the currency and amount paid.
- **FEATURE SWITCHES (Studio > Site Settings > "Feature switches").** Every switch starts OFF. While OFF, customers see "coming soon" where it applies; switch ON only after finishing that feature's setup:
  - **Phone-number login:** needs an SMS provider. Create a Termii account (check their current rules: sender ID registration, per-text prices, `generic` vs `dnd` channel and endpoint), set `TERMII_API_KEY`, `TERMII_SENDER_ID`, `TERMII_CHANNEL`, redeploy, then switch ON. Customers log in with a texted 6-digit code (10 minutes, 5 tries, 60 seconds between texts, 100 texts per hour site-wide). Phone accounts see their orders by matching the phone number on the order; they have no email until they type one at checkout. OFF: the "Phone number" button on the login page says "Phone login is coming soon".
  - **PDF invoice download:** no setup. ON adds a real PDF download on every invoice (generated by the site). OFF: the Download PDF button says "coming soon" and Print / save as PDF still works. Naira shows as "NGN" in the PDF because standard PDF fonts have no naira sign.
  - **Server-side search and paging:** no setup. Switch ON when you have more than about 300 products: the shop then searches and loads 24 at a time from the server instead of filtering a preloaded list. OFF: the shop filters up to 300 preloaded products.
  - **Courier tracking links:** in Site Settings add each courier under "Courier tracking links" (name + address with `{number}` where the tracking number goes). On each order type the courier name in "Carrier / driver" (exactly as in the list) and the number in "Tracking number". ON: the Track page shows a "Track with <courier>" button. OFF (or no match): it says live courier tracking is coming soon. This is link-based; a live feed from a courier's API needs that courier's API keys and is a later job.
  - **International delivery:** in Site Settings add countries with a base fee and per-kg fee in naira under "International delivery rates". ON: the cart offers those countries; buyers pay duties and taxes at destination (shown in the cart). Check restricted products, courier rules and your Terms before enabling, and consider enabling a foreign currency in Site Settings too. OFF: the cart says "Delivery outside Nigeria: coming soon".
  - **Delivery partners at checkout (Elorge Logistics + partner couriers):** in Studio open **Delivery partners & Elorge Logistics** and add each option: create one with type "Elorge Logistics (our own delivery)" and one per partner courier. For each set the fee in Lagos and other states, an extra fee per kg, a maximum weight, "free delivery above", the states served (empty = all Nigeria), a delivery-time text (a promise: be honest) and an optional tracking link. Set a weight on your products so the per-kg fee works. Then switch ON "Delivery partners at checkout". The cart then shows the options available for the buyer's state with their price and delivery time; the server recalculates the fee from the option chosen, so it cannot be changed in the browser. The choice is saved on the order (and in your new-order Telegram alert and on the invoice and waybill), and the courier name is pre-filled in "Carrier / driver". Studio has an "Elorge Logistics: orders to dispatch" list. Pickup stays free; international orders use the international rates. OFF (or no active partners): checkout uses the normal flat fees and says "Choose your delivery partner: coming soon". Lightning deals always use the normal flat fees.
    **Zones, areas and weight bands (more precise than plain fees):** on a delivery partner you can add **Zones and weight bands**. Each zone has a name, a list of keywords (states or areas, e.g. Lekki, Victoria Island, Ikoyi), and either one base fee (plus per-kg) or **weight bands** (e.g. up to 5 kg = N3,000, up to 20 kg = N4,500; heavier than the last band = last band fee plus per-kg for the extra weight). Checkout asks the buyer for their state AND an optional "Area or town"; the **first zone, top to bottom, whose keyword appears in state + area wins**, so put specific areas above general ones and finish with a catch-all such as "Lagos (other areas)". A zone's own delivery-time text overrides the partner's. If no zone matches, the partner's plain Lagos / other-states fees apply; if those are empty the option shows "Not available in your area". The zone and area are saved on the order and shown in your Telegram alert and on the invoice and waybill. Keywords match as text, so avoid very short ones that appear inside other place names. Distance is not calculated; zones keep prices predictable and easy to explain.
    **Different vehicles, different prices (bus vs trailer):** every price is editable in Studio. Add ONE delivery option per vehicle (for example "Elorge Logistics" with vehicle Bus, and another with vehicle Trailer), each with its own fees, zones/bands, maximum weight and "Minimum weight for this option". A bus option is offered for small and medium carts; the trailer option stays hidden until the cart reaches its minimum weight. Use "sort order" (small numbers first) so the cheapest suitable vehicle is pre-selected. Very large or truckload orders still go through the Bulk / truckload quote form (it now asks which vehicle you need), where you quote by hand.
    **Logistics company enrolment:** the public page `/logistics` ("Deliver for Elorge", linked in the footer) is an application form for riders, courier companies, van/bus/truck/trailer operators and air-cargo handlers (company, RC number, contact, states served, vehicle types, services, fleet size, insurance, tracking, rates). Applications land in Studio under **Logistics Applications** and you get a Telegram alert. Review each one: call them, collect the CAC certificate, insurance and vehicle documents (the form does not upload files), agree rates in writing, set the status, and for approved partners create a **Delivery partner** in Studio with their zones and fees. Vehicle types: bicycle, motorbike, car, van, pickup, bus, truck, trailer, plane (air cargo), boat/ship, train, other. Air and sea options work like any other option: price them with zones/weight bands or the international rates.
    *What it does not do yet:* it does not book the courier for you. You still book the shipment with the partner yourself and update the tracking note. Your delivery fees should cover what you pay each courier and your own riders/fuel. Update your Terms (who the carrier is, damage and delay rules, insurance) before offering your own delivery, and keep a record of what each partner charges you (booking and payment of couriers through their APIs is a later job).
  - **Loyalty points and saved cards:** NOT built, so there is no switch. The My account page shows two "Coming soon" tiles. Saved cards involve storing card tokens with Flutterwave (stricter security rules); loyalty points need earning, spending and refund rules decided first.
- **SEO files (automatic):** `https://<domain>/robots.txt` and `https://<domain>/sitemap.xml` are generated by the site. The sitemap lists the home page, `/quote`, `/sell`, `/logistics`, the legal pages, every active product and every seller, refreshed hourly. robots.txt blocks the private areas (`/studio`, `/api/`, `/cart`, `/track`, `/account`, `/invoice/`) and duplicate search links (`?q=`, `?paid=`). **Test sites on `*.vercel.app` or localhost block ALL search engines** (robots.txt disallows everything and an `X-Robots-Tag: noindex` header is sent), so your test site never competes with elorgestore.org; the live domain is indexed normally. Check both files in a browser after you switch domains. Product pages publish product, price, rating and breadcrumb data for Google; the home page publishes organisation, contact and a site-search action. Good SEO still depends on real content: clear product names, descriptions with specs, several photos and reviews.
- **Google Search Console / Bing Webmaster:** add the site, submit `https://elorgestore.org/sitemap.xml`.

## 6. GO-LIVE CHECKLIST
Work through this when you have partner agreements and product photos.

**A. Business and legal**
- [ ] Signed agreement with each launch partner (pricing, invoices/delivery documents, warranty, commission, channel conflict)
- [ ] Nigerian lawyer has reviewed the Terms, Privacy and Returns & Warranty pages (`src/lib/legal.ts`); change anything that is not your real policy
- [ ] Accountant has confirmed the VAT rate and invoice format; VAT % set in Site Settings
- [ ] Delivery partner/carrier chosen; fees and per-kg rates set
- [ ] Process agreed for warranty claims, returns and refunds

**B. Content**
- [ ] Partner agreements signed (4a, 4c) and product sheets loaded or entered (4b); each partner has confirmed their prices and photos in writing
- [ ] 2 to 3 partners entered under Sellers (logo, tagline, about, commission %)
- [ ] At least 20 products with photos, descriptions, prices, tiers, warranty, honest dispatch times
- [ ] Contact details, RC number, address and socials filled in Site Settings
- [ ] 3 "Who we serve" photos uploaded (with permission from the people shown)
- [ ] Intro video uploaded (optional), moving banner phrases checked
- [ ] Social accounts created, bios link to elorgestore.org

**C. Accounts and keys**
- [ ] Flutterwave business account fully verified
- [ ] Resend domain verified (DNS records added)
- [ ] Telegram bot + chat ID working; live-chat webhook set
- [ ] All variables from section 2 added in Vercel

**D. Deploy**
- [ ] Code pushed to a private GitHub repo (no `.env.local` committed)
- [ ] Vercel project deployed (check the plan allows commercial use); domain elorgestore.org connected; `NEXT_PUBLIC_SITE_URL` set; redeployed
- [ ] elorgestore.org added to Sanity CORS origins (allow credentials)
- [ ] Flutterwave and Sanity webhooks created (section 5)

**E. Test with TEST keys (do not skip)**
- [ ] Normal order: pays, shows as paid in Studio, stock drops, confirmation email arrives, invoice link opens, `/track` works
- [ ] Order with a colour/size option, a volume-discount quantity, a discount code, pickup and delivery
- [ ] Lightning deal: two phones click at once, only one wins; code appears on the receipt
- [ ] Set an order to shipped: customer gets the email. Cancel a test order: stock returns, you get the Telegram alert (test `AUTO_REFUND=true` here with test keys before ever using it live)
- [ ] Analytics: press Accept on the cookie notice, see yourself in Google Analytics Realtime and the Meta Pixel Helper
- [ ] Bulk quote, seller application and review: each reaches your Telegram
- [ ] Live chat: send from the site, reply from Telegram, answer appears
- [ ] Accounts: sign in by email code (and Google/Facebook if enabled), see an order in My account, Reorder, save an address and see it prefilled at checkout, delete account data
- [ ] Foreign currency: pay a test order in USD with test keys; check the invoice and the verified amount
- [ ] WhatsApp opt-in order: confirmation and shipped messages arrive (after templates are approved)
- [ ] Delivery zones: test a Lagos area zone, a state-wide zone, a weight-band edge (exactly on a band limit, and above the last band) and an unmatched area
- [ ] Delivery partners: add Elorge Logistics and each partner, set a weight on products, switch ON, then test a Lagos order, an order to a state a partner does not serve, and an overweight cart; check the choice appears in the Telegram alert, invoice and "orders to dispatch" list
- [ ] For each feature switch you turn on: test it (phone login with a real number, PDF download opens correctly, search and Load more at 300+ products, a courier link opens the right page, an international order shows the right fee) before telling customers
- [ ] Install the app on a phone and a laptop; check pages on a slow phone connection

**F. Flip to live** (follow section 7 step by step)
- [ ] Replace the Flutterwave TEST key with the LIVE key in Vercel; redeploy
- [ ] Place one small real order yourself and refund it; confirm the whole chain works
- [ ] Leave `AUTO_REFUND=false` for the first weeks; refund manually in Flutterwave until you trust the flow
- [ ] Submit the sitemap to Google Search Console; connect the product feed if you use it

**G. First week**
- [ ] Check Telegram and Studio's "Orders to ship" several times a day
- [ ] Answer chats and quotes quickly; approve reviews
- [ ] Watch the Sales tab for low stock; keep stock numbers honest
- [ ] Pay each seller BEFORE collecting goods: work through the Studio lists "Step 1: pay sellers" then "Step 2: ready to collect and ship"; tick "Paid to seller?" and keep the proof of payment (section 4d)

## 7. LAUNCH DAY: switch from the test site to elorgestore.org
Until now you have been testing on the Vercel test address (currently `https://e-store-eight-rose.vercel.app`). Several things point at a web address, so each one must be moved to `https://elorgestore.org` when you go live. Do them in this order. Use placeholders below; never paste real tokens or secrets into chats, tickets or Git.

1. **Connect the domain in Vercel:** Project > Settings > Domains > add `elorgestore.org` (and `www.elorgestore.org`, redirecting to the main one). Add the DNS records Vercel shows at your registrar. Wait until Vercel shows the domain as valid with HTTPS.
2. **Update `NEXT_PUBLIC_SITE_URL`** in Vercel to `https://elorgestore.org`, then **redeploy**. It controls: where customers return after paying, links in emails and invoices, canonical addresses, the sitemap, the product feed, and social share previews.
3. **Sanity CORS:** manage > API > CORS origins > add `https://elorgestore.org` (allow credentials). Keep the test address until you are done testing.
4. **Telegram live-chat webhook** (a bot can only have ONE webhook, so this replaces the test one):
   `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://elorgestore.org/api/telegram&secret_token=<TELEGRAM_WEBHOOK_SECRET>`
   Then open `https://api.telegram.org/bot<TOKEN>/getWebhookInfo` and check: `url` shows elorgestore.org, `pending_update_count` is 0, there is no `last_error_message`. Test: send a chat from the live site, long-press it in Telegram > Reply, wait for "Delivered to visitor #...".
5. **Sign-in:** add `https://elorgestore.org/api/auth/callback/google` and `/facebook` to the Google and Facebook redirect URIs. Then **Flutterwave:** Settings > Webhooks: change the URL to `https://elorgestore.org/api/webhook` (same secret hash). Replace the TEST secret key with the LIVE key in Vercel and redeploy.
6. **Sanity webhook:** manage > API > Webhooks: change the URL to `https://elorgestore.org/api/order-updated?secret=<SANITY_WEBHOOK_SECRET>`.
7. **Email (Resend):** make sure the elorgestore.org domain shows as Verified, and `EMAIL_FROM` uses it (for example `Elorge Store <orders@elorgestore.org>`).
8. **Analytics and search:** in Google Analytics make sure the web stream is for elorgestore.org; add elorgestore.org in Google Search Console (and Bing) and submit `https://elorgestore.org/sitemap.xml`; if you use the Facebook/Instagram or Google Merchant catalogue, change the feed address to `https://elorgestore.org/feeds/products.xml`.
9. **Social accounts:** put `https://elorgestore.org` in every bio and the real links in Studio > Site Settings.
10. **Final check on the live address:** place one small real order and refund it; then confirm the paid status, stock, email, invoice link, `/track`, and a live-chat round trip. Check the browser address bar shows elorgestore.org the whole way through checkout and back.

If something breaks after the switch, the usual causes are: a variable not redeployed, the old address still in a webhook, or the domain missing from Sanity CORS. Re-check `getWebhookInfo`, Flutterwave's webhook log, and Vercel's function logs.

## 8. Roadmap and status of "later" features
**Built, behind switches (default OFF):** phone login, PDF invoices, server-side search and paging, courier tracking links, international delivery, delivery partners at checkout. See Feature switches in section 5. None has been tested against real providers or real customers yet.

**Placeholders only ("Coming soon" tiles on My account, no switch):** loyalty points, saved cards.

**Not built yet, ranked**
- *Worth doing soon after launch:* stock per colour/size (today variants share one stock number); purchase tracking events for Google Analytics and the Meta Pixel (today page views only); bulk CSV product import; a seller portal so partners can add their own products and see their sales; abandoned-cart reminders and a returns request form; rate limiting and a bot check on the quote, seller, review and coupon forms; error monitoring (for example Sentry) and a regular Sanity dataset export as a backup.
- *Later:* courier booking and live tracking through courier APIs, with tracking of what you owe each courier; live courier API tracking (needs a chosen courier's API); loyalty points and saved cards (above); sales tax rules per country for international orders.

**Decided not to build:** automatic split payments to sellers. You collect the money, buy on the client's behalf and pay the seller yourself BEFORE collecting the goods, which avoids extra Flutterwave charges and checks. Payouts are tracked per order in Studio ("Paid to seller?") and totalled in the Sales tab.

**Known limits**
- Normal checkout checks stock when the order is created but reduces it when payment is confirmed, so two people could both pay for the last unit (lightning deals do not have this problem). Handle a clash by cancelling and refunding one order (cancelling restocks).
- Because you pay sellers before collecting, cancelling a customer order after you have paid a seller does not reverse that payment automatically: agree in writing whether the seller refunds, credits or keeps it, and cancel only when needed.
- Nothing has been tested with real payments, WhatsApp, SMS, Google or Facebook login; follow the test section of the go-live checklist before using live keys.
