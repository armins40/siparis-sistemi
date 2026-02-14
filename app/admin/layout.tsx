'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isAdminAuthenticated, adminLogout } from '@/lib/admin';

const menuItems = [
  { href: '/admin', label: 'Genel Bakış', icon: '📊' },
  { href: '/admin/users', label: 'Kullanıcılar', icon: '👥' },
  { href: '/admin/affiliate', label: 'Ortaklık (Affiliate)', icon: '🤝' },
  { href: '/admin/coupons', label: 'Kuponlar', icon: '🎫' },
  { href: '/admin/categories', label: 'Kategoriler', icon: '📁' },
  { href: '/admin/products', label: 'Ürünler', icon: '📦' },
  { href: '/admin/analytics', label: 'Analizler', icon: '📈' },
  { href: '/admin/settings', label: 'Ayarlar', icon: '⚙️' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  // Mobil için sidebar açık/kapalı durumu
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Client-side authentication kontrolü
    if (typeof window !== 'undefined') {
      const auth = isAdminAuthenticated();
      setAuthenticated(auth);
      if (!auth && pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    }
  }, [router, pathname]);

  // Hydration hatasını önlemek için mounted kontrolü
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  const handleLogout = () => {
    adminLogout();
    router.push('/admin/login');
  };

  // Login sayfası için layout render etme (kendi layout'u var)
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Yönlendiriliyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobil Header - Hamburger Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-800 text-white"
          aria-label="Menu"
        >
          <span className="text-2xl">☰</span>
        </button>
        <Link href="/admin" className="text-xl font-bold text-white">
          🔐 Admin
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
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo - Desktop'ta göster */}
        <div className="h-16 hidden lg:flex items-center px-6 border-b border-gray-700">
          <Link href="/admin" className="text-xl font-bold">
            🔐 Admin Panel
          </Link>
        </div>
        
        {/* Mobil Logo ve Kapat Butonu */}
        <div className="h-16 lg:hidden flex items-center justify-between px-6 border-b border-gray-700">
          <Link href="/admin" className="text-xl font-bold">
            🔐 Admin Panel
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-800 text-white"
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
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span className="text-xl">🏠</span>
            <span className="font-medium">Ana Sayfa</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
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
