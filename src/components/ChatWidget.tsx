'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
const rid = () => Array.from(crypto.getRandomValues(new Uint8Array(12))).map((b) => b.toString(16).padStart(2, '0')).join('')
export default function ChatWidget() {
  const path = usePathname()
  const [open, setOpen] = useState(false), [cid, setCid] = useState(''), [name, setName] = useState(''), [phone, setPhone] = useState(''), [text, setText] = useState('')
  const [msgs, setMsgs] = useState<any[]>([]), [err, setErr] = useState(''), [unread, setUnread] = useState(0), [used, setUsed] = useState(false)
  const last = useRef(''), openRef = useRef(false), box = useRef<HTMLDivElement>(null)
  openRef.current = open
  useEffect(() => {
    let id = localStorage.getItem('elorge-chat-id')
    if (!id) { id = rid(); localStorage.setItem('elorge-chat-id', id) }
    setCid(id); setName(localStorage.getItem('elorge-chat-name') || ''); setPhone(localStorage.getItem('elorge-chat-phone') || ''); setUsed(!!localStorage.getItem('elorge-chat-used'))
  }, [])
  async function poll(id: string) {
    if (document.hidden || (!openRef.current && !localStorage.getItem('elorge-chat-used'))) return
    const r = await fetch(`/api/chat?cid=${id}&after=${encodeURIComponent(last.current)}`).then((x) => x.json()).catch(() => null)
    if (!r?.messages?.length) return
    last.current = r.messages[r.messages.length - 1].createdAt
    setMsgs((m) => { const seen = new Set(m.map((x) => x._id)), add = r.messages.filter((x: any) => !seen.has(x._id)); if (!openRef.current) setUnread((u) => u + add.filter((x: any) => x.sender === 'owner').length); return [...m, ...add] })
  }
  useEffect(() => { if (!cid) return; poll(cid); const t = setInterval(() => poll(cid), open ? 4000 : 20000); return () => clearInterval(t) }, [cid, open])
  useEffect(() => { box.current?.scrollTo(0, box.current.scrollHeight) }, [msgs, open])
  async function send() {
    const t = text.trim()
    if (!t) return
    if (!name.trim()) return setErr('Please enter your name.')
    if (phone.replace(/\D/g, '').length < 10) return setErr('Please enter your phone number so we can reach you.')
    setErr(''); setText(''); localStorage.setItem('elorge-chat-name', name); localStorage.setItem('elorge-chat-phone', phone)
    const r = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ cid, name, phone, text: t }) }), d = await r.json().catch(() => ({}))
    if (d.ok) { localStorage.setItem('elorge-chat-used', '1'); setUsed(true); setMsgs((m) => (m.some((x) => x._id === d.message._id) ? m : [...m, d.message])) } else { setErr(d.error || 'Could not send. Try again.'); setText(t) }
  }
  if (path?.startsWith('/studio') || path?.startsWith('/invoice')) return null
  return (<>
    {!open && <button className="chatfab" onClick={() => { setOpen(true); setUnread(0) }}>Chat with us{unread > 0 && <span className="chatbadge">{unread}</span>}</button>}
    {open && <div className="chatbox" role="dialog" aria-label="Live chat">
      <div className="chathead"><b>Chat with Elorge Store</b><button onClick={() => setOpen(false)} aria-label="Close chat">×</button></div>
      <div className="chatmsgs" ref={box}>
        <div className="chatm owner">Hello! Ask us anything about a product, a bulk order or delivery. We reply here.</div>
        {msgs.map((m) => <div key={m._id} className={`chatm ${m.sender}`}>{m.text}</div>)}</div>
      {(!used || !phone) && <div className="chatwho"><input placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} /><input placeholder="Phone number *" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /><small style={{ color: 'var(--mute)' }}>If we cannot reply here, we will call or WhatsApp you on this number.</small></div>}
      {err && <div className="err" style={{ padding: '0 12px' }}>{err}</div>}
      <div className="chatin"><input placeholder="Type your message…" value={text} maxLength={600} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} /><button className="btn" onClick={send}>Send</button></div>
    </div>}
  </>)
}
