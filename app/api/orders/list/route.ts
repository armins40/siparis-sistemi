import { NextRequest, NextResponse } from 'next/server';
import { getOrdersByStoreSlug } from '@/lib/db/orders';
import { getUserByIdFromDB } from '@/lib/db/users';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const storeSlug = searchParams.get('storeSlug');

    let slug: string | null = null;

    if (storeSlug && typeof storeSlug === 'string' && storeSlug.trim()) {
      slug = storeSlug.trim();
    } else if (userId && typeof userId === 'string' && userId.trim()) {
      const user = await getUserByIdFromDB(userId.trim());
      if (user?.storeSlug) slug = user.storeSlug;
    }

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'userId or storeSlug is required' },
        { status: 400 }
      );
    }

    const orders = await getOrdersByStoreSlug(slug);
    return NextResponse.json({ success: true, orders });
  } catch (e: unknown) {
    console.error('GET /api/orders/list:', e);
    return NextResponse.json(
      { success: false, error: (e as Error)?.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
