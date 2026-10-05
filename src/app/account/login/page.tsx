import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getFeatures } from '@/lib/features'
import LoginForm from '@/components/LoginForm'
export const metadata = { title: 'Sign in', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'
export default async function Login() {
  if ((await auth())?.user?.email) redirect('/account')
  const f = await getFeatures()
  return <div className="wrap" style={{ padding: '30px 20px' }}><h1>Sign in to Elorge Store</h1><p style={{ color: 'var(--mute)' }}>See your orders, reorder in one tap and save delivery addresses.</p><LoginForm google={!!process.env.AUTH_GOOGLE_ID} facebook={!!process.env.AUTH_FACEBOOK_ID} phoneOn={f.phoneLogin} /></div>
}
