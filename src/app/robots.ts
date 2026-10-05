import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://elorgestore.org').replace(/\/$/, '')
/** Live site: allow everything public, block private areas and duplicate search URLs. Test sites (*.vercel.app, localhost): block everything so they never compete with the real site. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = ((await headers()).get('host') || '').toLowerCase()
  if (/vercel\.app$|^localhost/.test(host)) return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/studio', '/api/', '/cart', '/track', '/account', '/invoice/', '/*?q=', '/*?paid='] }],
    sitemap: `${SITE}/sitemap.xml`,
  }
}
