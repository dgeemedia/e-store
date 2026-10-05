import { getSettings } from './sanity'
/** Feature switches live in Studio > Site Settings > Feature switches. Everything defaults to OFF ("coming soon"). */
export const FEATURES = ['phoneLogin', 'pdfInvoices', 'serverSearch', 'courierLinks', 'intlDelivery', 'logistics'] as const
export type Features = Record<(typeof FEATURES)[number], boolean>
export async function getFeatures(): Promise<Features> {
  const s = await getSettings()
  return Object.fromEntries(FEATURES.map((k) => [k, !!s?.features?.[k]])) as Features
}
