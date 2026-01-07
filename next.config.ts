import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // CSP headers with unsafe-eval allowed
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data:",
              "style-src 'self' 'unsafe-inline' https: http: data:",
              "img-src 'self' data: https: http: blob:",
              "font-src 'self' data: https: http:",
              "connect-src 'self' https: http: wss: ws:",
              "frame-src 'self' https: http:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
