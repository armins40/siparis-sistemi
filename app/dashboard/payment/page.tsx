'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, setCurrentUser } from '@/lib/auth';
import { updateUser } from '@/lib/admin';
import type { User } from '@/lib/types';

export default function PaymentPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | '6month' | 'yearly'>('monthly');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    // Trial kullanıcı değilse dashboard'a yönlendir
    if (currentUser.plan !== 'trial') {
      router.push('/dashboard');
      return;
    }
    
    // Süresi dolmamışsa dashboard'a yönlendir
    if (currentUser.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(currentUser.expiresAt);
      if (expiresAt > now) {
        router.push('/dashboard');
        return;
      }
    }
    
    setUser(currentUser);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!user) return;

    try {
      // Payment intent oluştur
      const intentResponse = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          amount: PLAN_PRICES[selectedPlan],
        }),
      });

      const intentData = await intentResponse.json();

      if (!intentResponse.ok) {
        setError(intentData.error || 'Ödeme intent oluşturulamadı');
        setIsLoading(false);
        return;
      }

      // Payment confirm
      const confirmResponse = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          plan: selectedPlan,
          amount: PLAN_PRICES[selectedPlan],
          paymentIntentId: intentData.paymentIntentId,
          paymentMethod: `****${formData.cardNumber.slice(-4)}`, // Son 4 hane
        }),
      });

      const confirmData = await confirmResponse.json();

      if (!confirmResponse.ok) {
        setError(confirmData.error || 'Ödeme başarısız');
        setIsLoading(false);
        return;
      }

      // Kullanıcı planını güncelle
      updateUser(user.id, {
        plan: selectedPlan,
        expiresAt: undefined, // Yeni plan için subscription endDate kullanılacak
      });

      // Başarılı - Dashboard'a yönlendir
      setCurrentUser(user.id);
      alert('Ödeme başarılı! Dashboard\'a yönlendiriliyorsunuz...');
      router.push('/dashboard');
    } catch (err) {
      setError('Ödeme sırasında bir hata oluştu');
      setIsLoading(false);
    }
  };

  const PLAN_NAMES = {
    monthly: '1 Aylık Plan',
    '6month': '6 Aylık Plan',
    yearly: 'Yıllık Plan',
  };

  const PLAN_PRICES = {
    monthly: 299,
    '6month': 1590,
    yearly: 2490,
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ödeme</h1>
          <p className="text-gray-600">
            7 günlük deneme süreniz doldu. Devam etmek için bir plan seçin.
          </p>
        </div>

        {/* Plan Seçimi */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Plan Seçin</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['monthly', '6month', 'yearly'] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPlan === plan
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-gray-900 mb-1">{PLAN_NAMES[plan]}</div>
                <div className="text-2xl font-bold text-orange-600">{PLAN_PRICES[plan]}₺</div>
                {plan === '6month' && (
                  <div className="text-xs text-gray-500 mt-1">Daha Uygun</div>
                )}
                {plan === 'yearly' && (
                  <div className="text-xs text-gray-500 mt-1">En Avantajlı</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="payment-card-number" className="block text-sm font-medium text-gray-700 mb-2">
              Kart Numarası
            </label>
            <input
              type="text"
              id="payment-card-number"
              name="payment-card-number"
              required
              value={formData.cardNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 16) {
                  setFormData({ ...formData, cardNumber: value });
                }
              }}
              placeholder="1234 5678 9012 3456"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ borderColor: '#AF948F' }}
              maxLength={16}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="payment-expiry-date" className="block text-sm font-medium text-gray-700 mb-2">
                Son Kullanma Tarihi
              </label>
              <input
                type="text"
                id="payment-expiry-date"
                name="payment-expiry-date"
                required
                value={formData.expiryDate}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) {
                    setFormData({ ...formData, expiryDate: value });
                  }
                }}
                placeholder="MM/YY"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{ borderColor: '#AF948F' }}
                maxLength={4}
              />
            </div>

            <div>
              <label htmlFor="payment-cvv" className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                id="payment-cvv"
                name="payment-cvv"
                required
                value={formData.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 3) {
                    setFormData({ ...formData, cvv: value });
                  }
                }}
                placeholder="123"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{ borderColor: '#AF948F' }}
                maxLength={3}
              />
            </div>
          </div>

          <div>
            <label htmlFor="payment-cardholder-name" className="block text-sm font-medium text-gray-700 mb-2">
              Kart Sahibinin Adı
            </label>
            <input
              type="text"
              id="payment-cardholder-name"
              name="payment-cardholder-name"
              required
              value={formData.cardholderName}
              onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
              placeholder="Ad Soyad"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ borderColor: '#AF948F' }}
            />
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-gray-900">Toplam:</span>
              <span className="text-2xl font-bold text-orange-600">
                {PLAN_PRICES[selectedPlan]}₺
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
            >
              {isLoading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}