import { NextResponse } from 'next/server'
import { randomInt } from 'crypto'
import { writeClient } from '@/lib/sanity'
import { sendMail } from '@/lib/mail'
import { hash } from '@/lib/customer'
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({})), email = String(b.email || '').trim().toLowerCase()
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 120) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  const id = `logincode-${hash(email).slice(0, 32)}`
  const old: any = await writeClient.getDocument(id)
  if (old && Date.now() - new Date(old.createdAt).getTime() < 45000) return NextResponse.json({ error: 'Please wait a moment before asking for another code.' }, { status: 429 })
  const code = String(randomInt(100000, 1000000))
  await writeClient.createOrReplace({ _id: id, _type: 'loginCode', codeHash: hash(code + email + process.env.AUTH_SECRET), createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 10 * 60000).toISOString(), tries: 0 })
  const sent = await sendMail({ to: email, subject: `Your Elorge Store login code: ${code}`, html: `<div style="font-family:sans-serif"><p>Your login code is</p><p style="font-size:32px;letter-spacing:6px"><b>${code}</b></p><p>It expires in 10 minutes. If you did not ask for it, ignore this email.</p></div>` })
  if (!sent) return NextResponse.json({ error: 'We could not send the email right now. Try Google sign-in or try again later.' }, { status: 503 })
  return NextResponse.json({ ok: true })
}
