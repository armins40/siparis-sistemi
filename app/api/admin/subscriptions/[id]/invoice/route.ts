import { NextRequest, NextResponse } from 'next/server';
import { updateSubscriptionInvoiceSent } from '@/lib/db/subscriptions';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return requireAdminAuth(request, async () => {
    try {
      const body = await request.json().catch(() => ({}));
      const sent = body.sent === true;

      const ok = await updateSubscriptionInvoiceSent(id, sent);
      return NextResponse.json({ success: ok });
    } catch (e: unknown) {
      console.error('PATCH /api/admin/subscriptions/[id]/invoice:', e);
      return NextResponse.json(
        { success: false, error: (e as Error)?.message ?? 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
