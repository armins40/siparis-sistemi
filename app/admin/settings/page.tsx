'use client';

import { useEffect, useState } from 'react';
import { isAdminAuthenticated } from '@/lib/admin';

export default function AdminSettingsPage() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [yearlyPrice, setYearlyPrice] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [kdvRate, setKdvRate] = useState('');
  const [priceTagline, setPriceTagline] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      return;
    }
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/settings', { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.settings) {
        setWhatsappNumber(result.settings.whatsapp_number || '905535057059');
        setYearlyPrice(result.settings.yearly_price || '2490');
        setMonthlyPrice(result.settings.monthly_plan_price || '599');
        setKdvRate(result.settings.kdv_rate ?? '20');
        setPriceTagline(result.settings.price_tagline || 'Günlük bir çay parasına sipariş sistemi');
      } else {
        setWhatsappNumber('905535057059');
        setYearlyPrice('2490');
        setMonthlyPrice('599');
        setKdvRate('20');
        setPriceTagline('Günlük bir çay parasına sipariş sistemi');
      }
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError(err?.message || 'Ayarlar yüklenirken bir hata oluştu');
      setWhatsappNumber('905535057059');
      setYearlyPrice('2490');
      setMonthlyPrice('599');
      setKdvRate('20');
      setPriceTagline('Günlük bir çay parasına sipariş sistemi');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess(false);

      // Validate WhatsApp number
      const cleanedWhatsapp = whatsappNumber.replace(/\s+/g, '');
      if (!cleanedWhatsapp || !/^\d+$/.test(cleanedWhatsapp)) {
        setError('Geçerli bir WhatsApp numarası girin (sadece rakamlar)');
        setSaving(false);
        return;
      }

      // Validate yearly price
      const cleanedYearly = yearlyPrice.replace(/\s+/g, '').replace(/[.,]/g, '');
      if (!cleanedYearly || !/^\d+$/.test(cleanedYearly)) {
        setError('Geçerli bir yıllık fiyat girin (sadece rakamlar)');
        setSaving(false);
        return;
      }

      // Validate monthly price
      const cleanedMonthly = monthlyPrice.replace(/\s+/g, '').replace(/[.,]/g, '');
      if (!cleanedMonthly || !/^\d+$/.test(cleanedMonthly)) {
        setError('Geçerli bir aylık fiyat girin (sadece rakamlar)');
        setSaving(false);
        return;
      }

      // Validate KDV rate (0-100)
      const kdvNum = parseFloat(kdvRate.replace(',', '.'));
      if (Number.isNaN(kdvNum) || kdvNum < 0 || kdvNum > 100) {
        setError('KDV oranı 0–100 arasında bir sayı olmalı (örn. 20)');
        setSaving(false);
        return;
      }
      const cleanedKdv = kdvNum.toString();

      // Save all settings
      const promises = [
        fetch('/api/admin/settings', {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: 'whatsapp_number',
            value: cleanedWhatsapp,
          }),
        }),
        fetch('/api/admin/settings', {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: 'yearly_price',
            value: cleanedYearly,
          }),
        }),
        fetch('/api/admin/settings', {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: 'monthly_plan_price',
            value: cleanedMonthly,
          }),
        }),
        fetch('/api/admin/settings', {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: 'kdv_rate',
            value: cleanedKdv,
          }),
        }),
        fetch('/api/admin/settings', {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: 'price_tagline',
            value: (priceTagline || 'Günlük bir çay parasına sipariş sistemi').trim(),
          }),
        }),
      ];

      const responses = await Promise.all(promises);
      
      for (const response of responses) {
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Ayarlar kaydedilirken bir hata oluştu');
        }
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err?.message || 'Ayarlar kaydedilirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
          <p className="text-gray-600 mt-1">Genel uygulama ayarları</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-600 mt-1">Genel uygulama ayarları</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">✅ Ayarlar başarıyla kaydedildi!</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Ana Sayfa Ayarları</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Numarası
            </label>
            <input
              type="text"
              id="whatsapp"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="905535057059"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Ana sayfadaki WhatsApp butonunda kullanılacak numara. Ülke kodu ile birlikte girin (sadece rakamlar). Örnek: 905535057059
            </p>
          </div>

          <div>
            <label htmlFor="yearlyPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Yıllık Plan Fiyatı (TL)
            </label>
            <input
              type="text"
              id="yearlyPrice"
              value={yearlyPrice}
              onChange={(e) => setYearlyPrice(e.target.value)}
              placeholder="2490"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Ödeme sayfasında yıllık planda gösterilecek toplam fiyat (TL + KDV). Sadece rakamlar. Örnek: 2490
            </p>
          </div>

          <div>
            <label htmlFor="monthlyPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Aylık Plan Fiyatı (TL)
            </label>
            <input
              type="text"
              id="monthlyPrice"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              placeholder="599"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Ödeme sayfasında aylık planda gösterilecek fiyat (TL / ay). Sadece rakamlar. Örnek: 599
            </p>
          </div>

          <div>
            <label htmlFor="priceTagline" className="block text-sm font-medium text-gray-700 mb-2">
              Fiyat Sloganı
            </label>
            <input
              type="text"
              id="priceTagline"
              value={priceTagline}
              onChange={(e) => setPriceTagline(e.target.value)}
              placeholder="Günlük bir çay parasına sipariş sistemi"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Ana sayfa fiyat bölümünde gösterilen slogan. Örn: Günlük bir çay parasına sipariş sistemi
            </p>
          </div>

          <div>
            <label htmlFor="kdvRate" className="block text-sm font-medium text-gray-700 mb-2">
              KDV Oranı (%)
            </label>
            <input
              type="text"
              id="kdvRate"
              value={kdvRate}
              onChange={(e) => setKdvRate(e.target.value)}
              placeholder="20"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Ödeme sayfasında toplam tutarın hesaplanmasında kullanılır. Örnek: 20 (%20 KDV)
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
