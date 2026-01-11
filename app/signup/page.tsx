'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createUser, getUserByEmail, getUserByPhone, updateUser } from '@/lib/admin';
import { setCurrentUser } from '@/lib/auth';
import { saveStore, generateSlug } from '@/lib/store';
import type { User, Sector } from '@/lib/types';
import { SECTORS } from '@/lib/sectors';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') as User['plan'] | null;
  
  const [step, setStep] = useState<'info' | 'verification' | 'payment'>('info');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    sector: '' as Sector | '',
    verificationType: 'email' as 'email' | 'phone',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [verified, setVerified] = useState({ email: false, phone: false });

  useEffect(() => {
    // Plan yoksa ana sayfaya yönlendir
    if (!plan || !['monthly', '6month', 'yearly'].includes(plan)) {
      router.push('/');
    }
  }, [plan, router]);

  // Şifre validasyonu: En az 1 sayı ve 1 büyük harf
  const validatePassword = (password: string): boolean => {
    if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError('Şifre en az 1 sayı içermelidir');
      return false;
    }
    if (!/[A-ZÇĞİÖŞÜ]/.test(password)) {
      setPasswordError('Şifre en az 1 büyük harf içermelidir');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordError('');
    setIsLoading(true);

    // Validasyon
    if (!formData.name.trim()) {
      setError('Ad soyad gerekli');
      setIsLoading(false);
      return;
    }

    if (!formData.email && !formData.phone) {
      setError('E-posta veya telefon numarası gerekli');
      setIsLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Şifre gerekli');
      setIsLoading(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setIsLoading(false);
      return;
    }

    if (formData.email) {
      const existing = getUserByEmail(formData.email);
      if (existing) {
        setError('Bu e-posta adresi zaten kullanılıyor');
        setIsLoading(false);
        return;
      }
    }

    if (formData.phone) {
      const existing = getUserByPhone(formData.phone);
      if (existing) {
        setError('Bu telefon numarası zaten kullanılıyor');
        setIsLoading(false);
        return;
      }
    }

    if (!formData.sector) {
      setError('Sektör seçimi zorunludur');
      setIsLoading(false);
      return;
    }

    try {
      // Kullanıcı oluştur
      const user = createUser({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        password: formData.password,
        sector: formData.sector,
        plan: plan || 'free',
        isActive: false, // Doğrulama yapılana kadar aktif değil
        emailVerified: false,
        phoneVerified: false,
      });

      // Store oluştur (sektör ile birlikte)
      const storeSlug = generateSlug(formData.name || `store-${user.id}`);
      saveStore({
        slug: storeSlug,
        name: formData.name,
        sector: formData.sector,
      });

      // Kullanıcıya store slug'ı ekle
      updateUser(user.id, {
        storeSlug: storeSlug,
      });

      setUserId(user.id);
      setStep('verification');

      // İlk doğrulama kodunu gönder
      const verificationType = formData.verificationType;
      if ((verificationType === 'email' && formData.email) || (verificationType === 'phone' && formData.phone)) {
        await sendVerificationCode(verificationType);
      }
    } catch (err) {
      setError('Kayıt sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationCode = async (type: 'email' | 'phone') => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verification/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: type === 'email' ? formData.email : undefined,
          phone: type === 'phone' ? formData.phone : undefined,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Doğrulama kodu gönderilemedi');
        return;
      }

      // Kod gönderildi (production'da API key varsa mail gönderilir)
    } catch (err) {
      setError('Doğrulama kodu gönderilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (code: string, type: 'email' | 'phone') => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verification/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: type === 'email' ? formData.email : undefined,
          phone: type === 'phone' ? formData.phone : undefined,
          code,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Doğrulama başarısız');
        setIsLoading(false);
        return false;
      }

      // Doğrulama başarılı
      const newVerified = { ...verified, [type]: true };
      setVerified(newVerified);
      
      // Kullanıcı bilgilerini güncelle
      if (userId) {
        updateUser(userId, {
          [type === 'email' ? 'emailVerified' : 'phoneVerified']: true,
          isActive: true, // Doğrulama yapıldıysa aktif
        });
      }
      
      // Plan ücretliyse ödeme adımına geç, değilse dashboard'a yönlendir
      if (plan && plan !== 'free') {
        setStep('payment');
      } else {
        // Ücretsiz plan için kullanıcıyı oturuma kaydet ve dashboard'a yönlendir
        if (userId) {
          setCurrentUser(userId);
        }
        router.push('/dashboard');
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      setError('Doğrulama sırasında bir hata oluştu');
      setIsLoading(false);
      return false;
    }
  };

  if (!plan || !['monthly', '6month', 'yearly'].includes(plan)) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: '#555555' }}>
                Siparis
              </h1>
            </Link>
            <Link
              href="/"
              className="px-4 py-2 font-medium transition-colors"
              style={{ color: '#555555' }}
            >
              Ana Sayfa
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex-1 text-center ${step === 'info' ? 'text-orange-600 font-bold' : 'text-gray-400'}`}>
              <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" 
                style={{ backgroundColor: step === 'info' ? '#FB6602' : '#E5E5E5', color: step === 'info' ? '#FFFFFF' : '#999999' }}>
                1
              </div>
              <p className="text-sm">Bilgiler</p>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step === 'verification' || step === 'payment' ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
            <div className={`flex-1 text-center ${step === 'verification' ? 'text-orange-600 font-bold' : step === 'payment' ? 'text-gray-600' : 'text-gray-400'}`}>
              <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" 
                style={{ backgroundColor: step === 'verification' || step === 'payment' ? '#FB6602' : '#E5E5E5', color: step === 'verification' || step === 'payment' ? '#FFFFFF' : '#999999' }}>
                2
              </div>
              <p className="text-sm">Doğrulama</p>
            </div>
            {plan !== 'free' && (
              <>
                <div className={`flex-1 h-1 mx-2 ${step === 'payment' ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
                <div className={`flex-1 text-center ${step === 'payment' ? 'text-orange-600 font-bold' : 'text-gray-400'}`}>
                  <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" 
                    style={{ backgroundColor: step === 'payment' ? '#FB6602' : '#E5E5E5', color: step === 'payment' ? '#FFFFFF' : '#999999' }}>
                    3
                  </div>
                  <p className="text-sm">Ödeme</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1: Bilgiler */}
          {step === 'info' && (
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#555555' }}>
                Kayıt Ol
              </h2>
              <p className="text-gray-600 mb-6">
                {plan === 'monthly' && '1 Aylık Plan - 299₺'}
                {plan === '6month' && '6 Aylık Plan - 1590₺'}
                {plan === 'yearly' && 'Yıllık Plan - 2490₺'}
              </p>

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: '#AF948F' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sektörünüz *
                  </label>
                  <select
                    required
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value as Sector })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-base font-medium"
                    style={{ borderColor: formData.sector ? '#FB6602' : '#AF948F' }}
                  >
                    <option value="">👉 Sektörünüzü Seçin</option>
                    {SECTORS.map((sector) => (
                      <option key={sector.value} value={sector.value}>
                        {sector.icon} {sector.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.sector 
                      ? `✓ ${SECTORS.find(s => s.value === formData.sector)?.label} sektörü seçildi`
                      : 'Sektörünüze özel ürünler ve kategoriler göreceksiniz'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: '#AF948F' }}
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon (Opsiyonel)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: '#AF948F' }}
                    placeholder="05XX XXX XX XX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şifre *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (e.target.value) {
                          validatePassword(e.target.value);
                        } else {
                          setPasswordError('');
                        }
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                      style={{ borderColor: passwordError ? '#ef4444' : formData.password && !passwordError ? '#22c55e' : '#AF948F' }}
                      placeholder="En az 1 sayı ve 1 büyük harf içermelidir"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-600 mt-1">{passwordError}</p>
                  )}
                  {formData.password && !passwordError && (
                    <p className="text-xs text-green-600 mt-1">✓ Şifre geçerli</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Şifre en az 6 karakter, 1 sayı ve 1 büyük harf içermelidir
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 mb-2">
                    Doğrulama Yöntemi *
                  </label>
                  <select
                    value={formData.verificationType}
                    onChange={(e) => setFormData({ ...formData, verificationType: e.target.value as 'email' | 'phone' })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: '#AF948F' }}
                  >
                    <option value="email">E-posta ile Doğrula</option>
                    {formData.phone && <option value="phone">Telefon ile Doğrula</option>}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Doğrulama kodu {formData.verificationType === 'email' ? 'e-posta adresinize' : 'telefon numaranıza'} gönderilecek
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
                >
                  {isLoading ? 'Kaydediliyor...' : 'Devam Et'}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Doğrulama */}
          {step === 'verification' && (
            <VerificationStep
              email={formData.email}
              phone={formData.phone}
              verificationType={formData.verificationType}
              onVerify={handleVerification}
              onResend={sendVerificationCode}
              verified={verified}
              isLoading={isLoading}
              error={error}
              onErrorChange={setError}
            />
          )}

          {/* Step 3: Ödeme */}
          {step === 'payment' && plan !== 'free' && userId && (
            <PaymentStep
              userId={userId}
              plan={plan}
              email={formData.email}
              phone={formData.phone}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Doğrulama Adımı Komponenti
function VerificationStep({
  email,
  phone,
  verificationType,
  onVerify,
  onResend,
  verified,
  isLoading,
  error,
  onErrorChange,
}: {
  email: string;
  phone: string;
  verificationType: 'email' | 'phone';
  onVerify: (code: string, type: 'email' | 'phone') => Promise<boolean>;
  onResend: (type: 'email' | 'phone') => Promise<void>;
  verified: { email: boolean; phone: boolean };
  isLoading: boolean;
  error: string;
  onErrorChange: (error: string) => void;
}) {
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onErrorChange('');
    
    if (code.length !== 6) {
      onErrorChange('Kod 6 haneli olmalıdır');
      return;
    }

    const success = await onVerify(code, verificationType);
    if (success) {
      setCode('');
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    await onResend(verificationType);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4" style={{ color: '#555555' }}>
        Doğrulama
      </h2>
      <p className="text-gray-600 mb-6">
        {verificationType === 'email' 
          ? `${email} adresine gönderilen doğrulama kodunu girin`
          : `${phone} numarasına gönderilen doğrulama kodunu girin`}
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {(verified.email || verified.phone) && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-green-800 text-sm">
            ✅ {verificationType === 'email' ? 'E-posta' : 'Telefon'} doğrulaması tamamlandı!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Doğrulama Kodu (6 haneli)
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // Sadece rakam
              setCode(value);
              onErrorChange('');
            }}
            className="w-full px-4 py-2 border rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-500"
            style={{ borderColor: '#AF948F' }}
            placeholder="000000"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || code.length !== 6}
          className="w-full py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
        >
          {isLoading ? 'Doğrulanıyor...' : 'Doğrula'}
        </button>
      </form>

      <div className="mt-4 text-center">
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-orange-600 hover:underline"
          >
            Kodu Tekrar Gönder
          </button>
        ) : (
          <p className="text-sm text-gray-500">
            Kodu tekrar göndermek için {countdown} saniye bekleyin
          </p>
        )}
      </div>
    </div>
  );
}

