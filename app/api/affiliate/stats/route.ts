import { NextRequest, NextResponse } from 'next/server';
import { getAffiliateStats } from '@/lib/affiliate';
import { getAffiliateSession } from '@/lib/affiliate-auth';

export async function GET(request: NextRequest) {
  try {
    const affiliateId = getAffiliateSession(request.headers.get('cookie') ?? null);
    if (!affiliateId) {
      return NextResponse.json({ success: false, error: 'Oturum açın' }, { status: 401 });
    }
    const stats = await getAffiliateStats(affiliateId);
    return NextResponse.json({ success: true, ...stats });
  } catch (e) {
    console.error('Affiliate stats error:', e);
    return NextResponse.json({ success: false, error: 'İstatistikler alınamadı' }, { status: 500 });
  }
}
