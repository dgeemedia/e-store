import { getSettings } from '@/lib/sanity'
import CartClient from '@/components/CartClient'
export const revalidate = 60
export default async function Cart() {
  const s = (await getSettings()) || {}
  return <CartClient fees={{ lagos: s.deliveryFeeLagos ?? 3000, other: s.deliveryFeeOther ?? 8000, perKgLagos: s.perKgLagos ?? 0, perKgOther: s.perKgOther ?? 0, free: s.freeDeliveryAbove, threshold: s.truckloadThreshold ?? 2e6 }} />
}
