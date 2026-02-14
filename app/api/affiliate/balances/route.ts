import { NextRequest, NextResponse } from 'next/server';
import { getAffiliateSession } from '@/lib/affiliate-auth';
import { getAffiliateBalances } from '@/lib/affiliate-analytics';

export async function GET(request: NextRequest) {
  const affiliateId = getAffiliateSession(request.headers.get('cookie') ?? null);
  if (!affiliateId) {
    return NextResponse.json({ success: false, error: 'Oturum yok' }, { status: 401 });
  }
  try {
    const data = await getAffiliateBalances(affiliateId);
    return NextResponse.json({ success: true, ...data });
  } catch (e) {
    console.error('Affiliate balances error:', e);
    return NextResponse.json({ success: false, error: 'Yüklenemedi' }, { status: 500 });
  }
}
