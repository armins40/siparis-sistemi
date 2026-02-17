'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { playChaChing } from '@/lib/sounds';

function showOrderNotification(total: string | number) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification('Yeni Sipariş Geldi! 🛒', {
      body: `${total} ₺ tutarında sipariş. Ürünü gönderin.`,
      icon: '/logo.png',
    });
  } catch {
    // Ignore
  }
}

interface DashboardOrderNotifierProps {
  userId: string;
}

export default function DashboardOrderNotifier({ userId }: DashboardOrderNotifierProps) {
  const prevCountRef = useRef<number>(-1);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  const loadOrderCount = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/orders/count?userId=${encodeURIComponent(userId)}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.success) return;
      const count = typeof data.count === 'number' ? data.count : 0;

      if (prevCountRef.current >= 0 && count > prevCountRef.current) {
        playChaChing();
        const listRes = await fetch(`/api/orders/list?userId=${encodeURIComponent(userId)}`, { credentials: 'include' });
        const listData = await listRes.json();
        const orders = Array.isArray(listData.orders) ? listData.orders : [];
        const last = orders[0];
        const total = last?.final_total ?? 0;
        showOrderNotification(total);
      }
      prevCountRef.current = count;
    } catch {
      // Ignore
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setPermission(Notification.permission);
    loadOrderCount();
    const interval = setInterval(loadOrderCount, 10000);
    return () => clearInterval(interval);
  }, [userId, loadOrderCount]);

  const requestPermission = () => {
    if (!('Notification' in window)) return;
    Notification.requestPermission().then((p) => {
      setPermission(p);
    });
  };

  if (!userId || permission === 'granted' || permission === 'denied') return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-lg flex items-center justify-between gap-3">
        <p className="text-sm text-amber-800">
          Yeni sipariş geldiğinde bildirim almak için izin verin.
        </p>
        <button
          onClick={requestPermission}
          className="shrink-0 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium whitespace-nowrap"
        >
          Bildirimleri Aç
        </button>
      </div>
    </div>
  );
}
