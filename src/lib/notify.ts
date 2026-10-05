import { sendMail } from './mail'
/** Instant alerts to the owner: Telegram (free, phone push) and/or email. Never throws. */
export async function notify(text: string) {
  const jobs: Promise<any>[] = []
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) jobs.push(fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }) }))
  if (process.env.OWNER_EMAIL) jobs.push(sendMail({ to: process.env.OWNER_EMAIL, subject: text.split('\n')[0].slice(0, 120), text }))
  await Promise.allSettled(jobs)
}
/** Telegram-only message (used by live chat so it never emails you per message). */
export async function telegram(text: string) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }) }).catch(() => {})
}
