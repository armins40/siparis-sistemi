import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { requireAdminAuth } from '@/lib/admin-auth';
import type { Order } from '@/lib/types';

async function handleGet(request: NextRequest) {
  try {
    if (!process.env.POSTGRES_URL) {
      return NextResponse.json(
        { success: false, error: 'POSTGRES_URL not configured' },
        { status: 500 }
      );
    }

    // Tüm siparişleri getir (son 50)
    const ordersResult = await sql`
      SELECT 
        id, user_id, store_slug, items, total, discount, final_total, address, status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const orders: Order[] = ordersResult.rows.map(row => {
      const items = Array.isArray(row.items) 
        ? row.items 
        : (typeof row.items === 'string' ? JSON.parse(row.items) : []);
      
      return {
        id: row.id,
        userId: row.user_id || undefined,
        storeSlug: row.store_slug,
        items: items.map((it: any) => ({
          productId: it.productId || '',
          productName: it.productName || '',
          quantity: Number(it.quantity) || 0,
          unit: it.unit || 'adet',
          price: Number(it.price) || 0,
          total: Number(it.total) || 0,
        })),
        total: parseFloat(String(row.total || 0)),
        discount: row.discount ? parseFloat(String(row.discount)) : undefined,
        finalTotal: parseFloat(String(row.final_total || row.total || 0)),
        address: row.address || undefined,
        status: (row.status || 'pending') as Order['status'],
        createdAt: new Date(row.created_at).toISOString(),
      };
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, handleGet);
}
