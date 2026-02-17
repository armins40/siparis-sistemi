import { sql } from './client';

const PLAN_DURATIONS: Record<string, number> = {
  monthly: 30,
  '6month': 180,
  yearly: 365,
};

export async function createSubscriptionInDB(
  userId: string,
  plan: 'monthly' | '6month' | 'yearly',
  amount: number,
  paymentId?: string,
  paymentMethod?: string
): Promise<string | null> {
  try {
    await sql`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS invoice_sent BOOLEAN DEFAULT false`;
    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (PLAN_DURATIONS[plan] ?? 30));

    await sql`
      INSERT INTO subscriptions (id, user_id, plan, amount, status, start_date, end_date, payment_method, payment_id)
      VALUES (${id}, ${userId}, ${plan}, ${amount}, 'active', ${startDate.toISOString()}, ${endDate.toISOString()}, ${paymentMethod || null}, ${paymentId || null})
    `;
    return id;
  } catch (e) {
    console.error('Error creating subscription in DB:', e);
    return null;
  }
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  plan: string;
  amount: string;
  status: string;
  start_date: string;
  end_date: string;
  payment_method: string | null;
  payment_id: string | null;
  created_at: string;
  invoice_sent: boolean;
}

export async function getSubscriptionsForAdmin(): Promise<SubscriptionRow[]> {
  try {
    await sql`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS invoice_sent BOOLEAN DEFAULT false`;
    const result = await sql`
      SELECT s.id, s.user_id, s.plan, s.amount::text, s.status, s.start_date::text, s.end_date::text, s.payment_method, s.payment_id, s.created_at::text, COALESCE(s.invoice_sent, false) as invoice_sent
      FROM subscriptions s
      ORDER BY s.created_at DESC
    `;
    return (result.rows || []) as SubscriptionRow[];
  } catch (e) {
    console.error('Error getting subscriptions:', e);
    return [];
  }
}

export async function updateSubscriptionInvoiceSent(id: string, sent: boolean): Promise<boolean> {
  try {
    await sql`
      UPDATE subscriptions SET invoice_sent = ${sent} WHERE id = ${id}
    `;
    return true;
  } catch (e) {
    console.error('Error updating subscription invoice_sent:', e);
    return false;
  }
}
