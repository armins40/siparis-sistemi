'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  ownerEmail: string;
  phone?: string;
  subscriptionStatus: string;
  isActive: boolean;
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
};

type Paginated = {
  data: Tenant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function TenantsPage() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<Paginated | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (page > 1) params.set('page', String(page));
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      params.set('limit', '20');
      const res = await fetch(`/api/super-admin/tenants?${params}`);
      const json = await res.json();

      if (!json.success) {
        setError(json.error || 'Liste alınamadı');
        setConfigured(json.configured ?? null);
        setResult(null);
        return;
      }
      setConfigured(true);
      setResult(json.data);
    } catch (e) {
      setError('Bağlantı hatası');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [page, status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTenants();
  };

  const handleSuspend = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/super-admin/tenants/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suspend' }),
      });
      const json = await res.json();
      if (json.success) fetchTenants();
      else setError(json.error || 'İşlem başarısız');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/super-admin/tenants/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate' }),
      });
      const json = await res.json();
      if (json.success) fetchTenants();
      else setError(json.error || 'İşlem başarısız');
    } finally {
      setActionLoading(null);
    }
  };

  if (error && configured === false) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Firmalar</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <p className="font-medium text-amber-800">Backend bağlantısı yapılandırılmamış</p>
          <p className="text-sm text-amber-700 mt-2">
            <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_BACKEND_URL</code> ve <code className="bg-amber-100 px-1 rounded">BACKEND_ADMIN_TOKEN</code> ortam değişkenlerini ayarlayın.
          </p>
          <Link href="/admin/super" className="inline-block mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium">
            Süper Admin sayfasına git
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Firmalar</h1>
        <p className="text-gray-600 mt-1">Tüm tenant (firma) listesi</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Firma adı, e-posta veya slug..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Tüm durumlar</option>
          <option value="active">Aktif</option>
          <option value="trial">Deneme</option>
          <option value="expired">Süresi dolmuş</option>
          <option value="cancelled">İptal</option>
          <option value="inactive">Pasif</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium">
          Ara
        </button>
      </form>

      {error && result === null && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
        </div>
      ) : result && (
        <>
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Firma</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Yetkili</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Durum</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Kayıt</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.data.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Firma bulunamadı</td></tr>
                  ) : (
                    result.data.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{t.name}</p>
                          <p className="text-gray-500 text-xs">{t.slug}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{t.ownerEmail}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            t.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                            t.subscriptionStatus === 'trial' ? 'bg-blue-100 text-blue-800' :
                            !t.isActive ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {t.subscriptionStatus}
                            {!t.isActive && ' (pasif)'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{new Date(t.createdAt).toLocaleDateString('tr-TR')}</td>
                        <td className="px-4 py-3 text-right">
                          {t.isActive ? (
                            <button
                              onClick={() => handleSuspend(t.id)}
                              disabled={actionLoading === t.id}
                              className="text-red-600 hover:underline text-xs font-medium disabled:opacity-50"
                            >
                              {actionLoading === t.id ? '...' : 'Askıya al'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(t.id)}
                              disabled={actionLoading === t.id}
                              className="text-green-600 hover:underline text-xs font-medium disabled:opacity-50"
                            >
                              {actionLoading === t.id ? '...' : 'Aktifleştir'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {result.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Toplam {result.total} firma · Sayfa {result.page} / {result.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                >
                  Önceki
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
                  disabled={page >= result.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
