import { notFound } from 'next/navigation'
import { client, getSettings } from '@/lib/sanity'
import PrintButton from '@/components/PrintButton'
import { getFeatures } from '@/lib/features'
import { T } from '@/lib/i18n'
export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false }, title: 'Invoice' }
const n = (x: number) => '₦' + Math.round(x || 0).toLocaleString('en-NG')
export default async function Invoice({ params, searchParams }: { params: Promise<{ key: string }>; searchParams: Promise<{ waybill?: string }> }) {
  const { key } = await params, { waybill } = await searchParams
  const [o, s, feat] = await Promise.all([client.fetch(`*[_type=="order" && viewKey==$key][0]`, { key }), getSettings(), getFeatures()])
  if (!o || !key) notFound()
  const vat = s?.vatPercent ? (o.total * s.vatPercent) / (100 + s.vatPercent) : 0
  const wb = !!waybill
  const intl = o.country && o.country !== 'Nigeria' ? `, ${o.country}` : ''
  return (<div className="wrap" style={{ maxWidth: 780, padding: '24px 20px', background: '#fff', color: '#111' }}>
    <style>{`@media print{.no-print,header,footer,.bar,.ticker{display:none!important}body{background:#fff}}.inv td,.inv th{padding:8px;border-bottom:1px solid #ddd;text-align:left}.inv .r{text-align:right}`}</style>
    <PrintButton pdfOn={feat.pdfInvoices} pdfHref={`/invoice/${key}/pdf`} />
    <h1 style={{ margin: 0 }}>{wb ? <T k="iv.waybill" /> : <T k="iv.invoice" />}</h1>
    <p><b>Elorge Technologies Limited</b> · RC 9521453<br />{s?.address}{s?.phone && <> · {s.phone}</>}{s?.email && <> · {s.email}</>}</p>
    <p><T k="iv.order" />: <b>{o.reference}</b><br /><T k="iv.date" />: {new Date(o.createdAt).toLocaleDateString('en-NG')} · <T k="iv.status" />: <b><T k={'st.' + o.status} /></b>{o.promoCode && <><br /><T k="iv.promo" />: <b>{o.promoCode}</b></>}</p>
    {o.logisticsPartner && <p><T k="iv.by" />: <b>{o.logisticsPartner}</b>{o.logisticsZone && <> · <T k="iv.zone" />: {o.logisticsZone}</>}{o.deliveryArea && <> · <T k="iv.area" />: {o.deliveryArea}</>}{o.etaText ? ` (${o.etaText})` : ''}</p>}
    <p><b>{wb ? <T k="iv.deliverTo" /> : <T k="iv.billed" />}:</b><br />{o.name} · {o.phone}<br />{o.delivery === 'pickup' ? <T k="iv.pickup" /> : `${o.address}, ${o.state}${intl}`}</p>
    <table className="inv" style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th><T k="iv.item" /></th><th className="r"><T k="iv.qty" /></th>{!wb && <th className="r"><T k="iv.amount" /></th>}</tr></thead><tbody>
      {(o.items || []).map((i: any, k: number) => <tr key={k}><td>{i.productName}{i.variant && ` (${i.variant})`}{i.mode === 'dozen' && <> – <T k="iv.pack" /></>}</td><td className="r">{i.quantity}</td>{!wb && <td className="r">{n(i.price * i.quantity)}</td>}</tr>)}</tbody></table>
    {!wb ? (<p className="r" style={{ textAlign: 'right' }}>{o.discount ? <><T k="c.disc" vars={{ code: o.couponCode }} />: -{n(o.discount)}<br /></> : null}<T k="c.delivery" />: {n(o.deliveryFee)}<br />{vat > 0 && <><T k="iv.vat" vars={{ n: s.vatPercent }} />: {n(vat)}<br /></>}<b style={{ fontSize: 20 }}><T k="iv.paid" />: {n(o.total)}</b>{o.payCurrency && o.payCurrency !== 'NGN' && <><br /><T k="iv.charged" />: {o.payCurrency} {o.payAmount}</>}</p>)
      : (<div style={{ marginTop: 30 }}><p><T k="iv.carrier" />: {o.carrier || '____________________'}</p><p><T k="iv.received" />: ____________________ <T k="iv.signature" />: ____________ <T k="iv.date" />: ________</p></div>)}
  </div>)
}
