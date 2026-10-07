import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { ts, normLang } from './tserver'
const money = (x: number) => 'NGN ' + Math.round(x || 0).toLocaleString('en-US')
/** Invoice or waybill as a PDF in English, Chinese or French. Chinese uses an embedded font subset; characters outside it (for example unusual names) print as "?". */
export async function buildInvoicePdf(o: any, s: any, langIn: any, waybill = false): Promise<Uint8Array> {
  const lang = normLang(langIn), T = (k: string, v?: any) => ts(lang, k, v)
  const pdf = await PDFDocument.create()
  let font: any, bold: any, ok: (c: string) => boolean
  if (lang === 'zh') {
    pdf.registerFontkit(fontkit)
    const { CJK_B64 } = await import('./cjkFont')
    const bytes = Buffer.from(CJK_B64, 'base64'), set = new Set<number>((fontkit.create(bytes) as any).characterSet)
    font = bold = await pdf.embedFont(bytes, { subset: false }); ok = (c) => set.has(c.codePointAt(0)!)
  } else { font = await pdf.embedFont(StandardFonts.Helvetica); bold = await pdf.embedFont(StandardFonts.HelveticaBold); ok = (c) => /[\x20-\x7E\xA0-\xFF]/.test(c) }
  const clean = (t: any) => Array.from(String(t ?? '')).map((c) => (ok(c) ? c : '?')).join('')
  let page = pdf.addPage([595, 842]), y = 800
  const ink = rgb(0.06, 0.12, 0.18)
  const row = (text: string, o2: { f?: any; size?: number; gap?: number; right?: string } = {}) => {
    if (y < 70) { page = pdf.addPage([595, 842]); y = 800 }
    const size = o2.size || 10, f = o2.f || font
    page.drawText(clean(text), { x: 50, y, size, font: f, color: ink })
    if (o2.right) { const r = clean(o2.right), w = f.widthOfTextAtSize(r, size); page.drawText(r, { x: 545 - w, y, size, font: f, color: ink }) }
    y -= o2.gap ?? 16
  }
  row(waybill ? T('iv.waybill') : T('iv.invoice'), { f: bold, size: 20, gap: 28 })
  row('Elorge Technologies Limited  |  RC 9521453', { f: bold, size: 11 })
  row([s?.address, s?.phone, s?.email].filter(Boolean).join('  |  '), { gap: 22 })
  row(`${T('iv.order')}: ${o.reference}`, { f: bold }); row(`${T('iv.date')}: ${new Date(o.createdAt).toLocaleDateString('en-NG')}   ${T('iv.status')}: ${T('st.' + o.status)}`)
  if (o.promoCode) row(`${T('iv.promo')}: ${o.promoCode}`)
  if (o.logisticsPartner) row(`${T('iv.by')}: ${o.logisticsPartner}${o.logisticsZone ? ' | ' + T('iv.zone') + ': ' + o.logisticsZone : ''}${o.deliveryArea ? ' | ' + T('iv.area') + ': ' + o.deliveryArea : ''}`)
  y -= 8; row(waybill ? T('iv.deliverTo') : T('iv.billed'), { f: bold }); row(`${o.name}  |  ${o.phone}`)
  row(o.delivery === 'pickup' ? T('iv.pickup') : `${o.address}, ${o.state}${o.country && o.country !== 'Nigeria' ? ', ' + o.country : ''}`, { gap: 24 })
  row(T('iv.item'), { f: bold, right: waybill ? T('iv.qty') : T('iv.amount') }); row('', { gap: 4 })
  for (const i of o.items || []) row(`${i.productName}${i.variant ? ' (' + i.variant + ')' : ''}${i.mode === 'dozen' ? ' - ' + T('iv.pack') : ''}  x ${i.quantity}`, { right: waybill ? '' : money(i.price * i.quantity) })
  y -= 8
  if (waybill) { row(`${T('iv.carrier')}: ${o.carrier || '____________________'}`, { gap: 30 }); row(`${T('iv.received')}: ______________________   ${T('iv.signature')}: ____________   ${T('iv.date')}: ________`) }
  else {
    if (o.discount) row(T('c.disc', { code: o.couponCode }), { right: '-' + money(o.discount) })
    row(T('c.delivery'), { right: money(o.deliveryFee) })
    if (s?.vatPercent) row(T('iv.vat', { n: s.vatPercent }), { right: money((o.total * s.vatPercent) / (100 + s.vatPercent)) })
    row(T('iv.paid'), { f: bold, size: 13, right: money(o.total) })
    if (o.payCurrency && o.payCurrency !== 'NGN') row(`${T('iv.charged')}: ${o.payCurrency} ${o.payAmount}`)
  }
  return pdf.save()
}
