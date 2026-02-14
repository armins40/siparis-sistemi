import type { NextConfig } from "next";

// PWA: Using static manifest.json + public/firebase-messaging-sw.js (no @ducanh2912/next-pwa)
// to avoid Next.js 16 Turbopack + webpack / terser "Unexpected early exit" on Vercel.

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},

  // Güvenlik Headers - PWA + Firebase için connect-src güncellendi
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https: wss: https://*.googleapis.com https://*.firebaseio.com https://fcm.googleapis.com https://firebaseinstallations.googleapis.com https://*.google.com",
              "frame-src 'self' https://wa.me",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://wa.me",
              "frame-ancestors 'none'",
              "worker-src 'self' blob:",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
