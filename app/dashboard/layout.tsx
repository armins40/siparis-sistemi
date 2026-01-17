'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getCurrentUserAsync, logout, checkUserSubscription } from '@/lib/auth';
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
  // Mobil için sidebar açık/kapalı durumu
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      // Önce localStorage'dan hızlı kontrol (ilk render için)
      const localUser = getCurrentUser();
      if (localUser && localUser.isActive) {
        setUser(localUser);
      }
      
      // Sonra database'den kontrol et (async)
      getCurrentUserAsync().then((currentUser) => {
        if (!currentUser || !currentUser.isActive) {
          router.replace('/login');
          return;
        }
        
        setUser(currentUser);
        
        // Trial planı için expiresAt kontrolü (tüm kullanıcılar trial ile başlıyor)
        if (currentUser.plan === 'trial' && currentUser.expiresAt) {
          const now = new Date();
          const expiresAt = new Date(currentUser.expiresAt);
          const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isExpired = expiresAt <= now;
          
          setSubscriptionStatus({
            hasActiveSubscription: !isExpired,
            daysRemaining: Math.max(0, daysRemaining),
          });
          
          // Süre dolmuşsa ödeme sayfasına yönlendir (zorunlu)
          if (isExpired && pathname !== '/dashboard/payment') {
            router.replace('/dashboard/payment');
            return; // Ödeme sayfasına yönlendirildi, dashboard'a erişim yok
          }
        } else if (currentUser.plan !== 'free') {
          // Diğer planlar için subscription kontrolü
          const subStatus = checkUserSubscription(currentUser.id);
          setSubscriptionStatus(subStatus);
        }
      }).catch((error) => {
        console.error('Error loading user:', error);
        // Hata durumunda localStorage'dan oku
        const fallbackUser = getCurrentUser();
        if (!fallbackUser || !fallbackUser.isActive) {
          router.replace('/login');
        } else {
          setUser(fallbackUser);
        }
      });
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
      {/* Mobil Header - Hamburger Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Menu"
        >
          <span className="text-2xl">☰</span>
        </button>
        <Link href="/dashboard" className="text-xl font-bold text-gray-900">
          Siparis
        </Link>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Mobil Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobilde slide-in, desktop'ta fixed */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo - Desktop'ta göster */}
        <div className="h-16 hidden lg:flex items-center px-6 border-b border-gray-200">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            Siparis
          </Link>
        </div>
        
        {/* Mobil Logo ve Kapat Butonu */}
        <div className="h-16 lg:hidden flex items-center justify-between px-6 border-b border-gray-200">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            Siparis
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Kapat"
          >
            <span className="text-2xl">×</span>
          </button>
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
                {user.plan === 'trial' && subscriptionStatus.hasActiveSubscription && '🎁 Deneme Sürümü'}
                {user.plan === 'trial' && !subscriptionStatus.hasActiveSubscription && '⚠️ Deneme Süresi Doldu'}
                {user.plan !== 'trial' && subscriptionStatus.hasActiveSubscription && '✅ Aktif'}
                {user.plan !== 'trial' && !subscriptionStatus.hasActiveSubscription && '⚠️ Süresi Dolmuş'}
              </div>
              {subscriptionStatus.hasActiveSubscription && subscriptionStatus.daysRemaining > 0 && (
                <div className="text-xs mt-1">
                  {user.plan === 'trial' ? `${subscriptionStatus.daysRemaining} gün deneme kaldı` : `${subscriptionStatus.daysRemaining} gün kaldı`}
                </div>
              )}
              {!subscriptionStatus.hasActiveSubscription && (
                <Link
                  href={user.plan === 'trial' ? '/dashboard/payment' : `/signup?plan=${user.plan}`}
                  className="text-xs underline mt-1 block"
                >
                  {user.plan === 'trial' ? 'Ödeme Yap' : 'Yenile'}
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

      {/* Main Content - Mobilde full width, desktop'ta margin */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
