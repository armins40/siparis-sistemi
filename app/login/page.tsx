'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userLogin, userLoginAsync, getCurrentUser, checkUserSubscription } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const user = getCurrentUser();
      if (user && user.isActive && user.id) {
        router.replace(`/dashboard/${user.id}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.trim()) {
      setError('E-posta adresi gerekli');
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Şifre gerekli');
      setIsLoading(false);
      return;
    }

    // Email'i normalize et
    const normalizedEmail = email.trim().toLowerCase();
    
    try {
      const { user, error } = await userLoginAsync(normalizedEmail, password.trim(), 'email');
      
      if (error === 'not_active') {
        setError('Hesabınız henüz aktif değil. Kayıt sonrası e-posta veya telefondan doğrulama adımını tamamlayın.');
        setIsLoading(false);
        return;
      }
      if (error === 'not_found' || error === 'invalid_password') {
        setError('E-posta adresi veya şifre hatalı.');
        setIsLoading(false);
        return;
      }
      
      if (user) {
        if (user.plan === 'trial' && user.expiresAt) {
          const now = new Date();
          const expiresAt = new Date(user.expiresAt);
          const isExpired = expiresAt <= now;
          
          if (isExpired) {
            // Trial süresi dolmuş, ödeme sayfasına yönlendir
            router.push(`/dashboard/${user.id}/payment`);
          } else {
            // Dashboard'a yönlendir (URL'de user ID ile)
            router.push(`/dashboard/${user.id}`);
          }
        } else if (user.plan !== 'free' && user.plan !== 'trial') {
          // Diğer planlar için subscription kontrolü
          const subscription = checkUserSubscription(user.id);
          
          if (!subscription.hasActiveSubscription) {
            // Abonelik süresi dolmuş, yenileme sayfasına yönlendir
            router.push(`/signup?plan=${user.plan}`);
          } else {
            // Dashboard'a yönlendir (URL'de user ID ile)
            router.push(`/dashboard/${user.id}`);
          }
        } else {
          router.push(`/dashboard/${user.id}`);
        }
      } else {
        setError('E-posta adresi veya şifre hatalı.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#555555' }}>
              🔐 Giriş Yap
            </h1>
            <p className="text-sm" style={{ color: '#999999' }}>
              Dashboard'a erişmek için giriş yapın
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-800 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#555555' }}>
                E-posta Adresi
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{ borderColor: '#AF948F' }}
                required
                placeholder="ornek@email.com"
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#555555' }}>
                  Şifre
                </label>
                <Link href="/forgot-password" className="text-sm text-orange-600 hover:underline">
                  Şifremi unuttum
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                  style={{ borderColor: '#AF948F' }}
                  required
                  placeholder="Şifrenizi girin"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm" style={{ color: '#999999' }}>
              Hesabınız yok mu?{' '}
              <Link href="/#fiyatlandirma" className="text-orange-600 hover:underline font-medium">
                Plan seç ve kayıt ol
              </Link>
            </p>
            <Link
              href="/"
              className="block text-sm hover:underline"
              style={{ color: '#999999' }}
            >
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
