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

export interface OrderRow {
  id: string;
  user_id: string | null;
  store_slug: string;
  items: unknown;
  total: string;
  discount: string;
  final_total: string;
  address: string | null;
  status: string;
  created_at: string;
  invoice_sent: boolean;
}

export async function getOrdersByStoreSlug(storeSlug: string): Promise<OrderRow[]> {
  try {
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_sent BOOLEAN DEFAULT false`;
    const result = await sql`
      SELECT id, user_id, store_slug, items, total::text, discount::text, final_total::text, address, status, created_at, COALESCE(invoice_sent, false) as invoice_sent
      FROM orders
      WHERE store_slug = ${storeSlug}
      ORDER BY created_at DESC
    `;
    return (result.rows || []) as OrderRow[];
  } catch (e) {
    console.error('Error getting orders by store:', e);
    return [];
  }
}

export async function updateOrderInvoiceSent(orderId: string, storeSlug: string, sent: boolean): Promise<boolean> {
  try {
    await sql`
      UPDATE orders
      SET invoice_sent = ${sent}
      WHERE id = ${orderId} AND store_slug = ${storeSlug}
    `;
    return true;
  } catch (e) {
    console.error('Error updating order invoice_sent:', e);
    return false;
  }
}
