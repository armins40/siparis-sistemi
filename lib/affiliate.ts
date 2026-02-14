/**
 * Affiliate: komisyon oranları (satış planına göre), KDV sonrası hesaplama, kayıt.
 * Yıllık %20, aylık %10. 6 aylık %15. KDV çıktıktan sonra komisyon hesaplanır.
 */
import { sql } from '@/lib/db/client';

export const AFFILIATE_RATES = {
  yearly: 20,
  '6month': 15,
  monthly: 10,
} as const;

export type AffiliatePlan = keyof typeof AFFILIATE_RATES;

/** Ödeme periyodu: satış yapıldıktan sonra X gün sonra ödeme tarihi. */
export const PAYOUT_DAYS = 5;
/** Minimum çekim tutarı (TL). */
export const MIN_PAYOUT_AMOUNT = 1000;

/**
 * Son komisyon tarihinden sonraki ödeme tarihi ve kalan gün sayısı.
 * Satış (komisyon) yapıldıktan sonra 5 gün geri sayım başlar.
 */
export function getNextPayoutFromCommissions(commissionDates: (string | Date)[]): { nextPayoutDate: string | null; daysUntilPayout: number | null } {
  if (!commissionDates.length) return { nextPayoutDate: null, daysUntilPayout: null };
  const dates = commissionDates.map((d) => new Date(d).getTime()).filter((t) => !isNaN(t));
  if (!dates.length) return { nextPayoutDate: null, daysUntilPayout: null };
  const lastMs = Math.max(...dates);
  const lastDate = new Date(lastMs);
  const next = new Date(lastDate);
  next.setDate(next.getDate() + PAYOUT_DAYS);
  const nextStr = next.toISOString().slice(0, 10);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextStart = new Date(nextStr + 'T00:00:00');
  const diffMs = nextStart.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  return { nextPayoutDate: nextStr, daysUntilPayout: daysUntil < 0 ? 0 : daysUntil };
}

/** KDV oranı (0-100). Settings'ten okunabilir; varsayılan 20 */
const DEFAULT_KDV = 20;

/**
 * KDV dahil tutarı KDV hariçe çevirir.
 * amountGross = amountNet * (1 + kdv/100) => amountNet = amountGross / (1 + kdv/100)
 */
export function amountAfterVat(amountGross: number, kdvRate: number = DEFAULT_KDV): number {
  if (kdvRate <= 0) return amountGross;
  return Math.round((amountGross / (1 + kdvRate / 100)) * 100) / 100;
}

/**
 * Komisyon tutarını hesaplar: KDV sonrası tutar * oran / 100
 */
export function commissionAmount(amountAfterVat: number, plan: AffiliatePlan): number {
  const rate = AFFILIATE_RATES[plan] ?? AFFILIATE_RATES.monthly;
  return Math.round(amountAfterVat * (rate / 100) * 100) / 100;
}

/**
 * Tek satırda: brüt tutar + KDV oranı + plan -> komisyon tutarı
 */
export function calculateCommission(
  amountGross: number,
  plan: 'monthly' | '6month' | 'yearly',
  kdvRate: number = DEFAULT_KDV
): { amountAfterVat: number; rate: number; commissionAmount: number } {
  const amountAfterVatVal = amountAfterVat(amountGross, kdvRate);
  const rate = AFFILIATE_RATES[plan as AffiliatePlan] ?? AFFILIATE_RATES.monthly;
  const commissionAmountVal = commissionAmount(amountAfterVatVal, plan as AffiliatePlan);
  return { amountAfterVat: amountAfterVatVal, rate, commissionAmount: commissionAmountVal };
}

export interface AffiliateCommissionRow {
  id: string;
  affiliate_id: string;
  referred_user_id: string;
  plan: string;
  amount_gross: number;
  amount_after_vat: number;
  commission_rate: number;
  commission_amount: number;
  payment_type: string;
  status: string;
  created_at: string;
}

/**
 * Komisyon kaydı oluşturur (ödeme başarılı olduğunda çağrılır).
 */
