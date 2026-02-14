import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import type { Product } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Tüm admin ürünlerini getir (sektör ayrımı yok)
    const result = await sql`
      SELECT id, name, price, category, image,
        is_published as "isPublished", stock, unit,
        created_at as "createdAt", sector,
        created_by as "createdBy", user_id as "userId", store_slug as "storeSlug"
      FROM products
      WHERE created_by = 'admin'
      ORDER BY created_at DESC
    `;

    const products = result.rows.map(row => {
      let price = row.price;
      if (price == null) {
        price = 0;
      } else if (typeof price === 'string') {
        price = parseFloat(price) || 0;
      } else if (typeof price !== 'number') {
        price = parseFloat(String(price)) || 0;
      }
      return {
        ...row,
        price,
        createdAt: new Date(row.createdAt).toISOString(),
      };
    }) as Product[];

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Error in /api/products/admin-by-sector:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
