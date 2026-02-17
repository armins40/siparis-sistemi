import { NextRequest, NextResponse } from 'next/server';
import { updateOrderInvoiceSent } from '@/lib/db/orders';
import { getUserByIdFromDB } from '@/lib/db/users';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const sent = body.sent === true;
    const userId = body.userId as string | undefined;

    if (!userId?.trim()) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const user = await getUserByIdFromDB(userId.trim());
    const storeSlug = user?.storeSlug;
    if (!storeSlug) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    const ok = await updateOrderInvoiceSent(id, storeSlug, sent);
    return NextResponse.json({ success: ok });
  } catch (e: unknown) {
    console.error('PATCH /api/orders/[id]/invoice:', e);
    return NextResponse.json(
      { success: false, error: (e as Error)?.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
