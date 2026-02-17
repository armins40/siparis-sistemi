import { NextRequest, NextResponse } from 'next/server';
import { updateUserInDB } from '@/lib/db/users';

/** POST /api/user/update-invoice — Fatura bilgilerini güncelle */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, invoiceTaxNo, invoiceAddress } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ success: false, error: 'userId gerekli' }, { status: 400 });
    }

    const updates: { invoiceTaxNo?: string; invoiceAddress?: string } = {};
    if (invoiceTaxNo != null && typeof invoiceTaxNo === 'string') {
      updates.invoiceTaxNo = invoiceTaxNo.trim() || undefined;
    }
    if (invoiceAddress != null && typeof invoiceAddress === 'string') {
      updates.invoiceAddress = invoiceAddress.trim() || undefined;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'Fatura bilgileri gerekli' }, { status: 400 });
    }

    const ok = await updateUserInDB(userId, updates);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Güncelleme yapılamadı' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in update-invoice:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
