import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getFeatures } from '@/lib/features'
import { T } from '@/lib/i18n'
import LoginForm from '@/components/LoginForm'
export const metadata = { title: 'Sign in', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'
export default async function Login() {
  if ((await auth())?.user?.email) redirect('/account')
  const f = await getFeatures()
  return <div className="wrap" style={{ padding: '30px 20px' }}><h1><T k="lo.title" /></h1><p style={{ color: 'var(--mute)' }}><T k="lo.sub" /></p><LoginForm google={!!process.env.AUTH_GOOGLE_ID} facebook={!!process.env.AUTH_FACEBOOK_ID} phoneOn={f.phoneLogin} /></div>
}
