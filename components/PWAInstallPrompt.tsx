'use client';

import { useState, useEffect } from 'react';

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const key = 'pwa-install-dismissed';
      if (!sessionStorage.getItem(key)) setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) setShowBanner(false);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    sessionStorage.setItem('pwa-install-dismissed', '1');
  };

  if (!showBanner || dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-[#25D366] px-4 py-3 text-white shadow-lg sm:left-4 sm:right-auto sm:bottom-4 sm:max-w-sm sm:rounded-xl">
      <span className="text-sm font-medium">Uygulamayı ana ekrana ekle</span>
      <div className="flex gap-2">
        <button type="button" onClick={handleDismiss} className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium hover:bg-white/30">
          Sonra
        </button>
        <button type="button" onClick={handleInstall} className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-[#25D366] hover:bg-gray-100">
          Ekle
        </button>
      </div>
    </div>
  );
}