// Ödeme Adımı Komponenti
function PaymentStep({
  userId,
  plan,
  email,
  phone,
}: {
  userId: string;
  plan: 'monthly' | '6month' | 'yearly';
  email: string;
  phone: string;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  useEffect(() => {
    // Payment intent oluştur
    const createIntent = async () => {
      try {
        const response = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            plan,
            email,
            phone,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Ödeme intent oluşturulamadı');
          return;
        }

        setPaymentIntentId(data.paymentIntentId);
      } catch (err) {
        setError('Ödeme intent oluşturulurken bir hata oluştu');
      }
    };

    createIntent();
  }, [userId, plan, email, phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!paymentIntentId) {
      setError('Ödeme intent bulunamadı');
      setIsLoading(false);
      return;
    }

    // Kart bilgileri validasyonu (basit)
    if (formData.cardNumber.replace(/\s/g, '').length < 16) {
      setError('Geçerli bir kart numarası girin');
      setIsLoading(false);
      return;
    }

    if (formData.expiryDate.length !== 5) {
      setError('Geçerli bir son kullanma tarihi girin (AA/YY)');
      setIsLoading(false);
      return;
    }

    if (formData.cvv.length < 3) {
      setError('Geçerli bir CVV girin');
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Stripe ile gerçek ödeme
      // Production'da:
      /*
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: formData.cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(formData.expiryDate.split('/')[0]),
          exp_year: 2000 + parseInt(formData.expiryDate.split('/')[1]),
          cvc: formData.cvv,
        },
      });

      await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethod.id,
      });
      */

      // Mock ödeme onayı
      const response = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId,
          userId,
          paymentMethod: `****${formData.cardNumber.slice(-4)}`, // Son 4 hane
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ödeme başarısız');
        setIsLoading(false);
        return;
      }

      // Başarılı - Kullanıcıyı oturuma kaydet ve Dashboard'a yönlendir
      setCurrentUser(userId);
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4" style={{ color: '#555555' }}>
        Ödeme
      </h2>
      <p className="text-gray-600 mb-6">
        {PLAN_NAMES[plan]} - {PLAN_PRICES[plan]}₺
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kart Numarası *
          </label>
          <input
            type="text"
            required
            maxLength={19}
            value={formData.cardNumber}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              // 4 hanede bir boşluk ekle
              value = value.replace(/(.{4})/g, '$1 ').trim();
              setFormData({ ...formData, cardNumber: value });
            }}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            style={{ borderColor: '#AF948F' }}
            placeholder="1234 5678 9012 3456"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kart Üzerindeki İsim *
          </label>
          <input
            type="text"
            required
            value={formData.cardName}
            onChange={(e) => setFormData({ ...formData, cardName: e.target.value.toUpperCase() })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            style={{ borderColor: '#AF948F' }}
            placeholder="AHMET YILMAZ"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Son Kullanma (AA/YY) *
            </label>
            <input
              type="text"
              required
              maxLength={5}
              value={formData.expiryDate}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                  value = value.slice(0, 2) + '/' + value.slice(2, 4);
                }
                setFormData({ ...formData, expiryDate: value });
              }}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ borderColor: '#AF948F' }}
              placeholder="12/25"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVV *
            </label>
            <input
              type="text"
              required
              maxLength={4}
              value={formData.cvv}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setFormData({ ...formData, cvv: value });
              }}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ borderColor: '#AF948F' }}
              placeholder="123"
            />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 border">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Toplam:</span>
            <span className="text-xl font-bold" style={{ color: '#555555' }}>
              {PLAN_PRICES[plan]}₺
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !paymentIntentId}
          className="w-full py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
        >
          {isLoading ? 'Ödeme İşleniyor...' : `${PLAN_PRICES[plan]}₺ Öde ve Başla`}
        </button>

        <p className="text-xs text-center text-gray-500">
          🔒 Güvenli ödeme. Kart bilgileriniz şifrelenir ve saklanmaz.
        </p>
      </form>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
