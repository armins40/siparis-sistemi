import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionsForAdmin } from '@/lib/db/subscriptions';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getUserByIdFromDB } from '@/lib/db/users';

async function handleGet(request: NextRequest) {
  try {
    const subs = await getSubscriptionsForAdmin();
    const withUser = await Promise.all(
      subs.map(async (s) => {
        const user = await getUserByIdFromDB(s.user_id);
        return {
          ...s,
          userName: user?.name ?? null,
          userEmail: user?.email ?? null,
          userPhone: user?.phone ?? null,
        };
      })
    );
    return NextResponse.json({ success: true, subscriptions: withUser });
  } catch (e: unknown) {
    console.error('GET /api/admin/subscriptions:', e);
    return NextResponse.json(
      { success: false, error: (e as Error)?.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, handleGet);
}
