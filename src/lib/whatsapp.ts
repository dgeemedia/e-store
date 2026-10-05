import { normPhone as norm } from './customer'
/** WhatsApp Cloud API template message. Only call for customers who ticked the opt-in box. Never throws. */
export async function sendWhatsApp(phone: string, template: string, params: string[]) {
  const { WHATSAPP_TOKEN: t, WHATSAPP_PHONE_ID: id } = process.env
  if (!t || !id || !phone) return
  try {
    await fetch(`https://graph.facebook.com/v21.0/${id}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: norm(phone), type: 'template', template: { name: template, language: { code: process.env.WHATSAPP_LANG || 'en' }, components: [{ type: 'body', parameters: params.map((x) => ({ type: 'text', text: String(x).slice(0, 200) })) }] } }) })
  } catch (e) { console.error('whatsapp failed', e) }
}
