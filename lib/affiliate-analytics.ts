/**
 * Affiliate dönüşüm analizi: tıklama, satış detayları, bakiye, bildirimler.
 */
import { sql } from '@/lib/db/client';
import { getNextPayoutFromCommissions, MIN_PAYOUT_AMOUNT, PAYOUT_DAYS } from '@/lib/affiliate';
import { createHash } from 'crypto';

/** 7 gün güvenlik bekleme süresi (komisyon onayı öncesi). */
export const SECURITY_HOLD_DAYS = 7;

/** Aynı IP'den en fazla bu sürede 1 tıklama sayılır (spam). Saniye. */
const CLICK_SPAM_WINDOW_SEC = 3600; // 1 saat

function hashIp(ip: string): string {
  const salt = process.env.AFFILIATE_CLICK_SALT || 'affiliate-click-v1';
  return createHash('sha256').update(ip + salt).digest('hex').slice(0, 32);
}

/** Referans linkine tıklama kaydet. IP spam: aynı IP aynı affiliate için 1 saatte 1 kez. */
export async function recordAffiliateClick(affiliateId: string, ip: string): Promise<{ recorded: boolean }> {
  const ipHash = hashIp(ip);
  const since = new Date(Date.now() - CLICK_SPAM_WINDOW_SEC * 1000).toISOString();
  const existing = await sql`
    SELECT id FROM affiliate_clicks
    WHERE affiliate_id = ${affiliateId} AND ip_hash = ${ipHash} AND created_at > ${since}
    LIMIT 1
  `;
  if (existing.rows.length > 0) return { recorded: false };
  const id = `clk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  await sql`
    INSERT INTO affiliate_clicks (id, affiliate_id, ip_hash, created_at)
    VALUES (${id}, ${affiliateId}, ${ipHash}, NOW())
  `;
  return { recorded: true };
}

/** Dönüşüm analizi: tıklama, kayıt, ücretli dönüşüm, oran, aktif abonelik. */
export async function getConversionAnalytics(affiliateId: string): Promise<{
  totalClicks: number;
  totalSignups: number;
  paidConversions: number;
  conversionRate: number;
  activeSubscriptions: number;
}> {
  const [clicksRes, signupsRes, commissionsRes, activeRes] = await Promise.all([
    sql`SELECT COUNT(*)::int as c FROM affiliate_clicks WHERE affiliate_id = ${affiliateId}`,
    sql`SELECT COUNT(*)::int as c FROM users WHERE referred_by_affiliate_id = ${affiliateId}`,
    sql`SELECT COUNT(*)::int as c FROM affiliate_commissions WHERE affiliate_id = ${affiliateId} AND status IN ('pending','approved','paid')`,
    sql`
      SELECT COUNT(*)::int as c FROM users u
      WHERE u.referred_by_affiliate_id = ${affiliateId}
        AND u.expires_at > NOW() AND u.plan IS NOT NULL AND u.plan NOT IN ('free','trial')
    `,
  ]);
  const totalClicks = Number((clicksRes.rows[0] as { c: number })?.c ?? 0);
  const totalSignups = Number((signupsRes.rows[0] as { c: number })?.c ?? 0);
  const paidConversions = Number((commissionsRes.rows[0] as { c: number })?.c ?? 0);
  const activeSubscriptions = Number((activeRes.rows[0] as { c: number })?.c ?? 0);
  const conversionRate = totalClicks > 0 ? Math.round((totalSignups / totalClicks) * 10000) / 100 : 0;
  return {
    totalClicks,
    totalSignups,
    paidConversions,
    conversionRate,
    activeSubscriptions,
  };
}

/** Satış detayları: müşteri adı, mağaza, paket, abonelik durumu, komisyon, tarih. Sayfalama, arama, filtre. */
export async function getSalesDetails(
  affiliateId: string,
  opts: { page?: number; limit?: number; search?: string; planFilter?: string; statusFilter?: string }
): Promise<{
  items: {
    customerName: string;
    storeSlug: string | null;
    storeName: string | null;
    plan: string;
    subscriptionStatus: string;
    commissionAmount: number;
    saleDate: string;
    commissionId: string;
    status: string;
  }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(50, Math.max(5, opts.limit ?? 20));
  const offset = (page - 1) * limit;
  const search = opts.search?.trim();
  const planFilter = opts.planFilter?.trim();
  const statusFilter = opts.statusFilter?.trim();

  const searchPattern = search ? `%${search}%` : null;
  const noSearch = searchPattern === null;
  const noPlanFilter = !planFilter;
  const noStatusFilter = !statusFilter;
  const countResult = await sql`
    SELECT COUNT(*)::int as total
    FROM affiliate_commissions c
    JOIN users u ON u.id = c.referred_user_id
    LEFT JOIN stores s ON s.slug = u.store_slug
    WHERE c.affiliate_id = ${affiliateId}
      AND (${noSearch} OR (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern} OR s.name ILIKE ${searchPattern} OR u.store_slug ILIKE ${searchPattern}))
      AND (${noPlanFilter} OR c.plan = ${planFilter})
      AND (${noStatusFilter} OR c.status = ${statusFilter})
  `;
  const total = Number((countResult.rows[0] as { total: number })?.total ?? 0);

  const rows = await sql`
    SELECT c.id as "commissionId", c.plan, c.commission_amount as "commissionAmount", c.status, c.created_at as "saleDate",
           u.name as "customerName", u.store_slug as "storeSlug", u.plan as "userPlan", u.expires_at as "expiresAt",
           s.name as "storeName"
    FROM affiliate_commissions c
    JOIN users u ON u.id = c.referred_user_id
    LEFT JOIN stores s ON s.slug = u.store_slug
    WHERE c.affiliate_id = ${affiliateId}
      AND (${noSearch} OR (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern} OR s.name ILIKE ${searchPattern} OR u.store_slug ILIKE ${searchPattern}))
      AND (${noPlanFilter} OR c.plan = ${planFilter})
      AND (${noStatusFilter} OR c.status = ${statusFilter})
    ORDER BY c.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const now = new Date();
  const items = (rows.rows as any[]).map((r) => {
    let subscriptionStatus = 'Aktif';
    if (r.userPlan === 'trial' || r.userPlan === 'free') subscriptionStatus = 'Deneme/Ücretsiz';
    else if (r.expiresAt && new Date(r.expiresAt) < now) subscriptionStatus = 'Süresi dolmuş';
    return {
      customerName: r.customerName || '—',
      storeSlug: r.storeSlug ?? null,
      storeName: r.storeName ?? null,
      plan: r.plan || '—',
      subscriptionStatus,
      commissionAmount: Number(r.commissionAmount) || 0,
      saleDate: r.saleDate,
      commissionId: r.commissionId,
      status: r.status || 'pending',
    };
  });

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/** Komisyon durum sayıları: beklemede, onaylandı, ödendi, iptal. */
export async function getCommissionStatusCounts(affiliateId: string): Promise<{
  pending: number;
  approved: number;
  paid: number;
  cancelled: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
}> {
  const r = await sql`
    SELECT status, COUNT(*)::int as cnt, COALESCE(SUM(commission_amount), 0)::numeric as amt
    FROM affiliate_commissions
    WHERE affiliate_id = ${affiliateId}
    GROUP BY status
  `;
  const map: Record<string, { count: number; amount: number }> = {};
  (r.rows as { status: string; cnt: number; amt: number }[]).forEach((x) => {
    map[x.status] = { count: x.cnt, amount: Number(x.amt) };
  });
  return {
    pending: map.pending?.count ?? 0,
    approved: map.approved?.count ?? 0,
    paid: map.paid?.count ?? 0,
    cancelled: map.cancelled?.count ?? 0,
    pendingAmount: map.pending?.amount ?? 0,
    approvedAmount: map.approved?.amount ?? 0,
    paidAmount: map.paid?.amount ?? 0,
  };
}