export async function createAffiliateCommission(params: {
  affiliateId: string;
  referredUserId: string;
  plan: 'monthly' | '6month' | 'yearly';
  amountGross: number;
  kdvRate?: number;
  paymentType?: 'first' | 'renewal';
}): Promise<boolean> {
  const { affiliateId, referredUserId, plan, amountGross, paymentType = 'first' } = params;
  const kdvRate = params.kdvRate ?? DEFAULT_KDV;
  const { amountAfterVat: amountAfterVatVal, rate, commissionAmount: commissionAmountVal } = calculateCommission(
    amountGross,
    plan,
    kdvRate
  );
  const id = `ac_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  try {
    await sql`
      INSERT INTO affiliate_commissions (
        id, affiliate_id, referred_user_id, plan,
        amount_gross, amount_after_vat, commission_rate, commission_amount,
        payment_type, status
      ) VALUES (
        ${id}, ${affiliateId}, ${referredUserId}, ${plan},
        ${amountGross}, ${amountAfterVatVal}, ${rate}, ${commissionAmountVal},
        ${paymentType}, 'pending'
      )
    `;
    return true;
  } catch (e) {
    console.error('createAffiliateCommission error:', e);
    return false;
  }
}

/**
 * Affiliate kodu ile affiliate id döner (affiliates tablosu).
 */
export async function getAffiliateIdByCode(code: string | null | undefined): Promise<string | null> {
  if (!code || typeof code !== 'string' || !code.trim()) return null;
  const normalized = code.trim().toLowerCase();
  const result = await sql`
    SELECT id FROM affiliates WHERE code = ${normalized} LIMIT 1
  `;
  return (result.rows[0] as { id?: string })?.id ?? null;
}

function generateAffiliateCode(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export interface AffiliateRow {
  id: string;
  name: string;
  email: string;
  code: string;
  created_at: string;
  iban?: string | null;
  payment_name?: string | null;
  is_suspended?: boolean;
}

/** Kullanıcı kodunda izin verilen karakterler: küçük harf, rakam, alt çizgi. 3-24 karakter. */
export function normalizeAffiliateCode(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (trimmed.length < 3 || trimmed.length > 24) return null;
  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9_]/g, '');
  return normalized.length >= 3 ? normalized : null;
}

/**
 * Yeni affiliate kaydı (YouTuber/promoter). İstenirse kendi kodu (kanal adı vb.), yoksa otomatik kod.
 */
export async function registerAffiliate(params: {
  name: string;
  email: string;
  passwordHash: string;
  code?: string | null;
  iban?: string | null;
  payment_name?: string | null;
}): Promise<{ id: string; code: string } | { error: 'email_taken' | 'code_taken' | 'code_invalid' }> {
  const { name, email, passwordHash, code: requestedCode, iban, payment_name } = params;
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await sql`SELECT id FROM affiliates WHERE email = ${normalizedEmail} LIMIT 1`;
  if (existing.rows.length > 0) return { error: 'email_taken' };

  const id = `aff_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  let code: string;
  if (requestedCode && requestedCode.trim()) {
    const normalized = normalizeAffiliateCode(requestedCode);
    if (!normalized) return { error: 'code_invalid' };
    const taken = await sql`SELECT id FROM affiliates WHERE code = ${normalized} LIMIT 1`;
    if (taken.rows.length > 0) return { error: 'code_taken' };
    code = normalized;
  } else {
    code = generateAffiliateCode();
    for (let i = 0; i < 5; i++) {
      const c = await sql`SELECT id FROM affiliates WHERE code = ${code} LIMIT 1`;
      if (c.rows.length === 0) break;
      code = generateAffiliateCode();
    }
  }
  const ibanVal = iban != null && String(iban).trim() ? String(iban).trim() : null;
  const paymentNameVal = payment_name != null && String(payment_name).trim() ? String(payment_name).trim() : null;
  await sql`
    INSERT INTO affiliates (id, name, email, password_hash, code, iban, payment_name)
    VALUES (${id}, ${name.trim()}, ${normalizedEmail}, ${passwordHash}, ${code}, ${ibanVal}, ${paymentNameVal})
  `;
  return { id, code };
}

export async function getAffiliateByEmail(email: string): Promise<AffiliateRow | null> {
  const normalized = email.trim().toLowerCase();
  const result = await sql`
    SELECT id, name, email, code, created_at, iban, payment_name, COALESCE(is_suspended, false) as is_suspended FROM affiliates WHERE email = ${normalized} LIMIT 1
  `;
  return (result.rows[0] as AffiliateRow) ?? null;
}

export async function getAffiliateById(id: string): Promise<AffiliateRow | null> {
  const result = await sql`
    SELECT id, name, email, code, created_at, iban, payment_name, COALESCE(is_suspended, false) as is_suspended FROM affiliates WHERE id = ${id} LIMIT 1
  `;
  return (result.rows[0] as AffiliateRow) ?? null;
}

