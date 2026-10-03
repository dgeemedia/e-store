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
| AUTO_REFUND | `false` until you have tested a cancellation; `true` = cancelled paid orders are refunded automatically |
| NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_META_PIXEL_ID | optional analytics (load only after a visitor accepts cookies) |

Generate secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 3. Where to put what in Studio (`/studio`)
Everything optional is hidden on the site until you fill it in, so nothing looks broken while you build up content.

| Studio place | What goes there |
|---|---|
| **Site Settings** | WhatsApp number, phone, email, address, RC number, **social links** (Instagram, Facebook, TikTok, X, YouTube, LinkedIn, Telegram), delivery fees (Lagos / other), per-kg rates, free-delivery threshold, truckload threshold, VAT %, moving banner phrases, **intro video**, **3 photos for the "Who we serve" cards** |
| **Sellers** | Each partner: name, type, logo, tagline, about text, commission %, "Paid partner" tick |
| **Products** | Photos, short + full description, specs, options (colour/size), unit price, pack price/size/name, volume discounts, warranty, dispatch time, weight, stock |
| **Flash Sales & Promos** | Timed sale with tag text (e.g. BLACK FRIDAY) and promo prices |
| **Lightning Deals** | 3-5 minute first-click deals with a unit limit and promo code prefix |
| **Discount Codes** | % or naira off, minimum spend, max uses, dates |
| **Orders** | Set status (paid, shipped, delivered, cancelled), carrier, tracking note; tick "Paid to seller?" |
| **Orders to ship / Low stock / Reviews to approve** | Ready-made work lists |
| **Bulk Quote Requests, Seller Applications, Chat history** | Inbound leads |
| **Sales** tab | 30-day sales, best sellers, low stock, amounts owed to sellers |

## 4. Partner onboarding sheet (collect this from every seller before listing)
- Legal business name, RC number, contact person and phone
- Product list with: name, unit price, pack size and pack price, volume discounts, weight, warranty terms, dispatch time
- Photos (see below) and permission in writing to use them
- Who supplies the invoice and delivery documents; who handles warranty claims and returns
- Commission % you agreed, and how/when you pay them out
- Whether they sell through other distributors (agree on pricing in writing)

**Photo standard:** square, at least 1000x1000, plain background, 3 to 5 per product, no other marketplace's watermark, only images you have the right to use.

## 5. Integrations (set up once the site is live on HTTPS)
- **Flutterwave webhook:** URL `https://elorgestore.org/api/webhook`, secret hash = FLUTTERWAVE_SECRET_HASH.
- **Sanity webhook (shipped emails, cancellations):** manage > API > Webhooks > create. URL `https://elorgestore.org/api/order-updated?secret=SANITY_WEBHOOK_SECRET`, dataset production, trigger Create + Update, filter `_type == "order"`, projection `{_id}`, POST, drafts off.
- **Telegram alerts:** create a bot with @BotFather; press Start on it and send "hi"; open `https://api.telegram.org/bot<TOKEN>/getUpdates` (note the word `bot`) and copy `chat.id`. Test: `https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<ID>&text=test`.
- **Live chat (visitors on site, you on Telegram):** after deploying, open once: `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://elorgestore.org/api/telegram&secret_token=<TELEGRAM_WEBHOOK_SECRET>`. Reply to a visitor by long-pressing their message in Telegram > Reply.
- **Product feed** for Meta (Facebook/Instagram) Commerce Manager and Google Merchant Center: `https://elorgestore.org/feeds/products.xml` (refreshes hourly). Check what each platform supports in Nigeria before investing time.
- **Automatic refunds (`AUTO_REFUND`):** keep `false` until tested. Test with Flutterwave TEST keys: pay a test order, set it to **cancelled** in Studio, then confirm stock returns and Telegram reports "Refund started automatically" (with `true`) or "Refund NOT sent" (with `false`). Only then set `true` in Vercel and redeploy. It refunds the FULL total (including delivery), starts the moment you change the status, can fail (for example low Flutterwave balance; read the Telegram message), and does not undo seller payouts you already made. Partial refunds: do them by hand in Flutterwave.
- **Google Analytics (`NEXT_PUBLIC_GA_ID`):** analytics.google.com > create property "Elorge Store" (time zone Lagos, currency NGN) > Web stream for elorgestore.org > copy the Measurement ID (`G-XXXX`). Test: open the live site in a private window, press Accept on the cookie notice, check Reports > Realtime.
- **Meta Pixel (`NEXT_PUBLIC_META_PIXEL_ID`):** business.facebook.com > Events Manager > Connect data sources > Web > Meta Pixel > name it, enter the site address, skip the install-code steps (the site already loads it), copy the Pixel ID. Test with the Meta Pixel Helper Chrome extension or Events Manager > Test events.
- Both analytics tools load only after a visitor accepts the cookie notice, so numbers will read lower than real traffic. Both `NEXT_PUBLIC_` values need a redeploy to take effect.
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
- [ ] Install the app on a phone and a laptop; check pages on a slow phone connection

**F. Flip to live**
- [ ] Replace the Flutterwave TEST key with the LIVE key in Vercel; redeploy
- [ ] Place one small real order yourself and refund it; confirm the whole chain works
- [ ] Leave `AUTO_REFUND=false` for the first weeks; refund manually in Flutterwave until you trust the flow
- [ ] Submit the sitemap to Google Search Console; connect the product feed if you use it

**G. First week**
- [ ] Check Telegram and Studio's "Orders to ship" several times a day
- [ ] Answer chats and quotes quickly; approve reviews
- [ ] Watch the Sales tab for low stock; keep stock numbers honest
- [ ] Record what you owe each seller and pay them on the agreed schedule

## 7. Not built yet (decide later)
Customer accounts and saved addresses; automatic split payments to sellers (payouts are tracked in Studio and paid manually); WhatsApp Business API alerts; selling outside Nigeria (multi-currency, international shipping, customs).
