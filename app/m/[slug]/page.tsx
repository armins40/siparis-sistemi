'use client';

import { use, useEffect, useState } from 'react';
import { getStore } from '@/lib/store';
import { getTheme } from '@/lib/themes';
import { getThemeId } from '@/lib/store';
import { getProductsByCategory, getPublishedProducts, getAllProducts } from '@/lib/products';
import { getAllCategories } from '@/lib/categories';
import type { Product } from '@/lib/types';

interface MenuPageProps {
  params: Promise<{ slug?: string }>;
}

export default function MenuPage({ params }: MenuPageProps) {
  // Unwrap params Promise
  const { slug = '' } = use(params);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [store, setStore] = useState<ReturnType<typeof getStore> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Map<string, { quantity: number; unit?: string }>>(new Map());
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  useEffect(() => {
    // Validate slug
    if (!slug || typeof slug !== 'string') {
      setLoading(false);
      return;
    }

    // Load products
    const publishedProducts = getPublishedProducts();
    const allProductsList = getAllProducts();
    const useAllProducts = publishedProducts.length === 0 && allProductsList.length > 0;
    const allProducts = useAllProducts ? allProductsList : publishedProducts;

    // Load categories from both category management and products
    const managedCategories = getAllCategories();
    const productCategories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));
    const categories = Array.from(new Set([
      ...managedCategories.map(c => c.name),
      ...productCategories
    ])).sort();

    // Try to find store
    const storeData = getStore();
    if (storeData) {
      if (!storeData.themeId) {
        storeData.themeId = getThemeId();
      }
      setStore(storeData);
    } else if (allProducts.length > 0) {
      const defaultStore = {
        slug: slug,
        name: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        themeId: getThemeId(),
      };
      setStore(defaultStore);
    }

    setProducts(allProducts);
    setAllCategories(categories);
    setLoading(false);
  }, [slug]);

  const addProduct = (product: Product, increment: number = 1) => {
    const newMap = new Map(selectedProducts);
    const current = newMap.get(product.id);
    const currentQty = current?.quantity || 0;
    const unit = product.unit || 'adet';
    
    newMap.set(product.id, { 
      quantity: currentQty + increment,
      unit: unit
    });
    setSelectedProducts(newMap);
  };

  const removeProduct = (productId: string) => {
    const newMap = new Map(selectedProducts);
    const current = newMap.get(productId);
    if (current && current.quantity > 1) {
      newMap.set(productId, { 
        quantity: current.quantity - 1,
        unit: current.unit
      });
    } else {
      newMap.delete(productId);
    }
    setSelectedProducts(newMap);
  };

  const getTotalCount = (): number => {
    let total = 0;
    selectedProducts.forEach((item) => {
      total += item.quantity;
    });
    return total;
  };

  const getTotalPrice = (): number => {
    let total = 0;
    selectedProducts.forEach((item, productId) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        total += product.price * item.quantity;
      }
    });
    return total;
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Tarayıcınız konum desteği sağlamıyor');
      return;
    }

    setLocationLoading(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Konum bilgisi alınamadı.');
            break;
          case error.TIMEOUT:
            setLocationError('Konum almak için zaman aşımı oluştu.');
            break;
          default:
            setLocationError('Konum alınırken bir hata oluştu.');
            break;
        }
      }
    );
  };

  const sendWhatsAppOrder = () => {
    if (!store || !store.whatsapp || selectedProducts.size === 0) return;

    const selectedItems: string[] = [];
    selectedProducts.forEach((item, productId) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        const unit = item.unit || product.unit || 'adet';
        selectedItems.push(`${item.quantity} ${unit} ${product.name} - ${(product.price * item.quantity).toFixed(2)}₺`);
      }
    });

    let message = `Merhaba, sipariş vermek istiyorum:\n\n${selectedItems.join('\n')}\n\nToplam: ${getTotalPrice().toFixed(2)}₺`;

    // Add address if provided
    if (address.trim()) {
      message += `\n\n📍 Adres:\n${address.trim()}`;
    }

    // Add location if available
    if (location) {
      const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      message += `\n\n🗺️ Konum: ${googleMapsUrl}`;
    }

    const whatsappUrl = `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Close modal and reset
    setShowOrderModal(false);
    setAddress('');
    setLocation(null);
    setLocationError('');
  };

  const openOrderModal = () => {
    setShowOrderModal(true);
  };

  // Apply theme
  const themeId = store?.themeId || getThemeId();
  const theme = getTheme(themeId);

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Category filter
    if (selectedCategory !== 'Tümü' && product.category !== selectedCategory) {
      return false;
    }
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <div style={{ color: theme.text }}>Yükleniyor...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: theme.background }}
      >
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
            Mağaza bulunamadı
          </h2>
          <p style={{ color: theme.text, opacity: 0.7 }}>
            Aradığınız mağaza mevcut değil veya menü henüz hazırlanmamış.
          </p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: theme.background }}
      >
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
            Henüz ürün eklenmemiş
          </h2>
          <p style={{ color: theme.text, opacity: 0.7 }}>
            {store.name} mağazası henüz menüsünü hazırlamamış.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: theme.background }}>
      {/* Banner Header */}
      <header className="relative">
        {store.banner ? (
          <div className="relative rounded-b-3xl overflow-hidden shadow-md">
            <img
              src={store.banner}
              alt={store.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                // Fallback to gradient if banner fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.className = parent.className.replace('overflow-hidden', '');
                  parent.style.background = `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`;
                }
              }}
            />
            <div className="absolute inset-0 bg-black/20 flex items-center">
              <div className="max-w-4xl mx-auto px-6 w-full">
                <div className="flex items-center space-x-4">
                  {store.logo && (
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1 drop-shadow-lg">
                      {store.name}
                    </h1>
                    {store.description && (
                      <p className="text-white/90 text-sm drop-shadow">{store.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="rounded-b-3xl shadow-md px-6 py-8"
            style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
            }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-4">
                {store.logo && (
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">{store.name}</h1>
                  {store.description && (
                    <p className="text-white/90 text-sm">{store.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto px-4 -mt-4 mb-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ürün ara..."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Category Filters */}
      {allCategories.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('Tümü')}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'Tümü'
                  ? 'text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              style={
                selectedCategory === 'Tümü'
                  ? { backgroundColor: theme.primary }
                  : {}
              }
            >
              Tümü
            </button>
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                style={
                  selectedCategory === category
                    ? { backgroundColor: theme.primary }
                    : {}
                }
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <main className="max-w-4xl mx-auto px-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: theme.text, opacity: 0.7 }}>
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Bu kategoride ürün bulunmamaktadır'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-6">
            {filteredProducts.map((product) => {
              const item = selectedProducts.get(product.id);
              const quantity = item?.quantity || 0;
              const unit = product.unit || 'adet';
              const increment = unit === 'kg' ? 0.5 : 1;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-base font-bold mb-1 text-gray-900 line-clamp-2" style={{ minHeight: '2.5rem' }}>
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold mb-2" style={{ color: theme.primary }}>
                      {product.price.toFixed(2)} ₺/{unit}
                    </p>
                    {product.stock !== undefined && (
                      <p className="text-xs text-gray-500 mb-3">
                        Stok: {product.stock.toFixed(1)} {unit}
                      </p>
                    )}
                    {quantity > 0 ? (
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-opacity hover:opacity-80"
                          style={{
                            backgroundColor: theme.primary,
                            color: '#ffffff',
                          }}
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold px-2 text-gray-900">
                          {quantity} {unit}
                        </span>
                        <button
                          onClick={() => addProduct(product, increment)}
                          className="w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-opacity hover:opacity-80"
                          style={{
                            backgroundColor: theme.primary,
                            color: '#ffffff',
                          }}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addProduct(product, increment)}
                        className="w-full py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: theme.primary,
                          color: '#ffffff',
                        }}
                      >
                        Sepete Ekle (+{increment} {unit})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {selectedProducts.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4" style={{ backgroundColor: theme.card }}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: theme.text, opacity: 0.7 }}>
                {getTotalCount()} ürün
              </p>
              <p className="text-xl font-bold" style={{ color: theme.text }}>
                {getTotalPrice().toFixed(2)} ₺
              </p>
            </div>
            <button
              onClick={openOrderModal}
              disabled={!store.whatsapp}
              className="px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              style={{
                backgroundColor: store.whatsapp ? theme.primary : theme.text,
                color: '#ffffff',
              }}
            >
              <span>📱</span>
              <span>WhatsApp ile Sipariş Ver</span>
            </button>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: theme.card }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" style={{ color: theme.text }}>
                Sipariş Detayları
              </h2>
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setAddress('');
                  setLocation(null);
                  setLocationError('');
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                style={{ color: theme.text }}
              >
                ×
              </button>
            </div>

            {/* Order Summary */}
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: theme.background }}>
              <p className="text-sm font-medium mb-2" style={{ color: theme.text }}>
                Sipariş Özeti
              </p>
              <div className="space-y-1 text-sm" style={{ color: theme.text, opacity: 0.8 }}>
                {Array.from(selectedProducts.entries()).map(([productId, item]) => {
                  const product = products.find((p) => p.id === productId);
                  if (!product) return null;
                  const unit = item.unit || product.unit || 'adet';
                  return (
                    <div key={productId} className="flex justify-between">
                      <span>{item.quantity} {unit} {product.name}</span>
                      <span>{(product.price * item.quantity).toFixed(2)} ₺</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t flex justify-between font-bold" style={{ borderColor: theme.text, opacity: 0.2 }}>
                <span style={{ color: theme.text }}>Toplam:</span>
                <span style={{ color: theme.primary }}>{getTotalPrice().toFixed(2)} ₺</span>
              </div>
            </div>

            {/* Address Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Adres Açıklama
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none"
                style={{
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.text + '40',
                }}
                placeholder="Örn: Çamlık Mahallesi, No: 15, Daire: 3, Kapı zili: Sevda"
              />
            </div>

            {/* Location Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Konum Paylaş
              </label>
              {!location ? (
                <div className="space-y-2">
                  <button
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="w-full py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    style={{
                      backgroundColor: theme.primary,
                      color: '#ffffff',
                    }}
                  >
                    {locationLoading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Konum alınıyor...</span>
                      </>
                    ) : (
                      <>
                        <span>📍</span>
                        <span>Canlı Konum Paylaş</span>
                      </>
                    )}
                  </button>
                  {locationError && (
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {locationError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: theme.background }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>✅</span>
                      <span className="text-sm font-medium" style={{ color: theme.text }}>
                        Konum alındı
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setLocation(null);
                        setLocationError('');
                      }}
                      className="text-sm px-3 py-1 rounded hover:bg-gray-100 transition-colors"
                      style={{ color: theme.text }}
                    >
                      Değiştir
                    </button>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm underline"
                    style={{ color: theme.primary }}
                  >
                    🗺️ Konumu Haritada Aç
                  </a>
                  <p className="text-xs" style={{ color: theme.text, opacity: 0.7 }}>
                    Enlem: {location.lat.toFixed(6)}, Boylam: {location.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={sendWhatsAppOrder}
              disabled={!store.whatsapp}
              className="w-full py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              style={{
                backgroundColor: store.whatsapp ? theme.primary : theme.text,
                color: '#ffffff',
              }}
            >
              <span>📱</span>
              <span>WhatsApp'ta Gönder</span>
            </button>

            <p className="text-xs text-center mt-4" style={{ color: theme.text, opacity: 0.6 }}>
              Sipariş WhatsApp üzerinden gönderilecektir
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
