import { NextResponse } from 'next/server'
import { randomInt } from 'crypto'
import { writeClient } from '@/lib/sanity'
import { sendSms } from '@/lib/sms'
import { getFeatures } from '@/lib/features'
import { hash, normPhone } from '@/lib/customer'
import { ts, normLang } from '@/lib/tserver'
export async function POST(req: Request) {
  if (!(await getFeatures()).phoneLogin) return NextResponse.json({ error: 'Phone login is coming soon. Please use email or Google for now.' }, { status: 503 })
  const b = await req.json().catch(() => ({})), phone = normPhone(String(b.phone || ''))
  if (!/^234\d{10}$/.test(phone)) return NextResponse.json({ error: 'Please enter a valid Nigerian phone number.' }, { status: 400 })
  const id = `logincode-${hash(phone).slice(0, 32)}`, since = new Date(Date.now() - 3600000).toISOString()
  const [old, hourly]: any[] = await Promise.all([writeClient.getDocument(id), writeClient.fetch(`count(*[_type=="loginCode" && kind=="phone" && createdAt>$since])`, { since })])
  if (old && Date.now() - new Date(old.createdAt).getTime() < 60000) return NextResponse.json({ error: 'Please wait a minute before asking for another code.' }, { status: 429 })
  if (hourly >= 100) return NextResponse.json({ error: 'Too many requests right now. Please try again later or use email.' }, { status: 429 })
  const code = String(randomInt(100000, 1000000))
  await writeClient.createOrReplace({ _id: id, _type: 'loginCode', kind: 'phone', codeHash: hash(code + phone + process.env.AUTH_SECRET), createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 10 * 60000).toISOString(), tries: 0 })
  const sent = await sendSms(phone, ts(normLang(b.lang), 'em.sms', { code }))
  if (!sent) return NextResponse.json({ error: 'We could not send the SMS right now. Please use email or Google.' }, { status: 503 })
  return NextResponse.json({ ok: true })
}
