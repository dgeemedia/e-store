import { sendMail } from './mail'
import { ts, normLang } from './tserver'
const naira = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG')
const SITE = () => process.env.NEXT_PUBLIC_SITE_URL
/** Customer emails are sent in the language the buyer used at checkout (saved on the order). */
export async function sendOrderEmail(o: any) {
  if (!o.email) return
  const L = normLang(o.lang), T = (k: string, v?: any) => ts(L, k, v)
  const rows = (o.items || []).map((i: any) => `<tr><td>${i.productName}${i.variant ? ' – ' + i.variant : ''} (${i.mode === 'dozen' ? T('em.pack') : T('em.unit')}) × ${i.quantity}</td><td align="right">${naira(i.price * i.quantity)}</td></tr>`).join('')
  const html = `<div style="font-family:sans-serif;max-width:520px"><h2 style="color:#0056b6">${T('em.thanks', { name: o.name || T('em.friend') })}</h2><p>${T('em.confirmed', { ref: `<b>${o.reference}</b>` })}</p>${o.promoCode ? `<p>${T('em.promo', { code: `<b>${o.promoCode}</b>`, title: o.promoTitle })}</p>` : ''}<table width="100%">${rows}${o.discount ? `<tr><td>${T('c.disc', { code: o.couponCode })}</td><td align="right">-${naira(o.discount)}</td></tr>` : ''}<tr><td>${T('c.delivery')}</td><td align="right">${naira(o.deliveryFee || 0)}</td></tr><tr><td><b>${T('c.total')}</b></td><td align="right"><b>${naira(o.total)}</b></td></tr></table>${o.payCurrency && o.payCurrency !== 'NGN' ? `<p>${T('em.charged', { cur: o.payCurrency, amt: `<b>${o.payAmount}</b>` })}</p>` : ''}<p>${T('em.invoiceLine')} <a href="${SITE()}/invoice/${o.viewKey}?lang=${L}">${T('em.viewPrint')}</a></p><p>${T('em.trackLine')} <a href="${SITE()}/track?lang=${L}">${SITE()}/track</a> ${T('em.trackHint')}</p></div>`
  await sendMail({ to: o.email, subject: T('em.subject', { ref: o.reference }), html })
}
export async function sendShippedEmail(o: any) {
  if (!o.email) return
  const L = normLang(o.lang), T = (k: string, v?: any) => ts(L, k, v)
  const html = `<div style="font-family:sans-serif;max-width:520px"><h2 style="color:#0056b6">${T('em.shipHead')}</h2><p>${T('em.shipHi', { name: o.name || '', ref: `<b>${o.reference}</b>` })}</p>${o.carrier ? `<p>${T('em.carrier')} <b>${o.carrier}</b></p>` : ''}${o.trackingNote ? `<p>${o.trackingNote}</p>` : ''}<p><a href="${SITE()}/track?lang=${L}">${T('em.trackBtn')}</a></p></div>`
  await sendMail({ to: o.email, subject: T('em.shipSubject', { ref: o.reference }), html })
}
