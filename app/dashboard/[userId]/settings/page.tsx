'use client';

import { useEffect, useState } from 'react';
import { getStore, saveStore, generateSlug, getThemeId } from '@/lib/store';
// Database operations moved to API route - no direct DB imports needed

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    banner: '',
    address: '',
    phone: '',
    whatsapp: '',
    deliveryFee: '',
  });
  const [logoError, setLogoError] = useState<string>('');
  const [bannerError, setBannerError] = useState<string>('');
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [bannerLoadError, setBannerLoadError] = useState(false);
  const [originalSlug, setOriginalSlug] = useState<string>('');

  useEffect(() => {
    const store = getStore();
    if (store) {
      const slug = store.slug || '';
      setFormData({
        name: store.name || '',
        slug: slug,
        description: store.description || '',
        logo: store.logo || '',
        banner: store.banner || '',
        address: store.address || '',
        phone: store.phone || '',
        whatsapp: store.whatsapp || '',
        deliveryFee: (store as any).deliveryFee || '',
      });
      setOriginalSlug(slug); // Orijinal slug'ı sakla
    }
  }, []);

  const onLogoUrlChange = (v: string) => {
    const val = v.trim();
    setFormData(prev => ({ ...prev, logo: val }));
    setLogoError(val && !val.startsWith('https://') ? 'Geçerli bir https:// görsel adresi girin' : '');
    setLogoLoadError(false);
  };

  const onBannerUrlChange = (v: string) => {
    const val = v.trim();
    setFormData(prev => ({ ...prev, banner: val }));
    setBannerError(val && !val.startsWith('https://') ? 'Geçerli bir https:// görsel adresi girin' : '');
    setBannerLoadError(false);
  };

  const removeLogo = () => {
    setLogoError('');
    setLogoLoadError(false);
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  const removeBanner = () => {
    setBannerError('');
    setBannerLoadError(false);
    setFormData(prev => ({ ...prev, banner: '' }));
  };

  const handleNameChange = (name: string) => {
    const slug = generateSlug(name);
    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      alert('Mağaza adı ve slug gerekli');
      return;
    }
    if (formData.logo.trim() && !formData.logo.trim().startsWith('https://')) {
      setLogoError('Logo adresi https:// ile başlamalıdır');
      return;
    }
    if (formData.banner.trim() && !formData.banner.trim().startsWith('https://')) {
      setBannerError('Banner adresi https:// ile başlamalıdır');
      return;
    }
    const currentStore = getStore();
    const slugChanged = originalSlug && formData.slug !== originalSlug;
    
    const storeData = {
      slug: formData.slug,
      name: formData.name,
      description: formData.description || undefined,
      logo: formData.logo || undefined,
      banner: formData.banner || undefined,
      address: formData.address || undefined,
      phone: formData.phone || undefined,
      whatsapp: formData.whatsapp?.trim() || undefined,
      themeId: currentStore?.themeId || getThemeId(),
      sector: currentStore?.sector || undefined,
      deliveryFee: formData.deliveryFee ? parseFloat(formData.deliveryFee) : undefined,
    };
    
    // Save to localStorage (for backward compatibility)
    saveStore(storeData);
    
    // Save to database via API route (server-side)
    try {
      console.log('📤 Sending store data to API:', {
        slug: storeData.slug,
        originalSlug: originalSlug,
        slugChanged: slugChanged,
        name: storeData.name,
        hasWhatsapp: !!storeData.whatsapp,
        whatsappValue: storeData.whatsapp
      });
      
      const response = await fetch('/api/stores', {
        method: slugChanged ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          store: storeData,
          oldSlug: slugChanged ? originalSlug : undefined, // Slug değiştiyse eski slug'ı gönder
        }),
      });

      const result = await response.json();
      console.log('📥 API Response:', result);

      if (result.success) {
        console.log('✅ Store settings saved to database:', { 
          logo: storeData.logo, 
          banner: storeData.banner,
          whatsapp: storeData.whatsapp,
          slugChanged: slugChanged
        });
        // Slug değiştiyse orijinal slug'ı güncelle
        if (slugChanged) {
          setOriginalSlug(formData.slug);
        }
        alert('✅ Ayarlar database\'e kaydedildi!');
      } else {
        console.error('❌ Failed to save store to database:', result.error);
        alert(`⚠️ Ayarlar localStorage'a kaydedildi (database hatası: ${result.error || 'Bilinmeyen hata'})`);
      }
    } catch (error: any) {
      console.error('❌ Database save error:', error);
      alert(`⚠️ Ayarlar localStorage'a kaydedildi (database hatası: ${error?.message || 'Bilinmeyen hata'})`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mağaza Ayarları</h1>
        <p className="text-gray-600 mt-1">Mağaza bilgilerinizi yönetin</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div>
          <label htmlFor="store-name" className="block text-sm font-medium text-gray-700 mb-2">
            Mağaza Adı *
          </label>
          <input
            type="text"
            id="store-name"
            name="store-name"
            required
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Örn: Sevda Manav"
          />
        </div>


        <div>
          <label htmlFor="store-slug" className="block text-sm font-medium text-gray-700 mb-2">
            Slug (URL) *
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">/m/</span>
            <input
              type="text"
              id="store-slug"
              name="store-slug"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="sevda-manav"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Menü linkiniz: <code className="bg-gray-100 px-1 rounded">/m/{formData.slug || 'slug'}</code>
          </p>
        </div>

        <div>
          <label htmlFor="store-description" className="block text-sm font-medium text-gray-700 mb-2">
            Açıklama
          </label>
          <textarea
            id="store-description"
            name="store-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Mağazanız hakkında kısa bilgi"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="logo-url" className="block text-sm font-medium text-gray-700 mb-2">
              Logo / Profil Fotoğrafı (URL)
            </label>
            <div className="space-y-3">
              <input
                id="logo-url"
                type="url"
                value={formData.logo}
                onChange={(e) => onLogoUrlChange(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              {logoError && <p className="text-sm text-red-600">{logoError}</p>}
              {formData.logo.trim() && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Önizleme:</p>
                  <div className="relative inline-block">
                    {!logoLoadError ? (
                      <img
                        src={formData.logo.trim()}
                        alt="Logo önizleme"
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        onError={() => setLogoLoadError(true)}
                        onLoad={() => setLogoLoadError(false)}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg border-2 border-amber-300 bg-amber-50 flex items-center justify-center text-center px-1 text-xs text-amber-800">
                        Görsel yüklenemedi. Adresi kontrol edin.
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      title="Logo adresini temizle"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Görselin https:// ile başlayan adresini yapıştırın. Cloudinary kullanılmaz.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="banner-url" className="block text-sm font-medium text-gray-700 mb-2">
              Banner Görseli (URL)
            </label>
            <div className="space-y-3">
              <input
                id="banner-url"
                type="url"
                value={formData.banner}
                onChange={(e) => onBannerUrlChange(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              {bannerError && <p className="text-sm text-red-600">{bannerError}</p>}
              {formData.banner.trim() && (
                <div className="relative">
                  <p className="text-xs text-gray-500 mb-2">Önizleme:</p>
                  <div className="relative">
                    {!bannerLoadError ? (
                      <img
                        src={formData.banner.trim()}
                        alt="Banner önizleme"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        onError={() => setBannerLoadError(true)}
                        onLoad={() => setBannerLoadError(false)}
                      />
                    ) : (
                      <div className="w-full h-32 rounded-lg border-2 border-amber-300 bg-amber-50 flex items-center justify-center text-center px-4 text-sm text-amber-800">
                        Görsel yüklenemedi. Adresi kontrol edin.
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={removeBanner}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      title="Banner adresini temizle"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Görselin https:// ile başlayan adresini yapıştırın. Cloudinary kullanılmaz.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="store-address" className="block text-sm font-medium text-gray-700 mb-2">
            Adres
          </label>
          <input
            type="text"
            id="store-address"
            name="store-address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Tam adres bilgisi"
          />
        </div>

        <div>
          <label htmlFor="store-phone" className="block text-sm font-medium text-gray-700 mb-2">
            Telefon
          </label>
          <input
            type="tel"
            id="store-phone"
            name="store-phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="0XXX XXX XX XX"
          />
        </div>

        <div>
          <label htmlFor="store-whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp Numarası
          </label>
          <input
            type="tel"
            id="store-whatsapp"
            name="store-whatsapp"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="90XXXXXXXXXX"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ülke kodu ile birlikte girin (örn: 905551234567)
          </p>
        </div>

        <div>
          <label htmlFor="delivery-fee" className="block text-sm font-medium text-gray-700 mb-2">
            Kurye Ücreti (₺)
          </label>
          <input
            type="number"
            id="delivery-fee"
            name="delivery-fee"
            step="0.01"
            min="0"
            value={formData.deliveryFee}
            onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="0.00"
          />
          <p className="text-xs text-gray-500 mt-1">
            Siparişlerde gösterilecek kurye ücreti (opsiyonel)
          </p>
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          Ayarları Kaydet
        </button>
      </form>
    </div>
  );
}
