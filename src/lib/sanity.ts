import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
const cfg = { projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production', apiVersion: '2024-10-01' }
export const client = createClient({ ...cfg, useCdn: false, perspective: 'published' })
export const writeClient = createClient({ ...cfg, useCdn: false, token: process.env.SANITY_API_TOKEN })
export const urlFor = (src: any) => imageUrlBuilder(cfg).image(src)

export const P = `_id, name, nameZh, nameFr, descriptionZh, descriptionFr, "slug": slug.current, category, images, description, unitPrice, dozenPrice, packSize, packLabel, weightKg, options, soldUnits, "rating": math::avg(*[_type=="review" && product._ref==^._id && approved==true].rating), "reviewCount": count(*[_type=="review" && product._ref==^._id && approved==true]), tiers, warrantyMonths, stockUnits, featured, dispatchTime, "brand": brand->{name, tagline, logo, sponsored, "slug": slug.current}`
export const getSettings = () => client.fetch(`*[_type=="siteSettings"][0]{..., "introVideoUrl": introVideo.asset->url}`)
export const getActivePromo = () => client.fetch(`*[_type=="promo" && startsAt<=now() && endsAt>=now()] | order(endsAt asc)[0]{title, badge, startsAt, endsAt, banner, items[]{limitPerCustomer, promoUnitPrice, promoDozenPrice, "productId": product._ref}}`)
export const getProducts = () => client.fetch(`*[_type=="product" && active!=false] | order(featured desc, _createdAt desc)[0...300]{${P}}`)
export const getProduct = (slug: string) => client.fetch(`*[_type=="product" && slug.current==$slug][0]{${P}, body, specs}`, { slug })
export const getBrands = () => client.fetch(`*[_type=="brand"] | order(featured desc, name asc){name, tagline, logo, sponsored, "slug": slug.current}`)

/** Overlay the active flash-sale price onto products */
export function withPromo(products: any[], promo: any) {
  const m = new Map((promo?.items || []).map((i: any) => [i.productId, i]))
  return products.map((p) => {
    const i: any = m.get(p._id)
    return i ? { ...p, promoUnitPrice: i.promoUnitPrice, promoDozenPrice: i.promoDozenPrice, promoBadge: promo?.badge } : p
  })
}
export const getBrand = (slug: string) => client.fetch(`*[_type=="brand" && slug.current==$slug][0]{name, tagline, about, logo, sponsored, "products": *[_type=="product" && active!=false && references(^._id)] | order(featured desc){${P}}}`, { slug })

export async function getLightning() {
  const d = await client.fetch(`*[_type=="lightning" && active!=false && startsAt<=now() && endsAt>=now()] | order(endsAt asc)[0]{_id,title,dealPrice,endsAt,units,holdMinutes,"product":product->{_id,name,"slug":slug.current,images,unitPrice}}`)
  if (!d?.product?.images?.length) return null
  const taken = await client.fetch(`count(*[_type=="claim" && deal==$id && (status=="paid" || (status=="held" && expiresAt>now()))])`, { id: d._id })
  return { ...d, left: Math.max(0, d.units - taken) }
}
export const getReviews = (id: string) => client.fetch(`*[_type=="review" && product._ref==$id && approved==true] | order(createdAt desc)[0...20]{name, rating, comment, createdAt}`, { id })
export const getRelated = (category: string, id: string) => client.fetch(`*[_type=="product" && active!=false && category==$category && _id!=$id][0...4]{${P}}`, { category: category || '', id })
