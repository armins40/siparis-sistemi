# Database Test Rehberi

## ✅ Kurulum Tamamlandı - Şimdi Test Edin!

## 🧪 Test Adımları

### 1. Dashboard'da Ürün Ekleme Testi

1. **Dashboard'a gidin:** `https://siteniz.vercel.app/dashboard/products`
2. **"Yeni Ürün Ekle"** butonuna tıklayın
3. Ürün bilgilerini doldurun:
   - Ürün Adı: Test Ürünü
   - Fiyat: 10
   - Kategori: Test
   - Stok: 100
4. **"Ekle"** butonuna tıklayın
5. **Console'u açın (F12)** ve şu mesajları kontrol edin:
   - ✅ `✅ Product saved to DB successfully` → Başarılı!
   - ❌ `❌ Error creating product in DB` → Hata var, detayları kontrol edin

### 2. Mobilde Menü Testi

1. **Mobil cihazınızda** menü URL'sini açın:
   ```
   https://siteniz.vercel.app/m/slug-buraya
   ```
   (slug'ı Dashboard > Settings'den kontrol edin)

2. **Ürünler görünmeli!** 🎉

3. **Görünmüyorsa:**
   - Mobilde USB debugging ile console'u açın
   - Şu mesajları kontrol edin:
     - `📦 Direct products by slug: [sayı]` → Kaç ürün bulundu
     - `⚠️ POSTGRES_URL not set` → Environment variable eksik
     - `❌ Error fetching store products from DB` → Database hatası

### 3. Database Bağlantı Testi

**Browser Console'da (F12):**
```javascript
// Test için (isteğe bağlı)
fetch('/api/db/setup')
  .then(r => r.json())
  .then(console.log)
```

Veya direkt ürün ekleyip console log'larını kontrol edin.

## 🔍 Kontrol Noktaları

### ✅ Başarılı İşaretler

1. **Ürün eklerken:**
   - Console'da `✅ Product saved to DB successfully` görünüyor
   - Alert mesajı YOK (hata yok)
   - Ürün listede görünüyor

2. **Mobilde menü:**
   - Console'da `📦 Direct products by slug: [sayı > 0]` görünüyor
   - Ürünler sayfada görünüyor
   - Kategoriler görünüyor

### ❌ Sorun İşaretleri

1. **"Ürün database'e kaydedilemedi" Alert'i:**
   - ✅ Console'da hata detaylarını kontrol edin
   - ✅ Vercel'de `POSTGRES_URL` environment variable'ın ekli olduğundan emin olun
   - ✅ Redeploy edin

2. **Mobilde ürünler görünmüyor:**
   - ✅ Console'da `📦 Direct products by slug: 0` görünüyorsa → Database'de ürün yok
   - ✅ Dashboard'da ürün ekleyin
   - ✅ Ürünün `isPublished: true` olduğundan emin olun
   - ✅ Store slug'ının doğru olduğundan emin olun

## 🆘 Sorun Giderme

### Database Bağlantı Hatası

**Console'da görünen hata:**
```
❌ Error creating product in DB: [error message]
```

**Çözüm:**
1. Vercel Dashboard > Settings > Environment Variables
2. `POSTGRES_URL` değişkeninin ekli olduğundan emin olun
3. Connection string'in doğru olduğundan emin olun (Neon'dan kopyaladığınız)
4. Redeploy edin

### Tablo Bulunamadı Hatası

**Console'da görünen hata:**
```
relation "products" does not exist
```

**Çözüm:**
1. Neon SQL Editor'e gidin
2. `lib/db/schema.sql` dosyasını tekrar çalıştırın
3. Tüm tabloların oluşturulduğundan emin olun

### Mobilde Ürünler Görünmüyor

**Kontrol:**
1. Dashboard'da ürün eklediniz mi?
2. Console'da `📦 Direct products by slug: [sayı]` kaç?
3. Store slug doğru mu? (Dashboard > Settings'den kontrol edin)

## 📊 Başarı Kriterleri

✅ Dashboard'da ürün ekleniyor (alert yok)
✅ Console'da `✅ Product saved to DB successfully` görünüyor
✅ Mobilde menü sayfasında ürünler görünüyor
✅ Kategoriler görünüyor
✅ Ürünler tıklanabilir ve sepete eklenebiliyor

## 🎉 Başarılı!

Eğer tüm kriterler sağlanıyorsa, database kurulumu başarılı! 🎊
