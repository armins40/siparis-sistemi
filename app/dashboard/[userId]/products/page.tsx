'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getStore } from '@/lib/store';
import { compressImageForUpload } from '@/lib/image-compress';
import { getSectorLabel, getSectorIcon } from '@/lib/sectors';
import type { Product, Sector } from '@/lib/types';

export default function ProductsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params?.userId as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [addedAdminProductIds, setAddedAdminProductIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    stock: '',
    unit: 'adet',
  });
  const [activeTab, setActiveTab] = useState<'my-products' | 'ready-products'>('my-products');
  const [imageError, setImageError] = useState<string>('');
  const [imageLoadError, setImageLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedReadyProductIds, setSelectedReadyProductIds] = useState<Set<string>>(new Set());
  const [bulkAdding, setBulkAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);


  useEffect(() => {
    if (activeTab !== 'ready-products') {
      setSelectedReadyProductIds(new Set());
    }
  }, [activeTab]);

  // Dashboard ana sayfadan "Yeni Ürün Ekle" ile gelindiyse formu hemen aç
  useEffect(() => {
    if (searchParams.get('openForm') === '1') {
      setShowForm(true);
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: '', image: '', stock: '', unit: 'adet' });
      setImageError('');
      setImageLoadError(false);
      // URL'den parametreyi kaldır (yenilemede form tekrar açılmasın)
      if (typeof window !== 'undefined' && window.history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.delete('openForm');
        window.history.replaceState({}, '', url.pathname + (url.search || ''));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const loadProducts = async () => {
      if (!userId) {
        setProducts([]);
        setAdminProducts([]);
        return;
      }

      // Global kategorileri API'den al (admin panelinde eklenenler)
      let categoryNamesFromApi: string[] = [];
      try {
        const catRes = await fetch('/api/categories', { cache: 'no-store' });
        const catData = await catRes.json();
        if (catData.success && Array.isArray(catData.categories)) {
          categoryNamesFromApi = catData.categories.map((c: { name: string }) => c.name);
        }
      } catch (_) {}

      // Önce database'den kullanıcının kendi ürünlerini getir (API route)
      try {
        const response = await fetch(`/api/products/list?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' });
        const result = await response.json();

        if (result.success && result.products && Array.isArray(result.products)) {
          const userProducts = result.products.filter((p: Product) => p.createdBy !== 'admin');
          setProducts(userProducts);

          const userProductNames = new Set<string>(userProducts.map((p: Product) => p.name.toLowerCase().trim()));
          setAddedAdminProductIds(userProductNames);

          const userProductCategories = userProducts.map((p: Product) => p.category).filter((cat: string | undefined): cat is string => Boolean(cat));
          setCategories(prev => {
            const combined = Array.from(new Set([...categoryNamesFromApi, ...userProductCategories, ...prev]));
            return combined.sort();
          });
        }
      } catch (error) {
        console.error('Error loading products from API:', error);
      }

      // Hazır ürünleri her zaman yükle: tüm admin ürünleri (sektör ayrımı yok)
      try {
        const adminResponse = await fetch('/api/products/admin-by-sector', { cache: 'no-store' });
        const adminResult = await adminResponse.json();

        if (adminResult.success && adminResult.products && Array.isArray(adminResult.products)) {
          setAdminProducts(adminResult.products);

          const adminProductCategories = adminResult.products
            .map((p: Product) => p.category)
            .filter((cat: string | undefined): cat is string => Boolean(cat));
          setCategories(prev => {
            const combined = Array.from(new Set([...prev, ...adminProductCategories]));
            return combined.sort();
          });
        }
      } catch (error) {
        console.error('Error loading admin products:', error);
      }
    };

    loadProducts();
  }, [userId]);

  // Admin ürünlerini filtreleme - artık eklenen ürünler listeden silinmeyecek
  // Admin ürünleri şablon olarak kalacak, kullanıcılar istediği kadar ekleyebilir
  const filteredAdminProducts = useMemo(() => {
    // Tüm admin ürünlerini göster (filtreleme yok)
    return adminProducts;
  }, [adminProducts]);

  // Filtrelenmiş ürünler (arama ve kategori)
  const filteredProducts = useMemo(() => {
    const sourceProducts = activeTab === 'my-products' ? products : filteredAdminProducts;
    
    return sourceProducts.filter(product => {
      // Arama sorgusu kontrolü (ürün adı veya kategori)
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Kategori filtresi
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [activeTab, products, filteredAdminProducts, searchQuery, selectedCategory]);

  // Seçili hazır ürünler (ID'ye göre)
  const selectedReadyProducts = useMemo(() => {
    if (activeTab !== 'ready-products') return [];
    return filteredProducts.filter(p => p.createdBy === 'admin' && selectedReadyProductIds.has(p.id));
  }, [activeTab, filteredProducts, selectedReadyProductIds]);

  const toggleReadyProductSelection = (id: string) => {
    setSelectedReadyProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllReadyProducts = () => {
    const adminIds = filteredProducts.filter(p => p.createdBy === 'admin').map(p => p.id);
    setSelectedReadyProductIds(new Set(adminIds));
  };

  const clearReadyProductSelection = () => {
    setSelectedReadyProductIds(new Set());
  };

  const handleBulkAddReadyProducts = async () => {
    const store = getStore();
    const userSector = store?.sector;
    const currentUserId = params?.userId as string;
    const storeSlug = store?.slug || currentUserId;

    if (!userSector || !currentUserId) {
      alert('Lütfen önce Mağaza Ayarları\'ndan sektörünüzü seçin!');
      return;
    }

    if (selectedReadyProducts.length === 0) {
      alert('Lütfen en az bir ürün seçin.');
      return;
    }

    setBulkAdding(true);
    let successCount = 0;
    let errorCount = 0;

    const baseId = Date.now();
    for (let i = 0; i < selectedReadyProducts.length; i++) {
      const product = selectedReadyProducts[i];
      const newProduct = {
        id: `product_${baseId}_${i}_${Math.random().toString(36).substring(2, 9)}`,
        name: product.name,
        price: product.price,
        category: product.category,
        image: (product.image && product.image.trim() !== '') ? product.image : undefined,
        stock: product.stock || undefined,
        unit: product.unit || 'adet',
        sector: userSector,
        createdBy: 'user' as const,
        userId: currentUserId,
        isPublished: true,
        createdAt: new Date().toISOString(),
      };

      try {
        const response = await fetch('/api/products/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: newProduct, storeSlug }),
        });
        const result = await response.json();

        if (result.success) {
          successCount++;
          setAddedAdminProductIds(prev => new Set([...prev, product.name.toLowerCase().trim()]));
          setProducts(prev => [...prev, { ...newProduct, createdAt: newProduct.createdAt } as Product]);
        } else {
          errorCount++;
        }
      } catch {
        errorCount++;
      }
    }

    setBulkAdding(false);
    setSelectedReadyProductIds(new Set());

    if (successCount > 0) {
      setActiveTab('my-products');
      setTimeout(async () => {
        try {
          const reloadResponse = await fetch(`/api/products/list?userId=${encodeURIComponent(currentUserId)}`, { cache: 'no-store' });
          const reloadResult = await reloadResponse.json();
          if (reloadResult.success && reloadResult.products && Array.isArray(reloadResult.products)) {
            const userProducts = reloadResult.products.filter((p: Product) => p.createdBy !== 'admin');
            setProducts(userProducts);
            const names = new Set<string>(userProducts.map((p: Product) => p.name.toLowerCase().trim()));
            setAddedAdminProductIds(names);
          }
        } catch (e) {
          console.error('Error reloading products:', e);
        }
      }, 500);
    }

    alert(
      `✅ ${successCount} ürün mağazanıza eklendi (aktif - menüde görünür).` +
      (errorCount > 0 ? `\n⚠️ ${errorCount} ürün eklenirken hata oluştu.` : '')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const store = getStore();
    const userSector = store?.sector;
    const storeSlug = store?.slug; // Store slug (URL için)
    const currentUserId = params?.userId as string; // Gerçek kullanıcı ID'si (params'dan)
    
    if (!userSector || !storeSlug) {
      alert('Lütfen önce Mağaza Ayarları\'ndan sektörünüzü seçin!');
      return;
    }
    setSubmitting(true);
    
    // Validate image URL if provided
    if (formData.image.trim() && !formData.image.trim().startsWith('https://')) {
      setImageError('Görsel adresi https:// ile başlamalıdır');
      return;
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price) || 0,
      category: formData.category,
      image: formData.image.trim() || undefined,
      stock: formData.stock ? parseFloat(formData.stock) : undefined,
      unit: formData.unit || undefined,
      sector: userSector, // Kullanıcının sektörü
      createdBy: 'user' as const, // Kullanıcı eklediği ürünler
      userId: currentUserId, // Gerçek kullanıcı ID'si
    };
    
    try {
      if (editingProduct) {
        // Update product
        const updatedProduct = {
          ...editingProduct,
          ...productData,
        };
        
        // Update in database via API
        const response = await fetch('/api/products/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product: updatedProduct,
            storeSlug: storeSlug,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          setSubmitting(false);
          alert(`❌ Hata: ${result.error || 'Ürün güncellenirken bir hata oluştu'}`);
          return;
        }
        
        console.log('✅ Product updated in database');
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
        
        // Try database first (via API route)
        try {
          const response = await fetch('/api/products/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              product: newProduct,
              storeSlug: storeSlug,
            }),
          });

          const result = await response.json();

          if (!result.success) {
            setSubmitting(false);
            alert(`❌ Hata: ${result.error || 'Ürün kaydedilirken bir hata oluştu'}`);
            return;
          }
          
          console.log('✅ Product saved to database');
          // Hemen listeye ekle (önbellek yüzünden 2. ürün görünmeme sorununu önler)
          setProducts(prev => [...prev, newProduct as Product]);
        } catch (fetchError: any) {
          setSubmitting(false);
          console.error('❌ Error calling API:', fetchError);
          alert('⚠️ Ürün database\'e kaydedilemedi (API hatası).\n\nÜrün localStorage\'a kaydedildi (mobilde görünmeyebilir).');
          // Still save to localStorage as backup
          // No localStorage - database only
        }
      }
      
      setFormData({ name: '', price: '', category: '', image: '', stock: '', unit: 'adet' });
      setImageError('');
      setImageLoadError(false);
      setShowForm(false);
      setEditingProduct(null);
      setSubmitting(false);
      
      // Reload products (cache kullanma, güncel liste gelsin)
      if (currentUserId) {
        try {
          const response = await fetch(`/api/products/list?userId=${encodeURIComponent(currentUserId)}`, { cache: 'no-store' });
          const result = await response.json();
          
          if (result.success && result.products && Array.isArray(result.products)) {
            const userProducts = result.products.filter((p: Product) => p.createdBy !== 'admin');
            setProducts(userProducts);
            let categoryNamesFromApi: string[] = [];
            try {
              const catRes = await fetch('/api/categories', { cache: 'no-store' });
              const catData = await catRes.json();
              if (catData.success && Array.isArray(catData.categories)) {
                categoryNamesFromApi = catData.categories.map((c: { name: string }) => c.name);
              }
            } catch (_) {}
            const productCategories = userProducts.map((p: Product) => p.category).filter((cat: string | undefined): cat is string => Boolean(cat));
            const allCategoryNames = Array.from(new Set([...categoryNamesFromApi, ...productCategories]));
            setCategories(allCategoryNames.sort());
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        }
        
        try {
          const s = getStore()?.sector || 'all';
          const adminResponse = await fetch(`/api/products/admin-by-sector?sector=${encodeURIComponent(s)}`, { cache: 'no-store' });
          const adminResult = await adminResponse.json();
          if (adminResult.success && adminResult.products && Array.isArray(adminResult.products)) {
            setAdminProducts(adminResult.products);
          }
        } catch (error) {
          console.error('Error loading admin products:', error);
        }
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setSubmitting(false);
      alert('Ürün kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const onImageUrlChange = (v: string) => {
    const val = v.trim();
    setFormData(prev => ({ ...prev, image: val }));
    setImageError(val && !val.startsWith('https://') ? 'Geçerli bir https:// görsel adresi girin' : '');
    setImageLoadError(false);
  };

  const removeImage = () => {
    setImageError('');
    setImageLoadError(false);
    setFormData(prev => ({ ...prev, image: '' }));
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
    });
    // Reset image errors
    setImageError('');
    setImageLoadError(false);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const product = products.find(p => p.id === id);
    // Admin eklediği ürünleri silme (sadece kullanıcının kendi ürünlerini silebilir)
    if (product?.createdBy === 'admin') {
      alert('Admin tarafından eklenen ürünleri silemezsiniz. Sadece aktif/pasif yapabilirsiniz.');
      return;
    }
    
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) return;
    
    try {
      // Delete from database via API
      const response = await fetch(`/api/products/list?productId=${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!result.success) {
        alert(`❌ Hata: ${result.error || 'Ürün silinirken bir hata oluştu'}`);
        return;
      }
      
      console.log('✅ Product deleted from database');
      
      // Reload products from database
      const reloadResponse = await fetch(`/api/products/list?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' });
      const reloadResult = await reloadResponse.json();
      
      if (reloadResult.success && reloadResult.products) {
        const userProducts = reloadResult.products.filter((p: Product) => p.createdBy !== 'admin');
        setProducts(userProducts);
        let categoryNamesFromApi: string[] = [];
        try {
          const catRes = await fetch('/api/categories', { cache: 'no-store' });
          const catData = await catRes.json();
          if (catData.success && Array.isArray(catData.categories)) {
            categoryNamesFromApi = catData.categories.map((c: { name: string }) => c.name);
          }
        } catch (_) {}
        const productCategories: string[] = Array.from(new Set(userProducts.map((p: Product) => p.category).filter((cat: string | undefined): cat is string => Boolean(cat))));
        const allCategoryNames: string[] = Array.from(new Set<string>([...categoryNamesFromApi, ...productCategories]));
        setCategories(allCategoryNames.sort());
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Ürün silinirken bir hata oluştu.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ürünler</h1>
          <p className="text-gray-600 mt-1">Ürünlerinizi yönetin</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setEditingProduct(null);
            setFormData({ name: '', price: '', category: '', image: '', stock: '', unit: 'adet' });
            setImageError('');
            setImageLoadError(false);
          }}
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors font-medium [touch-action:manipulation] select-none"
        >
          + Yeni Ürün Ekle
        </button>
      </div>

      {/* Form Modal - z-[60] mobilde header (z-50) üstünde olsun */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 [touch-action:manipulation]">
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
                <label htmlFor="product-image" className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Görseli
                </label>
                <div className="space-y-3">
                  {/* File Upload Input */}
                  <input
                    type="file"
                    id="product-image-file"
                    accept="image/*"
                    capture="environment"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 10 * 1024 * 1024) {
                        setImageError('Dosya 10MB\'dan küçük olmalıdır.');
                        return;
                      }

                      setUploadingImage(true);
                      setImageError('');
                      try {
                        const { blob, contentType } = await compressImageForUpload(file);
                        const presignRes = await fetch('/api/upload-s3/presign', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ contentType, folder: 'products' }),
                        });
                        const presign = await presignRes.json();
                        if (!presign.success || !presign.uploadUrl || !presign.url) {
                          setImageError('Görsel yüklenirken hata: ' + (presign.error || 'Presigned URL alınamadı'));
                          return;
                        }

                        const putRes = await fetch(presign.uploadUrl, {
                          method: 'PUT',
                          body: blob,
                          headers: { 'Content-Type': contentType },
                        });
                        if (!putRes.ok) {
                          setImageError('Görsel S3\'e yüklenirken hata oluştu.');
                          return;
                        }
                        setFormData({ ...formData, image: presign.url });
                        setImageLoadError(false);
                      } catch (error) {
                        console.error('Upload error:', error);
                        setImageError('Görsel yüklenirken bir hata oluştu.');
                      } finally {
                        setUploadingImage(false);
                      }
                    }}
                    className="hidden"
                  />
                  
                  <div className="flex gap-2">
                    <label
                      htmlFor="product-image-file"
                      className="flex-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-900 transition-colors text-center text-sm"
                    >
                      {uploadingImage ? '⏳ Yükleniyor...' : '📷 Fotoğraf Çek / Seç'}
                    </label>
                    
                    {/* URL Input (fallback) */}
                    <input
                      type="url"
                      id="product-image"
                      name="product-image"
                      value={formData.image}
                      onChange={(e) => onImageUrlChange(e.target.value)}
                      placeholder="veya URL yapıştır..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                  
                  {imageError && (
                    <p className="text-xs text-red-600">{imageError}</p>
                  )}
                  {formData.image && (
                    <div className="relative">
                      <p className="text-xs text-gray-500 mb-2">Önizleme:</p>
                      <div className="relative inline-block">
                        {imageLoadError ? (
                          <div className="w-32 h-32 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-500 text-center p-2">
                            Görsel yüklenemedi. Adresi kontrol edin.
                          </div>
                        ) : (
                          <img
                            src={formData.image.trim()}
                            alt="Görsel önizleme"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                            onError={() => setImageLoadError(true)}
                            onLoad={() => setImageLoadError(false)}
                          />
                        )}
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
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Ekleniyor...' : editingProduct ? 'Güncelle' : 'Ekle'}
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

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-1 mb-6">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('my-products')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'my-products'
                ? 'bg-gray-900 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            📦 Benim Ürünlerim ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('ready-products')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'ready-products'
                ? 'bg-gray-900 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            🎁 Hazır Ürünler ({filteredAdminProducts.length})
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      {(products.length > 0 || filteredAdminProducts.length > 0) && (
        <div className="bg-white rounded-xl shadow-lg p-4 space-y-4">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1">
              <label htmlFor="product-search" className="sr-only">
                Ürün ara
              </label>
              <input
                type="text"
                id="product-search"
                placeholder="Ürün adı veya kategori ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="sm:w-64">
              <label htmlFor="category-filter" className="sr-only">
                Kategori filtresi
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Filtreleri temizle"
              >
                ✕ Temizle
              </button>
            )}
          </div>
          {filteredProducts.length !== (activeTab === 'my-products' ? products.length : filteredAdminProducts.length) && (
            <p className="text-sm text-gray-600">
              {filteredProducts.length} ürün bulundu
            </p>
          )}
        </div>
      )}

      {/* Products Grid */}
      <>
        {activeTab === 'my-products' && products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Henüz ürün eklenmemiş
            </h3>
            <p className="text-gray-600 mb-6">
              {getStore()?.sector ? (
                <>Sektörünüze ({getSectorIcon(getStore()?.sector)} {getSectorLabel(getStore()?.sector)}) özel admin ürünleri ve<br />kendi ürünleriniz burada görünecek.</>
              ) : (
                <>Hazır ürünlerden ekleyebilir veya kendi ürünlerinizi oluşturabilirsiniz.</>
              )}
            </p>
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingProduct(null);
                  setFormData({ name: '', price: '', category: '', image: '', stock: '', unit: 'adet' });
                }}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                + İlk Ürünü Ekle
              </button>
            </div>
        ) : activeTab === 'ready-products' && filteredAdminProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Henüz hazır ürün yok
            </h3>
            <p className="text-gray-600 mb-6">
              {getStore()?.sector
                ? <>Sektörünüze ({getSectorIcon(getStore()?.sector)} {getSectorLabel(getStore()?.sector)}) özel admin ürünleri burada görünecek.<br />Admin ürünleri eklediğinde burada görünecektir.</>
                : <>Admin panelinden eklenen hazır ürünler burada görünecek. Mağaza ayarlarından sektör seçerseniz sektörünüze özel ürünler listelenir.</>
              }
            </p>
          </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Arama sonucu bulunamadı
              </h3>
              <p className="text-gray-600 mb-6">
                Arama kriterlerinize uygun ürün bulunamadı.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'ready-products' && filteredProducts.some(p => p.createdBy === 'admin') && (
                <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={selectAllReadyProducts}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Tümünü Seç
                  </button>
                  <button
                    type="button"
                    onClick={clearReadyProductSelection}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Seçimi Kaldır
                  </button>
                  {selectedReadyProductIds.size > 0 && (
                    <button
                      type="button"
                      onClick={handleBulkAddReadyProducts}
                      disabled={bulkAdding}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {bulkAdding ? '⏳ Ekleniyor...' : `📦 Toplu Ürün Ekle (${selectedReadyProductIds.size})`}
                    </button>
                  )}
                  {selectedReadyProductIds.size > 0 && (
                    <span className="text-sm text-gray-500">
                      {selectedReadyProductIds.size} ürün seçildi
                    </span>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative"
                >
                  {activeTab === 'ready-products' && product.createdBy === 'admin' && (
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={selectedReadyProductIds.has(product.id)}
                        onChange={() => toggleReadyProductSelection(product.id)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`${product.name} seç`}
                      />
                    </div>
                  )}
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
                      {activeTab === 'ready-products' && product.createdBy === 'admin' ? (
                        <div className="flex flex-col gap-2 w-full">
                          <button
                            onClick={async () => {
                              const store = getStore();
                              const userSector = store?.sector;
                              const currentUserId = params?.userId as string;
                              const storeSlug = store?.slug || currentUserId;
                              
                              if (!userSector || !currentUserId) {
                                alert('Lütfen önce Mağaza Ayarları\'ndan sektörünüzü seçin!');
                                return;
                              }
                              
                              // Admin ürününü kullanıcının mağazasına kopyala (aktif)
                              const newProduct = {
                                id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                                name: product.name,
                                price: product.price,
                                category: product.category,
                                image: (product.image && product.image.trim() !== '') ? product.image : undefined,
                                stock: product.stock || undefined,
                                unit: product.unit || 'adet',
                                sector: userSector,
                                createdBy: 'user' as const,
                                userId: currentUserId,
                                isPublished: true,
                                createdAt: new Date().toISOString(),
                              };
                              
                              try {
                                console.log('📤 Sending product to API:', {
                                  productName: newProduct.name,
                                  userId: newProduct.userId,
                                  storeSlug: currentUserId,
                                  isPublished: newProduct.isPublished
                                });
                                
                                const response = await fetch('/api/products/create', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    product: newProduct,
                                    storeSlug: storeSlug,
                                  }),
                                });

                                const result = await response.json();
                                console.log('📥 API Response:', result);

                                if (result.success) {
                                  setAddedAdminProductIds(prev => new Set([...prev, product.name.toLowerCase().trim()]));
                                  setActiveTab('my-products');
                                  
                                  const addedProduct: Product = {
                                    ...newProduct,
                                    createdAt: new Date().toISOString(),
                                  };
                                  setProducts(prev => [...prev, addedProduct]);
                                  
                                  alert('✅ Ürün mağazanıza eklendi! (Aktif - menüde görünür.)');
                                  
                                  setTimeout(async () => {
                                    try {
                                      const reloadResponse = await fetch(`/api/products/list?userId=${encodeURIComponent(currentUserId)}`, { cache: 'no-store' });
                                      const reloadResult = await reloadResponse.json();
                                      
                                      if (reloadResult.success && reloadResult.products && Array.isArray(reloadResult.products)) {
                                        const userProducts = reloadResult.products.filter((p: Product) => p.createdBy !== 'admin');
                                        setProducts(userProducts);
                                        const userProductNames = new Set<string>(userProducts.map((p: Product) => p.name.toLowerCase().trim()));
                                        setAddedAdminProductIds(userProductNames);
                                      }
                                    } catch (reloadError) {
                                      console.error('❌ Error reloading products:', reloadError);
                                    }
                                  }, 500);
                                } else {
                                  alert('⚠️ Ürün eklenirken bir hata oluştu: ' + (result.error || 'Bilinmeyen hata'));
                                }
                              } catch (error) {
                                console.error('Error adding product:', error);
                                alert('⚠️ Ürün eklenirken bir hata oluştu.');
                              }
                            }}
                            className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                          >
                            ➕ Mağazama Ekle
                          </button>
                          <button
                            onClick={() => {
                              // Hazır ürünü düzenleme moduna al (kullanıcının kendi ürünü olarak kaydedilecek)
                              const store = getStore();
                              const userSector = store?.sector;
                              const currentUserId = params?.userId as string;
                              
                              if (!userSector || !currentUserId) {
                                alert('Lütfen önce Mağaza Ayarları\'ndan sektörünüzü seçin!');
                                return;
                              }
                              
                              // Admin ürününü kullanıcı ürünü olarak düzenleme moduna al
                              const editableProduct: Product = {
                                ...product,
                                id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Yeni ID
                                createdBy: 'user',
                                userId: currentUserId,
                                sector: userSector,
                                isPublished: true, // Düzenleme sonrası aktif olacak
                              };
                              
                              handleEdit(editableProduct);
                            }}
                            className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                          >
                            ✏️ Düzenle
                          </button>
                        </div>
                      ) : (
                        <>
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
                              // Toggle publish status - Update product in database with new isPublished status
                              const updatedProduct = {
                                ...product,
                                isPublished: !product.isPublished
                              };
                              
                              // Update via API
                              const response = await fetch('/api/products/list', {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  product: updatedProduct,
                                }),
                              });
                              
                              const result = await response.json();
                              if (!result.success) {
                                alert(`❌ Hata: ${result.error || 'Ürün durumu güncellenemedi'}`);
                                return;
                              }
                              
                              console.log('✅ Product publish status updated in DB');
                              
                              // Reload products from database
                              try {
                                const response = await fetch(`/api/products/list?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' });
                                const result = await response.json();
                                
                                if (result.success && result.products) {
                                  const userProducts = result.products.filter((p: Product) => p.createdBy !== 'admin');
                                  setProducts(userProducts);
                                }
                              } catch (error) {
                                console.error('Error reloading products:', error);
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
                        </>
                      )}
                    </div>
                    {product.createdBy === 'admin' && (
                      <p className="text-xs text-gray-500 mt-3 pt-3 border-t">
                        {addedAdminProductIds.has(product.name.toLowerCase().trim()) 
                          ? '💡 Bu ürünü zaten mağazanıza eklediniz. Tekrar ekleyebilir veya "Benim Ürünlerim" sekmesinde düzenleyebilirsiniz.'
                          : '💡 Bu ürün admin tarafından eklenmiştir. "Mağazama Ekle" ile kendi mağazanıza ekleyebilirsiniz.'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </>
    </div>
  );
}
