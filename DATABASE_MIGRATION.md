# Database Migration Rehberi

## ✅ Yapılan Değişiklikler

### 1. Müşteri Sayfası (`/m/[slug]`)
- ✅ Database'den ürün ve store bilgilerini okuyor
- ✅ localStorage fallback mekanizması var
- ✅ Tüm cihazlardan erişilebilir

### 2. Dashboard Products Sayfası
- ✅ Ürün oluşturma database'e yazıyor
- ✅ Ürün güncelleme database'e yazıyor
- ✅ Ürün silme database'den siliyor
- ✅ localStorage fallback mekanizması var

## 📋 Yapılacaklar

### 1. Neon PostgreSQL Kurulumu

1. https://neon.tech → Sign up
2. "Create Project" → `siparis-db`
3. Connection string'i kopyala

### 2. Vercel Environment Variables

Vercel Dashboard > Settings > Environment Variables:

```env
POSTGRES_URL=postgresql://user:password@host/database?sslmode=require
POSTGRES_PRISMA_URL=postgresql://user:password@host/database?sslmode=require&pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://user:password@host/database?sslmode=require
```

### 3. Schema Yükleme

Neon Dashboard > SQL Editor:
- `lib/db/schema.sql` dosyasındaki SQL'i çalıştır

### 4. localStorage'dan Database'e Migration

**Manuel Migration:**
1. Dashboard'da ürün ekle → Otomatik database'e yazılır
2. Store ayarlarını kaydet → Otomatik database'e yazılır

**Toplu Migration (Gelecek):**
- Migration script'i oluşturulacak
- localStorage'daki tüm verileri database'e taşıyacak

## 🔄 Fallback Mekanizması

Kod şu şekilde çalışıyor:
1. **Önce database'den dene**
2. **Başarısız olursa localStorage kullan**

Bu sayede:
- Database yoksa → localStorage çalışır
- Database varsa → Database kullanılır
- Geçiş sorunsuz olur

## 🧪 Test

1. Neon'da database oluştur
2. Schema'yı yükle
3. Vercel'de environment variables ekle
4. Deploy et
5. Dashboard'da ürün ekle
6. `/m/[slug]` sayfasında kontrol et

## ⚠️ Önemli Notlar

- Database bağlantısı yoksa localStorage kullanılır (geriye dönük uyumluluk)
- Database bağlantısı varsa database kullanılır (yeni sistem)
- Her iki sistem de aynı anda çalışabilir (geçiş dönemi)
