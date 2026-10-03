import { client, urlFor, getActivePromo, withPromo } from '@/lib/sanity'
export const revalidate = 3600
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://elorgestore.org'
const MAP: Record<string, string> = { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }
const x = (v: any) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/[<>&'"]/g, (c) => MAP[c])
/** Product feed for Meta (Facebook/Instagram) Commerce Manager and Google Merchant Center. */
export async function GET() {
  const [products, promo] = await Promise.all([
    client.fetch(`*[_type=="product" && active!=false][0...1000]{_id,name,"slug":slug.current,description,images,category,unitPrice,stockUnits,"brand":brand->name}`),
    getActivePromo(),
  ])
  const items = withPromo(products, promo).filter((p: any) => p.unitPrice && p.images?.length && p.slug).map((p: any) => {
    const img = (i: any) => urlFor(i).width(1000).height(1000).url()
    const extra = p.images.slice(1, 6).map((i: any) => `<g:additional_image_link>${x(img(i))}</g:additional_image_link>`).join('')
    return `<item><g:id>${x(p._id)}</g:id><g:title>${x(String(p.name).slice(0, 150))}</g:title><g:description>${x(String(p.description || p.name).slice(0, 5000))}</g:description><g:link>${x(`${SITE}/product/${p.slug}`)}</g:link><g:image_link>${x(img(p.images[0]))}</g:image_link>${extra}<g:availability>${p.stockUnits === 0 ? 'out of stock' : 'in stock'}</g:availability><g:condition>new</g:condition><g:price>${Number(p.unitPrice).toFixed(2)} NGN</g:price>${p.promoUnitPrice ? `<g:sale_price>${Number(p.promoUnitPrice).toFixed(2)} NGN</g:sale_price>` : ''}<g:brand>${x(p.brand || 'Elorge Store')}</g:brand>${p.category ? `<g:product_type>${x(p.category)}</g:product_type>` : ''}<g:identifier_exists>no</g:identifier_exists></item>`
  })
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>Elorge Store</title><link>${SITE}</link><description>Elorge Store product feed</description>${items.join('')}</channel></rss>`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600' } })
}
