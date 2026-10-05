import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { client, getSettings } from '@/lib/sanity'
import { getFeatures } from '@/lib/features'
const money = (x: number) => 'NGN ' + Math.round(x || 0).toLocaleString('en-US')
const clean = (t: any) => String(t ?? '').replace(/[^\x20-\x7E]/g, '?') // standard PDF fonts are ASCII-only
/** Invoice as a real PDF file (only when the "PDF invoice download" switch is on). */
export async function GET(_: Request, { params }: { params: Promise<{ key: string }> }) {
  if (!(await getFeatures()).pdfInvoices) return new Response('PDF invoices are coming soon.', { status: 503 })
  const { key } = await params
  const [o, s] = await Promise.all([client.fetch(`*[_type=="order" && viewKey==$key][0]`, { key }), getSettings()])
  if (!o || !key) return new Response('Not found', { status: 404 })
  const pdf = await PDFDocument.create(), font = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  let page = pdf.addPage([595, 842]), y = 800
  const row = (text: string, opts: { x?: number; f?: any; size?: number; gap?: number; right?: string } = {}) => {
    if (y < 70) { page = pdf.addPage([595, 842]); y = 800 }
    const size = opts.size || 10, f = opts.f || font
    page.drawText(clean(text), { x: opts.x ?? 50, y, size, font: f, color: rgb(0.06, 0.12, 0.18) })
    if (opts.right) { const w = f.widthOfTextAtSize(clean(opts.right), size); page.drawText(clean(opts.right), { x: 545 - w, y, size, font: f, color: rgb(0.06, 0.12, 0.18) }) }
    y -= opts.gap ?? 16
  }
  row('INVOICE / RECEIPT', { f: bold, size: 20, gap: 28 })
  row('Elorge Technologies Limited  |  RC 9521453', { f: bold, size: 11 })
  row([s?.address, s?.phone, s?.email].filter(Boolean).join('  |  '), { gap: 22 })
  row(`Order: ${o.reference}`, { f: bold }); row(`Date: ${new Date(o.createdAt).toLocaleDateString('en-NG')}   Status: ${o.status}`)
  if (o.promoCode) row(`Promo code: ${o.promoCode}`)
  y -= 8; row('Billed to', { f: bold }); row(`${o.name}  |  ${o.phone}`)
  row(o.delivery === 'pickup' ? 'Customer pickup' : `${o.address}, ${o.state}${o.country && o.country !== 'Nigeria' ? ', ' + o.country : ''}`, { gap: 24 })
  row('Item', { f: bold, right: 'Amount' }); row('', { gap: 4 })
  for (const i of o.items || []) row(`${i.productName}${i.variant ? ' (' + i.variant + ')' : ''}${i.mode === 'dozen' ? ' - pack' : ''}  x ${i.quantity}`, { right: money(i.price * i.quantity) })
  y -= 8
  if (o.discount) row(`Discount (${o.couponCode})`, { right: '-' + money(o.discount) })
  row('Delivery', { right: money(o.deliveryFee) })
  if (s?.vatPercent) row(`VAT included (${s.vatPercent}%)`, { right: money((o.total * s.vatPercent) / (100 + s.vatPercent)) })
  row('Total paid', { f: bold, size: 13, right: money(o.total) })
  if (o.payCurrency && o.payCurrency !== 'NGN') row(`Charged: ${o.payCurrency} ${o.payAmount}`)
  const bytes = await pdf.save()
  return new Response(bytes as any, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="invoice-${o.reference}.pdf"` } })
}
