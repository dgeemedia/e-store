import { NextResponse } from 'next/server'
import { client, getActivePromo, withPromo, P } from '@/lib/sanity'
import { getFeatures } from '@/lib/features'
const PAGE = 24
/** Server-side search + paging (used only when the "Server-side search and paging" switch is on). */
export async function GET(req: Request) {
  if (!(await getFeatures()).serverSearch) return NextResponse.json({ error: 'off' }, { status: 404 })
  const u = new URL(req.url), g = (k: string) => u.searchParams.get(k) || ''
  const q = g('q').trim().slice(0, 60).replace(/[^\p{L}\p{N} -]/gu, ''), page = Math.max(0, parseInt(g('page')) || 0)
  const filter = `_type=="product" && active!=false && ($cat=="" || category==$cat) && ($brand=="" || brand->name==$brand) && ($q=="" || name match $q || category match $q || brand->name match $q)`
  const order = g('sort') === 'low' ? 'unitPrice asc' : g('sort') === 'high' ? 'unitPrice desc' : 'featured desc, _createdAt desc'
  const params = { cat: g('cat').slice(0, 60), brand: g('brand').slice(0, 80), q: q.split(' ').filter(Boolean).map((w) => w + '*').join(' '), from: page * PAGE, to: page * PAGE + PAGE }
  const [items, total, promo] = await Promise.all([client.fetch(`*[${filter}] | order(${order})[$from...$to]{${P}}`, params), client.fetch(`count(*[${filter}])`, params), getActivePromo()])
  return NextResponse.json({ items: withPromo(items, promo), total })
}
