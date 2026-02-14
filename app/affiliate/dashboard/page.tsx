'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type Stats = {
  totalReferrals: number;
  activeReferrals: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  commissionsByMonth: { month: string; amount: number; count: number }[];
  commissionsByDay: { date: string; amount: number }[];
  recentCommissions: {
    plan: string;
    commission_amount: number;
    payment_type: string;
    status: string;
    created_at: string;
  }[];
  nextPayoutDate: string | null;
  daysUntilPayout: number | null;
  minPayoutAmount: number;
};

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const [affiliate, setAffiliate] = useState<{ id: string; name: string; email: string; code: string; iban: string | null; paymentName: string | null } | null>(null);
  const [editingPayment, setEditingPayment] = useState(false);
  const [paymentIban, setPaymentIban] = useState('');
  const [paymentName, setPaymentName] = useState('');
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversion, setConversion] = useState<{ totalClicks: number; totalSignups: number; paidConversions: number; conversionRate: number; activeSubscriptions: number } | null>(null);
  const [balances, setBalances] = useState<{ withdrawableBalance: number; pendingBalance: number; totalEarned: number; nextPayoutDate: string | null; daysUntilPayout: number | null; minPayoutAmount: number } | null>(null);
  const [commissionStatus, setCommissionStatus] = useState<{ pending: number; approved: number; paid: number; cancelled: number; pendingAmount: number; approvedAmount: number; paidAmount: number } | null>(null);
  const [chartData, setChartData] = useState<{ dates: string[]; clicks: number[]; signups: number[]; sales: number[] } | null>(null);
  const [sales, setSales] = useState<{ items: any[]; total: number; page: number; totalPages: number } | null>(null);
  const [salesPage, setSalesPage] = useState(1);
  const [salesSearch, setSalesSearch] = useState('');
  const [payments, setPayments] = useState<{ items: any[]; total: number; page: number; totalPages: number } | null>(null);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [notifications, setNotifications] = useState<{ id: string; type: string; title: string; body: string | null; readAt: string | null; createdAt: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meRes = await fetch('/api/affiliate/me', { credentials: 'include' });
        const meData = await meRes.json();
        if (!meData.success || !meData.affiliate) {
          if (!cancelled) router.replace('/affiliate/giris');
          return;
        }
        if (!cancelled) {
          setAffiliate(meData.affiliate);
          setPaymentIban(meData.affiliate?.iban ?? '');
          setPaymentName(meData.affiliate?.paymentName ?? '');
        }
        const [statsRes, analyticsRes, balancesRes, statusRes, chartRes] = await Promise.all([
          fetch('/api/affiliate/stats', { credentials: 'include' }),
          fetch('/api/affiliate/analytics', { credentials: 'include' }),
          fetch('/api/affiliate/balances', { credentials: 'include' }),
          fetch('/api/affiliate/commission-status', { credentials: 'include' }),
          fetch('/api/affiliate/chart', { credentials: 'include' }),
        ]);
        const statsData = await statsRes.json();
        if (statsData.success && !cancelled) {
          setStats({
            totalReferrals: statsData.totalReferrals ?? 0,
            activeReferrals: statsData.activeReferrals ?? 0,
            totalCommission: statsData.totalCommission ?? 0,
            pendingCommission: statsData.pendingCommission ?? 0,
            paidCommission: statsData.paidCommission ?? 0,
            commissionsByMonth: statsData.commissionsByMonth ?? [],
            commissionsByDay: statsData.commissionsByDay ?? [],
            recentCommissions: statsData.recentCommissions ?? [],
            nextPayoutDate: statsData.nextPayoutDate ?? null,
            daysUntilPayout: statsData.daysUntilPayout ?? null,
            minPayoutAmount: statsData.minPayoutAmount ?? 1000,
          });
        }
        if (!cancelled && analyticsRes.ok) {
          const d = await analyticsRes.json();
          if (d.success) setConversion({ totalClicks: d.totalClicks ?? 0, totalSignups: d.totalSignups ?? 0, paidConversions: d.paidConversions ?? 0, conversionRate: d.conversionRate ?? 0, activeSubscriptions: d.activeSubscriptions ?? 0 });
        }
        if (!cancelled && balancesRes.ok) {
          const d = await balancesRes.json();
          if (d.success) setBalances({ withdrawableBalance: d.withdrawableBalance ?? 0, pendingBalance: d.pendingBalance ?? 0, totalEarned: d.totalEarned ?? 0, nextPayoutDate: d.nextPayoutDate ?? null, daysUntilPayout: d.daysUntilPayout ?? null, minPayoutAmount: d.minPayoutAmount ?? 1000 });
        }
        if (!cancelled && statusRes.ok) {
          const d = await statusRes.json();
          if (d.success) setCommissionStatus(d);
        }
        if (!cancelled && chartRes.ok) {
          const d = await chartRes.json();
          if (d.success) setChartData({ dates: d.dates ?? [], clicks: d.clicks ?? [], signups: d.signups ?? [], sales: d.sales ?? [] });
        }
      } catch {
        if (!cancelled) router.replace('/affiliate/giris');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  const loadSales = async (page: number = 1, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (search !== undefined && search.trim()) params.set('search', search.trim());
    const res = await fetch(`/api/affiliate/sales?${params}`, { credentials: 'include' });
    const data = await res.json();
    if (data.success) setSales({ items: data.items ?? [], total: data.total ?? 0, page: data.page ?? 1, totalPages: data.totalPages ?? 1 });
  };

  const loadPayments = async (page: number = 1) => {
    const res = await fetch(`/api/affiliate/payments?page=${page}&limit=10`, { credentials: 'include' });
    const data = await res.json();
    if (data.success) setPayments({ items: data.items ?? [], total: data.total ?? 0, page: data.page ?? 1, totalPages: data.totalPages ?? 1 });
  };

  const loadNotifications = async () => {
    const res = await fetch('/api/affiliate/notifications', { credentials: 'include' });
    const data = await res.json();
    if (data.success) setNotifications(data.items ?? []);
  };

  useEffect(() => {
    if (!affiliate) return;
    loadSales(salesPage, salesSearch);
  }, [affiliate, salesPage]);

  useEffect(() => {
    if (!affiliate) return;
    loadPayments(paymentsPage);
  }, [affiliate, paymentsPage]);

  useEffect(() => {
    if (!affiliate) return;
    loadNotifications();
  }, [affiliate]);

  const handleLogout = async () => {
    await fetch('/api/affiliate/logout', { method: 'POST', credentials: 'include' });
    router.replace('/affiliate/giris');
  };

  const handleSavePaymentInfo = async () => {
    setPaymentSaving(true);
    try {
      const res = await fetch('/api/affiliate/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ iban: paymentIban.trim() || null, payment_name: paymentName.trim() || null }),
      });
      const data = await res.json();
      if (data.success && data.affiliate) {
        setAffiliate((a) => (a ? { ...a, iban: data.affiliate.iban, paymentName: data.affiliate.paymentName } : null));
        setEditingPayment(false);
      }
    } finally {
      setPaymentSaving(false);
    }
  };

  const monthLabel = (m: string) => {
    const [y, mo] = m.split('-');
    const months = 'Ocak Şubat Mart Nisan Mayıs Haziran Temmuz Ağustos Eylül Ekim Kasım Aralık'.split(' ');
    return `${months[parseInt(mo || '1', 10) - 1]} ${y}`;
  };

  const dayLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  if (!affiliate) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const affiliateLink = `${baseUrl}/signup?ref=${encodeURIComponent(affiliate.code)}`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/affiliate" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Siparis" width={120} height={34} />
            <span className="text-gray-500 text-sm">Affiliate</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">{affiliate.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-900 text-sm font-medium"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-2">Davet linkiniz</h2>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              readOnly
              value={affiliateLink}
              className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(affiliateLink);
                alert('Link kopyalandı.');
              }}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Kopyala
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-2">Kod: <strong>{affiliate.code}</strong></p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-2">Ödeme bilgileri</h2>
          <p className="text-gray-600 text-sm mb-4">Komisyon ödemesi bu bilgilere yapılacak. Lütfen doğru girin.</p>
          {editingPayment ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hesap adı (ad soyad)</label>
                <input
                  type="text"
                  value={paymentName}
                  onChange={(e) => setPaymentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Banka hesabındaki ad soyad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                <input
                  type="text"
                  value={paymentIban}
                  onChange={(e) => setPaymentIban(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSavePaymentInfo}
                  disabled={paymentSaving}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {paymentSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingPayment(false); setPaymentIban(affiliate.iban ?? ''); setPaymentName(affiliate.paymentName ?? ''); }}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-700"><span className="text-gray-500">Ad soyad:</span> {affiliate.paymentName || '—'}</p>
              <p className="text-sm text-gray-700 font-mono mt-1"><span className="text-gray-500">IBAN:</span> {affiliate.iban || '—'}</p>
              <button
                type="button"
                onClick={() => setEditingPayment(true)}
                className="mt-3 text-sm font-medium text-gray-900 underline hover:no-underline"
              >
                Düzenle
              </button>
            </>
          )}
        </div>

        {/* Dönüşüm analizi */}
        {conversion && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Dönüşüm analizi</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-xs">Toplam tıklama</p>
                <p className="text-xl font-bold text-gray-900">{conversion.totalClicks}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-xs">Kayıt olan</p>
                <p className="text-xl font-bold text-gray-900">{conversion.totalSignups}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-xs">Ücretli dönüşüm</p>
                <p className="text-xl font-bold text-green-600">{conversion.paidConversions}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-xs">Dönüşüm oranı</p>
                <p className="text-xl font-bold text-gray-900">%{conversion.conversionRate}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-xs">Aktif abonelik</p>
                <p className="text-xl font-bold text-gray-900">{conversion.activeSubscriptions}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bakiye: çekilebilir, bekleyen, toplam, sonraki ödeme */}
        {balances && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Bakiye özeti</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-green-800 text-sm">Çekilebilir bakiye</p>
                <p className="text-2xl font-bold text-green-900">₺{balances.withdrawableBalance.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-amber-800 text-sm">Bekleyen bakiye</p>
                <p className="text-2xl font-bold text-amber-900">₺{balances.pendingBalance.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm">Toplam kazanılan</p>
                <p className="text-2xl font-bold text-gray-900">₺{balances.totalEarned.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm">Sonraki ödeme</p>
                <p className="text-lg font-bold text-gray-900">
                  {balances.daysUntilPayout !== null ? (balances.daysUntilPayout === 0 ? 'Bugün' : `${balances.daysUntilPayout} gün sonra`) : '—'}
                </p>
                {balances.nextPayoutDate && <p className="text-xs text-gray-500">{new Date(balances.nextPayoutDate + 'T12:00:00').toLocaleDateString('tr-TR')}</p>}
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-2">Minimum çekim: ₺{balances.minPayoutAmount.toLocaleString('tr-TR')}. Ödeme öncesi 7 gün güvenlik bekleme süresi uygulanır.</p>
          </div>
        )}

        {/* Komisyon durumu: Beklemede, Onaylandı, Ödendi, İptal */}
        {commissionStatus && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Komisyon durumu</h2>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-amber-800 font-medium">Beklemede</span>
                <span className="text-amber-900 font-bold">{commissionStatus.pending} adet · ₺{commissionStatus.pendingAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-blue-800 font-medium">Onaylandı</span>
                <span className="text-blue-900 font-bold">{commissionStatus.approved} adet · ₺{commissionStatus.approvedAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-200">
                <span className="text-green-800 font-medium">Ödendi</span>
                <span className="text-green-900 font-bold">{commissionStatus.paid} adet · ₺{commissionStatus.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 border border-gray-200">
                <span className="text-gray-600 font-medium">İptal</span>
                <span className="text-gray-700 font-bold">{commissionStatus.cancelled} adet</span>
              </div>
            </div>
          </div>
        )}

        {/* Tıklama / kayıt / satış karşılaştırma grafiği */}
        {chartData && chartData.dates.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Tıklama / kayıt / satış (son 30 gün)</h3>
            <div className="flex items-end gap-0.5 h-40">
              {chartData.dates.map((_, i) => {
                const maxVal = Math.max(...chartData.clicks, ...chartData.signups, ...chartData.sales, 1);
                const c = (chartData.clicks[i] ?? 0) / maxVal * 100;
                const s = (chartData.signups[i] ?? 0) / maxVal * 100;
                const sale = (chartData.sales[i] ?? 0) / maxVal * 100;
                return (
                  <div key={i} className="flex-1 min-w-0 flex flex-col items-center gap-0.5" title={`${chartData.dates[i]}: Tıklama ${chartData.clicks[i] ?? 0}, Kayıt ${chartData.signups[i] ?? 0}, Satış ${chartData.sales[i] ?? 0}`}>
                    <div className="w-full flex gap-0.5" style={{ height: '100%' }}>
                      <div className="flex-1 bg-blue-400 rounded-t min-h-[2px]" style={{ height: `${Math.max(c, 2)}%` }} />
                      <div className="flex-1 bg-amber-400 rounded-t min-h-[2px]" style={{ height: `${Math.max(s, 2)}%` }} />
                      <div className="flex-1 bg-green-500 rounded-t min-h-[2px]" style={{ height: `${Math.max(sale, 2)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span><span className="inline-block w-3 h-3 rounded bg-blue-400" /> Tıklama</span>
              <span><span className="inline-block w-3 h-3 rounded bg-amber-400" /> Kayıt</span>
              <span><span className="inline-block w-3 h-3 rounded bg-green-500" /> Satış</span>
            </div>
          </div>
        )}

        {/* Satış detayları tablosu */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Satış detayları</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Müşteri, mağaza ara..."
              value={salesSearch}
              onChange={(e) => setSalesSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48"
            />
            <button type="button" onClick={() => loadSales(1, salesSearch)} className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm">Ara</button>
          </div>
          {sales ? (
            sales.items.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">Henüz satış kaydı yok.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Müşteri</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Mağaza</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Paket</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Abonelik</th>
                        <th className="px-3 py-2 text-right text-gray-500 font-medium">Komisyon</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Tarih</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sales.items.map((row: any) => (
                        <tr key={row.commissionId} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-900">{row.customerName}</td>
                          <td className="px-3 py-2 text-gray-600">{row.storeName || row.storeSlug || '—'}</td>
                          <td className="px-3 py-2">{row.plan}</td>
                          <td className="px-3 py-2">
                            <span className={row.subscriptionStatus === 'Aktif' ? 'text-green-600' : row.subscriptionStatus === 'Süresi dolmuş' ? 'text-red-600' : 'text-gray-500'}>{row.subscriptionStatus}</span>
                          </td>
                          <td className="px-3 py-2 text-right font-medium">₺{row.commissionAmount?.toFixed(2)}</td>
                          <td className="px-3 py-2 text-gray-500">{row.saleDate ? new Date(row.saleDate).toLocaleDateString('tr-TR') : '—'}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              row.status === 'paid' ? 'bg-green-100 text-green-800' :
                              row.status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
                              row.status === 'approved' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>{row.status === 'paid' ? 'Ödendi' : row.status === 'approved' ? 'Onaylandı' : row.status === 'cancelled' ? 'İptal' : 'Beklemede'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-gray-500 text-sm">Toplam {sales.total} kayıt</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={sales.page <= 1} onClick={() => setSalesPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Önceki</button>
                    <span className="px-3 py-1 text-sm">Sayfa {sales.page} / {sales.totalPages}</span>
                    <button type="button" disabled={sales.page >= sales.totalPages} onClick={() => setSalesPage((p) => p + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Sonraki</button>
                  </div>
                </div>
              </>
            )
          ) : (
            <p className="text-gray-500 text-sm py-4">Yükleniyor...</p>
          )}
        </div>

        {/* Ödeme geçmişi */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Ödeme geçmişi</h2>
          {payments ? (
            payments.items.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">Henüz ödeme kaydı yok.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Tutar</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Tarih</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Durum</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">IBAN</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">İşlem ref.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {payments.items.map((p: any) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium">₺{p.amount?.toFixed(2)}</td>
                          <td className="px-3 py-2 text-gray-600">{p.paidAt ? new Date(p.paidAt).toLocaleDateString('tr-TR') : '—'}</td>
                          <td className="px-3 py-2"><span className="text-green-600">{p.status === 'completed' ? 'Tamamlandı' : p.status}</span></td>
                          <td className="px-3 py-2 font-mono text-gray-500">{p.maskedIban || '—'}</td>
                          <td className="px-3 py-2 text-gray-500">{p.transactionRef || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-gray-500 text-sm">Toplam {payments.total} ödeme</p>
                  {payments.totalPages > 1 && (
                    <div className="flex gap-2">
                      <button type="button" disabled={paymentsPage <= 1} onClick={() => setPaymentsPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Önceki</button>
                      <span className="px-3 py-1 text-sm">Sayfa {paymentsPage} / {payments.totalPages}</span>
                      <button type="button" disabled={paymentsPage >= payments.totalPages} onClick={() => setPaymentsPage((p) => p + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Sonraki</button>
                    </div>
                  )}
                </div>
              </>
            )
          ) : (
            <p className="text-gray-500 text-sm py-4">Yükleniyor...</p>
          )}
        </div>

        {/* Bildirimler */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Bildirimler</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">Bildirim yok.</p>
          ) : (
            <ul className="space-y-2">
              {notifications.slice(0, 10).map((n) => (
                <li key={n.id} className={`flex justify-between items-start gap-2 p-3 rounded-lg ${n.readAt ? 'bg-gray-50' : 'bg-amber-50'}`}>
                  <div>
                    <p className="font-medium text-gray-900">{n.title}</p>
                    {n.body && <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>}
                    <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString('tr-TR')}</p>
                  </div>
                  {!n.readAt && (
                    <button type="button" onClick={async () => { await fetch('/api/affiliate/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ id: n.id }) }); loadNotifications(); }} className="text-xs text-gray-500 underline">Okundu</button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {stats && (
          <>
            {/* Ödeme takvimi: 5 günde bir, min 1000 TL, geri sayım satış sonrası başlar */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-amber-900 mb-2">Ödeme takvimi</h3>
              <p className="text-amber-800 text-sm mb-3">Ödemeler 5 günde bir yapılır. Geri sayım son satışınızdan sonra başlar. Minimum çekim tutarı ₺{stats.minPayoutAmount.toLocaleString('tr-TR')}’dir.</p>
              {stats.daysUntilPayout !== null && stats.nextPayoutDate ? (
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-2xl font-bold text-amber-900">
                    Sonraki ödeme: {stats.daysUntilPayout === 0 ? 'Bugün' : `${stats.daysUntilPayout} gün sonra`}
                  </span>
                  <span className="text-amber-700 text-sm">
                    ({new Date(stats.nextPayoutDate + 'T12:00:00').toLocaleDateString('tr-TR')})
                  </span>
                </div>
              ) : (
                <p className="text-amber-700 text-sm">Henüz komisyonunuz yok. Satış yapıldıktan sonra ödeme tarihi burada görünecek.</p>
              )}
              <p className="text-amber-800 text-sm mt-2">
                Bekleyen: <strong>₺{stats.pendingCommission.toFixed(2)}</strong>
                {stats.pendingCommission < stats.minPayoutAmount && stats.pendingCommission > 0 && (
                  <span> — Çekim için en az ₺{stats.minPayoutAmount.toLocaleString('tr-TR')} birikmesi gerekir.</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-gray-500 text-sm">Toplam üye</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-gray-500 text-sm">Aktif üye</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeReferrals}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-gray-500 text-sm">Toplam komisyon</p>
                <p className="text-2xl font-bold text-green-600">₺{stats.totalCommission.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-gray-500 text-sm">Bekleyen</p>
                <p className="text-2xl font-bold text-amber-600">₺{stats.pendingCommission.toFixed(2)}</p>
              </div>
            </div>

            {/* Günlük kazanç grafiği (son 30 gün) */}
            {stats.commissionsByDay && stats.commissionsByDay.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Günlük kazanç (son 30 gün)</h3>
                <div className="flex items-end gap-0.5 h-32">
                  {stats.commissionsByDay.map((d) => {
                    const maxDay = Math.max(...stats.commissionsByDay.map((x) => x.amount), 1);
                    const pct = maxDay > 0 ? (d.amount / maxDay) * 100 : 0;
                    return (
                      <div
                        key={d.date}
                        className="flex-1 min-w-0 flex flex-col items-center group"
                        title={`${dayLabel(d.date)}: ₺${d.amount.toFixed(2)}`}
                      >
                        <div
                          className="w-full bg-green-500 rounded-t min-h-[2px] transition-all"
                          style={{ height: `${Math.max(pct, 2)}%` }}
                        />
                        <span className="text-[10px] text-gray-400 mt-1 truncate w-full text-center hidden sm:block">
                          {dayLabel(d.date)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-gray-500 text-xs mt-2">Her çubuk bir gün; üzerine gelince tutar görünür.</p>
              </div>
            )}

            {/* Aylık kazanç grafiği */}
            {stats.commissionsByMonth && stats.commissionsByMonth.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Aylık kazanç</h3>
                <div className="space-y-3">
                  {stats.commissionsByMonth.slice(0, 12).map((row) => {
                    const maxMonth = Math.max(...stats.commissionsByMonth.map((x) => x.amount), 1);
                    const pct = maxMonth > 0 ? (row.amount / maxMonth) * 100 : 0;
                    return (
                      <div key={row.month} className="flex items-center gap-3">
                        <span className="text-gray-600 text-sm w-24 shrink-0">{monthLabel(row.month)}</span>
                        <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded"
                            style={{ width: `${pct}%`, minWidth: row.amount > 0 ? '4px' : 0 }}
                          />
                        </div>
                        <span className="text-sm font-medium w-20 text-right">₺{row.amount.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {stats.recentCommissions.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Son komisyonlar</h3>
                <ul className="space-y-2">
                  {stats.recentCommissions.map((c, i) => (
                    <li key={i} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-600">
                        {new Date(c.created_at).toLocaleDateString('tr-TR')} · {c.plan} · {c.payment_type === 'renewal' ? 'Yenileme' : 'İlk'}
                      </span>
                      <span className="font-medium">₺{Number(c.commission_amount).toFixed(2)} ({c.status === 'paid' ? 'Ödendi' : 'Bekliyor'})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-700">Ödeme nasıl yapılır?</p>
              <p className="mt-1">Ödemeler 5 günde bir yapılır; geri sayım son satışından sonra başlar. Minimum çekim ₺1.000’dir. Ödeme, kayıtlı ad soyad ve IBAN bilgine havale/EFT ile yapılır. Sonraki ödeme tarihi ve kalan gün yukarıdaki ödeme takviminde görünür. IBAN ve hesap adını “Ödeme bilgileri” bölümünden güncelleyebilirsiniz.</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
