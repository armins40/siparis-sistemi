'use client';

import { useEffect, useState } from 'react';
import { getStore, saveStore, generateSlug, getThemeId } from '@/lib/store';
import { SECTORS } from '@/lib/sectors';
import type { Sector } from '@/lib/types';

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
    sector: '' as Sector | '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');

  useEffect(() => {
    const store = getStore();
    if (store) {
      setFormData({
        name: store.name || '',
        slug: store.slug || '',
        description: store.description || '',
        logo: store.logo || '',
        banner: store.banner || '',
        address: store.address || '',
        phone: store.phone || '',
        whatsapp: store.whatsapp || '',
        sector: store.sector || '',
      });
      // Set previews if images exist (either URL or base64)
      if (store.logo) {
        setLogoPreview(store.logo);
      }
      if (store.banner) {
        setBannerPreview(store.banner);
      }
    }
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Logo dosyası 5MB\'dan küçük olmalıdır');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görsel dosyası seçin');
      return;
    }

    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoPreview(base64String);
      setFormData({ ...formData, logo: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Banner dosyası 10MB\'dan küçük olmalıdır');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görsel dosyası seçin');
      return;
    }

    setBannerFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setBannerPreview(base64String);
      setFormData({ ...formData, banner: base64String });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setFormData({ ...formData, logo: '' });
    // Reset file input
    const input = document.getElementById('logo-input') as HTMLInputElement;
    if (input) input.value = '';
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview('');
    setFormData({ ...formData, banner: '' });
    // Reset file input
    const input = document.getElementById('banner-input') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleNameChange = (name: string) => {
    const slug = generateSlug(name);
    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      alert('Mağaza adı ve slug gerekli');
      return;
    }
    const currentStore = getStore();
    saveStore({
      slug: formData.slug,
      name: formData.name,
      description: formData.description || undefined,
      logo: formData.logo || undefined,
      banner: formData.banner || undefined,
      address: formData.address || undefined,
      phone: formData.phone || undefined,
      whatsapp: formData.whatsapp || undefined,
      themeId: currentStore?.themeId || getThemeId(), // Preserve theme
      sector: formData.sector || undefined, // Sektör
    });
    alert('Ayarlar kaydedildi!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mağaza Ayarları</h1>
        <p className="text-gray-600 mt-1">Mağaza bilgilerinizi yönetin</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mağaza Adı *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Örn: Sevda Manav"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sektör *
          </label>
          <select
            required
            value={formData.sector}
            onChange={(e) => setFormData({ ...formData, sector: e.target.value as Sector })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">Sektör Seçin</option>
            {SECTORS.map((sector) => (
              <option key={sector.value} value={sector.value}>
                {sector.icon} {sector.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Mağazanızın hangi sektörde olduğunu seçin. Bu sektöre özel ürünler göreceksiniz.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug (URL) *
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">/m/</span>
            <input
              type="text"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Açıklama
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Mağazanız hakkında kısa bilgi"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo / Profil Fotoğrafı
            </label>
            <div className="space-y-3">
              <div>
                <input
                  id="logo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="logo-input"
                  className="cursor-pointer flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm font-medium text-gray-700"
                >
                  <span className="mr-2">📷</span>
                  Logo Yükle
                </label>
              </div>
              {logoPreview && (
                <div className="relative">
                  <p className="text-xs text-gray-500 mb-2">Önizleme:</p>
                  <div className="relative inline-block">
                    <img
                      src={logoPreview}
                      alt="Logo önizleme"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      title="Logo'yu Kaldır"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Maksimum dosya boyutu: 5MB
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Görseli
            </label>
            <div className="space-y-3">
              <div>
                <input
                  id="banner-input"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
                <label
                  htmlFor="banner-input"
                  className="cursor-pointer flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm font-medium text-gray-700"
                >
                  <span className="mr-2">🖼️</span>
                  Banner Yükle
                </label>
              </div>
              {bannerPreview && (
                <div className="relative">
                  <p className="text-xs text-gray-500 mb-2">Önizleme:</p>
                  <div className="relative">
                    <img
                      src={bannerPreview}
                      alt="Banner önizleme"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeBanner}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      title="Banner'ı Kaldır"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Maksimum dosya boyutu: 10MB
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adres
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Tam adres bilgisi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefon
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="0XXX XXX XX XX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp Numarası
          </label>
          <input
            type="tel"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="90XXXXXXXXXX"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ülke kodu ile birlikte girin (örn: 905551234567)
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
