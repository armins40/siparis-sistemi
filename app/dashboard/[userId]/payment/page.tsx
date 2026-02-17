'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserAsync, setCurrentUser } from '@/lib/auth';
import { updateUser } from '@/lib/admin';
import type { User } from '@/lib/types';
import AgreementCheckboxes from '@/components/AgreementCheckboxes';
import PaymentTrustBadges from '@/components/PaymentTrustBadges';

export default function PaymentPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [pricesFromApi, setPricesFromApi] = useState({ monthly: 599, yearly: 2490 });
  const [kdvRate, setKdvRate] = useState(20);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedHizmet, setAgreedHizmet] = useState(false);
  const [agreedKvkk, setAgreedKvkk] = useState(false);
  const [agreedIade, setAgreedIade] = useState(false);
  const [agreementError, setAgreementError] = useState('');
  const [invoiceTaxNo, setInvoiceTaxNo] = useState('');
  const [invoiceAddress, setInvoiceAddress] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUserAsync();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      const isTestUser = currentUser.email?.toLowerCase() === 'test@siparis-sistemi.com';
      if (currentUser.plan !== 'trial' && !isTestUser) {
        router.push('/dashboard');
        return;
      }
      setUser(currentUser);
    };
    loadUser();
  }, [router]);

  useEffect(() => {
    if (user?.invoiceTaxNo) setInvoiceTaxNo(user.invoiceTaxNo);
    if (user?.invoiceAddress) setInvoiceAddress(user.invoiceAddress);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Fetch price from API (optional override)
    fetch('/api/settings/price')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const yearly = data.yearlyPrice != null ? parseInt(String(data.yearlyPrice), 10) : 2490;
          const monthly = data.monthlyPlanPrice != null ? parseInt(String(data.monthlyPlanPrice), 10) : 599;
          const kdv = data.kdvRate != null ? parseFloat(String(data.kdvRate)) : 20;
          if (!Number.isNaN(yearly)) setPricesFromApi((p) => ({ ...p, yearly }));
          if (!Number.isNaN(monthly)) setPricesFromApi((p) => ({ ...p, monthly }));
          if (!Number.isNaN(kdv) && kdv >= 0 && kdv <= 100) setKdvRate(kdv);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedHizmet || !agreedKvkk || !agreedIade) {
      setAgreementError('Ödeme yapabilmek için tüm sözleşmeleri kabul etmeniz gerekmektedir.');
      return;
    }
    setAgreementError('');
    const taxNo = (user?.invoiceTaxNo || invoiceTaxNo).trim();
    const address = (user?.invoiceAddress || invoiceAddress).trim();
    setIsLoading(true);
    setError('');

    if (!user) return;

    try {
      // Fatura bilgileri isteğe bağlı - varsa kaydet
      if ((taxNo || address) && (!user.invoiceTaxNo || !user.invoiceAddress)) {
        await fetch('/api/user/update-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, invoiceTaxNo: taxNo || undefined, invoiceAddress: address || undefined }),
        });
      }
      // Toplam = ara toplam + KDV (KDV dahil ödenecek tutar)
      const baseAmount = selectedPlan === 'yearly' ? pricesFromApi.yearly : pricesFromApi.monthly;
      const totalAmount = Math.round(baseAmount * (1 + kdvRate / 100));

      const intentResponse = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          plan: selectedPlan,
          amount: totalAmount,
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
          amount: totalAmount,
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

  const yearlyEquivalentPerMonth = Math.round(pricesFromApi.yearly / 12);
  const monthlyFullYear = pricesFromApi.monthly * 12;
  const annualSavingsPercent =
    monthlyFullYear > 0
      ? Math.round(((monthlyFullYear - pricesFromApi.yearly) / monthlyFullYear) * 100)
      : 0;

  // Ödeme özeti (KDV dahil)
  const baseAmount = selectedPlan === 'yearly' ? pricesFromApi.yearly : pricesFromApi.monthly;
  const kdvAmount = Math.round(baseAmount * (kdvRate / 100));
  const totalWithVat = baseAmount + kdvAmount;

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
            {user.expiresAt && new Date(user.expiresAt) > new Date()
              ? '7 günlük denemeniz devam ediyor. İsterseniz şimdi ödeme yaparak aboneliğe geçebilirsiniz.'
              : '7 günlük deneme süreniz doldu. Devam etmek için bir plan seçin.'}
          </p>
        </div>

        {/* Plan seçimi: Aylık / Yıllık */}
        <div className="mb-8">
          <div className="p-6 rounded-xl border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Standard</h2>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${selectedPlan === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                  Aylık
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={selectedPlan === 'yearly'}
                  onClick={() => setSelectedPlan(selectedPlan === 'yearly' ? 'monthly' : 'yearly')}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                    selectedPlan === 'yearly' ? 'bg-[#25D366]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition ${
                      selectedPlan === 'yearly' ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${selectedPlan === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                  Yıllık
                </span>
              </div>
            </div>
            {selectedPlan === 'monthly' ? (
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  ₺{pricesFromApi.monthly.toLocaleString('tr-TR')} +KDV
                </span>
                <span className="text-gray-600">/ Ay</span>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-gray-900">
                    ₺{yearlyEquivalentPerMonth.toLocaleString('tr-TR')} +KDV
                  </span>
                  <span className="text-gray-600">/ Ay</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Yıllık ₺{pricesFromApi.yearly.toLocaleString('tr-TR')} +KDV ödenir
                </p>
                <p className="text-sm font-medium text-green-600">
                  Aylık plana göre %{annualSavingsPercent} daha avantajlı!
                </p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Fatura Bilgileri - isteğe bağlı */}
        <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Fatura Bilgileri (isteğe bağlı)</h3>
          <p className="text-xs text-gray-500 mb-4">İsim üzerine de fatura kesilebilir. Vergi no veya adres bilgisi vermek isterseniz doldurabilirsiniz.</p>
            <div className="space-y-3">
              <p className="text-sm text-gray-600"><span className="text-green-600">✔</span> Ad soyad: <strong>{user.name || '—'}</strong></p>
              <p className="text-sm text-gray-600"><span className="text-green-600">✔</span> Mail: <strong>{user.email || '—'}</strong></p>
              <div>
                <label htmlFor="payment-invoice-tax" className="block text-xs font-medium text-gray-600 mb-1">Vergi no / TC no</label>
                <input
                  type="text"
                  id="payment-invoice-tax"
                  value={invoiceTaxNo}
                  onChange={(e) => setInvoiceTaxNo(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="10 veya 11 haneli"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ borderColor: '#AF948F' }}
                  maxLength={11}
                />
              </div>
              <div>
                <label htmlFor="payment-invoice-address" className="block text-xs font-medium text-gray-600 mb-1">Adres</label>
                <input
                  type="text"
                  id="payment-invoice-address"
                  value={invoiceAddress}
                  onChange={(e) => setInvoiceAddress(e.target.value)}
                  placeholder="Fatura adresi"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ borderColor: '#AF948F' }}
                />
              </div>
            </div>
          </div>

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

          <div className="pt-4 border-t space-y-4">
            {/* Sözleşme onayları - tümü işaretlenmeden ödeme yapılamaz */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Sözleşmeler</h3>
              <AgreementCheckboxes
                items={[
                  { id: 'hizmet', label: 'Hizmet Sözleşmesini', href: '/hizmet-sozlesmesi', checked: agreedHizmet, onChange: setAgreedHizmet },
                  { id: 'kvkk', label: 'KVKK Aydınlatma Metnini', href: '/kvkk', checked: agreedKvkk, onChange: setAgreedKvkk },
                  { id: 'iade', label: 'İade ve İptal Politikasını', href: '/iade-iptal', checked: agreedIade, onChange: setAgreedIade },
                ]}
                error={agreementError}
              />
            </div>

            <div className="space-y-2">
            <div className="flex items-center justify-between text-gray-600">
              <span>Ara toplam:</span>
              <span>₺{baseAmount.toLocaleString('tr-TR')}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>KDV (%{kdvRate}):</span>
              <span>₺{kdvAmount.toLocaleString('tr-TR')}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-lg font-medium text-gray-900">Toplam (KDV dahil):</span>
              <span className="text-2xl font-bold text-orange-600">
                ₺{totalWithVat.toLocaleString('tr-TR')}
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !agreedHizmet || !agreedKvkk || !agreedIade}
              className="w-full py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
            >
              {isLoading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
            </button>

            <PaymentTrustBadges />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}