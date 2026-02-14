'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type DashboardData = {
  totalTenants: number;
  activeSubscriptions: number;
  trialTenants: number;
  ordersToday: number;
  ordersMonthly: number;
  revenueMonthly: number;
  monthlyOrdersChart: { date: string; count: number }[];
  monthlyRevenueChart: { date: string; amount: number }[];
  recentTenants: { id: string; name: string; slug: string; ownerEmail: string; subscriptionStatus: string; createdAt: string }[];
  recentCancelledSubscriptions: { id: string; tenantId: string; tenantName: string; plan: string; cancelledAt: string }[];
};

export default function SuperAdminPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/super-admin/dashboard');
        const json = await res.json();

        if (!json.success) {
          setError(json.error || 'Veri alınamadı');
          setConfigured(json.configured ?? null);
          setData(null);
          return;
        }
        setConfigured(true);
        setData(json.data);
      } catch (e) {
        setError('Bağlantı hatası');
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Süper Admin</h1>
        <p className="text-gray-600">Multi-tenant platform özeti (NestJS backend)</p>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
        </div>
      </div>
    );
  }

  if (error && configured === false) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Süper Admin</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <p className="font-medium text-amber-800">Backend bağlantısı yapılandırılmamış</p>
          <p className="text-sm text-amber-700 mt-2">
            Süper Admin verileri NestJS API’den gelir. Ortam değişkenlerini ayarlayın:
          </p>
          <ul className="mt-2 text-sm text-amber-800 list-disc list-inside space-y-1">
            <li><code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_BACKEND_URL</code> veya <code className="bg-amber-100 px-1 rounded">BACKEND_URL</code> (örn. http://localhost:3000/api/v1)</li>
            <li><code className="bg-amber-100 px-1 rounded">BACKEND_ADMIN_TOKEN</code> (NestJS’te giriş yapıp alacağınız JWT)</li>
          </ul>
          <Link href="/admin/tenants" className="inline-block mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium">
            Firmalar sayfasına git
          </Link>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Süper Admin</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800">❌ {error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
            Yeniden dene
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Süper Admin</h1>
          <p className="text-gray-600 mt-1">Multi-tenant platform özeti</p>
        </div>
        <Link href="/admin/tenants" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm">
          Tüm Firmalar
        </Link>
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Toplam Firma</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.totalTenants}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Aktif Abonelik</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{data.activeSubscriptions}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Deneme (Trial)</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{data.trialTenants}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Bugünkü Sipariş</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.ordersToday}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Bu ay sipariş</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{data.ordersMonthly}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Bu ay gelir (₺)</p>
          <p className="text-xl font-bold text-green-600 mt-1">{Number(data.revenueMonthly).toFixed(2)}</p>
        </div>
      </div>

      {/* Son kayıt olan firmalar */}
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <h2 className="text-lg font-bold text-gray-900 px-5 py-4 border-b border-gray-100">Son kayıt olan firmalar</h2>
        <div className="divide-y divide-gray-100">
          {data.recentTenants?.length ? data.recentTenants.map((t) => (
            <Link key={t.id} href={`/admin/tenants?id=${t.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.ownerEmail} · {t.subscriptionStatus}</p>
              </div>
              <span className="text-sm text-gray-400">{new Date(t.createdAt).toLocaleDateString('tr-TR')}</span>
            </Link>
          )) : (
            <p className="px-5 py-6 text-gray-500 text-sm">Henüz kayıt yok</p>
          )}
        </div>
      </div>

      {/* Son iptal edilen abonelikler */}
      {data.recentCancelledSubscriptions?.length > 0 && (
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <h2 className="text-lg font-bold text-gray-900 px-5 py-4 border-b border-gray-100">Son iptal edilen abonelikler</h2>
          <div className="divide-y divide-gray-100">
            {data.recentCancelledSubscriptions.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-gray-900">{s.tenantName}</p>
                  <p className="text-sm text-gray-500">Plan: {s.plan} · {new Date(s.cancelledAt).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
