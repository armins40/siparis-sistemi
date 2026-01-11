'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getAllUsers,
  getAllCoupons,
  getAllOrders,
  getSalesAnalytics,
  isAdminAuthenticated,
} from '@/lib/admin';
import { getAllProducts } from '@/lib/products';
import { getAllCategories } from '@/lib/categories';
import type { User, Coupon, Order } from '@/lib/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalCoupons: 0,
    activeCoupons: 0,
  });

  useEffect(() => {
    if (!isAdminAuthenticated()) return;

    const updateStats = () => {
      const users = getAllUsers();
      const coupons = getAllCoupons();
      const orders = getAllOrders();
      const analytics = getSalesAnalytics('monthly');
      const products = getAllProducts();
      const categories = getAllCategories();

      setStats({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        totalOrders: orders.length,
        totalRevenue: analytics.totalRevenue,
        totalProducts: products.length,
        totalCategories: categories.length,
        totalCoupons: coupons.length,
        activeCoupons: coupons.filter(c => c.isActive && new Date(c.validUntil) > new Date()).length,
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Her 5 saniyede bir güncelle
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Genel Bakış</h1>
        <p className="text-gray-600 mt-1">Admin paneli özet istatistikleri</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/users">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">{stats.activeUsers} aktif</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/analytics">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRevenue.toFixed(2)} ₺</p>
                <p className="text-xs text-gray-500 mt-1">{stats.totalOrders} sipariş</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/products">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.totalCategories} kategori</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/coupons">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kuponlar</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCoupons}</p>
                <p className="text-xs text-green-600 mt-1">{stats.activeCoupons} aktif</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎫</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/users?action=create"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">➕</span>
            <span className="font-medium text-gray-700">Yeni Kullanıcı Ekle</span>
          </Link>
          <Link
            href="/admin/coupons?action=create"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">🎫</span>
            <span className="font-medium text-gray-700">Yeni Kupon Oluştur</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">📈</span>
            <span className="font-medium text-gray-700">Satış Raporları</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Son Aktiviteler</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">👥</span>
              <div>
                <p className="font-medium text-gray-900">Kullanıcı Yönetimi</p>
                <p className="text-sm text-gray-500">Toplam {stats.totalUsers} kullanıcı kayıtlı</p>
              </div>
            </div>
            <Link
              href="/admin/users"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              Görüntüle
            </Link>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-medium text-gray-900">Satış Analizi</p>
                <p className="text-sm text-gray-500">{stats.totalOrders} sipariş, {stats.totalRevenue.toFixed(2)} ₺ gelir</p>
              </div>
            </div>
            <Link
              href="/admin/analytics"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              Görüntüle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
