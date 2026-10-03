import type { MetadataRoute } from 'next'
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://elorgestore.org'
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/studio', '/api', '/cart', '/track'] }], sitemap: `${SITE}/sitemap.xml` }
}
