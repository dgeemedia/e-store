/** Sends email through Brevo first (free plan: 300/day), then falls back to Resend. Never throws. */
export async function sendMail({ to, subject, html, text }: { to: string; subject: string; html?: string; text?: string }) {
  const from = process.env.EMAIL_FROM || 'Elorge Store <orders@yourdomain.com>'
  const m = /^(.*)<(.+)>$/.exec(from), name = (m?.[1] || 'Elorge Store').trim(), email = (m?.[2] || from).trim()
  if (process.env.BREVO_API_KEY) {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', { method: 'POST', headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ sender: { name, email }, to: [{ email: to }], subject, ...(html ? { htmlContent: html } : { textContent: text || subject }) }) }).catch(() => null)
    if (r?.ok) return true
  }
  if (process.env.RESEND_API_KEY) {
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to, subject, ...(html ? { html } : { text }) }) }).catch(() => null)
    return !!r?.ok
  }
  return false
}
