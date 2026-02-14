'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser, getCurrentUserAsync, logout, checkUserSubscription } from '@/lib/auth';
import { getStore, saveStore, clearStore } from '@/lib/store';
import type { User } from '@/lib/types';
import DashboardPWAProvider from '@/components/DashboardPWAProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const userId = params?.userId as string;

  // Menu items with userId in URL
  const menuItems = [
    { href: `/dashboard/${userId}`, label: 'Genel Bakış', icon: '📊' },
    { href: `/dashboard/${userId}/products`, label: 'Ürünler', icon: '📦' },
    { href: `/dashboard/${userId}/products?openForm=1`, label: 'Yeni Ürün Ekle', icon: '➕' },
    { href: `/dashboard/${userId}/categories`, label: 'Kategoriler', icon: '📁' },
    { href: `/dashboard/${userId}/theme`, label: 'Tema & Tasarım', icon: '🎨' },
    { href: `/dashboard/${userId}/settings`, label: 'Mağaza Ayarları', icon: '⚙️' },
    { href: `/dashboard/${userId}/qr`, label: 'QR Kod & Link', icon: '🔗' },
  ];
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    hasActiveSubscription: boolean;
    daysRemaining: number;
  } | null>(null);
  // Mobil için sidebar açık/kapalı durumu
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Üyelik iptali: 0 = kapalı, 1 = ilk onay, 2 = ikinci onay
  const [cancelModalStep, setCancelModalStep] = useState(0);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      // Database'den direkt kontrol et (localStorage'dan eski kullanıcı gelmesin)
      getCurrentUserAsync().then((currentUser) => {
        if (!currentUser || !currentUser.isActive) {
          router.replace('/login');
          return;
        }
        
        setUser(currentUser);

        if (currentUser.storeSlug && !getStore()) {
          fetch(`/api/stores?slug=${encodeURIComponent(currentUser.storeSlug)}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.success && data.store) saveStore(data.store);
            })
            .catch(() => {});
        }
        
        const now = new Date();
        const paidPlans = ['monthly', '6month', 'yearly'] as const;
        const useExpiresAt = !!currentUser.expiresAt && (
          currentUser.plan === 'trial' ||
          paidPlans.includes(currentUser.plan as typeof paidPlans[number]) ||
          currentUser.plan === 'free' // İptal sonrası dönem sonuna kadar erişim
        );

        if (useExpiresAt && currentUser.expiresAt) {
          const expiresAt = new Date(currentUser.expiresAt);
          const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isExpired = expiresAt <= now;
          
          setSubscriptionStatus({
            hasActiveSubscription: !isExpired,
            daysRemaining: Math.max(0, daysRemaining),
          });
          
          if (currentUser.plan === 'trial' && isExpired && !pathname?.includes('/payment')) {
            router.replace(`/dashboard/${currentUser.id}/payment`);
            return;
          }
          // free + future expiresAt = iptal edilmiş, dönem sonuna kadar erişim devam
          
          if (userId && currentUser.id !== userId) {
            router.replace(`/dashboard/${currentUser.id}`);
          }
        } else if (currentUser.plan !== 'free') {
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
    clearStore();
    router.push('/');
  };

  const handleCancelMembershipConfirm = async () => {
    if (cancelModalStep === 1) {
      setCancelModalStep(2);
      return;
    }
    if (cancelModalStep === 2 && user) {
      setCancelLoading(true);
      try {
        const res = await fetch('/api/user/cancel-membership', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();
        if (data.success) {
          const updated = await getCurrentUserAsync();
          if (updated) setUser(updated);
          setCancelModalStep(0);
          alert('Üyeliğiniz iptal edildi. Ödenen dönem sonuna kadar hizmetten yararlanmaya devam edebilirsiniz.');
        } else {
          alert(data.error || 'İptal işlemi yapılamadı.');
        }
      } catch (e) {
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setCancelLoading(false);
      }
    }
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
    <DashboardPWAProvider userId={userId ?? user.id}>
    <div className="min-h-screen bg-gray-50">
      {/* Mobil Header - Hamburger Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-2 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Menu"
        >
          <span className="text-2xl">☰</span>
        </button>
        <Link href={`/dashboard/${userId}`} className="flex items-center">
          <Image
            src="/logo.svg"
            alt="Siparis Sistemi"
            width={531}
            height={354}
            className="hidden md:block"
            style={{ width: '380px', height: 'auto' }}
            priority
          />
          <Image
            src="/logo.svg"
            alt="Siparis Sistemi"
            width={531}
            height={354}
            className="md:hidden"
            style={{ width: '200px', height: 'auto' }}
            priority
          />
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
        <div className="hidden lg:flex items-center px-6 border-b border-gray-200" style={{ minHeight: '80px' }}>
          <Link href={`/dashboard/${userId}`} className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Siparis Sistemi"
              width={531}
              height={354}
              style={{ width: '380px', height: 'auto' }}
              priority
            />
          </Link>
        </div>
        
        {/* Mobil Logo ve Kapat Butonu */}
        <div className="h-16 lg:hidden flex items-center justify-between px-6 border-b border-gray-200">
          <Link href={`/dashboard/${userId}`} className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Siparis Sistemi"
              width={531}
              height={354}
              style={{ width: '200px', height: 'auto' }}
              priority
            />
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
          {/* Abonelik Durumu (trial, ücretli veya iptal edilmiş free + dönem sonuna kadar erişim) */}
          {subscriptionStatus && (
            <div className="px-4 py-2 mb-2 rounded-lg text-sm" style={{ 
              backgroundColor: subscriptionStatus.hasActiveSubscription ? '#E6F7E6' : '#FFF4E6',
              color: subscriptionStatus.hasActiveSubscription ? '#166534' : '#854D0E'
            }}>
              <div className="font-medium">
                {user.plan === 'trial' && subscriptionStatus.hasActiveSubscription && '🎁 Deneme Sürümü'}
                {user.plan === 'trial' && !subscriptionStatus.hasActiveSubscription && '⚠️ Deneme Süresi Doldu'}
                {user.plan === 'free' && subscriptionStatus.hasActiveSubscription && '📋 İptal edildi'}
                {user.plan !== 'trial' && user.plan !== 'free' && subscriptionStatus.hasActiveSubscription && '✅ Aktif'}
                {user.plan !== 'trial' && !subscriptionStatus.hasActiveSubscription && '⚠️ Süresi Dolmuş'}
              </div>
              {subscriptionStatus.hasActiveSubscription && subscriptionStatus.daysRemaining > 0 && (
                <div className="text-xs mt-1">
                  {user.plan === 'trial' && `${subscriptionStatus.daysRemaining} gün deneme kaldı`}
                  {user.plan === 'free' && `${subscriptionStatus.daysRemaining} gün erişim kaldı`}
                  {user.plan !== 'trial' && user.plan !== 'free' && `${subscriptionStatus.daysRemaining} gün kaldı`}
                </div>
              )}
              {!subscriptionStatus.hasActiveSubscription && (
                <Link
                  href={user.plan === 'trial' ? `/dashboard/${user.id}/payment` : `/signup?plan=${user.plan}`}
                  className="text-xs underline mt-1 block"
                >
                  {user.plan === 'trial' ? 'Ödeme Yap' : 'Yenile'}
                </Link>
              )}
              {subscriptionStatus.hasActiveSubscription && user.plan !== 'free' && (
                <button
                  type="button"
                  onClick={() => setCancelModalStep(1)}
                  className="text-xs text-red-600 hover:text-red-700 underline mt-1 block text-left"
                >
                  Üyelik iptali
                </button>
              )}
            </div>
          )}

          {/* Üyelik iptali çift onay modalı */}
          {cancelModalStep >= 1 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="cancel-modal-title">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                <h2 id="cancel-modal-title" className="text-lg font-bold text-gray-900">
                  {cancelModalStep === 1 ? 'Üyelik iptali' : 'Son onay'}
                </h2>
                {cancelModalStep === 1 ? (
                  <p className="text-gray-600">
                    Üyeliğinizi iptal etmek istediğinize emin misiniz? Ödenen dönem sonuna kadar hizmetten yararlanmaya devam edeceksiniz.
                  </p>
                ) : (
                  <p className="text-gray-600">
                    Bu işlem geri alınamaz. Üyeliğinizi sonlandırmak için lütfen tekrar onaylayın.
                  </p>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancelModalStep(0)}
                    disabled={cancelLoading}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelMembershipConfirm}
                    disabled={cancelLoading}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                  >
                    {cancelLoading ? 'İşleniyor...' : cancelModalStep === 1 ? 'Devam' : 'Üyeliği İptal Et'}
                  </button>
                </div>
              </div>
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
    </DashboardPWAProvider>
  );
}
