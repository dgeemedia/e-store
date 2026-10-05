import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'
import { LEGAL } from '@/lib/legal'
export const revalidate = 3600
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://elorgestore.org').replace(/\/$/, '')
/** Every public page. Products and sellers are read from Sanity, so new ones appear within the hour. Private pages (cart, account, invoices, API, Studio) are left out on purpose. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const pages: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/quote`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/sell`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/logistics`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    ...Object.keys(LEGAL).map((slug) => ({ url: `${SITE}/legal/${slug}`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.3 })),
  ]
  try {
    const [products, brands] = await Promise.all([
      client.fetch(`*[_type=="product" && active!=false && defined(slug.current)]{"slug":slug.current,_updatedAt}`),
      client.fetch(`*[_type=="brand" && defined(slug.current)]{"slug":slug.current,_updatedAt}`),
    ])
    return [
      ...pages,
      ...products.map((p: any) => ({ url: `${SITE}/product/${p.slug}`, lastModified: p._updatedAt, changeFrequency: 'weekly' as const, priority: 0.8 })),
      ...brands.map((b: any) => ({ url: `${SITE}/brand/${b.slug}`, lastModified: b._updatedAt, changeFrequency: 'weekly' as const, priority: 0.7 })),
    ]
  } catch { return pages } // if Sanity is unreachable, still serve the static pages
}
