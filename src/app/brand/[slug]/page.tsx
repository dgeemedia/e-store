import { notFound } from 'next/navigation'
import { getBrand, getActivePromo, withPromo, urlFor } from '@/lib/sanity'
import ProductCard from '@/components/ProductCard'
import Share from '@/components/Share'
export const revalidate = 60
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params, b = await getBrand(slug)
  if (!b) return {}
  const description = (b.about || b.tagline || `Shop ${b.name} products at factory-direct prices.`).slice(0, 155)
  return { title: `${b.name} products at factory prices`, description, alternates: { canonical: `/brand/${slug}` } }
}
export default async function Brand({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [b, promo] = await Promise.all([getBrand(slug), getActivePromo()])
  if (!b) notFound()
  return (<div className="wrap"><section className="hero" style={{ paddingBottom: 10 }}>
    {b.logo && <img src={urlFor(b.logo).height(120).url()} height={60} alt="" />}
    <h1 style={{ fontSize: 'clamp(30px,5vw,52px)' }}>{b.name}</h1>{b.sponsored && <span className="pill">Partner</span>}<p>{b.tagline}</p><p>{b.about}</p><Share title={`${b.name} on Elorge Store`} /></section>
    <h3 className="sec">Products</h3><div className="grid">{withPromo(b.products, promo).map((p: any) => <ProductCard key={p._id} p={p} />)}</div></div>)
}
