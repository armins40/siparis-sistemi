'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllProducts, getPublishedProducts } from '@/lib/products';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    orders: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      const all = getAllProducts();
      const published = getPublishedProducts();
      setStats({
        total: all.length,
        published: published.length,
        orders: 0, // TODO: Implement orders
      });
    };

    updateStats();
    // Listen for storage changes
    window.addEventListener('storage', updateStats);
    // Also check periodically for same-tab updates
    const interval = setInterval(updateStats, 1000);
    return () => {
      window.removeEventListener('storage', updateStats);
      clearInterval(interval);
    };
  }, []);

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

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.orders}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/products"
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span className="text-4xl mb-2">➕</span>
            <span className="font-medium text-gray-900">Yeni Ürün Ekle</span>
          </Link>
          <Link
            href="/dashboard/theme"
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span className="text-4xl mb-2">🎨</span>
            <span className="font-medium text-gray-900">Tema Seç</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span className="text-4xl mb-2">⚙️</span>
            <span className="font-medium text-gray-900">Ayarları Düzenle</span>
          </Link>
          <Link
            href="/dashboard/qr"
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
