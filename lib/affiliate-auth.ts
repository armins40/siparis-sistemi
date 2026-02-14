/**
 * Affiliate oturumu: cookie tabanlı (müşteri auth'tan ayrı).
 */
export const AFFILIATE_COOKIE = 'affiliate_session';

export function getAffiliateSession(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${AFFILIATE_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1].trim()) : null;
}
