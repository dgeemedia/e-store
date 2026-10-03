const naira = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG')
/** Order confirmation via Resend's REST API (no extra package). Never throws. */
export async function sendOrderEmail(o: any) {
  if (!process.env.RESEND_API_KEY || !o.email) return
  const rows = (o.items || []).map((i: any) => `<tr><td>${i.productName}${i.variant ? ' – ' + i.variant : ''} (${i.mode === 'dozen' ? 'pack' : 'unit'}) × ${i.quantity}</td><td align="right">${naira(i.price * i.quantity)}</td></tr>`).join('')
  const html = `<div style="font-family:sans-serif;max-width:520px"><h2 style="color:#0056b6">Thank you, ${o.name || 'friend'}!</h2><p>Your Elorge Store order <b>${o.reference}</b> is confirmed.</p>${o.promoCode ? `<p>⚡ Lightning deal code: <b>${o.promoCode}</b> (${o.promoTitle})</p>` : ''}<table width="100%">${rows}${o.discount ? `<tr><td>Discount (${o.couponCode})</td><td align="right">-${naira(o.discount)}</td></tr>` : ''}<tr><td>Delivery</td><td align="right">${naira(o.deliveryFee || 0)}</td></tr><tr><td><b>Total</b></td><td align="right"><b>${naira(o.total)}</b></td></tr></table><p>Invoice: <a href="${process.env.NEXT_PUBLIC_SITE_URL}/invoice/${o.viewKey}">view / print</a></p><p>Track it anytime: <a href="${process.env.NEXT_PUBLIC_SITE_URL}/track">${process.env.NEXT_PUBLIC_SITE_URL}/track</a> (use your reference + phone).</p></div>`
  try { await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.EMAIL_FROM || 'Elorge Store <orders@yourdomain.com>', to: o.email, subject: `Order confirmed – ${o.reference}`, html }) }) } catch (e) { console.error('email failed', e) }
}

export async function sendShippedEmail(o: any) {
  if (!process.env.RESEND_API_KEY || !o.email) return
  const html = `<div style="font-family:sans-serif;max-width:520px"><h2 style="color:#0056b6">Your order is on its way 🚚</h2><p>Hi ${o.name || ''}, order <b>${o.reference}</b> has shipped.</p>${o.carrier ? `<p>Carrier / driver: <b>${o.carrier}</b></p>` : ''}${o.trackingNote ? `<p>📍 ${o.trackingNote}</p>` : ''}<p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/track">Track your order</a></p></div>`
  try { await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.EMAIL_FROM || 'Elorge Store <orders@yourdomain.com>', to: o.email, subject: `Your order ${o.reference} has shipped`, html }) }) } catch (e) { console.error('email failed', e) }
}