/** Bakiye: çekilebilir (onaylı + 7 gün geçmiş), bekleyen, toplam kazanılan, sonraki ödeme tarihi. */
export async function getAffiliateBalances(affiliateId: string): Promise<{
  withdrawableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  nextPayoutDate: string | null;
  daysUntilPayout: number | null;
  minPayoutAmount: number;
}> {
  const commissions = await sql`
    SELECT commission_amount, status, created_at
    FROM affiliate_commissions
    WHERE affiliate_id = ${affiliateId}
  `;
  const holdUntil = new Date();
  holdUntil.setDate(holdUntil.getDate() - SECURITY_HOLD_DAYS);
  let withdrawableBalance = 0;
  let pendingBalance = 0;
  let totalEarned = 0;
  const commissionDates: string[] = [];
  (commissions.rows as { commission_amount: number; status: string; created_at: string }[]).forEach((c) => {
    const amt = Number(c.commission_amount) || 0;
    totalEarned += amt;
    if (c.status === 'paid') return;
    if (c.status === 'cancelled') return;
    if (c.status === 'pending' || c.status === 'approved') {
      pendingBalance += amt;
      const created = new Date(c.created_at);
      if (created < holdUntil) withdrawableBalance += amt;
      commissionDates.push(c.created_at);
    }
  });
  const { nextPayoutDate, daysUntilPayout } = getNextPayoutFromCommissions(commissionDates);
  return {
    withdrawableBalance,
    pendingBalance,
    totalEarned,
    nextPayoutDate,
    daysUntilPayout,
    minPayoutAmount: MIN_PAYOUT_AMOUNT,
  };
}

