'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function DashboardPage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsRes, ordersRes] = await Promise.all([
          fetch(`/api/products/list?userId=${encodeURIComponent(userId)}`),
          fetch(`/api/orders/count?userId=${encodeURIComponent(userId)}`),
        ]);

        if (!productsRes.ok) {
          throw new Error(`API responded with status ${productsRes.status}`);
        }

        const result = await productsRes.json();
        let orderCount = 0;
        try {
          const ordersJson = await ordersRes.json();
          if (ordersJson.success && typeof ordersJson.count === 'number') {
            orderCount = ordersJson.count;
          }
        } catch (e) {
          console.error('Error loading order count:', e);
        }

        if (result.success && result.products) {
          const allProducts = result.products;
          const publishedProducts = allProducts.filter((p: any) => p.isPublished);

          setStats({
            total: allProducts.length,
            published: publishedProducts.length,
            orders: orderCount,
          });
        } else {
          throw new Error(result.error || 'Stats could not be loaded');
        }
      } catch (err: any) {
        console.error('Error loading stats:', err);
        setError(err?.message || 'İstatistikler yüklenirken bir hata oluştu');
        setStats({ total: 0, published: 0, orders: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Genel Bakış</h1>
          <p className="text-gray-600 mt-1">Mağazanızın özet bilgileri</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Genel Bakış</h1>
          <p className="text-gray-600 mt-1">Mağazanızın özet bilgileri</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">❌ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Genel Bakış</h1>
        <p className="text-gray-600 mt-1">Mağazanızın özet bilgileri</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Menü</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.published}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <Link
          href={`/dashboard/${userId}/orders`}
          className="bg-white rounded-xl shadow-lg p-6 block hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.orders}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href={`/dashboard/${userId}/orders`}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span className="text-4xl mb-2">🛒</span>
            <span className="font-medium text-gray-900">Siparişler</span>
          </Link>
          <Link
            href={`/dashboard/${userId}/products?openForm=1`}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span className="text-4xl mb-2">➕</span>
            <span className="font-medium text-gray-900">Yeni Ürün Ekle</span>
          </Link>
          <Link
            href={`/dashboard/${userId}/categories`}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span className="text-4xl mb-2">📁</span>
            <span className="font-medium text-gray-900">Kategoriler</span>
          </Link>
          <Link
            href={`/dashboard/${userId}/theme`}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span className="text-4xl mb-2">🎨</span>
            <span className="font-medium text-gray-900">Tema Seç</span>
          </Link>
          <Link
            href={`/dashboard/${userId}/settings`}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span className="text-4xl mb-2">⚙️</span>
            <span className="font-medium text-gray-900">Ayarları Düzenle</span>
          </Link>
          <Link
            href={`/dashboard/${userId}/qr`}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span className="text-4xl mb-2">🔗</span>
            <span className="font-medium text-gray-900">QR Kod Al</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
