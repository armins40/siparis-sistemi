'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout, checkUserSubscription } from '@/lib/auth';
import type { User } from '@/lib/types';

const menuItems = [
  { href: '/dashboard', label: 'Genel Bakış', icon: '📊' },
  { href: '/dashboard/products', label: 'Ürünler', icon: '📦' },
  { href: '/dashboard/categories', label: 'Kategoriler', icon: '📁' },
  { href: '/dashboard/theme', label: 'Tema & Tasarım', icon: '🎨' },
  { href: '/dashboard/settings', label: 'Mağaza Ayarları', icon: '⚙️' },
  { href: '/dashboard/qr', label: 'QR Kod & Link', icon: '🔗' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    hasActiveSubscription: boolean;
    daysRemaining: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const currentUser = getCurrentUser();
      
      if (!currentUser || !currentUser.isActive) {
        router.replace('/login');
        return;
      }
      
      setUser(currentUser);
      
      // Abonelik kontrolü (ücretsiz plan hariç)
      if (currentUser.plan !== 'free') {
        const subStatus = checkUserSubscription(currentUser.id);
        setSubscriptionStatus(subStatus);
        
        // Abonelik süresi dolmuşsa uyarı göster (yönlendirme yapmıyoruz, sadece uyarı)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Yönlendiriliyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            Siparis
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {/* Abonelik Durumu */}
          {user.plan !== 'free' && subscriptionStatus && (
            <div className="px-4 py-2 mb-2 rounded-lg text-sm" style={{ 
              backgroundColor: subscriptionStatus.hasActiveSubscription ? '#E6F7E6' : '#FFF4E6',
              color: subscriptionStatus.hasActiveSubscription ? '#166534' : '#854D0E'
            }}>
              <div className="font-medium">
                {subscriptionStatus.hasActiveSubscription ? '✅ Aktif' : '⚠️ Süresi Dolmuş'}
              </div>
              {subscriptionStatus.hasActiveSubscription && subscriptionStatus.daysRemaining > 0 && (
                <div className="text-xs mt-1">
                  {subscriptionStatus.daysRemaining} gün kaldı
                </div>
              )}
              {!subscriptionStatus.hasActiveSubscription && (
                <Link
                  href={`/signup?plan=${user.plan}`}
                  className="text-xs underline mt-1 block"
                >
                  Yenile
                </Link>
              )}
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