/** Affiliate ödeme bilgilerini günceller (IBAN, hesap adı). */
export async function updateAffiliatePaymentInfo(
  affiliateId: string,
  data: { iban?: string | null; payment_name?: string | null }
): Promise<boolean> {
  const ibanVal = data.iban != null ? (String(data.iban).trim() || null) : undefined;
  const paymentNameVal = data.payment_name != null ? (String(data.payment_name).trim() || null) : undefined;
  if (ibanVal === undefined && paymentNameVal === undefined) return true;
  if (ibanVal !== undefined && paymentNameVal !== undefined) {
    await sql`UPDATE affiliates SET iban = ${ibanVal}, payment_name = ${paymentNameVal} WHERE id = ${affiliateId}`;
  } else if (ibanVal !== undefined) {
    await sql`UPDATE affiliates SET iban = ${ibanVal} WHERE id = ${affiliateId}`;
  } else {
    await sql`UPDATE affiliates SET payment_name = ${paymentNameVal} WHERE id = ${affiliateId}`;
  }
  return true;
}

export async function getAffiliatePasswordHash(id: string): Promise<string | null> {
  const result = await sql`SELECT password_hash FROM affiliates WHERE id = ${id} LIMIT 1`;
  return (result.rows[0] as { password_hash?: string })?.password_hash ?? null;
}

/**
 * Affiliate istatistikleri: üye sayısı, aktif, toplam/bekleyen komisyon, son işlemler, günlük/aylık grafik, ödeme geri sayımı.
 */
export async function getAffiliateStats(affiliateId: string): Promise<{
  totalReferrals: number;
  activeReferrals: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  commissionsByMonth: { month: string; amount: number; count: number }[];
  commissionsByDay: { date: string; amount: number }[];
  recentCommissions: AffiliateCommissionRow[];
  nextPayoutDate: string | null;
  daysUntilPayout: number | null;
  minPayoutAmount: number;
}> {
  const [referrals, commissions, recent] = await Promise.all([
    sql`
      SELECT id, plan, expires_at FROM users
      WHERE referred_by_affiliate_id = ${affiliateId}
    `,
    sql`
      SELECT id, plan, amount_gross, amount_after_vat, commission_rate, commission_amount, payment_type, status, created_at, referred_user_id
      FROM affiliate_commissions WHERE affiliate_id = ${affiliateId} ORDER BY created_at DESC
    `,
    sql`
      SELECT id, affiliate_id, referred_user_id, plan, amount_gross, amount_after_vat, commission_rate, commission_amount, payment_type, status, created_at
      FROM affiliate_commissions WHERE affiliate_id = ${affiliateId} ORDER BY created_at DESC LIMIT 20
    `,
  ]);

  const now = new Date();
  let activeReferrals = 0;
  referrals.rows.forEach((r: { expires_at?: string; plan?: string }) => {
    if (r.expires_at) {
      const exp = new Date(r.expires_at);
      if (exp > now && r.plan && !['free', 'trial'].includes(r.plan)) activeReferrals++;
    }
  });

  let totalCommission = 0;
  let pendingCommission = 0;
  let paidCommission = 0;
  const byMonth: Record<string, { amount: number; count: number }> = {};

  const byDay: Record<string, number> = {};
  const commissionRows = commissions.rows as AffiliateCommissionRow[];
  commissionRows.forEach((c) => {
    totalCommission += Number(c.commission_amount) || 0;
    if (c.status === 'pending') pendingCommission += Number(c.commission_amount) || 0;
    if (c.status === 'paid') paidCommission += Number(c.commission_amount) || 0;
    const month = c.created_at ? String(c.created_at).slice(0, 7) : '';
    if (month) {
      if (!byMonth[month]) byMonth[month] = { amount: 0, count: 0 };
      byMonth[month].amount += Number(c.commission_amount) || 0;
      byMonth[month].count += 1;
    }
    const day = c.created_at ? String(c.created_at).slice(0, 10) : '';
    if (day) {
      byDay[day] = (byDay[day] || 0) + Number(c.commission_amount) || 0;
    }
  });

  const commissionsByMonth = Object.entries(byMonth)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 12)
    .map(([month, v]) => ({ month, amount: v.amount, count: v.count }));

  const today = new Date();
  const last30Days: { date: string; amount: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    last30Days.push({ date: dateStr, amount: byDay[dateStr] || 0 });
  }
  const commissionsByDay = last30Days;

  const commissionDates = commissionRows.map((c) => c.created_at).filter(Boolean) as string[];
  const { nextPayoutDate, daysUntilPayout } = getNextPayoutFromCommissions(commissionDates);

  return {
    totalReferrals: referrals.rows.length,
    activeReferrals,
    totalCommission,
    pendingCommission,
    paidCommission,
    commissionsByMonth,
    commissionsByDay,
    recentCommissions: recent.rows as AffiliateCommissionRow[],
    nextPayoutDate,
    daysUntilPayout,
    minPayoutAmount: MIN_PAYOUT_AMOUNT,
  };
}

