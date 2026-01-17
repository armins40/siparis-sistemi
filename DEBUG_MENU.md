# Menü Sayfası Debug Rehberi

## 🔍 Sorun: Telefonda Ürünler Görünmüyor

### Yapılan Düzeltmeler

1. **Debug Logları Eklendi**
   - Menü sayfası açıldığında console'da detaylı loglar göreceksiniz
   - Database'den veri çekme sürecini takip edebilirsiniz

2. **Direkt Slug Araması**
   - Kullanıcı database'de yoksa bile, ürünler direkt slug ile aranıyor
   - `getProductsByStoreSlugFromDB(slug)` ile direkt arama yapılıyor

3. **Ürün Kaydetme İyileştirmeleri**
   - `store_slug` doğru kaydediliyor
   - Debug logları eklendi

## 🧪 Test Adımları

### 1. Browser Console'u Açın

**Web'de (Dashboard):**
1. F12 → Console sekmesi
2. Ürün ekleyin
3. Console'da şunları görmelisiniz:
   ```
   📦 Creating product: {name: "...", storeSlug: "...", ...}
   💾 Saving product to DB: {...}
   ✅ Product saved to DB successfully
   ```

**Telefonda (Menü Sayfası):**
1. Chrome'da menüyü açın
2. F12 → Console (veya remote debugging)
3. Console'da şunları görmelisiniz:
   ```
   🔍 Loading menu data for slug: your-slug
   👤 User from DB: Found/Not found
   📦 Products from DB: X
   ✅ Final products count: X
   ```

### 2. Kontrol Edilecekler

**Ürün Eklerken:**
- ✅ Console'da "✅ Product saved to DB successfully" görünmeli
- ✅ `store_slug` doğru kaydedilmeli (store?.slug değeri)

**Menü Açarken:**
- ✅ Console'da "📦 Found products: X" görünmeli (X > 0)
- ✅ Eğer "📦 Found products: 0" görüyorsanız:
  - Ürünler `is_published = false` olabilir
  - `store_slug` eşleşmiyor olabilir

### 3. Yayın Durumu Kontrolü

**Önemli:** Ürünler varsayılan olarak **pasif** (`isPublished: false`) ekleniyor!

**Çözüm:**
1. Dashboard'da ürünü bulun
2. "Aktif Et" butonuna tıklayın
3. Console'da "✅ Product publish status updated in DB" görünmeli
4. Telefonda menüyü yenileyin

## 🔧 Olası Sorunlar ve Çözümleri

### Sorun 1: "📦 Found products: 0"

**Neden:**
- Ürünler `is_published = false` olabilir
- `store_slug` eşleşmiyor olabilir
- Database'de ürün yok

**Çözüm:**
1. Dashboard'da ürünü "Aktif Et"
2. Database'de kontrol edin:
   ```sql
   SELECT * FROM products WHERE store_slug = 'your-slug';
   ```

### Sorun 2: "👤 User from DB: Not found"

**Neden:**
- Kullanıcı database'e kaydedilmemiş (eski kullanıcı)

**Çözüm:**
1. Settings sayfasını açın
2. "Ayarları Kaydet" butonuna tıklayın
3. Bu, store'u database'e kaydedecek
4. Menüyü yenileyin

### Sorun 3: "❌ Error fetching store products from DB"

**Neden:**
- Database bağlantı hatası
- Schema eksik

**Çözüm:**
1. Vercel'de `POSTGRES_URL` kontrol edin
2. Neon dashboard'da database'in çalıştığını kontrol edin
3. Schema'yı kontrol edin (`lib/db/schema.sql`)

## 📊 Database Kontrolü

### Neon Dashboard'da Kontrol

1. Neon Dashboard → SQL Editor
2. Şu sorguyu çalıştırın:

```sql
-- Tüm ürünleri gör
SELECT id, name, store_slug, is_published, created_at 
FROM products 
ORDER BY created_at DESC 
LIMIT 10;

-- Belirli bir store için ürünler
SELECT id, name, store_slug, is_published 
FROM products 
WHERE store_slug = 'your-slug-here';

-- Yayında olan ürünler
SELECT id, name, store_slug 
FROM products 
WHERE store_slug = 'your-slug-here' AND is_published = true;
```

### Store Kontrolü

```sql
-- Store var mı?
SELECT * FROM stores WHERE slug = 'your-slug-here';

-- Kullanıcı var mı?
SELECT * FROM users WHERE store_slug = 'your-slug-here';
```

## ✅ Başarı Kriterleri

Menü sayfası çalışıyorsa:
- ✅ Console'da "📦 Found products: X" (X > 0)
- ✅ Telefonda ürünler görünüyor
- ✅ Ürünler `is_published = true`
- ✅ `store_slug` doğru eşleşiyor

## 🚀 Hızlı Test

1. **Dashboard'da:**
   - Yeni bir ürün ekleyin
   - "Aktif Et" butonuna tıklayın
   - Console'da "✅ Product saved to DB successfully" görünmeli

2. **Telefonda:**
   - Menüyü açın (`/m/your-slug`)
   - Console'da "📦 Found products: 1" görünmeli
   - Ürün görünmeli

Eğer hala çalışmıyorsa, console loglarını paylaşın!
