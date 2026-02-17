'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.trim()) {
      setError('E-posta adresi gerekli');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#555555' }}>
              🔑 Şifremi Unuttum
            </h1>
            <p className="text-sm" style={{ color: '#999999' }}>
              E-posta adresinizi girin, size şifre sıfırlama linki gönderelim
            </p>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-green-800 text-sm text-center">
                  E-posta adresinize şifre sıfırlama linki gönderdik. Lütfen gelen kutunuzu ve spam klasörünü kontrol edin.
                </p>
              </div>
              <Link
                href="/login"
                className="block w-full py-3 rounded-lg font-semibold text-center transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
              >
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: '#AF948F' }}
                    required
                    placeholder="ornek@email.com"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
                >
                  {isLoading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm hover:underline"
              style={{ color: '#999999' }}
            >
              ← Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
