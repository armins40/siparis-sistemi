'use client';

import { use, useEffect, useState } from 'react';
import { getTheme } from '@/lib/themes';
import { getAllCategories } from '@/lib/categories';
import { is18PlusProduct } from '@/lib/age-restricted';
import type { Product, Store } from '@/lib/types';

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
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Map<string, { quantity: number; unit?: string }>>(new Map());
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);
  const [storeNotFound, setStoreNotFound] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [ageDeclined, setAgeDeclined] = useState(false);

  useEffect(() => {
    // Validate slug
    if (!slug || typeof slug !== 'string') {
      setLoading(false);
      return;
    }

    // Database'den veri yükleme fonksiyonu
    const loadMenuData = async () => {
      try {
        let storeData: Store | null = null;
        let allProducts: Product[] = [];
        
        // ÖNCE: API route ile ürünleri al (server-side çalışır)
        try {
          const response = await fetch(`/api/menu/${encodeURIComponent(slug)}`);
          
          if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
          }
          
          const result = await response.json();
          
          if (result && result.success) {
            allProducts = Array.isArray(result.products) ? result.products : [];
            storeData = result.store || null;
            setTrialExpired(!!result.trialExpired);
            setStoreNotFound(!!result.storeNotFound);
            if (result.trialExpired) allProducts = [];
            if (result.storeNotFound) storeData = null;
          }
        } catch (apiError: any) {
          console.error('Error fetching from API:', apiError?.message || apiError);
          // No localStorage fallback - show error state
          setError('Menü yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
          setLoading(false);
          return;
        }
        
        if (storeNotFound || !storeData) {
          setStore(null);
          setProducts([]);
          setAllCategories([]);
          setStoreNotFound(true);
          setLoading(false);
          return;
        }

        // Ensure whatsapp is properly set (trim and check)
        if (storeData.whatsapp != null && typeof storeData.whatsapp === 'string') {
          const trimmed = storeData.whatsapp.trim();
          storeData.whatsapp = trimmed !== '' ? trimmed : undefined;
        } else if (storeData.whatsapp == null) {
          storeData.whatsapp = undefined;
        }
        
        // Categories - Sadece ürünü olan kategorileri göster
        const productCategories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));
        // Sadece gerçekten ürünü olan kategorileri göster (boş kategorileri gösterme)
        const categories = productCategories.sort();
        
        if (!storeData.themeId) {
          storeData.themeId = 'modern-blue';
        }
        const df = storeData.deliveryFee;
        if (df != null) {
          const n = typeof df === 'number' ? df : parseFloat(String(df));
          (storeData as { deliveryFee?: number }).deliveryFee = !Number.isNaN(n) && n >= 0 ? n : undefined;
        }
        
        // Normalize products: ensure price is always a number
        const normalizedProducts = allProducts.map(product => ({
          ...product,
          price: product.price != null 
            ? (typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0)
            : 0
        }));

        setStore(storeData);
        setProducts(normalizedProducts);
        setAllCategories(categories);
        setLoading(false);

        // Update page metadata for SEO
        if (storeData && typeof window !== 'undefined') {
          const title = `${storeData.name} - Online Sipariş Menüsü | Siparis`;
          const description = storeData.description || `${storeData.name} online sipariş menüsü. Hızlı ve kolay sipariş verin.`;
          const url = `https://www.siparis-sistemi.com/m/${slug}`;
          
          // Update document title
          document.title = title;
          
          // Update or create meta tags
          const updateMetaTag = (name: string, content: string, isProperty = false) => {
            const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
            let meta = document.querySelector(selector) as HTMLMetaElement;
            if (!meta) {
              meta = document.createElement('meta');
              if (isProperty) {
                meta.setAttribute('property', name);
              } else {
                meta.setAttribute('name', name);
              }
              document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
          };

          // Update meta tags
          updateMetaTag('description', description);
          updateMetaTag('og:title', title, true);
          updateMetaTag('og:description', description, true);
          updateMetaTag('og:url', url, true);
          updateMetaTag('og:type', 'website', true);
          if (storeData.banner) {
            updateMetaTag('og:image', storeData.banner, true);
          } else if (storeData.logo) {
            updateMetaTag('og:image', storeData.logo, true);
          }
          updateMetaTag('twitter:card', 'summary_large_image');
          updateMetaTag('twitter:title', title);
          updateMetaTag('twitter:description', description);
          
          // Update canonical link
          let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
          if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
          }
          canonical.setAttribute('href', url);
        }
      } catch (error) {
        console.error('Error loading menu data:', error);
        setError('Menü yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        setStore(null);
        setProducts([]);
        setAllCategories([]);
        setLoading(false);
      }
    };

    // Database'den veri yükle (tüm cihazlardan erişilebilir)
    loadMenuData();
  }, [slug]);

  useEffect(() => {
    if (typeof window === 'undefined' || !store || store.sector !== 'tekel' || !slug) return;
    try {
      const key = `tekel_age_${slug}`;
      if (sessionStorage.getItem(key) === '1') setAgeConfirmed(true);
    } catch (_) {}
  }, [store, slug]);

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
        const price = product.price != null 
          ? (typeof product.price === 'number' ? product.price : parseFloat(String(product.price)))
          : 0;
        total += (isNaN(price) ? 0 : price) * item.quantity;
      }
    });
    const df = store?.deliveryFee != null
      ? (typeof store.deliveryFee === 'number' ? store.deliveryFee : parseFloat(String(store.deliveryFee)) || 0)
      : 0;
    if (!Number.isNaN(df) && df > 0) total += df;
    return total;
  };

  const getSubtotal = (): number => {
    let total = 0;
    selectedProducts.forEach((item, productId) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        const price = product.price != null 
          ? (typeof product.price === 'number' ? product.price : parseFloat(String(product.price)))
          : 0;
        total += (isNaN(price) ? 0 : price) * item.quantity;
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

  const sendWhatsAppOrder = async () => {
    if (!store || !store.whatsapp || store.whatsapp.trim() === '' || selectedProducts.size === 0) return;

    const selectedItems: string[] = [];
    const orderItems: { productId: string; productName: string; quantity: number; unit: string; price: number; total: number }[] = [];
    selectedProducts.forEach((item, productId) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        const unit = item.unit || product.unit || 'adet';
        const price = product.price != null 
          ? (typeof product.price === 'number' ? product.price : parseFloat(String(product.price)))
          : 0;
        const safePrice = isNaN(price) ? 0 : price;
        const lineTotal = safePrice * item.quantity;
        selectedItems.push(`${item.quantity} ${unit} ${product.name} - ${lineTotal.toFixed(2)}₺`);
        orderItems.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unit,
          price: safePrice,
          total: lineTotal,
        });
      }
    });

    const subtotal = getSubtotal();
    const dfRaw = store?.deliveryFee != null
      ? (typeof store.deliveryFee === 'number' ? store.deliveryFee : parseFloat(String(store.deliveryFee)) || 0)
      : 0;
    const deliveryFee = !Number.isNaN(dfRaw) && dfRaw > 0 ? dfRaw : 0;
    const total = subtotal + deliveryFee;

    // Önce siparişi veritabanına kaydet (dashboard Toplam Sipariş için)
        const storeSlug = store?.slug;
        if (storeSlug) {
          try {
            await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                storeSlug,
                items: orderItems,
                total: subtotal,
                finalTotal: total,
                address: address.trim() || undefined,
              }),
            });
          } catch (e) {
            console.error('Error saving order:', e);
          }
        }

    let message = `Merhaba, sipariş vermek istiyorum:\n\n${selectedItems.join('\n')}`;
    if (deliveryFee > 0) {
      message += `\n\n🚚 Kurye Ücreti: ${deliveryFee.toFixed(2)}₺`;
    }
    message += `\n\n💳 Toplam: ${total.toFixed(2)}₺`;

    if (address.trim()) {
      message += `\n\n📍 Adres:\n${address.trim()}`;
    }

    if (location) {
      const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      message += `\n\n🗺️ Konum: ${googleMapsUrl}`;
    }

    const whatsappUrl = `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setShowOrderModal(false);
    setAddress('');
    setLocation(null);
    setLocationError('');
  };

  const openOrderModal = () => {
    setShowOrderModal(true);
  };

  // Apply theme
  const themeId = store?.themeId || 'modern-blue';
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

  if (storeNotFound || !store) {
    const t = getTheme('modern-blue');
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: t.background }}
      >
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: t.text }}>
            Mağaza bulunamadı
          </h2>
          <p style={{ color: t.text, opacity: 0.8 }}>
            Bu mağaza artık mevcut değil veya link yanlış olabilir.
          </p>
        </div>
      </div>
    );
  }

  if (trialExpired && store) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: theme.background }}
      >
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-6">🚧</div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: theme.text }}>
            {store.name} – Online Sipariş
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: theme.text }}>
            Çok yakında sizlerleyiz
          </h2>
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

  if (store.sector === 'tekel' && ageDeclined) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: theme.background }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
            18 yaş altına satış yapılmamaktadır
          </h2>
          <p className="text-sm mb-6" style={{ color: theme.text, opacity: 0.8 }}>
            Bu mağazadan 18 yaşından küçükler alışveriş yapamaz.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.primary, color: '#fff' }}
          >
            Ana sayfaya dön
          </a>
        </div>
      </div>
    );
  }

  if (store.sector === 'tekel' && !ageConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: theme.background }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔞</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
            Bu mağaza 18 yaş altına satış yapmamaktadır
          </h2>
          <p className="text-sm mb-6" style={{ color: theme.text, opacity: 0.8 }}>
            18 yaşından büyük müsünüz? Devam etmek için onaylayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => {
                try {
                  if (typeof window !== 'undefined' && slug) sessionStorage.setItem(`tekel_age_${slug}`, '1');
                } catch (_) {}
                setAgeConfirmed(true);
              }}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: theme.primary }}
            >
              Evet, 18 yaşından büyüğüm
            </button>
            <button
              type="button"
              onClick={() => setAgeDeclined(true)}
              className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
            >
              Hayır, 18 yaşından küçüğüm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: theme.background }}>
      {/* Banner Header: logo + store name overlay */}
      <header className="relative">
        {store.banner ? (
          <div className="relative rounded-b-3xl overflow-hidden shadow-md min-h-[12rem]">
            <img
              src={store.banner}
              alt="Banner"
              className="w-full h-48 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.className = parent.className.replace('overflow-hidden', '');
                  parent.style.background = `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`;
                  parent.style.minHeight = '12rem';
                }
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-md uppercase tracking-wide text-center z-0" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                {store.name} – Online Sipariş
              </h1>
            </div>
            {store.logo && (
              <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10">
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-[7.5rem] h-[7.5rem] sm:w-[9rem] sm:h-[9rem] rounded-full object-cover border-2 border-white/80 shadow-lg bg-white"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>
        ) : (
          <div
            className="rounded-b-3xl shadow-md min-h-[12rem] relative flex items-center justify-center px-4"
            style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
            }}
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-md uppercase tracking-wide text-center z-0" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              {store.name}
            </h1>
            {store.logo && (
              <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10">
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-[7.5rem] h-[7.5rem] sm:w-[9rem] sm:h-[9rem] rounded-full object-cover border-2 border-white/80 shadow-lg bg-white"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>
        )}
      </header>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto px-4 -mt-4 mb-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <label htmlFor="menu-search" className="sr-only">
            Ürün ara
          </label>
          <input
            type="text"
            id="menu-search"
            name="menu-search"
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
            {products.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-left max-w-md mx-auto">
                <p className="text-sm font-semibold text-yellow-800 mb-2">🔍 Debug Bilgisi:</p>
                <p className="text-xs text-yellow-700">Toplam ürün: {products.length}</p>
                <p className="text-xs text-yellow-700">Slug: {slug}</p>
                <p className="text-xs text-yellow-700">Store: {store?.name || 'Bulunamadı'}</p>
                <p className="text-xs text-yellow-700 mt-2">
                  💡 Console'da "📦 Direct products by slug:" mesajını kontrol edin
                </p>
              </div>
            )}
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
                  {is18PlusProduct(product) ? (
                    <div
                      className="w-full h-40 flex items-center justify-center bg-gray-800 text-white font-bold text-2xl sm:text-3xl"
                      aria-label="18 yaş üzeri ürün"
                    >
                      +18
                    </div>
                  ) : product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className="p-4">
                    <h3 className="text-base font-bold mb-1 text-gray-900 line-clamp-2" style={{ minHeight: '2.5rem' }}>
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold mb-2" style={{ color: theme.primary }}>
                      {(() => {
                        const price = product.price != null 
                          ? (typeof product.price === 'number' ? product.price : parseFloat(String(product.price))) 
                          : 0;
                        const safePrice = (price != null && typeof price === 'number' && !isNaN(price)) ? price : 0;
                        return safePrice.toFixed(2);
                      })()} ₺/{unit}
                    </p>
                    {product.stock != null && typeof product.stock === 'number' && (
                      <p className="text-xs text-gray-500 mb-3">
                        Stok: {product.stock != null && typeof product.stock === 'number' ? product.stock.toFixed(1) : '0.0'} {unit}
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
                {(getTotalPrice() || 0).toFixed(2)} ₺
              </p>
            </div>
            <button
              onClick={openOrderModal}
              disabled={!store?.whatsapp || store.whatsapp.trim() === ''}
              className="px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              style={{
                backgroundColor: (store?.whatsapp && store.whatsapp.trim() !== '') ? theme.primary : theme.text,
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
                      <span>{(() => {
                        const price = product.price != null 
                          ? (typeof product.price === 'number' ? product.price : parseFloat(String(product.price)))
                          : 0;
                        const safePrice = isNaN(price) ? 0 : price;
                        return (safePrice * item.quantity).toFixed(2);
                      })()} ₺</span>
                    </div>
                  );
                })}
              </div>
              {(() => {
                const df = store?.deliveryFee != null
                  ? (typeof store.deliveryFee === 'number' ? store.deliveryFee : parseFloat(String(store.deliveryFee)) || 0)
                  : 0;
                const showKurye = !Number.isNaN(df) && df > 0;
                return showKurye ? (
                  <div className="mt-2 pt-2 border-t border-gray-300 flex justify-between text-sm">
                    <span style={{ color: theme.text }}>🚚 Kurye Ücreti:</span>
                    <span style={{ color: theme.text }}>{df.toFixed(2)} ₺</span>
                  </div>
                ) : null;
              })()}
              <div className="mt-3 pt-3 border-t border-gray-300 flex justify-between font-bold">
                <span style={{ color: theme.text }}>💳 Toplam:</span>
                <span style={{ color: theme.primary }}>{(getTotalPrice() || 0).toFixed(2)} ₺</span>
              </div>
            </div>

            {/* Address Input */}
            <div className="mb-4">
              <label htmlFor="order-address" className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Adres Açıklama
              </label>
              <textarea
                id="order-address"
                name="order-address"
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
              <label htmlFor="location-share" className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
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
                    Enlem: {(location.lat || 0).toFixed(6)}, Boylam: {(location.lng || 0).toFixed(6)}
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={sendWhatsAppOrder}
              disabled={!store?.whatsapp || store.whatsapp.trim() === ''}
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
