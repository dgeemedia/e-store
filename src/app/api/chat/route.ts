import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanity'
import { telegram } from '@/lib/notify'
import { pullReplies } from '@/lib/chat'
const CID = /^[a-f0-9]{24}$/
const s = (v: any, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '')
/** Visitor polls for new messages. The conversation id is a random secret held only by that browser. */
export async function GET(req: Request) {
  const u = new URL(req.url), cid = u.searchParams.get('cid') || '', after = u.searchParams.get('after') || '1970-01-01T00:00:00Z'
  if (!CID.test(cid)) return NextResponse.json({ messages: [] })
  if (process.env.TELEGRAM_POLL === 'true') await pullReplies().catch(() => {})
  const messages = await writeClient.fetch(`*[_type=="chatMessage" && cid==$cid && createdAt>$after] | order(createdAt asc)[0...50]{_id,sender,text,createdAt}`, { cid, after })
  return NextResponse.json({ messages })
}
/** Visitor sends a message: saved in Sanity and forwarded to your Telegram, tagged #xxxxxx so your Reply finds its way back. */
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}))
  if (b.website) return NextResponse.json({ ok: true })
  const cid = String(b.cid || ''), name = s(b.name, 60), phone = s(b.phone, 30), text = s(b.text, 600)
  if (!CID.test(cid) || !name || phone.replace(/\D/g, '').length < 10 || !text) return NextResponse.json({ error: 'Please enter your name, a phone number and a message.' }, { status: 400 })
  const since = new Date(Date.now() - 60000).toISOString()
  const [mine, all] = await Promise.all([
    writeClient.fetch(`count(*[_type=="chatMessage" && sender=="visitor" && cid==$cid && createdAt>$since])`, { cid, since }),
    writeClient.fetch(`count(*[_type=="chatMessage" && sender=="visitor" && createdAt>$since])`, { since }),
  ])
  if (mine >= 6 || all >= 40) return NextResponse.json({ error: 'Too many messages. Please wait a moment.' }, { status: 429 })
  const createdAt = new Date().toISOString()
  const doc = await writeClient.create({ _type: 'chatMessage', cid, sender: 'visitor', name, phone, text, createdAt })
  await telegram(`#${cid.slice(0, 6)} ${name}${phone ? ' · ' + phone : ''}\n${text}\n\n(Reply to this message to answer on the site)`)
  return NextResponse.json({ ok: true, message: { _id: doc._id, sender: 'visitor', text, createdAt } })
}
