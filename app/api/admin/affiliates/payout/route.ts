import { NextRequest, NextResponse } from 'next/server';
import { getAffiliateById } from '@/lib/affiliate';
import { processAffiliatePayout } from '@/lib/affiliate-analytics';
import { requireAdminAuth } from '@/lib/admin-auth';

/** Affiliate’e ödeme yap: bekleyen/onaylı komisyonları ödendi yap, ödeme kaydı oluştur. */
export async function POST(request: NextRequest) {
  return requireAdminAuth(request, async () => {
    try {
      const body = await request.json().catch(() => ({}));
      const { affiliateId, transactionRef } = body;
      if (!affiliateId) {
        return NextResponse.json({ success: false, error: 'affiliateId gerekli' }, { status: 400 });
      }
      const affiliate = await getAffiliateById(affiliateId);
      if (!affiliate) {
        return NextResponse.json({ success: false, error: 'Affiliate bulunamadı' }, { status: 404 });
      }
      const result = await processAffiliatePayout(affiliateId, {
        transactionRef: typeof transactionRef === 'string' ? transactionRef.trim() : undefined,
        iban: affiliate.iban ?? undefined,
      });
      if (!result.success) {
        return NextResponse.json({ success: false, error: (result as { error: string }).error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        amount: (result as { amount: number }).amount,
        paymentId: (result as { paymentId: string }).paymentId,
      });
    } catch (e) {
      console.error('Admin affiliate payout error:', e);
      return NextResponse.json({ success: false, error: 'Ödeme işlenemedi' }, { status: 500 });
    }
  });
}
