# Database Kurulum Talimatları

## ⚠️ ÖNEMLİ: Database Bağlantısı Gerekli

Mobilde menünün görünmesi ve ürünlerin kaydedilmesi için database bağlantısı şarttır.

## Hızlı Kurulum (Neon PostgreSQL - Önerilen)

### 1. Neon Database Oluştur
1. https://neon.tech → Sign up (ücretsiz)
2. "Create Project" → İsim: `siparis-db`
3. Region: `Europe (Frankfurt)` seç
4. "Create Project" tıkla

### 2. Connection String Al
1. Neon Dashboard > Project > "Connection Details"
2. "Connection string" kısmından string'i kopyala
3. Format: `postgresql://user:password@host/database?sslmode=require`

### 3. Vercel Environment Variables Ekle
1. Vercel Dashboard > Projeniz > **Settings** > **Environment Variables**
2. Şu değişkeni ekle:

```
POSTGRES_URL=postgresql://user:password@host/database?sslmode=require
```

**ÖNEMLİ:** Neon'dan kopyaladığınız connection string'i kullanın!

### 4. Database Schema Yükle
1. Neon Dashboard > **SQL Editor**
2. `lib/db/schema.sql` dosyasını aç
3. İçeriğini kopyala ve SQL Editor'de çalıştır
4. Tablolar oluşturulacak

### 5. Redeploy
1. Vercel Dashboard > **Deployments**
2. Son deployment'ın yanındaki "..." menüsünden **"Redeploy"** seç
3. Veya yeni bir commit push et

## Kontrol

### Database Bağlantısını Test Et
1. Dashboard'da ürün ekle
2. Console'da (F12) şu mesajları kontrol et:
   - `✅ Product saved to DB successfully` → Başarılı!
   - `❌ Error creating product in DB` → Hata var, console'da detayları gör

### Mobilde Test Et
1. Menü URL'sini mobilde aç: `https://siteniz.com/m/slug-buraya`
2. Ürünler görünmeli
3. Görünmüyorsa, console'da (mobilde USB debugging ile) şu mesajları kontrol et:
   - `📦 Direct products by slug: [sayı]` → Kaç ürün bulundu
   - `⚠️ POSTGRES_URL not set` → Environment variable eksik

## Sorun Giderme

### "Ürün database'e kaydedilemedi" Hatası

**Sebep 1: POSTGRES_URL eksik**
- ✅ Vercel Dashboard > Settings > Environment Variables
- ✅ `POSTGRES_URL` değişkenini ekle
- ✅ Redeploy et

**Sebep 2: Database tabloları yok**
- ✅ Neon SQL Editor'de `lib/db/schema.sql` dosyasını çalıştır
- ✅ Tablolar oluşturulmalı

**Sebep 3: Connection string yanlış**
- ✅ Neon'dan yeni connection string al
- ✅ Vercel'de güncelle
- ✅ Redeploy et

### Mobilde Ürünler Görünmüyor

**Sebep 1: Database'de ürün yok**
- ✅ Dashboard'da ürün ekle
- ✅ Console'da `✅ Product saved to DB successfully` mesajını kontrol et
- ✅ Ürün `isPublished: true` olmalı

**Sebep 2: store_slug yanlış**
- ✅ Dashboard > Settings > Store Slug değerini kontrol et
- ✅ Menü URL'sindeki slug ile eşleşmeli
- ✅ Database'de ürünlerin `store_slug` değeri doğru olmalı

**Sebep 3: POSTGRES_URL eksik**
- ✅ Vercel'de environment variable kontrol et
- ✅ Redeploy et

## Fallback Mekanizması

Kod şu şekilde çalışıyor:
1. **Önce database'den dene**
2. **Başarısız olursa localStorage kullan**

Bu sayede:
- Database yoksa → localStorage çalışır (ama mobilde görünmez)
- Database varsa → Database kullanılır (mobilde görünür)

## Önemli Notlar

- ⚠️ **localStorage sadece aynı cihazda çalışır** (mobilde görünmez)
- ✅ **Database tüm cihazlardan erişilebilir** (mobilde görünür)
- 🔧 **Database kurulumu zorunludur** mobil görünürlük için
