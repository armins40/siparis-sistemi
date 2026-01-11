'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  isAdminAuthenticated,
} from '@/lib/admin';
import type { Coupon } from '@/lib/types';

export default function AdminCouponsPage() {
  const searchParams = useSearchParams();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as Coupon['discountType'],
    discountValue: 0,
    minPurchase: 0,
    maxDiscount: 0,
    usageLimit: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdminAuthenticated()) return;
    loadCoupons();
    
    if (searchParams.get('action') === 'create') {
      setShowModal(true);
    }
  }, [searchParams]);

  const loadCoupons = () => {
    const allCoupons = getAllCoupons();
    setCoupons(allCoupons);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validasyon
    if (!formData.code || formData.code.trim().length === 0) {
      setError('Kupon kodu gereklidir');
      return;
    }

    if (formData.discountValue <= 0) {
      setError('İndirim değeri 0\'dan büyük olmalıdır');
      return;
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      setError('Yüzde indirim %100\'den fazla olamaz');
      return;
    }

    if (new Date(formData.validUntil) < new Date(formData.validFrom)) {
      setError('Bitiş tarihi başlangıç tarihinden önce olamaz');
      return;
    }

    try {
      if (editingCoupon) {
        updateCoupon(editingCoupon.id, formData);
      } else {
        // Aynı kod kontrolü
        const existing = coupons.find(c => c.code.toUpperCase() === formData.code.toUpperCase());
        if (existing) {
          setError('Bu kupon kodu zaten kullanılıyor');
          return;
        }
        
        createCoupon({
          ...formData,
          code: formData.code.toUpperCase(),
          minPurchase: formData.minPurchase || undefined,
          maxDiscount: formData.maxDiscount || undefined,
          usageLimit: formData.usageLimit || undefined,
        });
      }
      
      loadCoupons();
      handleCloseModal();
      setError('');
    } catch (err) {
      setError('Bir hata oluştu');
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase || 0,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit || 0,
      validFrom: coupon.validFrom.split('T')[0],
      validUntil: coupon.validUntil.split('T')[0],
      isActive: coupon.isActive,
    });
    setShowModal(true);
    setError('');
  };

  const handleDelete = (couponId: string) => {
    if (confirm('Bu kuponu silmek istediğinize emin misiniz?')) {
      deleteCoupon(couponId);
      loadCoupons();
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      minPurchase: 0,
      maxDiscount: 0,
      usageLimit: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
    });
    setError('');
  };

  const isCouponValid = (coupon: Coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    return coupon.isActive && now >= validFrom && now <= validUntil && 
           (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kupon Yönetimi</h1>
          <p className="text-gray-600 mt-1">İndirim kuponlarını oluşturun ve yönetin</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          ➕ Yeni Kupon Oluştur
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-500">Henüz kupon oluşturulmamış</p>
          </div>
        ) : (
          coupons.map((coupon) => {
            const isValid = isCouponValid(coupon);
            return (
              <div
                key={coupon.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-2 ${
                  isValid ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {coupon.code}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          isValid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isValid ? 'Aktif' : 'Pasif'}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {coupon.discountType === 'percentage' ? '%' : '₺'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">İndirim:</span>
                    <span className="font-bold text-gray-900">
                      {coupon.discountType === 'percentage'
                        ? `%${coupon.discountValue}`
                        : `${coupon.discountValue.toFixed(2)} ₺`}
                    </span>
                  </div>
                   {coupon.minPurchase && coupon.minPurchase > 0 && (
                     <div className="flex justify-between text-sm">
                       <span className="text-gray-600">Min. Tutar:</span>
                       <span className="text-gray-900">{coupon.minPurchase.toFixed(2)} ₺</span>
                     </div>
                   )}
                  {coupon.usageLimit && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kullanım:</span>
                      <span className="text-gray-900">
                        {coupon.usageCount} / {coupon.usageLimit}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Geçerlilik:</span>
                    <span className="text-gray-900 text-xs">
                      {new Date(coupon.validFrom).toLocaleDateString('tr-TR')} - {new Date(coupon.validUntil).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCoupon ? 'Kupon Düzenle' : 'Yeni Kupon Oluştur'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kupon Kodu *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="YENIYIL2024"
                  required
                  disabled={!!editingCoupon}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İndirim Tipi *
                </label>
                  <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as Coupon['discountType'] })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="percentage">Yüzde (%)</option>
                  <option value="fixed">Sabit Tutar (₺)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İndirim Değeri *
                </label>
                <input
                  type="number"
                  min="0"
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                  step={formData.discountType === 'percentage' ? '1' : '0.01'}
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {formData.discountType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maksimum İndirim (₺) (Opsiyonel)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Maksimum indirim tutarı"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Alışveriş Tutarı (₺) (Opsiyonel)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Minimum alışveriş tutarı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanım Limiti (Opsiyonel)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0 = sınırsız"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bitiş Tarihi *
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Aktif
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  {editingCoupon ? 'Güncelle' : 'Oluştur'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
