import LogisticsForm from '@/components/LogisticsForm'
export const metadata = { title: 'Deliver for Elorge Store: logistics partner application', description: 'Logistics companies, riders, truck and air-cargo operators: apply to deliver Elorge Store orders.' }
export default function Logistics() {
  return (<div className="wrap" style={{ padding: '30px 20px', maxWidth: 720 }}>
    <h1 style={{ letterSpacing: '-.03em' }}>Deliver for Elorge Store</h1>
    <p style={{ color: 'var(--mute)' }}>Dispatch riders, courier companies, van, bus, truck and trailer operators, and air-cargo handlers: apply to become a delivery partner. If approved, customers can choose you at checkout, priced by the zones and weights we agree.</p>
    <LogisticsForm />
  </div>)
}
