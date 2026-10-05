'use client'
import { useState } from 'react'
export default function PrintButton({ pdfHref, pdfOn }: { pdfHref?: string; pdfOn?: boolean }) {
  const [soon, setSoon] = useState(false)
  const b = { padding: '10px 18px', cursor: 'pointer', border: '1px solid #999', background: '#fff', color: '#111', textDecoration: 'none', fontSize: 14 } as const
  return (<div className="no-print" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
    <button style={b} onClick={() => window.print()}>Print / save as PDF</button>
    {pdfOn ? <a style={b} href={pdfHref}>Download PDF</a> : <button style={b} onClick={() => setSoon(true)}>Download PDF</button>}
    {soon && <small>PDF download is coming soon. For now, use Print / save as PDF.</small>}
  </div>)
}
