'use client';

import { useEffect, useState } from 'react';
import { isAdminAuthenticated } from '@/lib/admin';
import type { Category } from '@/lib/types';

const BULK_CATEGORY_NAMES = [
  'Biralar',
  'Rakılar',
  'Viskiler',
  'Votkalar',
  'Cinler',
  'Romlar',
  'Likörler',
  'Tekilalar',
  'Şaraplar',
  'Tütün Ürünleri',
  'Alkolsüz İçecekler',
  'Atıştırmalıklar',
  'Kuruyemiş',
  'Şekerleme & Çikolata',
  'Cips & Bisküvi',
  'Enerji İçecekleri',
  'Kahve & Soğuk Kahve',
  'Su & Maden Suyu',
  'Sigara Aksesuarları (çakmak, sarma kâğıdı vb.)',
  'İçki Aksesuarları (açacak vb.)',
  'Meyve & Sebze',
  'Et & Tavuk & Balık',
  'Şarküteri',
  'Süt & Süt Ürünleri',
  'Kahvaltılık',
  'Bakliyat',
  'Temel Gıda',
  'Atıştırmalık',
  'Cips & Çerez',
  'Bisküvi & Kek',
  'İçecekler',
  'Gazlı İçecekler',
  'Su & Maden Suyu',
  'Enerji İçecekleri',
  'Çay & Kahve',
  'Dondurulmuş Gıda',
  'Hazır Yemek',
  'Konserve',
  'Yağ & Sos',
  'Baharat',
  'Unlu Mamuller',
  'Ekmek',
  'Temizlik Ürünleri',
  'Kişisel Bakım',
  'Kağıt Ürünleri',
  'Bebek Ürünleri',
  'Evcil Hayvan Ürünleri',
  'Kedi Ürünleri',
  'Köpek Ürünleri',
  'Kuş Ürünleri',
  'Balık & Akvaryum',
  'Kemirgen Ürünleri',
  'Mama (Kedi)',
  'Mama (Köpek)',
  'Yaş Mama',
  'Ödül Mamaları',
  'Kum & Tuvalet Ürünleri',
  'Oyuncaklar',
  'Tasma & Gezdirme',
  'Yatak & Kulübe',
  'Bakım & Temizlik',
  'Vitamin & Takviyeler',
  'Taşıma Çantaları',
  'Aksesuarlar',
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories', { cache: 'no-store', credentials: 'include' });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error('Kategoriler yüklenemedi:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdminAuthenticated()) return;
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Kategori adı boş olamaz');
      return;
    }
    setSubmitting(true);
    try {
      if (editingCategory) {
        const res = await fetch('/api/admin/categories', {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCategory.id, name: formData.name.trim() }),
        });
        const data = await res.json();
        if (!data.success) {
          alert(data.error || 'Bu kategori adı zaten kullanılıyor');
          return;
        }
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name.trim() }),
        });
        const data = await res.json();
        if (!data.success) {
          alert(data.error || 'Kategori eklenemedi');
          return;
        }
      }
      setFormData({ name: '' });
      setShowForm(false);
      setEditingCategory(null);
      await loadCategories();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz? Ürünleriniz etkilenmeyecektir.')) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) await loadCategories();
      else alert(data.error || 'Silinemedi');
    } catch (e) {
      console.error('Silme hatası:', e);
      alert('Silinemedi');
    }
  };

  const handleAddBulkCategories = async () => {
    if (!confirm(`Toplam ${BULK_CATEGORY_NAMES.length} kategori eklemek istediğinize emin misiniz? Zaten var olan kategoriler atlanacaktır.`)) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulkNames: BULK_CATEGORY_NAMES }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.added ?? 0} kategori eklendi.\n⚠️ ${data.skipped ?? 0} kategori atlandı (zaten mevcut).`);
        await loadCategories();
      } else alert(data.error || 'Toplu ekleme başarısız');
    } catch (e) {
      console.error('Toplu ekleme hatası:', e);
      alert('Toplu ekleme başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Kategoriler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategori Yönetimi</h1>
          <p className="text-gray-600 mt-1">Ürün kategorilerini yönetin (kullanıcı dashboard’unda da görünür)</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAddBulkCategories}
            disabled={submitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            📦 Toplu Kategori Ekle
          </button>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingCategory(null);
              setFormData({ name: '' });
            }}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            + Yeni Kategori Ekle
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="admin-category-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  id="admin-category-name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Örn: Meyveler, Sebzeler"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
                >
                  {editingCategory ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz kategori eklenmemiş</h3>
          <p className="text-gray-600 mb-6">İlk kategorinizi ekleyerek başlayın</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            + İlk Kategoriyi Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">ID: {category.id.substring(0, 12)}...</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
