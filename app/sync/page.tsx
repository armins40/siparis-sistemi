'use client';

import { useState } from 'react';

// localStorage Senkronizasyon Sayfası
// Bu sayfa, bilgisayardan kopyalanan localStorage verilerini telefona aktarmak için kullanılır
// NOT: Bu geçici bir çözümdür, production için database kullanılmalıdır

export default function SyncPage() {
  const [productsJson, setProductsJson] = useState('');
  const [usersJson, setUsersJson] = useState('');
  const [storeJson, setStoreJson] = useState('');
  const [message, setMessage] = useState('');

  const handleSync = () => {
    try {
      // Ürünleri senkronize et
      if (productsJson.trim()) {
        const products = JSON.parse(productsJson);
        localStorage.setItem('siparisProducts', JSON.stringify(products));
        
        // ÖNEMLİ: isPublished: true olan ürünlerin ID'lerini publishedIds array'ine ekle
        const publishedIds = products
          .filter((p: any) => p.isPublished === true)
          .map((p: any) => p.id);
        
        if (publishedIds.length > 0) {
          localStorage.setItem('siparisPublishedProducts', JSON.stringify(publishedIds));
        }
      }

      // Kullanıcıları senkronize et
      if (usersJson.trim()) {
        const users = JSON.parse(usersJson);
        localStorage.setItem('siparis_users', JSON.stringify(users));
      }

      // Store'u senkronize et
      if (storeJson.trim()) {
        const store = JSON.parse(storeJson);
        localStorage.setItem('siparisStore', JSON.stringify(store));
      }

      setMessage('✅ Veriler başarıyla senkronize edildi! Sayfayı yenileyin.');
    } catch (error) {
      setMessage('❌ Hata: Geçersiz JSON formatı. Lütfen kontrol edin.');
      console.error('Sync error:', error);
    }
  };

  const handleLoadCurrent = () => {
    // Mevcut localStorage verilerini yükle
    const products = localStorage.getItem('siparisProducts') || '[]';
    const users = localStorage.getItem('siparis_users') || '[]';
    const store = localStorage.getItem('siparisStore') || '{}';

    setProductsJson(products);
    setUsersJson(users);
    setStoreJson(store);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">localStorage Senkronizasyon</h1>
        <p className="text-gray-600 mb-6">
          Bu sayfa, bilgisayardan kopyalanan localStorage verilerini telefona aktarmak için kullanılır.
          <br />
          <strong className="text-red-600">NOT:</strong> Bu geçici bir çözümdür, production için database kullanılmalıdır.
        </p>

        <div className="space-y-4 mb-4">
          <div>
            <label htmlFor="sync-products" className="block text-sm font-medium mb-2">Ürünler (siparisProducts)</label>
            <textarea
              id="sync-products"
              name="sync-products"
              value={productsJson}
              onChange={(e) => setProductsJson(e.target.value)}
              className="w-full h-32 p-2 border rounded font-mono text-xs"
              placeholder='[{"name":"Ürün","price":10,...}]'
            />
          </div>

          <div>
            <label htmlFor="sync-users" className="block text-sm font-medium mb-2">Kullanıcılar (siparis_users)</label>
            <textarea
              id="sync-users"
              name="sync-users"
              value={usersJson}
              onChange={(e) => setUsersJson(e.target.value)}
              className="w-full h-32 p-2 border rounded font-mono text-xs"
              placeholder='[{"id":"user_123",...}]'
            />
          </div>

          <div>
            <label htmlFor="sync-store" className="block text-sm font-medium mb-2">Mağaza (siparisStore)</label>
            <textarea
              id="sync-store"
              name="sync-store"
              value={storeJson}
              onChange={(e) => setStoreJson(e.target.value)}
              className="w-full h-32 p-2 border rounded font-mono text-xs"
              placeholder='{"slug":"ibo-bakkal","name":"İbo Bakkal",...}'
            />
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={handleSync}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Senkronize Et
          </button>
          <button
            onClick={handleLoadCurrent}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Mevcut Verileri Yükle
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h2 className="font-bold mb-2">Kullanım Talimatları:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Bilgisayarda browser console'u açın (F12)</li>
            <li>Şu komutları çalıştırın:
              <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`localStorage.getItem('siparisProducts')
localStorage.getItem('siparis_users')
localStorage.getItem('siparisStore')`}
              </pre>
            </li>
            <li>Çıkan JSON'ları kopyalayın</li>
            <li>Bu sayfada ilgili alanlara yapıştırın</li>
            <li>"Senkronize Et" butonuna tıklayın</li>
            <li>Sayfayı yenileyin</li>
          </ol>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm font-semibold mb-1">⚠️ Önemli:</p>
            <p className="text-xs">
              Eğer ürünler görünmüyorsa, <strong>Kullanıcılar</strong> alanına da kullanıcı verilerini ekleyin.
              <br />
              Kullanıcı verileri olmadan ürünler filtrelenemez.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
