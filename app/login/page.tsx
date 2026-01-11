'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userLogin, getCurrentUser, checkUserSubscription } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState<'email' | 'phone'>('email');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Eğer zaten giriş yapılmışsa dashboard'a yönlendir
    // Verified kontrolü yapmıyoruz çünkü eski kayıtlar için verified olmayabilir
    if (typeof window !== 'undefined') {
      const user = getCurrentUser();
      if (user && user.isActive) {
        router.replace('/dashboard');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!emailOrPhone.trim()) {
      setError(`${type === 'email' ? 'E-posta' : 'Telefon'} adresi gerekli`);
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Şifre gerekli');
      setIsLoading(false);
      return;
    }

    // Giriş kontrolü (şifre ile)
    const user = userLogin(emailOrPhone.trim(), password.trim(), type);
    
    if (user) {
      // Abonelik kontrolü
      const subscription = checkUserSubscription(user.id);
      
      if (!subscription.hasActiveSubscription && user.plan !== 'free') {
        // Abonelik süresi dolmuş, yenileme sayfasına yönlendir
        router.push(`/signup?plan=${user.plan}`);
      } else {
        // Dashboard'a yönlendir
        router.push('/dashboard');
      }
    } else {
      setError(`${type === 'email' ? 'E-posta' : 'Telefon'} adresi veya şifre hatalı`);
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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
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
              <label className="block text-sm font-medium mb-2" style={{ color: '#555555' }}>
                Giriş Tipi
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'email' | 'phone')}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
                style={{ borderColor: '#AF948F' }}
              >
                <option value="email">E-posta ile Giriş</option>
                <option value="phone">Telefon ile Giriş</option>
              </select>
            </div>

            <div>
              <label htmlFor="emailOrPhone" className="block text-sm font-medium mb-2" style={{ color: '#555555' }}>
                {type === 'email' ? 'E-posta Adresi' : 'Telefon Numarası'}
              </label>
              <input
                type={type === 'email' ? 'email' : 'tel'}
                id="emailOrPhone"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{ borderColor: '#AF948F' }}
                required
                placeholder={type === 'email' ? 'ornek@email.com' : '05XX XXX XX XX'}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#555555' }}>
                Şifre
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
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
