import { NextRequest, NextResponse } from 'next/server';
import { getAffiliateSession } from '@/lib/affiliate-auth';
import { getAffiliateNotifications, markNotificationRead } from '@/lib/affiliate-analytics';

export async function GET(request: NextRequest) {
  const affiliateId = getAffiliateSession(request.headers.get('cookie') ?? null);
  if (!affiliateId) {
    return NextResponse.json({ success: false, error: 'Oturum yok' }, { status: 401 });
  }
  const unreadOnly = request.nextUrl.searchParams.get('unread') === '1';
  try {
    const items = await getAffiliateNotifications(affiliateId, { limit: 50, unreadOnly });
    return NextResponse.json({ success: true, items });
  } catch (e) {
    console.error('Affiliate notifications error:', e);
    return NextResponse.json({ success: false, error: 'Yüklenemedi' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const affiliateId = getAffiliateSession(request.headers.get('cookie') ?? null);
  if (!affiliateId) {
    return NextResponse.json({ success: false, error: 'Oturum yok' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const notificationId = body.id ?? body.notificationId;
  if (!notificationId) {
    return NextResponse.json({ success: false, error: 'id gerekli' }, { status: 400 });
  }
  try {
    const ok = await markNotificationRead(notificationId, affiliateId);
    return NextResponse.json({ success: ok });
  } catch (e) {
    console.error('Affiliate notification read error:', e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
