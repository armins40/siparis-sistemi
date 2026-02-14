import { NextRequest, NextResponse } from 'next/server';
import { getAffiliateById, updateAffiliatePaymentInfo } from '@/lib/affiliate';
import { getAffiliateSession } from '@/lib/affiliate-auth';

export async function GET(request: NextRequest) {
  const affiliateId = getAffiliateSession(request.headers.get('cookie') ?? null);
  if (!affiliateId) {
    return NextResponse.json({ success: false, error: 'Oturum yok' }, { status: 401 });
  }
  const affiliate = await getAffiliateById(affiliateId);
  if (!affiliate) {
    return NextResponse.json({ success: false, error: 'Affiliate bulunamadı' }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    affiliate: {
      id: affiliate.id,
      name: affiliate.name,
      email: affiliate.email,
      code: affiliate.code,
      iban: affiliate.iban ?? null,
      paymentName: affiliate.payment_name ?? null,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const affiliateId = getAffiliateSession(request.headers.get('cookie') ?? null);
  if (!affiliateId) {
    return NextResponse.json({ success: false, error: 'Oturum yok' }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const iban = body.iban != null ? String(body.iban).trim() : undefined;
    const payment_name = body.payment_name != null ? String(body.payment_name).trim() : undefined;
    if (iban === undefined && payment_name === undefined) {
      return NextResponse.json({ success: false, error: 'iban veya payment_name gerekli' }, { status: 400 });
    }
    await updateAffiliatePaymentInfo(affiliateId, { iban, payment_name });
    const affiliate = await getAffiliateById(affiliateId);
    return NextResponse.json({
      success: true,
      affiliate: affiliate
        ? {
            id: affiliate.id,
            name: affiliate.name,
            email: affiliate.email,
            code: affiliate.code,
            iban: affiliate.iban ?? null,
            paymentName: affiliate.payment_name ?? null,
          }
        : null,
    });
  } catch (e) {
    console.error('Affiliate PATCH error:', e);
    return NextResponse.json({ success: false, error: 'Güncellenemedi' }, { status: 500 });
  }
}
