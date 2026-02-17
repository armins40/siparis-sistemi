'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { setCurrentUser, logout } from '@/lib/auth';
import { generateSlug, saveStore, clearStore } from '@/lib/store';
import type { User, Sector, Store } from '@/lib/types';
import { SECTORS } from '@/lib/sectors';
function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCodeFromUrl = searchParams.get('ref') || searchParams.get('k') || '';
  // Artık plan seçimi yok - herkes 7 günlük ücretsiz deneme ile başlıyor
  const plan: User['plan'] = 'trial';
  
  const [step, setStep] = useState<'info' | 'verification' | 'payment'>('info');
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    sector: '' as Sector | '',
    verificationType: 'email' as 'email' | 'phone',
    invoiceTaxNo: '',
    invoiceAddress: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [verified, setVerified] = useState({ email: false, phone: false });
  const [verificationCodes, setVerificationCodes] = useState<Map<string, { code: string; expiresAt: string; id: string }>>(new Map());
  const [tekelAgeConfirm, setTekelAgeConfirm] = useState(false);

  useEffect(() => {
    logout();
    clearStore();
  }, []);

  // Affiliate tıklama kaydı: ref ile geldiyse bir kez say
  useEffect(() => {
    if (!referralCodeFromUrl.trim()) return;
    fetch(`/api/affiliate/click?code=${encodeURIComponent(referralCodeFromUrl.trim())}`).catch(() => {});
  }, [referralCodeFromUrl]);

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

    if (!formData.companyName.trim()) {
      setError('Firma ismi gerekli');
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

    // Check database for existing users (not localStorage)
    // This check will be done on the server side in the API route
    // We only do basic validation here

    if (!formData.sector) {
      setError('Sektör seçimi zorunludur');
      setIsLoading(false);
      return;
    }

    if (formData.sector === 'tekel' && !tekelAgeConfirm) {
      setError('18 yaş altına satış yapmayacağınızı kabul etmeniz gerekiyor.');
      setIsLoading(false);
      return;
    }

    try {
      // 7 günlük ücretsiz deneme için expiresAt hesapla
      const now = new Date();
      const trialEndDate = new Date(now);
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 gün ekle
      const expiresAt = trialEndDate.toISOString();
      
      // Generate user ID and store slug first
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const storeSlug = generateSlug(formData.companyName.trim() || `store-${userId}`);
      
      // Create user object (not saved to localStorage - only database)
      const user = {
        id: userId,
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        password: formData.password,
        sector: formData.sector,
        plan: 'trial' as const, // Herkes trial olarak başlıyor
        isActive: false, // Doğrulama yapılana kadar aktif değil
        emailVerified: false,
        phoneVerified: false,
        expiresAt, // 7 gün sonra
        storeSlug: storeSlug,
        createdAt: new Date().toISOString(),
        invoiceTaxNo: formData.invoiceTaxNo.trim() || undefined,
        invoiceAddress: formData.invoiceAddress.trim() || undefined,
      };

      // Store oluştur — slug firma isminden, mağaza adı firma ismi
      const storeData = {
        slug: storeSlug,
        name: formData.companyName.trim(),
        sector: formData.sector,
      };
      
      // Save to database (via API route) - NO localStorage
      try {
        // Save user and store to database via API
        const userWithStore = user;
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: userWithStore,
            store: storeData,
            referralCode: referralCodeFromUrl.trim() || undefined,
          }),
        });

        const result = await response.json();

        if (result.success) {
          console.log('✅ User and store saved to database');
          saveStore({ ...storeData, sector: (storeData.sector || undefined) as Sector | undefined } as Store);
        } else {
          // Show API error to user
          const errorMessage = result.error || 'Kayıt sırasında bir hata oluştu';
          setError(errorMessage);
          setIsLoading(false);
          return; // Stop signup process if database save fails
        }
      } catch (dbError: any) {
        console.error('⚠️ Database save error:', dbError);
        const errorMessage = dbError?.message || 'Kayıt sırasında bir hata oluştu';
        setError(errorMessage);
        setIsLoading(false);
        return; // Stop signup process if database save fails
      }

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

      // Kod gönderildi - response'da gelen kodu sakla (serverless sorununu çözmek için)
      const emailOrPhone = type === 'email' 
        ? formData.email?.trim().toLowerCase() 
        : formData.phone?.trim();
      
      console.log('📥 Send response:', { 
        hasVerificationCode: !!data.verificationCode,
        hasVerificationId: !!data.verificationId,
        hasExpiresAt: !!data.expiresAt,
        emailOrPhone,
        type,
        verificationCode: data.verificationCode,
        verificationId: data.verificationId,
        expiresAt: data.expiresAt,
        fullData: data 
      });
      
      if (data.verificationCode && data.verificationId && data.expiresAt && emailOrPhone) {
        const key = `${type}_${emailOrPhone}`;
        setVerificationCodes(prev => {
          const newMap = new Map(prev);
          newMap.set(key, {
            code: data.verificationCode,
            id: data.verificationId,
            expiresAt: data.expiresAt,
          });
          return newMap;
        });
        console.log('✅ Verification code saved locally:', data.verificationCode);
      } else {
        console.warn('⚠️ Verification code not in response or missing email/phone');
      }
    } catch (err) {
      setError('Doğrulama kodu gönderilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (code: string, type: 'email' | 'phone'): Promise<boolean> => {
    setIsLoading(true);
    setError('');

    try {
      // Email/Phone'u normalize et
      const emailOrPhone = type === 'email' 
        ? formData.email?.trim().toLowerCase() 
        : formData.phone?.trim();
      
      if (!emailOrPhone) {
        setError(type === 'email' ? 'E-posta adresi gerekli' : 'Telefon numarası gerekli');
        setIsLoading(false);
        return false;
      }

      // Önce client-side'da kontrol et (serverless sorununu çözmek için)
      const key = `${type}_${emailOrPhone}`;
      const localCode = verificationCodes.get(key);
      const normalizedCode = code.trim().replace(/\D/g, '');
      
      console.log('🔍 Verification check:', {
        key,
        hasLocalCode: !!localCode,
        localCode: localCode ? { code: localCode.code, expiresAt: localCode.expiresAt } : null,
        inputCode: normalizedCode,
        allCodes: Array.from(verificationCodes.entries()).map(([k, v]) => ({ key: k, code: v.code })),
      });
      
      if (localCode) {
        const now = Date.now();
        const expiresAt = new Date(localCode.expiresAt).getTime();
        
        if (localCode.code === normalizedCode && expiresAt > now) {
          console.log('✅ Code verified locally - skipping server request');
          // Local doğrulama başarılı - server'a istek gönderme (serverless sorunu nedeniyle)
          const localVerified = { ...verified, [type]: true };
          setVerified(localVerified);
          
          if (userId) {
            let activated = false;
            for (let attempt = 0; attempt < 2 && !activated; attempt++) {
              try {
                const res = await fetch('/api/auth/activate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId,
                    emailVerified: type === 'email',
                    phoneVerified: type === 'phone',
                  }),
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  activated = true;
                  console.log('✅ User activated in database:', userId);
                } else if (attempt === 1) {
                  setError('Hesap aktifleştirilemedi. Sayfayı yenileyip tekrar doğrulayın veya destekle iletişime geçin.');
                  setIsLoading(false);
                  return true;
                } else {
                  await new Promise((r) => setTimeout(r, 800));
                }
              } catch (e) {
                if (attempt === 1) {
                  setError('Hesap aktifleştirilemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.');
                  setIsLoading(false);
                  return true;
                }
                await new Promise((r) => setTimeout(r, 800));
              }
            }
            setCurrentUser(userId);
            router.push(`/dashboard/${userId}`);
          }
          setIsLoading(false);
          return true;
        } else if (expiresAt <= now) {
          setError('Doğrulama kodu süresi dolmuş. Lütfen yeni kod isteyin.');
          setIsLoading(false);
          return false;
        } else {
          // Kod eşleşmiyor
          console.warn('❌ Code mismatch:', { local: localCode.code, input: normalizedCode });
          setError('Doğrulama kodu hatalı');
          setIsLoading(false);
          return false;
        }
      } else {
        console.warn('⚠️ No local code found, trying server verification');
        
        // Client-side'da kod yoksa server'a istek gönder
        const requestBody = {
          email: type === 'email' ? emailOrPhone : undefined,
          phone: type === 'phone' ? emailOrPhone : undefined,
          code: normalizedCode,
          type,
        };

        console.log('🔍 Server verification request:', requestBody);

        let data;
        try {
          const response = await fetch('/api/verification/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          try {
            data = await response.json();
          } catch (jsonError) {
            console.error('❌ JSON parse error:', jsonError);
            const text = await response.text();
            console.error('Response text:', text);
            setError('Sunucudan geçersiz yanıt alındı');
            setIsLoading(false);
            return false;
          }

          console.log('📥 Verification response:', { status: response.status, data });

          if (!response.ok) {
            const errorMessage = data?.error || data?.message || `Doğrulama başarısız (${response.status})`;
            console.error('❌ Verification error:', errorMessage, data);
            setError(errorMessage);
            setIsLoading(false);
            return false;
          }

          // Doğrulama başarılı
          const newVerified = { ...verified, [type]: true };
          setVerified(newVerified);
          
          if (userId) {
            let activated = false;
            for (let attempt = 0; attempt < 2 && !activated; attempt++) {
              try {
                const res = await fetch('/api/auth/activate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId,
                    emailVerified: type === 'email',
                    phoneVerified: type === 'phone',
                  }),
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  activated = true;
                  console.log('✅ User activated in database:', userId);
                } else if (attempt === 1) {
                  setError('Hesap aktifleştirilemedi. Sayfayı yenileyip tekrar doğrulayın veya destekle iletişime geçin.');
                  setIsLoading(false);
                  return true;
                } else {
                  await new Promise((r) => setTimeout(r, 800));
                }
              } catch (e) {
                if (attempt === 1) {
                  setError('Hesap aktifleştirilemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.');
                  setIsLoading(false);
                  return true;
                }
                await new Promise((r) => setTimeout(r, 800));
              }
            }
            setCurrentUser(userId);
            router.push(`/dashboard/${userId}`);
          }

          setIsLoading(false);
          return true;
        } catch (fetchError) {
          console.error('❌ Fetch error:', fetchError);
          setError('Doğrulama sırasında bir hata oluştu');
          setIsLoading(false);
          return false;
        }
      }
    } catch (err) {
      setError('Doğrulama sırasında bir hata oluştu');
      setIsLoading(false);
      return false;
    }
  };

  // Plan kontrolü kaldırıldı - herkes trial olarak kayıt oluyor

  return (
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
            {/* Ödeme adımı kaldırıldı - 7 gün sonra dashboard'da ödeme ekranı gösterilecek */}
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
                7 Günlük Ücretsiz Deneme
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Kayıt olduktan sonra 7 gün ücretsiz kullanabilirsiniz. Deneme süresi sonunda ödeme yaparak devam edebilirsiniz.
              </p>

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div>
                  <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    id="signup-name"
                    name="signup-name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: '#AF948F' }}
                  />
                </div>

                <div>
                  <label htmlFor="signup-company" className="block text-sm font-medium text-gray-700 mb-2">
                    Firma İsmi *
                  </label>
                  <input
                    type="text"
                    id="signup-company"
                    name="signup-company"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: '#AF948F' }}
                    placeholder="Örn. Keyif Tekel"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Menü linki (slug) firma isminizden otomatik oluşturulur
                  </p>
                </div>

                <div>
                  <label htmlFor="signup-sector" className="block text-sm font-medium text-gray-700 mb-2">
                    Sektörünüz *
                  </label>
                  <select
                    id="signup-sector"
                    name="signup-sector"
                    required
                    value={formData.sector}
                    onChange={(e) => {
                      const v = e.target.value as Sector;
                      setFormData({ ...formData, sector: v });
                      if (v !== 'tekel') setTekelAgeConfirm(false);
                    }}
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
                  {formData.sector === 'tekel' && (
                    <div className="mt-4 p-4 rounded-lg border-2 border-amber-200 bg-amber-50">
                      <p className="text-sm font-medium text-amber-900 mb-2">
                        ⚠️ 18 yaş altına satış yapılamaz
                      </p>
                      <p className="text-sm text-amber-800 mb-3">
                        Tekel sektöründe 18 yaşından küçüklere satış yapılamaz. Bu sektörü seçerek 18 yaş altına satış yapmayacağınızı kabul etmeniz gerekmektedir.
                      </p>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tekelAgeConfirm}
                          onChange={(e) => setTekelAgeConfirm(e.target.checked)}
                          className="mt-1 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm text-amber-900">
                          18 yaş altına satış yapmayacağımı kabul ediyorum.
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    id="signup-email"
                    name="signup-email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase().trim() })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: '#AF948F' }}
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="signup-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon (Opsiyonel)
                  </label>
                  <input
                    type="tel"
                    id="signup-phone"
                    name="signup-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: '#AF948F' }}
                    placeholder="05XX XXX XX XX"
                  />
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Şifre *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="signup-password"
                      name="signup-password"
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
                  <label htmlFor="signup-verification-type" className="block text-sm font-medium text-gray-700 mb-2">
                    Doğrulama Yöntemi *
                  </label>
                  <select
                    id="signup-verification-type"
                    name="signup-verification-type"
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

                {/* Fatura Bilgileri - isteğe bağlı */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Fatura Bilgileri (isteğe bağlı)</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    7 gün ücretsiz deneme sırasında isteğe bağlı ödeme yapabilirsiniz. Fatura isim üzerine de kesilebilir; vergi no ve adres isteğe bağlıdır.
                  </p>
                  <div className="space-y-3 text-sm">
                    <p className="flex items-center gap-2 text-gray-600">
                      <span className="text-green-600">✔</span> Ad soyad: <strong>{formData.name || '—'}</strong>
                    </p>
                    <p className="flex items-center gap-2 text-gray-600">
                      <span className="text-green-600">✔</span> Firma adı: <strong>{formData.companyName || '—'}</strong>
                    </p>
                    <div>
                      <label htmlFor="signup-invoice-tax" className="block text-xs font-medium text-gray-600 mb-1">Vergi no</label>
                      <input
                        type="text"
                        id="signup-invoice-tax"
                        value={formData.invoiceTaxNo}
                        onChange={(e) => setFormData({ ...formData, invoiceTaxNo: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                        placeholder="10 veya 11 haneli"
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        style={{ borderColor: '#AF948F' }}
                        maxLength={11}
                      />
                    </div>
                    <div>
                      <label htmlFor="signup-invoice-address" className="block text-xs font-medium text-gray-600 mb-1">Adres</label>
                      <input
                        type="text"
                        id="signup-invoice-address"
                        value={formData.invoiceAddress}
                        onChange={(e) => setFormData({ ...formData, invoiceAddress: e.target.value })}
                        placeholder="Fatura adresi"
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        style={{ borderColor: '#AF948F' }}
                      />
                    </div>
                    <p className="flex items-center gap-2 text-gray-600">
                      <span className="text-green-600">✔</span> Mail: <strong>{formData.email || '—'}</strong>
                    </p>
                  </div>
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

          {/* Ödeme adımı kaldırıldı - 7 gün sonra dashboard'da ödeme ekranı gösterilecek */}
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
      <p className="text-gray-600 mb-2">
        {verificationType === 'email' 
          ? `${email} adresine gönderilen doğrulama kodunu girin`
          : `${phone} numarasına gönderilen doğrulama kodunu girin`}
      </p>
      <p className="text-sm text-gray-500 mb-6">
        ⏰ Kod <strong>12 dakika</strong> geçerlidir
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
          <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
            Doğrulama Kodu (6 haneli)
          </label>
          <input
            type="text"
            id="verification-code"
            name="verification-code"
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
          <div className="text-sm text-gray-500">
            <p>Kodu tekrar göndermek için {countdown} saniye bekleyin</p>
            <p className="text-xs mt-1">(Mevcut kodunuz hala geçerli)</p>
          </div>
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
          <label htmlFor="payment-card-number" className="block text-sm font-medium text-gray-700 mb-2">
            Kart Numarası *
          </label>
          <input
            type="text"
            id="payment-card-number"
            name="payment-card-number"
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
          <label htmlFor="payment-card-name" className="block text-sm font-medium text-gray-700 mb-2">
            Kart Üzerindeki İsim *
          </label>
          <input
            type="text"
            id="payment-card-name"
            name="payment-card-name"
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
            <label htmlFor="payment-expiry-date" className="block text-sm font-medium text-gray-700 mb-2">
              Son Kullanma (AA/YY) *
            </label>
            <input
              type="text"
              id="payment-expiry-date"
              name="payment-expiry-date"
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
            <label htmlFor="payment-cvv" className="block text-sm font-medium text-gray-700 mb-2">
              CVV *
            </label>
            <input
              type="text"
              id="payment-cvv"
              name="payment-cvv"
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Yükleniyor...</div>}>
      <SignupForm />
    </Suspense>
  );
}
