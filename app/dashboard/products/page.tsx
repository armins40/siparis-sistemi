'use client';

import { useEffect, useState } from 'react';
import { 
  getProductsForUser, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  toggleProductPublish,
  getUserProducts 
} from '@/lib/products';
// Database imports
import { 
  getProductsByUserIdFromDB,
  createProductInDB,
  updateProductInDB,
  deleteProductFromDB,
} from '@/lib/db/products';
import { getAllCategories } from '@/lib/categories';
import { getStore } from '@/lib/store';
import { getSectorLabel, getSectorIcon } from '@/lib/sectors';
import type { Product, Sector } from '@/lib/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    stock: '',
    unit: 'kg',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');


  useEffect(() => {
    // Store'dan sektör bilgisini al
    const store = getStore();
    const userSector = store?.sector;
    const userId = store?.slug; // Store slug'ı userId olarak kullanıyoruz
    
    if (!userSector) {
      // Sektör seçilmemişse uyarı ver
      setProducts([]);
      return;
    }
    
    // Kullanıcının sektörüne ait ürünleri getir (admin eklediği + kullanıcının kendi ürünleri)
    const data = getProductsForUser(userSector, userId);
    setProducts(data);
    
    // Load categories
    const allCategories = getAllCategories();
    const categoryNames = allCategories.map(c => c.name);
    // Also get categories from products
    const productCategories = Array.from(new Set(data.map(p => p.category).filter(Boolean)));
    const allCategoryNames = Array.from(new Set([...categoryNames, ...productCategories]));
    setCategories(allCategoryNames.sort());
    
    // Periodic updates
    const interval = setInterval(() => {
      const updated = getProductsForUser(userSector, userId);
      setProducts(updated);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const store = getStore();
    const userSector = store?.sector;
    const userId = store?.slug;
    
    if (!userSector || !userId) {
      alert('Lütfen önce Mağaza Ayarları\'ndan sektörünüzü seçin!');
      return;
    }
    
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price) || 0,
      category: formData.category,
      image: formData.image || undefined,
      stock: formData.stock ? parseFloat(formData.stock) : undefined,
      unit: formData.unit || undefined,
      sector: userSector, // Kullanıcının sektörü
      createdBy: 'user' as const, // Kullanıcı eklediği ürünler
      userId: userId, // Kullanıcının store slug'ı
    };
    
    try {
      if (editingProduct) {
        // Update product
        const updatedProduct = {
          ...editingProduct,
          ...productData,
        };
        
        // Try database first
        const dbSuccess = await updateProductInDB(updatedProduct);
        if (!dbSuccess) {
          console.error('❌ Database update failed');
          alert('⚠️ Ürün database\'de güncellenemedi. Lütfen database bağlantınızı kontrol edin.');
          // Still update localStorage as backup
          updateProduct(editingProduct.id, {
            ...productData,
            isPublished: editingProduct.isPublished,
          });
        } else {
          console.log('✅ Product updated in database');
        }
      } else {
        // Create product
        const newProduct = {
          id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          ...productData,
          isPublished: true, // Default: aktif (menüde görünsün)
          createdAt: new Date().toISOString(),
        };
        
        console.log('📦 Creating product:', {
          name: newProduct.name,
          storeSlug: userId,
          userId: newProduct.userId,
          isPublished: newProduct.isPublished
        });
        
        // Try database first
        const dbSuccess = await createProductInDB(newProduct, userId);
        if (!dbSuccess) {
          console.error('❌ Database save failed - product not saved');
          // Check if POSTGRES_URL is missing
          const hasDbUrl = typeof window === 'undefined' ? !!process.env.POSTGRES_URL : false;
          if (!hasDbUrl) {
            alert('⚠️ Database bağlantısı yapılandırılmamış.\n\nVercel Dashboard > Settings > Environment Variables\'dan POSTGRES_URL ekleyin.\n\nÜrün localStorage\'a kaydedildi (mobilde görünmeyebilir).');
          } else {
            alert('⚠️ Ürün database\'e kaydedilemedi. Console\'da hata detaylarını kontrol edin.\n\nÜrün localStorage\'a kaydedildi (mobilde görünmeyebilir).');
          }
          // Still save to localStorage as backup
          createProduct({
            ...productData,
            isPublished: true, // Menüde görünsün
          });
        } else {
          console.log('✅ Product saved to database');
          // Also save to localStorage for backward compatibility
          createProduct({
            ...productData,
            isPublished: true,
          });
        }
      }
      
      setFormData({ name: '', price: '', category: '', image: '', stock: '', unit: 'kg' });
      setImageFile(null);
      setImagePreview('');
      setShowForm(false);
      setEditingProduct(null);
      
      // Reload products
      if (userId) {
        try {
          const dbProducts = await getProductsByUserIdFromDB(userId);
          if (dbProducts.length > 0) {
            setProducts(dbProducts);
          } else {
            const updated = getProductsForUser(userSector, userId);
            setProducts(updated);
          }
        } catch (error) {
          const updated = getProductsForUser(userSector, userId);
          setProducts(updated);
        }
      } else {
        // No userId, just reload from localStorage
        const updated = getProductsForUser(userSector, '');
        setProducts(updated);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Ürün kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB for Cloudinary)
    if (file.size > 10 * 1024 * 1024) {
      alert('Görsel dosyası 10MB\'dan küçük olmalıdır');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görsel dosyası seçin');
      return;
    }

    setImageFile(file);

    // Preview için base64 (hızlı görüntüleme)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);

    // Cloudinary'ye yükle
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'siparis/products');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Cloudinary URL'ini kaydet
        setFormData({ ...formData, image: data.url });
        setImagePreview(data.url); // Cloudinary URL'ini preview olarak göster
      } else {
        alert(data.error || 'Görsel yüklenirken bir hata oluştu');
        setImageFile(null);
        setImagePreview('');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Görsel yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setImageFile(null);
      setImagePreview('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, image: '' });
    // Reset file input
    const input = document.getElementById('product-image-input') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      image: product.image || '',
      stock: product.stock?.toString() || '',
      unit: product.unit || 'kg',
    });
    // Set preview if image exists
    if (product.image) {
      setImagePreview(product.image);
    } else {
      setImagePreview('');
    }
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const product = products.find(p => p.id === id);
    // Admin eklediği ürünleri silme (sadece kullanıcının kendi ürünlerini silebilir)
    if (product?.createdBy === 'admin') {
      alert('Admin tarafından eklenen ürünleri silemezsiniz. Sadece aktif/pasif yapabilirsiniz.');
      return;
    }
    
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    
    try {
      // Try database first
      const dbSuccess = await deleteProductFromDB(id);
      if (!dbSuccess) {
        // Fallback to localStorage
        deleteProduct(id);
      }
      
      // Reload products
      const store = getStore();
      const userSector = store?.sector;
      const userId = store?.slug;
      if (userSector && userId) {
        try {
          const dbProducts = await getProductsByUserIdFromDB(userId);
          if (dbProducts.length > 0) {
            setProducts(dbProducts);
          } else {
            const updated = getProductsForUser(userSector, userId);
            setProducts(updated);
          }
        } catch (error) {
          const updated = getProductsForUser(userSector, userId);
          setProducts(updated);
        }
        
        // Update categories
        const allCategories = getAllCategories();
        const categoryNames = allCategories.map(c => c.name);
        let currentProducts: Product[] = [];
        try {
          currentProducts = await getProductsByUserIdFromDB(userId);
        } catch {
          currentProducts = getProductsForUser(userSector, userId);
        }
        const productCategories = Array.from(new Set(currentProducts.map((p: Product) => p.category).filter(Boolean)));
        const allCategoryNames = Array.from(new Set([...categoryNames, ...productCategories]));
        setCategories(allCategoryNames.sort());
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Ürün silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ürünler</h1>
          <p className="text-gray-600 mt-1">Ürünlerinizi yönetin</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingProduct(null);
            setFormData({ name: '', price: '', category: '', image: '', stock: '', unit: 'kg' });
            setImageFile(null);
            setImagePreview('');
          }}
          className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          + Yeni Ürün Ekle
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  id="product-name"
                  name="product-name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat (₺) *
                </label>
                <input
                  type="number"
                  id="product-price"
                  name="product-price"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori *
                </label>
                <input
                  type="text"
                  id="product-category"
                  name="product-category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  list="categories"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div>
                <label htmlFor="product-image-input" className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Görseli
                </label>
                <div className="space-y-3">
                  <div>
                    <input
                      id="product-image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="product-image-input"
                      className="cursor-pointer flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm font-medium text-gray-700"
                    >
                      <span className="mr-2">📷</span>
                      Görsel Yükle
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="relative">
                      <p className="text-xs text-gray-500 mb-2">Önizleme:</p>
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Görsel önizleme"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          title="Görseli Kaldır"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stok (opsiyonel)
                  </label>
                  <input
                    type="number"
                    id="product-stock"
                    name="product-stock"
                    step="0.1"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="10.0"
                  />
                </div>
                <div>
                  <label htmlFor="product-unit" className="block text-sm font-medium text-gray-700 mb-1">
                    Birim
                  </label>
                  <select
                    id="product-unit"
                    name="product-unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                  >
                    <option value="kg">kg</option>
                    <option value="adet">adet</option>
                    <option value="lt">lt</option>
                    <option value="paket">paket</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  {editingProduct ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
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

      {/* Sektör Uyarısı */}
      {(() => {
        const store = getStore();
        if (!store?.sector) {
          return (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sektör Seçimi Gerekli
              </h3>
              <p className="text-gray-600 mb-6">
                Ürünleri görebilmek için önce Mağaza Ayarları'ndan sektörünüzü seçin.
                <br />
                Sektörünüze özel admin eklediği ürünler ve kendi ürünleriniz burada görünecek.
              </p>
              <a
                href="/dashboard/settings"
                className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                ⚙️ Mağaza Ayarlarına Git
              </a>
            </div>
          );
        }
        return null;
      })()}

      {/* Products Grid */}
      {getStore()?.sector && (
        <>
          {products.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz ürün eklenmemiş
              </h3>
              <p className="text-gray-600 mb-6">
                Sektörünüze ({getSectorIcon(getStore()?.sector)} {getSectorLabel(getStore()?.sector)}) özel admin ürünleri ve 
                <br />kendi ürünleriniz burada görünecek.
              </p>
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingProduct(null);
                  setFormData({ name: '', price: '', category: '', image: '', stock: '', unit: 'kg' });
                }}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                + İlk Ürünü Ekle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
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
                        {product.createdBy === 'admin' && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                            📦 Admin Önerisi (Pasif)
                          </span>
                        )}
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
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    {product.stock !== undefined && (
                      <p className="text-xs text-gray-500 mb-2">
                        Stok: {product.stock} {product.unit || 'adet'}
                      </p>
                    )}
                    <p className="text-2xl font-bold text-gray-900 mb-4">
                      {product.price.toFixed(2)} ₺
                    </p>
                    <div className="flex space-x-2">
                      {product.createdBy !== 'admin' && (
                        <button
                          onClick={() => handleEdit(product)}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          Düzenle
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          // Toggle publish status
                          const updatedProduct = { ...product, isPublished: !product.isPublished };
                          
                          // Update in database
                          const dbSuccess = await updateProductInDB(updatedProduct);
                          if (dbSuccess) {
                            console.log('✅ Product publish status updated in DB');
                          } else {
                            console.error('❌ Failed to update product in DB');
                          }
                          
                          // Also update localStorage
                          toggleProductPublish(product.id);
                          
                          // Reload products
                          const store = getStore();
                          const userSector = store?.sector;
                          const userId = store?.slug;
                          
                          if (userId) {
                            try {
                              const dbProducts = await getProductsByUserIdFromDB(userId);
                              if (dbProducts.length > 0) {
                                setProducts(dbProducts);
                              } else {
                                const updated = getProductsForUser(userSector!, userId);
                                setProducts(updated);
                              }
                            } catch (error) {
                              const updated = getProductsForUser(userSector!, userId);
                              setProducts(updated);
                            }
                          } else {
                            const updated = getProductsForUser(userSector || undefined, '');
                            setProducts(updated);
                          }
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                          product.isPublished
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={product.createdBy === 'admin' ? 'Admin eklediği ürünleri aktif/pasif yapabilirsiniz' : ''}
                      >
                        {product.isPublished ? 'Pasif Yap' : 'Aktif Et'}
                      </button>
                      {product.createdBy !== 'admin' && (
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Sil
                        </button>
                      )}
                    </div>
                    {product.createdBy === 'admin' && (
                      <p className="text-xs text-gray-500 mt-3 pt-3 border-t">
                        💡 Bu ürün admin tarafından eklenmiştir. Sadece aktif/pasif yapabilirsiniz. Değişiklik için kendi ürününüzü ekleyin.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
