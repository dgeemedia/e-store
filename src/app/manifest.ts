import type { MetadataRoute } from 'next'
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Elorge Store', short_name: 'Elorge', description: 'Factory-direct, Opor! Shikini money. The more you buy, the cheaper you pay.',
    start_url: '/', scope: '/', display: 'standalone', background_color: '#ffffff', theme_color: '#0056b6',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [{ name: 'Bulk orders', url: '/quote' }, { name: 'Track order', url: '/track' }],
  }
}
