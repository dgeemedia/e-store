export default {
  images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }] },
  // Test deployments on *.vercel.app are never indexed (the live domain is unaffected).
  async headers() {
    return [{ source: '/:path*', has: [{ type: 'host', value: '(.*)\\.vercel\\.app' }], headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
  },
}
