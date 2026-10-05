import { createHash } from 'crypto'
export const customerId = (email: string) => `customer-${createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 32)}`
export const hash = (s: string) => createHash('sha256').update(s).digest('hex')
/** Nigerian number to international form (234...). */
export const normPhone = (p: string) => { let d = String(p || '').replace(/\D/g, ''); if (d.startsWith('00')) d = d.slice(2); if (d.startsWith('0')) d = '234' + d.slice(1); else if (d.length === 10) d = '234' + d; return d }
/** Phone-login accounts get a placeholder address so the rest of the site can treat them like any customer. */
export const phoneEmail = (p: string) => `${normPhone(p)}@phone.elorge.local`
export const isPhoneEmail = (e: string) => e.endsWith('@phone.elorge.local')
