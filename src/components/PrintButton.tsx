'use client'
export default function PrintButton() { return <button className="no-print" onClick={() => window.print()} style={{ padding: '10px 18px', marginBottom: 16, cursor: 'pointer' }}>Print / save as PDF</button> }
