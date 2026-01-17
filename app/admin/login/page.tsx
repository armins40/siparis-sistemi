'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminLogin, isAdminAuthenticated } from '@/lib/admin';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Eğer zaten giriş yapılmışsa admin paneline yönlendir
    // Sadece client-side'da çalış
    if (typeof window !== 'undefined') {
      const auth = isAdminAuthenticated();
      if (auth) {
        router.push('/admin');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Lütfen kullanıcı adı ve şifre girin');
      setIsLoading(false);
      return;
    }

    // Giriş kontrolü
    const success = adminLogin(username, password);
    
    if (success) {
      router.push('/admin');
    } else {
      setError('Kullanıcı adı veya şifre hatalı');
      setIsLoading(false);
    }
  };

  // Hydration hatasını önlemek için
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
              🔐 Admin Girişi
            </h1>
            <p className="text-sm" style={{ color: '#999999' }}>
              Admin paneline erişmek için giriş yapın
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-800 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="admin-username" className="block text-sm font-medium mb-2" style={{ color: '#555555' }}>
                Kullanıcı Adı
              </label>
              <input
                type="text"
                id="admin-username"
                name="admin-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{ borderColor: '#AF948F' }}
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium mb-2" style={{ color: '#555555' }}>
                Şifre
              </label>
              <input
                type="password"
                id="admin-password"
                name="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{ borderColor: '#AF948F' }}
                required
              />
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

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm hover:underline"
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
