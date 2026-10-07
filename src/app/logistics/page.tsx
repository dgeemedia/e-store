import LogisticsForm from '@/components/LogisticsForm'
import { T } from '@/lib/i18n'
export const metadata = { title: 'Deliver for Elorge Store: logistics partner application', description: 'Logistics companies, riders, truck and air-cargo operators: apply to deliver Elorge Store orders.' }
export default function Logistics() {
  return (<div className="wrap" style={{ padding: '30px 20px', maxWidth: 720 }}>
    <h1 style={{ letterSpacing: '-.03em' }}><T k="lg.title" /></h1>
    <p style={{ color: 'var(--mute)' }}><T k="lg.intro" /></p>
    <LogisticsForm />
  </div>)
}
