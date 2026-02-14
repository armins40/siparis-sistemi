import { NextRequest, NextResponse } from 'next/server';
import { getAdminAffiliatesList } from '@/lib/affiliate';
import { sql } from '@/lib/db/client';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async () => {
    try {
      const data = await getAdminAffiliatesList();
      return NextResponse.json({ success: true, ...data });
    } catch (e) {
      console.error('Admin affiliates error:', e);
      return NextResponse.json(
        { success: false, error: 'Affiliate listesi alınamadı' },
        { status: 500 }
      );
    }
  });
}

/** Askıya al / kaldır */
export async function PATCH(request: NextRequest) {
  return requireAdminAuth(request, async () => {
    try {
      const body = await request.json().catch(() => ({}));
      const { affiliateId, isSuspended } = body;
      if (!affiliateId || typeof isSuspended !== 'boolean') {
        return NextResponse.json({ success: false, error: 'affiliateId ve isSuspended gerekli' }, { status: 400 });
      }
      await sql`UPDATE affiliates SET is_suspended = ${isSuspended} WHERE id = ${affiliateId}`;
      return NextResponse.json({ success: true });
    } catch (e) {
      console.error('Admin affiliate suspend error:', e);
      return NextResponse.json({ success: false, error: 'Güncellenemedi' }, { status: 500 });
    }
  });
}
