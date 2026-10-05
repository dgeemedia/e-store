import { notFound } from 'next/navigation'
import { client, getSettings } from '@/lib/sanity'
import PrintButton from '@/components/PrintButton'
import { getFeatures } from '@/lib/features'
export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false }, title: 'Invoice' }
const n = (x: number) => '₦' + Math.round(x || 0).toLocaleString('en-NG')
export default async function Invoice({ params, searchParams }: { params: Promise<{ key: string }>; searchParams: Promise<{ waybill?: string }> }) {
  const { key } = await params, { waybill } = await searchParams
  const [o, s, feat] = await Promise.all([client.fetch(`*[_type=="order" && viewKey==$key][0]`, { key }), getSettings(), getFeatures()])
  if (!o || !key) notFound()
  const vat = s?.vatPercent ? (o.total * s.vatPercent) / (100 + s.vatPercent) : 0
  const wb = !!waybill
  return (<div className="wrap" style={{ maxWidth: 780, padding: '24px 20px', background: '#fff', color: '#111' }}>
    <style>{`@media print{.no-print,header,footer,.bar,.ticker{display:none!important}body{background:#fff}}.inv td,.inv th{padding:8px;border-bottom:1px solid #ddd;text-align:left}.inv .r{text-align:right}`}</style>
    <PrintButton pdfOn={feat.pdfInvoices} pdfHref={`/invoice/${key}/pdf`} />
    <h1 style={{ margin: 0 }}>{wb ? 'DELIVERY WAYBILL' : 'INVOICE / RECEIPT'}</h1>
    <p><b>Elorge Technologies Limited</b> · RC 9521453<br />{s?.address}{s?.phone && <> · {s.phone}</>}{s?.email && <> · {s.email}</>}</p>
    <p>Order: <b>{o.reference}</b><br />Date: {new Date(o.createdAt).toLocaleDateString('en-NG')} · Status: <b>{o.status}</b>{o.promoCode && <><br />Promo code: <b>{o.promoCode}</b></>}</p>
    {o.logisticsPartner && <p>Delivery by: <b>{o.logisticsPartner}</b>{o.logisticsZone ? ` · Zone: ${o.logisticsZone}` : ''}{o.deliveryArea ? ` · Area: ${o.deliveryArea}` : ''}{o.etaText ? ` (${o.etaText})` : ''}</p>}
    <p><b>{wb ? 'Deliver to' : 'Billed to'}:</b><br />{o.name} · {o.phone}<br />{o.delivery === 'pickup' ? 'Customer pickup' : `${o.address}, ${o.state}${o.country && o.country !== 'Nigeria' ? ', ' + o.country : ''}`}</p>
    <table className="inv" style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th>Item</th><th className="r">Qty</th>{!wb && <th className="r">Amount</th>}</tr></thead><tbody>
      {(o.items || []).map((i: any, k: number) => <tr key={k}><td>{i.productName}{i.variant && ` (${i.variant})`}{i.mode === 'dozen' ? ' – pack' : ''}</td><td className="r">{i.quantity}</td>{!wb && <td className="r">{n(i.price * i.quantity)}</td>}</tr>)}</tbody></table>
    {!wb ? (<p className="r" style={{ textAlign: 'right' }}>{o.discount ? <>Discount ({o.couponCode}): -{n(o.discount)}<br /></> : null}Delivery: {n(o.deliveryFee)}<br />{vat > 0 && <>VAT included ({s.vatPercent}%): {n(vat)}<br /></>}<b style={{ fontSize: 20 }}>Total paid: {n(o.total)}</b>{o.payCurrency && o.payCurrency !== 'NGN' && <><br />Charged: {o.payCurrency} {o.payAmount}</>}</p>)
      : (<div style={{ marginTop: 30 }}><p>Carrier / driver: {o.carrier || '____________________'}</p><p>Received in good order by: ____________________ Signature: ____________ Date: ________</p></div>)}
  </div>)
}
