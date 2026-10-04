import { NextResponse } from 'next/server'
import { handleOwnerMessage } from '@/lib/chat'
/** Telegram calls this when you (or your staff group) message the bot. A reply to a tagged visitor message becomes the answer on the site. */
export async function POST(req: Request) {
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || req.headers.get('x-telegram-bot-api-secret-token') !== process.env.TELEGRAM_WEBHOOK_SECRET) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const u = await req.json().catch(() => ({}))
  await handleOwnerMessage(u.message)
  return NextResponse.json({ ok: true })
}
