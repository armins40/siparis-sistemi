'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Geçersiz veya eksik link. Lütfen e-postanızdaki şifre sıfırlama linkini kullanın.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) return;

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 mb-6">
              <p className="text-red-800 text-sm text-center">{error}</p>
            </div>
            <Link
              href="/forgot-password"
              className="block w-full py-3 rounded-lg font-semibold text-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
            >
              Yeni şifre sıfırlama talebi gönder
            </Link>
            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm hover:underline" style={{ color: '#999999' }}>
                ← Giriş sayfasına dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 mb-6">
              <p className="text-green-800 text-sm text-center">
                Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.
              </p>
            </div>
            <Link
              href="/login"
              className="block w-full py-3 rounded-lg font-semibold text-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#555555' }}>
              🔐 Yeni Şifre Belirle
            </h1>
            <p className="text-sm" style={{ color: '#999999' }}>
              Yeni şifrenizi girin
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-800 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#555555' }}>
                Yeni Şifre
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
                  minLength={6}
                  placeholder="En az 6 karakter"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: '#555555' }}>
                Şifre Tekrar
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{ borderColor: '#AF948F' }}
                required
                minLength={6}
                placeholder="Şifrenizi tekrar girin"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
            >
              {isLoading ? 'Kaydediliyor...' : 'Şifremi Güncelle'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm hover:underline" style={{ color: '#999999' }}>
              ← Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
