'use client'
import { useState } from 'react'
import { useLang } from '@/lib/i18n'
export default function PrintButton({ pdfHref, pdfOn }: { pdfHref?: string; pdfOn?: boolean }) {
  const { t, lang } = useLang(), [soon, setSoon] = useState(false)
  const b = { padding: '10px 18px', cursor: 'pointer', border: '1px solid #999', background: '#fff', color: '#111', textDecoration: 'none', fontSize: 14 } as const
  return (<div className="no-print" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
    <button style={b} onClick={() => window.print()}>{t('iv.print')}</button>
    {pdfOn ? <a style={b} href={`${pdfHref}?lang=${lang}`}>{t('iv.dl')}</a> : <button style={b} onClick={() => setSoon(true)}>{t('iv.dl')}</button>}
    {soon && <small>{t('iv.dlSoon')}</small>}
  </div>)
}
