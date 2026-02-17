'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: string;
  discount: string;
  final_total: string;
  address: string | null;
  status: string;
  created_at: string;
  invoice_sent: boolean;
}

export default function DashboardOrdersPage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/orders/list?userId=${encodeURIComponent(userId)}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Siparişler yüklenemedi');
      const list = Array.isArray(data.orders) ? data.orders : [];
      setOrders(list);
      setError(null);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [userId, loadOrders]);

  const markInvoiceSent = async (orderId: string, sent: boolean) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sent, userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error('Güncellenemedi');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, invoice_sent: sent } : o))
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

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Siparişler</h1>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Siparişler</h1>
          <p className="text-gray-600 mt-1">Siparişleri yönetin, ürün gönderimini takip edin</p>
        </div>
        <button
          onClick={() => loadOrders()}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
        >
          Yenile
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg">Henüz sipariş yok</p>
          <p className="text-gray-400 text-sm mt-2">Yeni siparişler burada listelenecek</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <span className="text-xs text-gray-500 font-mono">{order.id}</span>
                    <p className="text-sm text-gray-600 mt-1">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">
                      {parseFloat(order.final_total || '0').toFixed(2)} ₺
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {order.status === 'pending' ? 'Bekliyor' : order.status}
                    </span>
                  </div>
                </div>

                {order.address && (
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Adres:</span> {order.address}
                  </p>
                )}

                <div className="border-t border-gray-100 pt-4 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Ürünler</p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {(order.items || []).map((item: OrderItem, i: number) => (
                      <li key={i}>
                        {item.quantity} {item.unit} {item.productName} — {item.total?.toFixed(2)} ₺
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Ürün gönderildi mi?</span>
                    <button
                      onClick={() => markInvoiceSent(order.id, !order.invoice_sent)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        order.invoice_sent
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {order.invoice_sent ? '✓ Gönderildi' : 'Gönderilmedi'}
                    </button>
                  </div>
                  {order.invoice_sent && (
                    <span className="text-xs text-green-600 font-medium">✓ Gönderim tamamlandı</span>
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
