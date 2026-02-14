'use client';

import { useEffect, useState } from 'react';
import { isAdminAuthenticated } from '@/lib/admin';

interface SaaSAnalytics {
  totalRevenue: number;
  revenueByPlan: {
    monthly: number;
    '6month': number;
    yearly: number;
  };
  totalSubscriptions: number;
  activeSubscriptions: number;
  userStats: {
    total: number;
    active: number;
    trial: number;
    activeTrial: number;
    expiredTrial: number;
    paid: number;
    monthly: number;
    '6month': number;
    yearly: number;
    free: number;
  };
  conversionRate: number;
  period: 'daily' | 'weekly' | 'monthly';
  timelineData: Array<{
    date: string;
    users: number;
    paid: number;
    revenue: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [analytics, setAnalytics] = useState<SaaSAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdminAuthenticated()) return;
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/saas-analytics?period=${period}`);

      if (!response.ok) {
        throw new Error('Analiz verileri yüklenemedi');
      }

      const data = await response.json();

      if (data.success && data.analytics) {
        setAnalytics(data.analytics);
      } else {
        throw new Error(data.error || 'Veri yüklenemedi');
      }
    } catch (err: any) {
      console.error('Error loading SaaS analytics:', err);
      setError(err?.message || 'Analiz verileri yüklenirken bir hata oluştu');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-500 mt-4">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800">❌ {error}</p>
          <button
            onClick={loadAnalytics}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Analiz verisi bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SaaS Analizleri</h1>
          <p className="text-gray-600 mt-1">Abonelik ve kullanıcı istatistikleri</p>
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
              <p className="text-xs text-gray-500 mt-1">
                {analytics.activeSubscriptions} aktif abonelik
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
              <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.userStats.total}</p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.userStats.active} aktif
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">7 Günlük Deneme</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.userStats.trial}</p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.userStats.activeTrial} aktif, {analytics.userStats.expiredTrial} bitmiş
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎁</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dönüşüm Oranı</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.conversionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Deneme → Ödeme
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Plan Dağılımı</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">7 Günlük Deneme</span>
              <span className="text-lg font-bold text-gray-900">{analytics.userStats.trial}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Aylık Plan</span>
              <span className="text-lg font-bold text-gray-900">{analytics.userStats.monthly}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">6 Aylık Plan</span>
              <span className="text-lg font-bold text-gray-900">{analytics.userStats['6month']}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Yıllık Plan</span>
              <span className="text-lg font-bold text-gray-900">{analytics.userStats.yearly}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ücretsiz</span>
              <span className="text-lg font-bold text-gray-900">{analytics.userStats.free}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Plan Bazlı Gelir</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Aylık Plan</span>
              <span className="text-lg font-bold text-green-600">
                {analytics.revenueByPlan.monthly.toFixed(2)} ₺
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">6 Aylık Plan</span>
              <span className="text-lg font-bold text-green-600">
                {analytics.revenueByPlan['6month'].toFixed(2)} ₺
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Yıllık Plan</span>
              <span className="text-lg font-bold text-green-600">
                {analytics.revenueByPlan.yearly.toFixed(2)} ₺
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Deneme İstatistikleri</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Aktif Deneme</span>
              <span className="text-lg font-bold text-blue-600">{analytics.userStats.activeTrial}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Biten Deneme</span>
              <span className="text-lg font-bold text-red-600">{analytics.userStats.expiredTrial}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ödeme Planına Geçen</span>
              <span className="text-lg font-bold text-green-600">{analytics.userStats.paid}</span>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Dönüşüm Oranı</span>
                <span className="text-xl font-bold text-orange-600">
                  {analytics.conversionRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Timeline Chart */}
      {analytics.timelineData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {period === 'daily' ? 'Günlük' : period === 'weekly' ? 'Haftalık' : 'Aylık'} Gelir & Kullanıcı Grafiği
          </h2>
          <div className="space-y-4">
            {analytics.timelineData.map((item, index) => {
              const maxRevenue = Math.max(...analytics.timelineData.map(d => d.revenue));
              const maxUsers = Math.max(...analytics.timelineData.map(d => d.users));
              const revenuePercentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              const usersPercentage = maxUsers > 0 ? (item.users / maxUsers) * 100 : 0;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {period === 'daily' || period === 'weekly'
                        ? new Date(item.date).toLocaleDateString('tr-TR')
                        : item.date}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">
                        {item.users} kullanıcı
                      </span>
                      <span className="text-gray-600">
                        {item.paid} ödeme
                      </span>
                      <span className="text-green-600 font-medium">
                        {item.revenue.toFixed(2)} ₺
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${revenuePercentage}%` }}
                      />
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${usersPercentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Gelir</span>
                      <span>Kullanıcı</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
