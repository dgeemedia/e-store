import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://elorgestore.org'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, brands] = await Promise.all([
    client.fetch(`*[_type=="product" && active!=false]{"slug":slug.current,_updatedAt}`),
    client.fetch(`*[_type=="brand"]{"slug":slug.current,_updatedAt}`),
  ])
  return [
    { url: SITE, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/quote`, changeFrequency: 'monthly', priority: 0.8 },
    ...products.map((p: any) => ({ url: `${SITE}/product/${p.slug}`, lastModified: p._updatedAt, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...brands.map((b: any) => ({ url: `${SITE}/brand/${b.slug}`, lastModified: b._updatedAt, changeFrequency: 'weekly' as const, priority: 0.7 })),
  ]
}