/** Admin: tüm affiliate'ler ve özet istatistikler (ödemeler için). */
export async function getAdminAffiliatesList(): Promise<{
  affiliates: { id: string; name: string; email: string; code: string; createdAt: string; iban: string | null; paymentName: string | null; isSuspended: boolean; totalReferrals: number; totalCommission: number; pendingCommission: number; paidCommission: number; nextPayoutDate: string | null; daysUntilPayout: number | null }[];
  summary: { totalPending: number; totalPaid: number; affiliateCount: number };
}> {
  const affiliatesResult = await sql`
    SELECT id, name, email, code, created_at as "createdAt", iban, payment_name as "paymentName", COALESCE(is_suspended, false) as "isSuspended"
    FROM affiliates ORDER BY created_at DESC
  `;
  const commissionsResult = await sql`
    SELECT affiliate_id, status, commission_amount, created_at
    FROM affiliate_commissions
  `;
  const referralsResult = await sql`
    SELECT referred_by_affiliate_id FROM users WHERE referred_by_affiliate_id IS NOT NULL
  `;

  type AffiliateListRow = { id: string; name: string; email: string; code: string; createdAt: string; iban: string | null; paymentName: string | null; isSuspended: boolean };
  type CommissionListRow = { affiliate_id: string; status: string; commission_amount: number; created_at: string };
  type ReferralListRow = { referred_by_affiliate_id: string | null };

  const affiliateRows = affiliatesResult.rows as AffiliateListRow[];
  const commissionRows = commissionsResult.rows as CommissionListRow[];
  const referralRows = referralsResult.rows as ReferralListRow[];

  const byAffiliate: Record<string, { total: number; pending: number; paid: number; referrals: number; lastCommissionDate: string | null }> = {};
  affiliateRows.forEach((a) => {
    byAffiliate[a.id] = { total: 0, pending: 0, paid: 0, referrals: 0, lastCommissionDate: null };
  });
  commissionRows.forEach((c) => {
    if (!byAffiliate[c.affiliate_id]) return;
    const amt = Number(c.commission_amount) || 0;
    byAffiliate[c.affiliate_id].total += amt;
    if (c.status === 'pending') byAffiliate[c.affiliate_id].pending += amt;
    if (c.status === 'paid') byAffiliate[c.affiliate_id].paid += amt;
    const created = c.created_at ? String(c.created_at).slice(0, 10) : null;
    if (created) {
      const cur = byAffiliate[c.affiliate_id].lastCommissionDate;
      if (!cur || created > cur) byAffiliate[c.affiliate_id].lastCommissionDate = created;
    }
  });
  referralRows.forEach((r) => {
    if (r.referred_by_affiliate_id && byAffiliate[r.referred_by_affiliate_id])
      byAffiliate[r.referred_by_affiliate_id].referrals += 1;
  });

  let totalPending = 0;
  let totalPaid = 0;
  const affiliates = affiliateRows.map((a) => {
    const stats = byAffiliate[a.id] || { total: 0, pending: 0, paid: 0, referrals: 0, lastCommissionDate: null };
    totalPending += stats.pending;
    totalPaid += stats.paid;
    const { nextPayoutDate, daysUntilPayout } = stats.lastCommissionDate
      ? getNextPayoutFromCommissions([stats.lastCommissionDate])
      : { nextPayoutDate: null as string | null, daysUntilPayout: null as number | null };
    return {
      id: a.id,
      name: a.name,
      email: a.email,
      code: a.code,
      createdAt: a.createdAt,
      iban: a.iban ?? null,
      paymentName: a.paymentName ?? null,
      isSuspended: a.isSuspended ?? false,
      totalReferrals: stats.referrals,
      totalCommission: stats.total,
      pendingCommission: stats.pending,
      paidCommission: stats.paid,
      nextPayoutDate,
      daysUntilPayout,
    };
  });

  return {
    affiliates,
    summary: { totalPending, totalPaid, affiliateCount: affiliates.length },
  };
}
