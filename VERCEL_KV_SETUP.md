# Vercel KV Setup

Müşteri sayfasının tüm cihazlardan çalışması için Vercel KV (Redis) kullanacağız.

## Adımlar:

1. **Vercel Dashboard'da KV Store Oluştur:**
   - https://vercel.com/dashboard'a git
   - Projene git
   - "Storage" sekmesine git
   - "Create Database" > "KV" seç
   - Bir isim ver (örn: "siparis-kv")

2. **Environment Variables:**
   - Vercel Dashboard'da projenin "Settings" > "Environment Variables" kısmına git
   - Şu değişkenleri ekle (KV store oluşturduktan sonra otomatik eklenir):
     - `KV_URL`
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
     - `KV_REST_API_READ_ONLY_TOKEN`

3. **Paket Kurulumu:**
   ```bash
   npm install @vercel/kv
   ```

4. **Kod Değişiklikleri:**
   - localStorage yerine Vercel KV kullanılacak
   - API routes eklenecek
   - Müşteri sayfası API'den veri okuyacak

## Not:
Bu büyük bir mimari değişiklik gerektirir. Tüm localStorage kullanımları Vercel KV'ye taşınmalı.
