import { client, getSettings } from '@/lib/sanity'
import { getFeatures } from '@/lib/features'
import { buildInvoicePdf } from '@/lib/invoicePdf'
/** Invoice (or ?waybill=1 waybill) as a real PDF, in ?lang=en|zh|fr. Only when the "PDF invoice download" switch is on. */
export async function GET(req: Request, { params }: { params: Promise<{ key: string }> }) {
  if (!(await getFeatures()).pdfInvoices) return new Response('PDF invoices are coming soon.', { status: 503 })
  const { key } = await params, u = new URL(req.url)
  const [o, s] = await Promise.all([client.fetch(`*[_type=="order" && viewKey==$key][0]`, { key }), getSettings()])
  if (!o || !key) return new Response('Not found', { status: 404 })
  const bytes = await buildInvoicePdf(o, s, u.searchParams.get('lang'), u.searchParams.has('waybill'))
  return new Response(bytes as any, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${u.searchParams.has('waybill') ? 'waybill' : 'invoice'}-${o.reference}.pdf"` } })
}