/** Ödeme geçmişi: tutar, tarih, durum, maskelenmiş IBAN, işlem ref. */
export async function getAffiliatePaymentHistory(
  affiliateId: string,
  opts: { page?: number; limit?: number }
): Promise<{
  items: { id: string; amount: number; paidAt: string; status: string; maskedIban: string | null; transactionRef: string | null }[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(50, Math.max(5, opts.limit ?? 20));
  const offset = (page - 1) * limit;
  const countRes = await sql`SELECT COUNT(*)::int as c FROM affiliate_payments WHERE affiliate_id = ${affiliateId}`;
  const total = Number((countRes.rows[0] as { c: number })?.c ?? 0);
  const rows = await sql`
    SELECT id, amount, paid_at as "paidAt", status, masked_iban as "maskedIban", transaction_ref as "transactionRef"
    FROM affiliate_payments
    WHERE affiliate_id = ${affiliateId}
    ORDER BY paid_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const items = (rows.rows as any[]).map((r) => ({
    id: r.id,
    amount: Number(r.amount) || 0,
    paidAt: r.paidAt,
    status: r.status || 'completed',
    maskedIban: r.maskedIban ?? null,
    transactionRef: r.transactionRef ?? null,
  }));
  return { items, total, page, totalPages: Math.ceil(total / limit) || 1 };
}

/** Maskelenmiş IBAN (TR** **** **** **** **** **34). */
export function maskIban(iban: string | null | undefined): string {
  if (!iban || typeof iban !== 'string') return '—';
  const clean = iban.replace(/\s/g, '');
  if (clean.length < 8) return '****';
  return clean.slice(0, 4) + ' **' + ' **** **** **** **** **' + clean.slice(-2);
}

/** Admin: affiliate’e ödeme yap (bekleyen/onaylı komisyonları ödendi yap, ödeme kaydı oluştur). */
export async function processAffiliatePayout(
  affiliateId: string,
  opts: { transactionRef?: string; iban?: string | null }
): Promise<{ success: boolean; amount: number; paymentId: string } | { success: false; error: string }> {
  const commissions = await sql`
    SELECT id, commission_amount FROM affiliate_commissions
    WHERE affiliate_id = ${affiliateId} AND status IN ('pending', 'approved')
  `;
  const rows = commissions.rows as { id: string; commission_amount: number }[];
  if (rows.length === 0) {
    return { success: false, error: 'Ödenecek komisyon yok' };
  }
  const amount = rows.reduce((s, r) => s + Number(r.commission_amount || 0), 0);
  if (amount <= 0) return { success: false, error: 'Toplam tutar 0' };
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const masked = opts.iban ? maskIban(opts.iban) : null;
  await sql`
    INSERT INTO affiliate_payments (id, affiliate_id, amount, paid_at, status, masked_iban, transaction_ref)
    VALUES (${paymentId}, ${affiliateId}, ${amount}, NOW(), 'completed', ${masked}, ${opts.transactionRef ?? null})
  `;
  for (const r of rows) {
    await sql`UPDATE affiliate_commissions SET status = 'paid', paid_at = NOW() WHERE id = ${r.id}`;
  }
  await createAffiliateNotification(
    affiliateId,
    'payment_made',
    'Ödeme yapıldı',
    `₺${amount.toFixed(2)} tutarında ödemeniz hesabınıza yansıtıldı.`
  );
  return { success: true, amount, paymentId };
}

/** Bildirim oluştur. */
export async function createAffiliateNotification(
  affiliateId: string,
  type: string,
  title: string,
  body?: string
): Promise<void> {
  const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  await sql`
    INSERT INTO affiliate_notifications (id, affiliate_id, type, title, body)
    VALUES (${id}, ${affiliateId}, ${type}, ${title}, ${body ?? null})
  `;
}

/** Bildirimleri listele (okunmamış önce). */
export async function getAffiliateNotifications(
  affiliateId: string,
  opts: { limit?: number; unreadOnly?: boolean }
): Promise<{ id: string; type: string; title: string; body: string | null; readAt: string | null; createdAt: string }[]> {
  const limit = Math.min(50, opts.limit ?? 20);
  const includeRead = !opts.unreadOnly;
  const rows = await sql`
    SELECT id, type, title, body, read_at as "readAt", created_at as "createdAt"
    FROM affiliate_notifications
    WHERE affiliate_id = ${affiliateId}
      AND (${includeRead} OR read_at IS NULL)
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.rows as any[];
}

/** Bildirimi okundu işaretle. */
export async function markNotificationRead(notificationId: string, affiliateId: string): Promise<boolean> {
  const r = await sql`
    UPDATE affiliate_notifications SET read_at = NOW() WHERE id = ${notificationId} AND affiliate_id = ${affiliateId} RETURNING id
  `;
  return (r.rows?.length ?? 0) > 0;
}

/** Tıklama / kayıt / satış karşılaştırma (son 30 gün günlük). */
export async function getClickSignupSaleChart(affiliateId: string): Promise<{
  dates: string[];
  clicks: number[];
  signups: number[];
  sales: number[];
}> {
  const today = new Date();
  const dates: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  const [clicksRes, signupsRes, salesRes] = await Promise.all([
    sql`
      SELECT DATE(created_at) as d, COUNT(*)::int as c
      FROM affiliate_clicks WHERE affiliate_id = ${affiliateId} AND created_at >= ${dates[0]}
      GROUP BY DATE(created_at)
    `,
    sql`
      SELECT DATE(created_at) as d, COUNT(*)::int as c
      FROM users WHERE referred_by_affiliate_id = ${affiliateId} AND created_at >= ${dates[0]}
      GROUP BY DATE(created_at)
    `,
    sql`
      SELECT DATE(created_at) as d, COUNT(*)::int as c
      FROM affiliate_commissions WHERE affiliate_id = ${affiliateId} AND created_at >= ${dates[0]}
      GROUP BY DATE(created_at)
    `,
  ]);
  const clicksByDate: Record<string, number> = {};
  const signupsByDate: Record<string, number> = {};
  const salesByDate: Record<string, number> = {};
  dates.forEach((d) => {
    clicksByDate[d] = 0;
    signupsByDate[d] = 0;
    salesByDate[d] = 0;
  });
  (clicksRes.rows as { d: string; c: number }[]).forEach((r) => {
    const d = String(r.d).slice(0, 10);
    if (dates.includes(d)) clicksByDate[d] = r.c;
  });
  (signupsRes.rows as { d: string; c: number }[]).forEach((r) => {
    const d = String(r.d).slice(0, 10);
    if (dates.includes(d)) signupsByDate[d] = r.c;
  });
  (salesRes.rows as { d: string; c: number }[]).forEach((r) => {
    const d = String(r.d).slice(0, 10);
    if (dates.includes(d)) salesByDate[d] = r.c;
  });
  return {
    dates,
    clicks: dates.map((d) => clicksByDate[d] ?? 0),
    signups: dates.map((d) => signupsByDate[d] ?? 0),
    sales: dates.map((d) => salesByDate[d] ?? 0),
  };
}
