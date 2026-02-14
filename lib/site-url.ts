/**
 * Canonical site URL for sitemap, robots, metadata.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://www.siparis-sistemi.com).
 */
export const SITE_URL =
  typeof process.env.NEXT_PUBLIC_SITE_URL === 'string' && process.env.NEXT_PUBLIC_SITE_URL.trim()
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
    : 'https://www.siparis-sistemi.com';
