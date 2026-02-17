'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function AffiliateKayitPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (!name.trim()) {
      setError('Ad soyad gerekli');
      setIsLoading(false);
      return;
    }
    if (!email.trim()) {
      setError('E-posta gerekli');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/affiliate/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          ...(code.trim() && { code: code.trim() }),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Kayıt yapılamadı');
        setIsLoading(false);
        return;
      }
      // Kayıt sonrası giriş yap (login ile session aç)
      const loginRes = await fetch('/api/affiliate/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const loginData = await loginRes.json();
      if (loginData.success) {
        router.push('/affiliate/dashboard');
        return;
      }
      router.push('/affiliate/giris');
    } catch {
      setError('Bir hata oluştu');
    } finally {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Satış ortağı kayıt</h1>
        <p className="text-gray-600 text-sm mb-6">
          Programı tanıtacak kişiler (YouTuber, içerik üreticisi vb.) buradan kayıt olur. Müşteri kaydı değildir.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Ad soyad</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Adınız Soyadınız"
            />
          </div>
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
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Referans kodunuz (kanal adı vb.)</label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Örn. KanalAdiniz veya youtube_kanal"
            />
            <p className="text-xs text-gray-500 mt-1">3-24 karakter, harf/rakam/alt çizgi. Boş bırakırsanız otomatik kod verilir.</p>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Şifre (en az 6 karakter)</label>
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
            {isLoading ? 'Kaydediliyor...' : 'Kayıt ol'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Zaten hesabınız var mı?{' '}
          <Link href="/affiliate/giris" className="text-gray-900 font-medium underline">Giriş yapın</Link>
        </p>
      </main>
    </div>
  );
}
