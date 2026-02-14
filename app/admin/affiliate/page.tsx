'use client';

import { useEffect, useState } from 'react';
import { isAdminAuthenticated } from '@/lib/admin';

type AffiliateRow = {
  id: string;
  name: string;
  email: string;
  code: string;
  createdAt: string;
  iban: string | null;
  paymentName: string | null;
  isSuspended: boolean;
  totalReferrals: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  nextPayoutDate: string | null;
  daysUntilPayout: number | null;
};

type Summary = {
  totalPending: number;
  totalPaid: number;
  affiliateCount: number;
};

export default function AdminAffiliatePage() {
  const [affiliates, setAffiliates] = useState<AffiliateRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!isAdminAuthenticated()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/affiliates', { credentials: 'include' });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Yüklenemedi');
        return;
      }
      setAffiliates(data.affiliates || []);
      setSummary(data.summary || null);
    } catch {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ortaklık (Affiliate)</h1>
        <p className="text-gray-600 mt-1">Programa katılanlar ve ödenecek komisyonlar. Ödemeler 5 günde bir yapılır (son satıştan itibaren); minimum çekim ₺1.000.</p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <p className="text-amber-800 text-sm font-medium">Toplam ödemeniz gereken (bekleyen)</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">₺{summary.totalPending.toFixed(2)}</p>
            <p className="text-amber-700 text-xs mt-1">pending durumundaki komisyonlar</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <p className="text-green-800 text-sm font-medium">Ödenen toplam</p>
            <p className="text-2xl font-bold text-green-900 mt-1">₺{summary.totalPaid.toFixed(2)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-gray-600 text-sm font-medium">Kayıtlı affiliate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.affiliateCount}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button onClick={load} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
            Yeniden dene
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <h2 className="px-6 py-4 border-b border-gray-200 font-semibold text-gray-900">Affiliate listesi</h2>
        {loading ? (
          <div className="p-12 text-center text-gray-500">Yükleniyor...</div>
        ) : affiliates.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Henüz kayıtlı affiliate yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İsim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kod</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad soyad (ödeme)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IBAN</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sonraki ödeme</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Üye sayısı</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Toplam komisyon</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Bekleyen (öde)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ödenen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {affiliates.map((a) => (
                  <tr key={a.id} className={`hover:bg-gray-50 ${a.isSuspended ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-3 text-sm text-gray-900">{a.name} {a.isSuspended && <span className="text-red-600 text-xs">(Askıda)</span>}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{a.email}</td>
                    <td className="px-6 py-3 text-sm font-mono text-gray-700">{a.code}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{a.paymentName || '—'}</td>
                    <td className="px-6 py-3 text-sm font-mono text-gray-600 max-w-[200px] truncate" title={a.iban ?? ''}>{a.iban || '—'}</td>
                    <td className="px-6 py-3 text-sm text-center text-gray-700">
                      {a.daysUntilPayout !== null ? (
                        <span title={a.nextPayoutDate ? new Date(a.nextPayoutDate + 'T12:00:00').toLocaleDateString('tr-TR') : ''}>
                          {a.daysUntilPayout === 0 ? 'Bugün' : `${a.daysUntilPayout} gün`}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{a.totalReferrals}</td>
                    <td className="px-6 py-3 text-sm text-right font-medium">₺{a.totalCommission.toFixed(2)}</td>
                    <td className="px-6 py-3 text-sm text-right text-amber-600 font-medium">₺{a.pendingCommission.toFixed(2)}</td>
                    <td className="px-6 py-3 text-sm text-right text-green-600">₺{a.paidCommission.toFixed(2)}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{new Date(a.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td className="px-6 py-3 text-sm">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm(a.isSuspended ? 'Hesabı tekrar aktif etmek istediğinize emin misiniz?' : 'Bu affiliate hesabını askıya almak istediğinize emin misiniz?')) return;
                          const res = await fetch('/api/admin/affiliates', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ affiliateId: a.id, isSuspended: !a.isSuspended }) });
                          const data = await res.json();
                          if (data.success) load();
                        }}
                        className={`mr-2 px-2 py-1 rounded text-xs font-medium ${a.isSuspended ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                      >
                        {a.isSuspended ? 'Aktif et' : 'Askıya al'}
                      </button>
                      {a.pendingCommission >= 1000 && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm(`₺${a.pendingCommission.toFixed(2)} ödeme yapılacak. Onaylıyor musunuz?`)) return;
                            const res = await fetch('/api/admin/affiliates/payout', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ affiliateId: a.id }) });
                            const data = await res.json();
                            if (data.success) { alert(`Ödeme kaydedildi: ₺${data.amount?.toFixed(2)}`); load(); }
                            else alert(data.error || 'İşlem başarısız');
                          }}
                          className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
                        >
                          Ödeme yap
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700">Ödeme nasıl yapılır?</p>
        <p className="mt-1">Ödemeler <strong>5 günde bir</strong> yapılır; geri sayım ilgili affiliate’in <strong>son satışından</strong> sonra başlar. <strong>Minimum çekim ₺1.000</strong>’dir. Tabloda her affiliate’in <strong>Ad soyad (ödeme)</strong>, <strong>IBAN</strong> ve <strong>Sonraki ödeme</strong> (kalan gün) bilgisi görünür. Bekleyen tutarı bu IBAN’a havale/EFT yapabilirsiniz.</p>
      </div>
    </div>
  );
}
