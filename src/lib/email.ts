import { sendMail } from './mail'
const naira = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG')
const SITE = () => process.env.NEXT_PUBLIC_SITE_URL
export async function sendOrderEmail(o: any) {
  if (!o.email) return
  const rows = (o.items || []).map((i: any) => `<tr><td>${i.productName}${i.variant ? ' – ' + i.variant : ''} (${i.mode === 'dozen' ? 'pack' : 'unit'}) × ${i.quantity}</td><td align="right">${naira(i.price * i.quantity)}</td></tr>`).join('')
  const html = `<div style="font-family:sans-serif;max-width:520px"><h2 style="color:#0056b6">Thank you, ${o.name || 'friend'}!</h2><p>Your Elorge Store order <b>${o.reference}</b> is confirmed.</p>${o.promoCode ? `<p>Lightning deal code: <b>${o.promoCode}</b> (${o.promoTitle})</p>` : ''}<table width="100%">${rows}${o.discount ? `<tr><td>Discount (${o.couponCode})</td><td align="right">-${naira(o.discount)}</td></tr>` : ''}<tr><td>Delivery</td><td align="right">${naira(o.deliveryFee || 0)}</td></tr><tr><td><b>Total</b></td><td align="right"><b>${naira(o.total)}</b></td></tr></table>${o.payCurrency && o.payCurrency !== 'NGN' ? `<p>Charged: <b>${o.payCurrency} ${o.payAmount}</b></p>` : ''}<p>Invoice: <a href="${SITE()}/invoice/${o.viewKey}">view / print</a></p><p>Track it anytime: <a href="${SITE()}/track">${SITE()}/track</a> (use your reference + phone).</p></div>`
  await sendMail({ to: o.email, subject: `Order confirmed – ${o.reference}`, html })
}
export async function sendShippedEmail(o: any) {
  if (!o.email) return
  const html = `<div style="font-family:sans-serif;max-width:520px"><h2 style="color:#0056b6">Your order is on its way</h2><p>Hi ${o.name || ''}, order <b>${o.reference}</b> has shipped.</p>${o.carrier ? `<p>Carrier / driver: <b>${o.carrier}</b></p>` : ''}${o.trackingNote ? `<p>${o.trackingNote}</p>` : ''}<p><a href="${SITE()}/track">Track your order</a></p></div>`
  await sendMail({ to: o.email, subject: `Your order ${o.reference} has shipped`, html })
}
