'use client';

import { useEffect, useState } from 'react';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductPublish,
  getProductsBySector,
} from '@/lib/products';
import { getAllCategories } from '@/lib/categories';
import { isAdminAuthenticated } from '@/lib/admin';
import { SECTORS, getSectorLabel, getSectorIcon } from '@/lib/sectors';
import type { Product, Sector } from '@/lib/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | 'all'>('all');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    stock: '',
    unit: 'adet',
    sector: '' as Sector | '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAdminAuthenticated()) return;
    loadCategories();
  }, []);

  useEffect(() => {
    if (!isAdminAuthenticated()) return;
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSector]);

  const loadProducts = () => {
    let data = getAllProducts();
    // Sektör bazlı filtreleme
    if (selectedSector !== 'all') {
      data = getProductsBySector(selectedSector);
    }
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, [selectedSector]);

  const loadCategories = () => {
    const allCategories = getAllCategories();
    const categoryNames = allCategories.map(c => c.name);
    const productCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    const allCategoryNames = Array.from(new Set([...categoryNames, ...productCategories]));
    setCategories(allCategoryNames.sort());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price || !formData.category || !formData.sector) {
      alert('Lütfen tüm zorunlu alanları doldurun (Sektör dahil)');
      return;
    }

    const productData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price) || 0,
      category: formData.category,
      image: formData.image.trim() || undefined,
      stock: formData.stock ? parseInt(formData.stock) : undefined,
      unit: formData.unit,
      sector: formData.sector as Sector,
      createdBy: 'admin' as const, // Admin eklediği ürünler
      isPublished: editingProduct?.isPublished || false, // Admin eklediği ürünler varsayılan olarak pasif
    };

    try {
      if (editingProduct) {
        updateProduct(editingProduct.id, productData);
      } else {
        // Yeni ürün eklerken isPublished: false (kullanıcı aktif edecek)
        createProduct({ ...productData, isPublished: false });
      }
      
      loadProducts();
      loadCategories();
      handleCloseModal();
    } catch (err) {
      alert('Ürün kaydedilirken bir hata oluştu');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      image: product.image || '',
      stock: product.stock?.toString() || '',
      unit: product.unit || 'adet',
      sector: product.sector || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      deleteProduct(id);
      loadProducts();
    }
  };

  const handleTogglePublish = (id: string) => {
    toggleProductPublish(id);
    loadProducts();
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      category: '',
      image: '',
      stock: '',
      unit: 'adet',
      sector: '',
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ürün Yönetimi</h1>
          <p className="text-gray-600 mt-1">Ürünleri görüntüleyin, ekleyin ve yönetin</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          ➕ Yeni Ürün Ekle
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-4 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Ürün adı veya kategori ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value as Sector | 'all')}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Tüm Sektörler</option>
            {SECTORS.map((sector) => (
              <option key={sector.value} value={sector.value}>
                {sector.icon} {sector.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz ürün eklenmemiş'}
          </h3>
          {!searchQuery && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              + İlk Ürünü Ekle
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-500">{product.category}</p>
                      {product.sector && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          {getSectorIcon(product.sector)} {getSectorLabel(product.sector)}
                        </span>
                      )}
                      {product.createdBy === 'admin' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      product.isPublished
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {product.isPublished ? 'Yayında' : 'Pasif'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {product.price.toFixed(2)} ₺
                </p>
                {product.stock !== undefined && (
                  <p className="text-sm text-gray-600 mb-2">
                    Stok: {product.stock} {product.unit || 'adet'}
                  </p>
                )}
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    onClick={() => handleTogglePublish(product.id)}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      product.isPublished
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {product.isPublished ? '📤 Yayından Kaldır' : '✅ Yayınla'}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Sektör Seçin</option>
                  {SECTORS.map((sector) => (
                    <option key={sector.value} value={sector.value}>
                      {sector.icon} {sector.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Bu ürün hangi sektör için? (Örn: Tekel için alkollü içecekler)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <input
                    type="text"
                    list="categories"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <datalist id="categories">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok (Opsiyonel)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birim
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="adet">Adet</option>
                    <option value="kg">Kilogram</option>
                    <option value="gr">Gram</option>
                    <option value="lt">Litre</option>
                    <option value="ml">Mililitre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Görseli URL (Opsiyonel)
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  {editingProduct ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
