import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { getProduct, getActivePromo, withPromo, urlFor, getReviews, getRelated } from '@/lib/sanity'
import BuyBox from '@/components/BuyBox'
import { T, L } from '@/lib/i18n'
import Gallery from '@/components/Gallery'
import Share from '@/components/Share'
import ReviewForm from '@/components/ReviewForm'
import ProductCard from '@/components/ProductCard'
export const revalidate = 30
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://elorgestore.org'
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params, p = await getProduct(slug)
  if (!p) return {}
  const title = `${p.name}${p.brand?.name ? ' by ' + p.brand.name : ''} - factory price`
  const description = (p.description || `Buy ${p.name} at factory-direct prices in Nigeria. Per unit or in packs, with warranty.`).slice(0, 155)
  return { title, description, alternates: { canonical: `/product/${slug}` }, openGraph: { title, description, images: [urlFor(p.images[0]).width(1200).height(630).url()] } }
}
export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [raw, promo] = await Promise.all([getProduct(slug), getActivePromo()])
  if (!raw) notFound()
  const [p] = withPromo([raw], promo)
  const [reviews, relatedRaw] = await Promise.all([getReviews(p._id), getRelated(p.category, p._id)])
  const related = withPromo(relatedRaw, promo)
  const avg = reviews.length ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length : 0
  const imgs = p.images.map((i: any) => ({ big: urlFor(i).width(900).url(), thumb: urlFor(i).width(120).height(120).url() }))
  const ld = { '@context': 'https://schema.org', '@type': 'Product', sku: slug, url: `${SITE}/product/${slug}`, name: p.name, image: imgs.map((i: any) => i.big), description: p.description, category: p.category, ...(p.brand?.name ? { brand: { '@type': 'Brand', name: p.brand.name } } : {}),
    ...(reviews.length ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: avg.toFixed(1), reviewCount: reviews.length } } : {}),
    offers: { '@type': 'Offer', url: `${SITE}/product/${slug}`, priceCurrency: 'NGN', price: p.promoUnitPrice ?? p.unitPrice, availability: p.stockUnits === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock' } }
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ name: 'Home', url: SITE }, ...(p.category ? [{ name: p.category, url: `${SITE}/?q=${encodeURIComponent(p.category)}` }] : []), { name: p.name, url: `${SITE}/product/${slug}` }].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })) }
  return (<>
    <div className="wrap pdp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <Gallery imgs={imgs} alt={p.name} />
      <div><small>{p.brand?.name} · {p.category}</small><h1 style={{ margin: '6px 0 8px', letterSpacing: '-.03em' }}><L en={p.name} zh={p.nameZh} fr={p.nameFr} /></h1>
        {!!reviews.length && <div style={{ color: '#e6a100', marginBottom: 6 }}>{'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))} <small style={{ color: 'var(--mute)' }}>{avg.toFixed(1)} ({reviews.length})</small></div>}
        <p style={{ color: 'var(--mute)' }}><L en={p.description} zh={p.descriptionZh} fr={p.descriptionFr} /></p>
        <BuyBox p={p} image={urlFor(p.images[0]).width(120).height(120).url()} />
        <div style={{ marginTop: 14 }}><Share title={p.name} /></div></div>
    </div>
    <div className="wrap" style={{ maxWidth: 860 }}>
      {!!p.body?.length && <section className="prose"><h3><T k="pp.about" /></h3><PortableText value={p.body} /></section>}
      {!!p.specs?.length && <section><h3><T k="pp.specs" /></h3><table className="specs"><tbody>{p.specs.map((s: any, i: number) => <tr key={i}><th>{s.label}</th><td>{s.value}</td></tr>)}</tbody></table></section>}
      <section><h3><T k="pp.reviews" /></h3>
        {reviews.map((r: any, i: number) => <div key={i} className="review"><span style={{ color: '#e6a100' }}>{'★'.repeat(r.rating)}</span> <b>{r.name}</b><p style={{ margin: '4px 0' }}>{r.comment}</p></div>)}
        {!reviews.length && <p style={{ color: 'var(--mute)' }}><T k="pp.noRev" /></p>}
        <ReviewForm productId={p._id} /></section>
    </div>
    {!!related.length && <div className="wrap"><h3 className="sec"><T k="pp.also" /></h3><div className="grid">{related.map((r: any) => <ProductCard key={r._id} p={r} />)}</div></div>}
  </>)
}
