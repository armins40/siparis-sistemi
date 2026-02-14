import { NextRequest, NextResponse } from 'next/server';
import { getAffiliateSession } from '@/lib/affiliate-auth';
import { getAffiliatePaymentHistory } from '@/lib/affiliate-analytics';

export async function GET(request: NextRequest) {
  const affiliateId = getAffiliateSession(request.headers.get('cookie') ?? null);
  if (!affiliateId) {
    return NextResponse.json({ success: false, error: 'Oturum yok' }, { status: 401 });
  }
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = parseInt(searchParams.get('limit') ?? '20', 10);
  try {
    const data = await getAffiliatePaymentHistory(affiliateId, { page, limit });
    return NextResponse.json({ success: true, ...data });
  } catch (e) {
    console.error('Affiliate payments error:', e);
    return NextResponse.json({ success: false, error: 'Yüklenemedi' }, { status: 500 });
  }
}
