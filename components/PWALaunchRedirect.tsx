'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function PWALaunchRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || pathname !== '/') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (!isStandalone) return;

    try {
      const saved = localStorage.getItem('pwa-launch-url');
      if (saved && saved !== '/' && saved.startsWith('/')) {
        router.replace(saved);
      }
    } catch {
      // ignore
    }
  }, [pathname, router]);

  return null;
}
