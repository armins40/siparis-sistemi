import { NextRequest, NextResponse } from 'next/server';
import { getAffiliateIdByCode } from '@/lib/affiliate';
import { recordAffiliateClick } from '@/lib/affiliate-analytics';

/** Referans linkine tıklama kaydı. Signup sayfası ref ile açıldığında çağrılır. Aynı IP spam kontrolü uygulanır. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ success: false }, { status: 400 });
  }
  const affiliateId = await getAffiliateIdByCode(code.trim());
  if (!affiliateId) {
    return NextResponse.json({ success: false }, { status: 404 });
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '0.0.0.0';
  try {
    const { recorded } = await recordAffiliateClick(affiliateId, ip);
    return NextResponse.json({ success: true, recorded });
  } catch (e) {
    console.error('Affiliate click record error:', e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
