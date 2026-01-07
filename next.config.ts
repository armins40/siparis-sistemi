import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // CSP headers with unsafe-eval allowed and relaxed for browser extensions
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data: blob:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data: blob: chrome-extension: moz-extension:",
              "style-src 'self' 'unsafe-inline' https: http: data:",
              "img-src 'self' data: https: http: blob:",
              "font-src 'self' data: https: http:",
              "connect-src 'self' https: http: wss: ws: chrome-extension: moz-extension:",
              "frame-src 'self' https: http: chrome-extension: moz-extension:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

export default nextConfig
