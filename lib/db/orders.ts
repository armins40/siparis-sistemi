// Database functions for Orders
import { sql } from './client';
import { getUserByStoreSlugFromDB } from './users';
import type { OrderItem } from '@/lib/types';

export interface CreateOrderInput {
  storeSlug: string;
  items: OrderItem[];
  total: number;
  discount?: number;
  finalTotal: number;
  address?: string;
}

export async function createOrderInDB(input: CreateOrderInput): Promise<boolean> {
  try {
    const owner = await getUserByStoreSlugFromDB(input.storeSlug);
    const userId = owner?.id ?? null;

    const id = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const itemsJson = JSON.stringify(input.items);

    await sql`
      INSERT INTO orders (id, user_id, store_slug, items, total, discount, final_total, address, status)
      VALUES (
        ${id},
        ${userId},
        ${input.storeSlug},
        ${itemsJson}::jsonb,
        ${input.total},
        ${input.discount ?? 0},
        ${input.finalTotal},
        ${input.address?.trim() || null},
        'pending'
      )
    `;
    return true;
  } catch (e) {
    console.error('Error creating order in DB:', e);
    return false;
  }
}

export async function getOrderCountByStoreSlug(storeSlug: string): Promise<number> {
  try {
    const result = await sql<{ count: string }>`
      SELECT COUNT(*)::text AS count
      FROM orders
      WHERE store_slug = ${storeSlug}
    `;
    const row = result.rows[0];
    const count = row ? parseInt(row.count, 10) || 0 : 0;
    return count;
  } catch (e) {
    console.error('Error getting order count by store:', e);
    return 0;
  }
}
