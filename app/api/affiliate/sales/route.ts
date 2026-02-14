import { NextRequest, NextResponse } from 'next/server';
import { getAffiliateSession } from '@/lib/affiliate-auth';
import { getSalesDetails } from '@/lib/affiliate-analytics';

export async function GET(request: NextRequest) {
  const affiliateId = getAffiliateSession(request.headers.get('cookie') ?? null);
  if (!affiliateId) {
    return NextResponse.json({ success: false, error: 'Oturum yok' }, { status: 401 });
  }
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = parseInt(searchParams.get('limit') ?? '20', 10);
  const search = searchParams.get('search') ?? undefined;
  const planFilter = searchParams.get('plan') ?? undefined;
  const statusFilter = searchParams.get('status') ?? undefined;
  try {
    const data = await getSalesDetails(affiliateId, { page, limit, search, planFilter, statusFilter });
    return NextResponse.json({ success: true, ...data });
  } catch (e) {
    console.error('Affiliate sales error:', e);
    return NextResponse.json({ success: false, error: 'Yüklenemedi' }, { status: 500 });
  }
}
