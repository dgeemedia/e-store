import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import Credentials from 'next-auth/providers/credentials'
import { writeClient } from '@/lib/sanity'
import { hash, normPhone, phoneEmail } from '@/lib/customer'
import { getFeatures } from '@/lib/features'
const providers: any[] = [
  // Email + 6-digit code (sent by /api/login-code). Codes are stored hashed, expire in 10 minutes, and lock after 5 wrong tries.
  Credentials({ id: 'code', name: 'Email code', credentials: { email: {}, code: {} },
    async authorize(c) {
      const email = String(c?.email || '').trim().toLowerCase(), code = String(c?.code || '').trim()
      if (!email || !/^\d{6}$/.test(code)) return null
      const id = `logincode-${hash(email).slice(0, 32)}`
      const d: any = await writeClient.getDocument(id)
      if (!d || new Date(d.expiresAt).getTime() < Date.now() || (d.tries || 0) >= 5) return null
      if (d.codeHash !== hash(code + email + process.env.AUTH_SECRET)) { await writeClient.patch(id).setIfMissing({ tries: 0 }).inc({ tries: 1 }).commit(); return null }
      await writeClient.delete(id)
      return { id: email, email, name: email.split('@')[0] }
    } }),
]
// Phone + SMS code. Only works when the "Phone-number login" switch is ON in Site Settings.
providers.push(Credentials({ id: 'phone', name: 'Phone code', credentials: { phone: {}, code: {} },
  async authorize(c) {
    const phone = normPhone(String(c?.phone || '')), code = String(c?.code || '').trim()
    if (!/^234\d{10}$/.test(phone) || !/^\d{6}$/.test(code) || !(await getFeatures()).phoneLogin) return null
    const id = `logincode-${hash(phone).slice(0, 32)}`
    const d: any = await writeClient.getDocument(id)
    if (!d || new Date(d.expiresAt).getTime() < Date.now() || (d.tries || 0) >= 5) return null
    if (d.codeHash !== hash(code + phone + process.env.AUTH_SECRET)) { await writeClient.patch(id).setIfMissing({ tries: 0 }).inc({ tries: 1 }).commit(); return null }
    await writeClient.delete(id)
    return { id: phone, email: phoneEmail(phone), name: phone }
  } }))
if (process.env.AUTH_GOOGLE_ID) providers.push(Google)
if (process.env.AUTH_FACEBOOK_ID) providers.push(Facebook)
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers, session: { strategy: 'jwt', maxAge: 30 * 24 * 3600 }, pages: { signIn: '/account/login' }, trustHost: true,
  callbacks: { signIn: ({ user }) => !!user.email },
})
