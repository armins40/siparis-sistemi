'use client';

import { useEffect, useState } from 'react';
import { isAdminAuthenticated } from '@/lib/admin';
import { SECTORS, getSectorLabel, getSectorIcon } from '@/lib/sectors';
import { compressImageForUpload } from '@/lib/image-compress';
import type { Product, Sector } from '@/lib/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkProductsText, setBulkProductsText] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | 'all'>('all');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    stock: '',
    unit: 'adet',
    sector: '' as Sector | 'all' | '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (!isAdminAuthenticated()) return;
    loadCategories();
  }, []);

  useEffect(() => {
    if (!isAdminAuthenticated()) return;
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSector]);

  useEffect(() => {
    if (!isAdminAuthenticated()) return;
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch admin products from database via API
      const sectorParam = selectedSector !== 'all' ? `?sector=${selectedSector}` : '';
      const response = await fetch(`/api/admin/products${sectorParam}`, { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.products) {
        setProducts(result.products);
      } else {
        throw new Error(result.error || 'Products could not be loaded');
      }
    } catch (err: any) {
      console.error('Error loading products from API:', err);
      setError(err?.message || 'Ürünler yüklenirken bir hata oluştu');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedSector]);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories', { cache: 'no-store', credentials: 'include' });
      const data = await res.json();
      const categoryNames = (data.success && Array.isArray(data.categories))
        ? data.categories.map((c: { name: string }) => c.name)
        : [];
      const productCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
      const allCategoryNames = Array.from(new Set([...categoryNames, ...productCategories]));
      setCategories(allCategoryNames.sort());
    } catch (_) {
      const productCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
      setCategories(productCategories.sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      stock: formData.stock ? parseFloat(formData.stock) : undefined,
      unit: formData.unit,
      sector: (formData.sector === 'all' ? 'all' : formData.sector) as Sector | 'all', // 'all' veya Sector
      createdBy: 'admin' as const, // Admin eklediği ürünler
      isPublished: editingProduct?.isPublished || false, // Admin eklediği ürünler varsayılan olarak pasif
    };

    try {
      if (editingProduct) {
        // Update - sadece database'e kaydet
        const updatedProduct = {
          ...editingProduct,
          ...productData,
        };
        
        const response = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: updatedProduct }),
          credentials: 'include',
        });
        
        const result = await response.json();
        if (!result.success) {
          alert(`❌ Hata: ${result.error || 'Ürün güncellenirken bir hata oluştu'}`);
          return;
        }
      } else {
        // Create - Yeni ürün
        const newProduct = {
          id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          ...productData,
          isPublished: false, // Admin eklediği ürünler varsayılan olarak pasif
          createdAt: new Date().toISOString(),
          userId: undefined, // Admin ürünleri user_id'ye sahip değil
        };
        
        // Database'e kaydet
        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: newProduct }),
          credentials: 'include',
        });

        const result = await response.json();
        if (!result.success) {
          alert(`❌ Hata: ${result.error || 'Ürün oluşturulurken bir hata oluştu'}`);
          return;
        }
      }
      
      await loadProducts();
      loadCategories();
      handleCloseModal();
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      alert(err?.message || 'Ürün kaydedilirken bir hata oluştu');
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
    setImagePreview(product.image || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
      return;
    }
    
    try {
      // Delete from database
      const response = await fetch(`/api/admin/products?productId=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (!result.success) {
        alert(`❌ Hata: ${result.error || 'Ürün silinirken bir hata oluştu'}`);
        return;
      }
      
      alert('✅ Ürün başarıyla silindi.');
      await loadProducts();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      alert('❌ Ürün silinirken bir hata oluştu.');
    }
  };

  const handleDeleteAllAdminProducts = async () => {
    const adminProducts = products.filter(p => p.createdBy === 'admin');
    const adminProductsCount = adminProducts.length;
    
    if (adminProductsCount === 0) {
      alert('Silinecek admin ürünü bulunamadı.');
      return;
    }
    
    if (!confirm(`Tüm admin ürünlerini (${adminProductsCount} adet) silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) {
      return;
    }
    
    try {
      // Delete from database
      const response = await fetch('/api/admin/products/delete-all', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (!result.success) {
        alert(`❌ Hata: ${result.error || 'Admin ürünleri silinirken bir hata oluştu'}`);
        return;
      }
      
      // No localStorage - database only
      
      alert(`✅ ${result.deletedCount || adminProductsCount} admin ürünü başarıyla silindi.`);
      loadProducts();
    } catch (error) {
      console.error('Error deleting all admin products:', error);
      alert('❌ Admin ürünleri silinirken bir hata oluştu.');
    }
  };

  const handleTogglePublish = async (product: Product) => {
    try {
      const updatedProduct = {
        ...product,
        isPublished: !product.isPublished,
      };
      
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: updatedProduct }),
        credentials: 'include',
      });
      
      const result = await response.json();
      if (!result.success) {
        alert(`❌ Hata: ${result.error || 'Ürün durumu güncellenirken bir hata oluştu'}`);
        return;
      }
      
      await loadProducts();
    } catch (err: any) {
      console.error('Error toggling product publish:', err);
      alert('❌ Ürün durumu güncellenirken bir hata oluştu.');
    }
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
    setImagePreview('');
  };

  const isImageUrl = (s: string) => /^https?:\/\//i.test((s || '').trim());
  const pullImageFromParts = (parts: string[]): { parts: string[]; image?: string } => {
    const p = [...parts];
    let image: string | undefined;
    while (p.length > 0 && isImageUrl(p[p.length - 1] || '')) {
      image = (p.pop() || '').trim();
    }
    return { parts: p, image };
  };

  const parseBulkProducts = (text: string): Array<{ name: string; category: string; price: number; stock?: number; unit?: string; image?: string }> => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const products: Array<{ name: string; category: string; price: number; stock?: number; unit?: string; image?: string }> = [];
    const seen = new Set<string>();
    
    for (const line of lines) {
      // Skip empty lines, category headers, and lines that are just category names
      if (!line || line.startsWith('*') || line.match(/^[A-ZÇĞİÖŞÜ\s&]+$/)) {
        continue;
      }
      
      // Remove leading * and spaces
      let cleaned = line.replace(/^\*\s*/, '').trim();
      
      let category = '';
      let name = '';
      let price = 0;
      let stock: number | undefined = undefined;
      let unit = 'adet';
      let image: string | undefined;

      if (cleaned.includes(':') && cleaned.includes('-')) {
        const colonIndex = cleaned.indexOf(':');
        category = cleaned.substring(0, colonIndex).trim();
        const rest = cleaned.substring(colonIndex + 1).trim();
        let dashParts = rest.split('-').map(p => p.trim());
        const pulled = pullImageFromParts(dashParts);
        dashParts = pulled.parts;
        image = pulled.image;
        name = dashParts[0] || '';
        const priceStr = dashParts[1] || '';
        price = parsePrice(priceStr);
        if (dashParts.length >= 3) {
          const third = dashParts[2] || '';
          const num = parseFloat(third.replace(/[^\d.,]/g, '').replace(',', '.'));
          if (!Number.isNaN(num) && num >= 0) stock = num;
          else if (third) unit = third;
        }
        if (dashParts.length >= 4 && unit === 'adet') unit = dashParts[3] || 'adet';
      }
      // Format 2: "Ürün Adı: Fiyat TL" or "Ürün Adı fiyatı: Fiyat TL" (auto-detect category)
      else if (cleaned.includes(':') || cleaned.match(/fiyatı?\s*:/i)) {
        const priceMatch = cleaned.match(/(?:fiyatı|fiyat)?:\s*([\d.,\s]+)\s*TL/i);
        if (priceMatch) {
          price = parsePrice(priceMatch[1]);
          name = cleaned.substring(0, priceMatch.index).replace(/fiyatı?\s*$/i, '').trim();
          category = detectCategory(name);
        } else {
          // Simple format: "Ürün: Fiyat"
          const parts = cleaned.split(':').map(p => p.trim());
          if (parts.length >= 2) {
            name = parts[0];
            price = parsePrice(parts[1]);
            category = detectCategory(name);
          }
        }
      }
      else if (cleaned.includes('-')) {
        let parts = cleaned.split('-').map(p => p.trim());
        const pulled = pullImageFromParts(parts);
        parts = pulled.parts;
        image = pulled.image;
        if (parts.length >= 2) {
          name = parts[0];
          price = parsePrice(parts[1]);
          category = detectCategory(name);
          if (parts.length >= 3) {
            const third = parts[2] || '';
            const num = parseFloat(third.replace(/[^\d.,]/g, '').replace(',', '.'));
            if (!Number.isNaN(num) && num >= 0) stock = num;
            else if (third) unit = third;
          }
          if (parts.length >= 4 && unit === 'adet') unit = parts[3] || 'adet';
        }
      }
      
      if (!name || price <= 0) {
        continue;
      }
      
      // If category not detected, use default
      if (!category) {
        category = 'Genel';
      }
      
      // Check for duplicates
      const key = `${name.toLowerCase()}-${price}`;
      if (seen.has(key)) {
        continue; // Skip duplicate
      }
      seen.add(key);

      products.push({ name: name.trim(), category, price, stock, unit, ...(image ? { image } : {}) });
    }

    return products;
  };

  const parsePrice = (priceStr: string): number => {
    if (!priceStr) return 0;
    
    // Remove TL, spaces, and trim
    let cleaned = priceStr.replace(/TL/g, '').replace(/\s/g, '').trim();
    
    if (!cleaned) return 0;
    
    // Handle Turkish number format:
    // - "1.250,50" -> 1250.50 (thousands separator: dot, decimal: comma)
    // - "1,250.50" -> 1250.50 (thousands separator: comma, decimal: dot) - English format
    // - "110" -> 110 (simple number)
    // - "1.250" -> 1250 (thousands separator, no decimal)
    
    // Check if it has both dot and comma
    const hasDot = cleaned.includes('.');
    const hasComma = cleaned.includes(',');
    
    if (hasDot && hasComma) {
      // Determine which is thousands separator and which is decimal
      const lastDot = cleaned.lastIndexOf('.');
      const lastComma = cleaned.lastIndexOf(',');
      
      if (lastComma > lastDot) {
        // Format: "1.250,50" (Turkish - dot for thousands, comma for decimal)
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        // Format: "1,250.50" (English - comma for thousands, dot for decimal)
        cleaned = cleaned.replace(/,/g, '');
      }
    } else if (hasDot) {
      // Could be "1.250" (thousands) or "1250.50" (decimal)
      // If there's only one dot and it's not at the end, it's likely thousands separator
      const dotCount = (cleaned.match(/\./g) || []).length;
      if (dotCount === 1 && cleaned.split('.')[1].length <= 3) {
        // Likely thousands separator (e.g., "1.250")
        cleaned = cleaned.replace(/\./g, '');
      }
      // Otherwise keep as is (decimal separator)
    } else if (hasComma) {
      // Could be "1250,50" (decimal) or "1,250" (thousands)
      const commaCount = (cleaned.match(/,/g) || []).length;
      if (commaCount === 1 && cleaned.split(',')[1].length <= 3) {
        // Likely decimal separator (e.g., "1250,50")
        cleaned = cleaned.replace(',', '.');
      } else {
        // Likely thousands separator (e.g., "1,250")
        cleaned = cleaned.replace(/,/g, '');
      }
    }
    
    const price = parseFloat(cleaned);
    return isNaN(price) ? 0 : price;
  };

  const detectCategory = (productName: string): string => {
    const name = productName.toLowerCase();
    
    // Biralar
    if (name.includes('efes') || name.includes('tuborg') || name.includes('bira')) {
      return 'Biralar';
    }
    
    // Viskiler
    if (name.includes('johnnie walker') || name.includes('chivas') || name.includes('jameson') || 
        name.includes('ballantine') || name.includes('glenlivet') || name.includes('aberlour') ||
        name.includes('viski') || name.includes('whisky') || name.includes('wisers') ||
        name.includes('pike creek') || name.includes('scapa') || name.includes('singleton') ||
        name.includes('cardhu') || name.includes('mortlach') || name.includes('clynelish') ||
        name.includes('caol ila') || name.includes('glenkinchie') || name.includes('talisker') ||
        name.includes('lagavulin') || name.includes('royal salute') || name.includes('aberfeldy') ||
        name.includes('royal brackla') || name.includes('craigellachie') || name.includes('teeling') ||
        name.includes('dewar')) {
      return 'Viskiler';
    }
    
    // Cinler
    if (name.includes('gordon') || name.includes('gilbey') || name.includes('tanqueray') ||
        name.includes('beefeater') || name.includes('malfy') || name.includes('monkey') ||
        name.includes('cork dry gin') || name.includes('bombay') || name.includes('oxley') ||
        name.includes('cin') || name.includes('gin')) {
      return 'Cinler';
    }
    
    // Tekilalar
    if (name.includes('don julio') || name.includes('casamigos') || name.includes('olmeca') ||
        name.includes('codigo') || name.includes('patron') || name.includes('tequila') ||
        name.includes('tekila')) {
      return 'Tekilalar';
    }
    
    // Votkalar
    if (name.includes('absolut') || name.includes('wyborowa') || name.includes('grey goose') ||
        name.includes('smirnoff') || name.includes('istanblue') || name.includes('bazooka') ||
        name.includes('ketel one') || name.includes('ciroc') || name.includes('votka')) {
      return 'Votkalar';
    }
    
    // Romlar
    if (name.includes('havana club') || name.includes('bumbu') || name.includes('santa teresa') ||
        name.includes('bacardi') || name.includes('rom')) {
      return 'Romlar';
    }
    
    // Likörler
    if (name.includes('kahlua') || name.includes('malibu') || name.includes('st germain') ||
        name.includes('likör') || name.includes('liqueur')) {
      return 'Likörler';
    }
    
    // Şampanya & Köpüklü Şarap
    if (name.includes('mumm') || name.includes('luc belaire') || name.includes('cafe de paris') ||
        name.includes('garonne prosecco') || name.includes('martini prosecco') ||
        name.includes('martini asti') || name.includes('martini brut') ||
        name.includes('şampanya') || name.includes('köpüklü şarap')) {
      return 'Şaraplar';
    }
    
    // Konyak & Brendi
    if (name.includes('martell') || name.includes('konyak') || name.includes('brendi') ||
        name.includes('cognac') || name.includes('brandy')) {
      return 'Konyak & Brendi';
    }
    
    // Rakılar
    if (name.includes('sarı zeybek') || name.includes('efe') || name.includes('rakı')) {
      return 'Rakılar';
    }
    
    // Mezcal
    if (name.includes('del maguey') || name.includes('ojo de tigre') || name.includes('mezcal')) {
      return 'Mezcal';
    }
    
    // Vermut
    if (name.includes('martini fiero') || name.includes('martini extra dry') ||
        name.includes('martini rosso') || name.includes('vermut')) {
      return 'Vermut';
    }
    
    // Düziko
  if (name.includes('düziko') || name.includes('özem')) {
    return 'Düziko';
  }
  
  // Sigara / Tütün Ürünleri
  if (name.includes('parliament') || name.includes('marlboro') || name.includes('kent') ||
      name.includes('winston') || name.includes('camel') || name.includes('davidoff') ||
      name.includes('muratti') || name.includes('l&m') || name.includes('chesterfield') ||
      name.includes('lark') || name.includes('rothmans') || name.includes('viceroy') ||
      name.includes('pall mall') || name.includes('tekel 2000') || name.includes('tekel 2001') ||
      name.includes('west') || name.includes('monte carlo') || name === 'ld' || name.includes(' ld ') || name.startsWith('ld ') ||
      name.includes('medley') || name.includes('mmc') || name.includes('hazar') ||
      name.includes('toros') || name.includes('captain black') || name.includes('sigara')) {
    return 'Sigara';
  }
  
  return 'Genel';
};

  const handleBulkSubmit = async () => {
    if (!bulkProductsText.trim()) {
      alert('Lütfen ürün listesini girin');
      return;
    }

    if (!formData.sector || (formData.sector as string) === 'all' || (formData.sector as string) === '') {
      alert('Lütfen önce sektör seçin!');
      return;
    }

    // Parse products from text using parseBulkProducts function
    const productsToAdd = parseBulkProducts(bulkProductsText);
    
    console.log('📦 Parsed products:', productsToAdd.length, productsToAdd.slice(0, 5));
    
    if (productsToAdd.length === 0) {
      alert('Geçerli ürün bulunamadı. Lütfen formatı kontrol edin.\n\nFormat: "Kategori: Ürün Adı - Fiyat" veya satır sonuna " - https://resim-url" ekleyerek ürün resmi belirtebilirsiniz.');
      return;
    }

    if (!confirm(`${productsToAdd.length} ürün eklemek istediğinize emin misiniz?\n\nKategoriler otomatik belirlenecek ve aynı ürünler atlanacak.`)) {
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    const errors: string[] = [];

    // First, load existing products to check for duplicates
    const existingProducts = products.filter(p => p.createdBy === 'admin');
    const existingKeys = new Set(existingProducts.map(p => `${p.name.toLowerCase()}-${p.price}`));

    for (const productData of productsToAdd) {
      const key = `${productData.name.toLowerCase()}-${productData.price}`;
      
      // Skip if already exists
      if (existingKeys.has(key)) {
        duplicateCount++;
        continue;
      }
      
      try {
        const newProduct: Product = {
          id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name: productData.name,
          price: productData.price,
          category: productData.category,
          stock: productData.stock,
          unit: productData.unit || 'adet',
          image: productData.image?.trim() || undefined,
          sector: ((formData.sector as string) === 'all' ? 'all' : formData.sector) as Sector,
          createdBy: 'admin',
          isPublished: false,
          createdAt: new Date().toISOString(),
        };

        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: newProduct }),
          credentials: 'include',
        });

        const result = await response.json();
        if (result.success) {
          successCount++;
          existingKeys.add(key); // Add to existing to prevent duplicates in same batch
          console.log('✅ Product added:', productData.name);
        } else {
          errorCount++;
          const errorMsg = result.error || 'Bilinmeyen hata';
          errors.push(`${productData.name}: ${errorMsg}`);
          console.error('❌ Failed to add product:', productData.name, errorMsg);
        }
      } catch (error: any) {
        errorCount++;
        errors.push(`${productData.name}: ${error?.message || 'Bilinmeyen hata'}`);
      }
    }

    let message = `✅ ${successCount} ürün başarıyla eklendi.`;
    if (duplicateCount > 0) {
      message += `\n⚠️ ${duplicateCount} ürün atlandı (zaten mevcut).`;
    }
    if (errorCount > 0) {
      message += `\n❌ ${errorCount} ürün eklenirken hata oluştu.`;
      if (errors.length > 0) {
        message += `\n\nHatalar:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... ve ${errors.length - 5} hata daha` : ''}`;
      }
    }
    
    alert(message);
    
    setBulkProductsText('');
    setShowBulkForm(false);
    await loadProducts();
    loadCategories();
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
        <div className="flex gap-3">
          <button
            onClick={handleDeleteAllAdminProducts}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            🗑️ Tüm Admin Ürünlerini Sil
          </button>
          <button
            onClick={() => setShowBulkForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            📦 Toplu Ürün Ekle
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            ➕ Yeni Ürün Ekle
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-4 space-y-4">
        <div className="flex gap-4">
          <label htmlFor="admin-product-search" className="sr-only">
            Ürün ara
          </label>
          <input
            type="text"
            id="admin-product-search"
            name="admin-product-search"
            placeholder="Ürün adı veya kategori ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <label htmlFor="admin-product-sector-filter" className="sr-only">
            Sektör filtresi
          </label>
          <select
            id="admin-product-sector-filter"
            name="admin-product-sector-filter"
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
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">❌ {error}</p>
            <button
              onClick={loadProducts}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Yeniden Dene
            </button>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
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
                    onClick={() => handleTogglePublish(product)}
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
      {/* Bulk Products Modal */}
      {showBulkForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📦 Toplu Ürün Ekle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sektör *
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value as Sector | 'all' | '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Sektör Seçin</option>
                  <option value="all">Tüm Sektörler</option>
                  {SECTORS.map((sector) => (
                    <option key={sector.value} value={sector.value}>
                      {sector.icon} {sector.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Listesi (Her satıra bir ürün)
                </label>
                <textarea
                  value={bulkProductsText}
                  onChange={(e) => setBulkProductsText(e.target.value)}
                  placeholder={`Örnek formatlar:
Biralar: Efes Pilsen - 100
Biralar: Tuborg - 120 - 50 - adet
Meyve & Sebze: Elma - 25 - 10 - kg
sebzeler: Domates - 30
Biralar: Efes Kutu - 110 - https://example.com/efes.png`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent h-64 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Format: <strong>Kategori: Ürün Adı - Fiyat</strong> veya <strong>Fiyat - Stok - Birim</strong>. İsteğe bağlı: satır sonuna <strong> - https://resim-url</strong> ekleyerek ürün resmi kullanılır.
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleBulkSubmit}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Ürünleri Ekle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkForm(false);
                    setBulkProductsText('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <label htmlFor="admin-product-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  id="admin-product-name"
                  name="admin-product-name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label htmlFor="admin-product-sector" className="block text-sm font-medium text-gray-700 mb-2">
                  Sektör *
                </label>
                <select
                  id="admin-product-sector"
                  name="admin-product-sector"
                  required
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value as Sector | 'all' })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Sektör Seçin</option>
                  <option value="all">🌐 Tüm Sektörler</option>
                  {SECTORS.map((sector) => (
                    <option key={sector.value} value={sector.value}>
                      {sector.icon} {sector.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  "Tüm Sektörler" seçilirse ürün her sektörde görünecektir.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="admin-product-price" className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    id="admin-product-price"
                    name="admin-product-price"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label htmlFor="admin-product-category" className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <input
                    type="text"
                    id="admin-product-category"
                    name="admin-product-category"
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
                  <label htmlFor="admin-product-stock" className="block text-sm font-medium text-gray-700 mb-2">
                    Stok (Opsiyonel)
                  </label>
                  <input
                    type="number"
                    id="admin-product-stock"
                    name="admin-product-stock"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label htmlFor="admin-product-unit" className="block text-sm font-medium text-gray-700 mb-2">
                    Birim
                  </label>
                  <select
                    id="admin-product-unit"
                    name="admin-product-unit"
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
                <label htmlFor="admin-product-image" className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Görseli (Opsiyonel)
                </label>
                
                {/* File Upload Input */}
                <input
                  type="file"
                  id="admin-product-image-file"
                  accept="image/*"
                  capture="environment"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 10 * 1024 * 1024) {
                      alert('Dosya 10MB\'dan küçük olmalıdır.');
                      return;
                    }

                    setUploadingImage(true);
                    try {
                      const { blob, contentType } = await compressImageForUpload(file);
                      const presignRes = await fetch('/api/upload-s3/presign', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contentType, folder: 'products' }),
                      });
                      const presign = await presignRes.json();
                      if (!presign.success || !presign.uploadUrl || !presign.url) {
                        alert('Görsel yüklenirken hata: ' + (presign.error || 'Presigned URL alınamadı'));
                        return;
                      }

                      const putRes = await fetch(presign.uploadUrl, {
                        method: 'PUT',
                        body: blob,
                        headers: { 'Content-Type': contentType },
                      });
                      if (!putRes.ok) {
                        alert('Görsel S3\'e yüklenirken hata oluştu.');
                        return;
                      }
                      setFormData({ ...formData, image: presign.url });
                      setImagePreview(presign.url);
                    } catch (error) {
                      console.error('Upload error:', error);
                      alert('Görsel yüklenirken bir hata oluştu.');
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                  className="hidden"
                />
                
                <div className="flex gap-2">
                  <label
                    htmlFor="admin-product-image-file"
                    className="flex-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors text-center"
                  >
                    {uploadingImage ? '⏳ Yükleniyor...' : '📷 Fotoğraf Çek / Seç'}
                  </label>
                  
                  {/* URL Input (fallback) */}
                  <input
                    type="url"
                    id="admin-product-image"
                    name="admin-product-image"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="veya URL yapıştır..."
                  />
                </div>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                      onError={() => setImagePreview('')}
                    />
                  </div>
                )}
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
