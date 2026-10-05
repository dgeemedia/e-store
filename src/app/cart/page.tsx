import { client, getSettings } from '@/lib/sanity'
import CartClient from '@/components/CartClient'
export const revalidate = 60
export default async function Cart() {
  const s = (await getSettings()) || {}
  const logisticsOn = !!s.features?.logistics
  const partners = logisticsOn ? await client.fetch(`*[_type=="deliveryPartner" && active!=false] | order(sortOrder asc){_id,name,kind,vehicle,minKg,coverage,feeLagos,feeOther,perKg,maxKg,freeAbove,etaText,zones[]{name,match,fee,perKg,etaText,bands[]{upToKg,fee}}}`) : []
  return <CartClient fees={{ lagos: s.deliveryFeeLagos ?? 3000, other: s.deliveryFeeOther ?? 8000, perKgLagos: s.perKgLagos ?? 0, perKgOther: s.perKgOther ?? 0, free: s.freeDeliveryAbove, threshold: s.truckloadThreshold ?? 2e6, currencies: s.currencies || [], intlRates: s.intlRates || [], intlOn: !!s.features?.intlDelivery, logisticsOn, partners }} />
}
