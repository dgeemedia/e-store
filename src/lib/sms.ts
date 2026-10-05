/** SMS through Termii. Check Termii's current docs for the endpoint, sender-ID registration and channel rules. True when the API accepted the message. */
export async function sendSms(to: string, message: string) {
  const key = process.env.TERMII_API_KEY
  if (!key) return false
  const r = await fetch('https://api.ng.termii.com/api/sms/send', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, from: process.env.TERMII_SENDER_ID || 'Elorge', sms: message, type: 'plain', channel: process.env.TERMII_CHANNEL || 'generic', api_key: key }) }).catch(() => null)
  return !!r?.ok
}
