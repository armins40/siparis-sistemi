'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { isAdminAuthenticated } from '@/lib/admin';
import { playChaChing } from '@/lib/sounds';

function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return Promise.resolve(false);
  if (Notification.permission === 'granted') return Promise.resolve(true);
  if (Notification.permission !== 'denied') {
    return Notification.requestPermission().then((p) => p === 'granted');
  }
  return Promise.resolve(false);
}

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  amount: string;
  status: string;
  created_at: string;
  invoice_sent: boolean;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
}

const PLAN_LABELS: Record<string, string> = {
  monthly: 'Aylık',
  '6month': '6 Aylık',
  yearly: 'Yıllık',
};

export default function AdminSalesPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevCountRef = useRef<number>(0);
  const notificationGrantedRef = useRef(false);

  const loadSubscriptions = useCallback(async () => {
    if (!isAdminAuthenticated()) return;
    try {
      const res = await fetch('/api/admin/subscriptions', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Satışlar yüklenemedi');
      const list = Array.isArray(data.subscriptions) ? data.subscriptions : [];
      setSubscriptions(list);

      const count = list.length;
      if (prevCountRef.current > 0 && count > prevCountRef.current) {
        playChaChing();
        if (notificationGrantedRef.current) {
          const last = list[0];
          const amount = last?.amount ?? 0;
          new Notification('Yeni Satış! 💰', {
            body: `${amount} ₺ tutarında abonelik. Fatura gönderin.`,
            icon: '/logo.png',
          });
        }
      }
      prevCountRef.current = count;
      setError(null);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdminAuthenticated()) return;
    requestNotificationPermission().then((ok) => {
      notificationGrantedRef.current = ok;
    });
    loadSubscriptions();
    const interval = setInterval(loadSubscriptions, 10000);
    return () => clearInterval(interval);
  }, [loadSubscriptions]);

  const markInvoiceSent = async (id: string, sent: boolean) => {
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}/invoice`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sent }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error('Güncellenemedi');
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, invoice_sent: sent } : s))
      );
    } catch {
      alert('Fatura durumu güncellenemedi.');
    }
  };

  const formatDate = (s: string) => {
    const d = new Date(s);
    return d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && subscriptions.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Satışlar</h1>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Satışlar</h1>
          <p className="text-gray-600 mt-1">Abonelik satışları, fatura gönderim takibi</p>
        </div>
        <button
          onClick={() => loadSubscriptions()}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
        >
          Yenile
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg">Henüz satış yok</p>
          <p className="text-gray-400 text-sm mt-2">Yeni abonelik satışları burada listelenecek</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <span className="text-xs text-gray-500 font-mono">{sub.id}</span>
                    <p className="text-sm text-gray-600 mt-1">{formatDate(sub.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">
                      {parseFloat(sub.amount || '0').toFixed(2)} ₺
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {PLAN_LABELS[sub.plan] || sub.plan}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  {sub.userName && <p><span className="font-medium">Müşteri:</span> {sub.userName}</p>}
                  {sub.userEmail && <p><span className="font-medium">E-posta:</span> {sub.userEmail}</p>}
                  {sub.userPhone && <p><span className="font-medium">Telefon:</span> {sub.userPhone}</p>}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Fatura gönderildi mi?</span>
                    <button
                      onClick={() => markInvoiceSent(sub.id, !sub.invoice_sent)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        sub.invoice_sent
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {sub.invoice_sent ? '✓ Gönderildi' : 'Gönderilmedi'}
                    </button>
                  </div>
                  {sub.invoice_sent && (
                    <span className="text-xs text-green-600 font-medium">✓ Takip tamamlandı</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
