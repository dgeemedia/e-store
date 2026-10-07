import { normPhone as norm } from './customer'
// Meta approves each template per language: create the same template name in en, zh_CN and fr.
const CODE: Record<string, string> = { en: 'en', zh: 'zh_CN', fr: 'fr' }
async function post(to: string, template: string, params: string[], code: string) {
  const { WHATSAPP_TOKEN: t, WHATSAPP_PHONE_ID: id } = process.env
  const r = await fetch(`https://graph.facebook.com/v21.0/${id}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'template', template: { name: template, language: { code }, components: [{ type: 'body', parameters: params.map((x) => ({ type: 'text', text: String(x).slice(0, 200) })) }] } }) }).catch(() => null)
  return !!r?.ok
}
/** WhatsApp Cloud API template message in the buyer's language (falls back to English if that translation is not approved yet). Only call for customers who ticked the opt-in box. Never throws. */
export async function sendWhatsApp(phone: string, template: string, params: string[], lang = 'en') {
  const { WHATSAPP_TOKEN: t, WHATSAPP_PHONE_ID: id } = process.env
  if (!t || !id || !phone) return
  try {
    const base = process.env.WHATSAPP_LANG || 'en', first = CODE[lang] || base, to = norm(phone)
    if (!(await post(to, template, params, first)) && first !== base) await post(to, template, params, base)
  } catch (e) { console.error('whatsapp failed', e) }
}
