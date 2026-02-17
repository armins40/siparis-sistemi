'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function AffiliateGirisPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (!email.trim() || !password) {
      setError('E-posta ve şifre gerekli');
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/affiliate/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Giriş yapılamadı');
        setIsLoading(false);
        return;
      }
      router.push('/affiliate/dashboard');
    } catch {
      setError('Bir hata oluştu');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/affiliate" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <Image src="/logo.svg" alt="Siparis" width={280} height={80} className="w-[200px] md:w-[260px] h-auto" />
            <span className="text-sm">Satış Ortaklığı</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Satış ortağı giriş</h1>
        <p className="text-gray-600 text-sm mb-6">Hesabınıza giriş yapın.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="ornek@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş yap'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Hesabınız yok mu?{' '}
          <Link href="/affiliate/kayit" className="text-gray-900 font-medium underline">Kayıt olun</Link>
        </p>
      </main>
    </div>
  );
}
