'use client';

import { useEffect, useRef } from 'react';
import { getFCMToken, onForegroundMessage, isFirebaseConfigured, requestNotificationPermission } from '@/lib/firebase';

export default function DashboardPWAProvider({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const savedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !userId || !isFirebaseConfigured()) return;

    const run = async () => {
      const perm = await requestNotificationPermission();
      if (perm !== 'granted') return;

      const token = await getFCMToken();
      if (!token || savedRef.current) return;

      const res = await fetch('/api/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token }),
      });
      if (res.ok) savedRef.current = true;
    };

    run();
  }, [userId]);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    const unsubscribe = onForegroundMessage((payload: unknown) => {
      const p = payload as { notification?: { title?: string; body?: string }; data?: { url?: string } };
      const title = p?.notification?.title ?? 'Yeni bildirim';
      const body = p?.notification?.body ?? '';
      try {
        if (typeof Audio !== 'undefined') {
          const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUtvT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        }
      } catch {
        // ignore
      }
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, { body });
        } catch {
          // ignore
        }
      }
    });

    return () => { unsubscribe?.(); };
  }, []);

  return <>{children}</>;
}
