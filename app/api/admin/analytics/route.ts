import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { requireAdminAuth } from '@/lib/admin-auth';
import type { SalesAnalytics } from '@/lib/types';

async function handleGet(request: NextRequest) {
  try {
    if (!process.env.POSTGRES_URL) {
      return NextResponse.json(
        { success: false, error: 'POSTGRES_URL not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'monthly') as 'daily' | 'weekly' | 'monthly';

    // Tüm siparişleri getir (sadece completed/confirmed olanlar gelir için sayılır)
    const ordersResult = await sql`
      SELECT 
        id, store_slug, items, total, final_total, status, created_at
      FROM orders
      WHERE status IN ('completed', 'confirmed')
      ORDER BY created_at DESC
    `;

    const orders = ordersResult.rows.map(row => {
      const items = Array.isArray(row.items) ? row.items : (typeof row.items === 'string' ? JSON.parse(row.items) : []);
      const finalTotal = parseFloat(String(row.final_total || row.total || 0));
      return {
        id: row.id,
        storeSlug: row.store_slug,
        items,
        finalTotal,
        status: row.status,
        createdAt: new Date(row.created_at).toISOString(),
      };
    });

    // Analytics hesapla
    const totalRevenue = orders.reduce((sum, o) => sum + o.finalTotal, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Tarihe göre grupla
    const dataMap = new Map<string, { revenue: number; orders: number }>();

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      let key: string;

      if (period === 'daily') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Haftanın başlangıcı
        key = weekStart.toISOString().split('T')[0];
      } else { // monthly
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      }

      const existing = dataMap.get(key) || { revenue: 0, orders: 0 };
      dataMap.set(key, {
        revenue: existing.revenue + order.finalTotal,
        orders: existing.orders + 1,
      });
    });

    const data = Array.from(dataMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const analytics: SalesAnalytics = {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      period,
      data,
    };

    return NextResponse.json({ success: true, analytics });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, handleGet);
}
