'use client'
export default function Share({ title }: { title: string }) {
  return <button className="btn ghost" onClick={async () => { const url = location.href; try { if (navigator.share) { await navigator.share({ title, url }); return } } catch { return } window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank') }}>Share</button>
}
