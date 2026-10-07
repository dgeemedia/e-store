'use client'
import { useLang } from '@/lib/i18n'
const DEFAULT = ['t.1', 't.2', 't.3', 't.4', 't.5', 't.6', 't.7']
/** Phrases typed in Studio show as written; the built-in defaults follow the visitor's language. */
export default function Ticker({ items }: { items?: string[] }) {
  const { t } = useLang()
  const list = items?.length ? items : DEFAULT.map((k) => t(k))
  const row = [...list, ...list, ...list]
  return (<div className="ticker" aria-label={list.join(', ')}><div className="ticker-track" aria-hidden>
    {[0, 1].map((k) => <div key={k} className="ticker-row">{row.map((x, i) => <span key={i}>{x}<i>★</i></span>)}</div>)}
  </div></div>)
}
