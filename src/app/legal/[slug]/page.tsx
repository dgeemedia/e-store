import { notFound } from 'next/navigation'
import { LEGAL } from '@/lib/legal'
export const generateStaticParams = () => Object.keys(LEGAL).map((slug) => ({ slug }))
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return { title: LEGAL[slug]?.title || 'Legal' } }
export default async function Legal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params, d = LEGAL[slug]
  if (!d) notFound()
  return (<div className="wrap prose" style={{ maxWidth: 760, padding: '30px 20px' }}><h1>{d.title}</h1><small>Elorge Technologies Limited · RC 9521453</small>
    {d.sections.map(([h, t]) => <section key={h}><h3>{h}</h3><p>{t}</p></section>)}</div>)
}
