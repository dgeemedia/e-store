import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanity'
import { telegram } from '@/lib/notify'
const ok = () => NextResponse.json({ ok: true })
/** Telegram calls this when you (or your staff group) message the bot. A reply to a tagged visitor message becomes the answer on the site. */
export async function POST(req: Request) {
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || req.headers.get('x-telegram-bot-api-secret-token') !== process.env.TELEGRAM_WEBHOOK_SECRET) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const u = await req.json().catch(() => ({})), m = u.message
  if (!m?.text || String(m.chat?.id) !== String(process.env.TELEGRAM_CHAT_ID)) return ok() // only you / your staff group
  const tag = /^#([a-f0-9]{6})\b/.exec(m.reply_to_message?.text || '')?.[1]
  if (!tag) { await telegram('To answer a visitor, long-press their message and tap Reply.'); return ok() }
  const cid = await (writeClient as any).fetch(`*[_type=="chatMessage" && string::startsWith(cid, $tag)][0].cid`, { tag })
  if (!cid) { await telegram('That conversation was not found.'); return ok() }
  await writeClient.create({ _type: 'chatMessage', cid, sender: 'owner', text: String(m.text).slice(0, 1000), createdAt: new Date().toISOString() })
  return ok()
}
