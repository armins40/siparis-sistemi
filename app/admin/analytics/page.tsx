'use client';

import { useEffect, useState } from 'react';
import {
  getAllOrders,
  getSalesAnalytics,
  isAdminAuthenticated,
} from '@/lib/admin';
import type { Order, SalesAnalytics } from '@/lib/types';

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdminAuthenticated()) return;
    loadAnalytics();
  }, [period]);

  const loadAnalytics = () => {
    setLoading(true);
    const analyticsData = getSalesAnalytics(period);
    const allOrders = getAllOrders();
    
    // En son siparişler (son 50)
    const sortedOrders = allOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 50);
    
    setAnalytics(analyticsData);
    setOrders(sortedOrders);
    setLoading(false);
  };

  // En çok satılan ürünleri hesapla
  const getTopProducts = () => {
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    orders
      .filter(o => o.status === 'completed')
      .forEach(order => {
        order.items.forEach(item => {
          const existing = productMap.get(item.productId) || { name: item.productName, quantity: 0, revenue: 0 };
          productMap.set(item.productId, {
            name: item.productName,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + item.total,
          });
        });
      });
    
    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  // Sipariş durumlarına göre dağılım
  const getOrderStatusStats = () => {
    const stats = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    
    orders.forEach(order => {
      stats[order.status]++;
    });
    
    return stats;
  };

  const topProducts = getTopProducts();
  const statusStats = getOrderStatusStats();

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Satış Analizi</h1>
          <p className="text-gray-600 mt-1">Gelir ve sipariş istatistikleri</p>
        </div>
        <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-lg">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'daily'
                ? 'bg-orange-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Günlük
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'weekly'
                ? 'bg-orange-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Haftalık
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'monthly'
                ? 'bg-orange-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Aylık
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.totalRevenue.toFixed(2)} ₺
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ortalama Sipariş</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.averageOrderValue.toFixed(2)} ₺
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statusStats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart (Simple Bar Chart) */}
      {analytics.data.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {period === 'daily' ? 'Günlük' : period === 'weekly' ? 'Haftalık' : 'Aylık'} Gelir Grafiği
          </h2>
          <div className="space-y-4">
            {analytics.data.map((item, index) => {
              const maxRevenue = Math.max(...analytics.data.map(d => d.revenue));
              const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {period === 'daily' || period === 'weekly'
                        ? new Date(item.date).toLocaleDateString('tr-TR')
                        : item.date}
                    </span>
                    <span className="text-gray-600">
                      {item.revenue.toFixed(2)} ₺ ({item.orders} sipariş)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 10 && (
                        <span className="text-xs font-medium text-white">
                          {item.revenue.toFixed(0)} ₺
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">En Çok Satan Ürünler</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Satılan Adet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Toplam Gelir
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold mr-3">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.revenue.toFixed(2)} ₺
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Status Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sipariş Durumları</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-sm font-medium text-gray-600">Beklemede</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{statusStats.pending}</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-sm font-medium text-gray-600">Onaylandı</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{statusStats.confirmed}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="text-2xl mb-2">🎉</div>
            <div className="text-sm font-medium text-gray-600">Tamamlandı</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{statusStats.completed}</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
            <div className="text-2xl mb-2">❌</div>
            <div className="text-sm font-medium text-gray-600">İptal</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{statusStats.cancelled}</div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Son Siparişler</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sipariş ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ürünler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Toplam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Henüz sipariş yok
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id.substring(0, 12)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.items.length} ürün
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.finalTotal.toFixed(2)} ₺
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status === 'completed'
                          ? 'Tamamlandı'
                          : order.status === 'confirmed'
                          ? 'Onaylandı'
                          : order.status === 'pending'
                          ? 'Beklemede'
                          : 'İptal'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
