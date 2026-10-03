// Elorge service worker: makes the app installable, caches static files, shows an offline page.
// Never caches /api or /studio, and never touches payments.
const V = 'elorge-v1'
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(['/offline.html', '/logo.png']))); self.skipWaiting() })
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== V).map((x) => caches.delete(x)))).then(() => self.clients.claim())) })
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url)
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api') || u.pathname.startsWith('/studio')) return
  if (r.mode === 'navigate') { e.respondWith(fetch(r).catch(() => caches.match('/offline.html'))); return }
  if (u.pathname.startsWith('/_next/static') || /\.(png|jpg|jpeg|svg|webp|woff2)$/.test(u.pathname)) {
    e.respondWith(caches.open(V).then(async (c) => { const hit = await c.match(r); const net = fetch(r).then((res) => { if (res.ok) c.put(r, res.clone()); return res }).catch(() => hit); return hit || net }))
  }
})
