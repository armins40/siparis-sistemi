import { NextRequest, NextResponse } from 'next/server';
import { createOrderInDB } from '@/lib/db/orders';
import { getUserByStoreSlugFromDB } from '@/lib/db/users';
import { getTokensByUser } from '@/lib/db/push-tokens';
import { sendPushToUser } from '@/lib/firebase-admin';
import { emitNewOrder } from '@/lib/order-events';
import type { OrderItem } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeSlug, items, total, discount, finalTotal, address } = body;

    if (!storeSlug || typeof storeSlug !== 'string' || !storeSlug.trim()) {
      return NextResponse.json(
        { success: false, error: 'storeSlug is required' },
        { status: 400 }
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'items array is required and must not be empty' },
        { status: 400 }
      );
    }

    const totalNum = typeof total === 'number' ? total : parseFloat(String(total));
    const finalNum = typeof finalTotal === 'number' ? finalTotal : parseFloat(String(finalTotal));
    if (Number.isNaN(totalNum) || Number.isNaN(finalNum) || totalNum < 0 || finalNum < 0) {
      return NextResponse.json(
        { success: false, error: 'total and finalTotal must be valid numbers' },
        { status: 400 }
      );
    }

    const sanitizedItems: OrderItem[] = items.map((it: unknown) => {
      const x = it as Record<string, unknown>;
      return {
        productId: String(x?.productId ?? ''),
        productName: String(x?.productName ?? ''),
        quantity: Math.max(0, Number(x?.quantity) || 0),
        unit: String(x?.unit ?? 'adet'),
        price: Math.max(0, Number(x?.price) || 0),
        total: Math.max(0, Number(x?.total) || 0),
      };
    }).filter((it: OrderItem) => it.productId && it.productName && it.quantity > 0);

    if (sanitizedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid order items' },
        { status: 400 }
      );
    }

    const ok = await createOrderInDB({
      storeSlug: storeSlug.trim(),
      items: sanitizedItems,
      total: totalNum,
      discount: typeof discount === 'number' ? discount : undefined,
      finalTotal: finalNum,
      address: typeof address === 'string' ? address : undefined,
    });

    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to save order' },
        { status: 500 }
      );
    }

    const owner = await getUserByStoreSlugFromDB(storeSlug.trim());
    const userId = owner?.id ?? null;
    if (userId) {
      emitNewOrder({ userId, storeSlug: storeSlug.trim(), finalTotal: finalNum });
      const title = 'Yeni Sipariş Geldi!';
      const body = `${finalNum.toFixed(0)} TL tutarında yeni sipariş.`;
      const url = `/dashboard/${userId}`;
      getTokensByUser(userId).then((tokens) => {
        if (tokens.length === 0) return;
        sendPushToUser(tokens, title, body, url).catch(() => {});
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('POST /api/orders:', e);
    return NextResponse.json(
      { success: false, error: (e as Error)?.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
