# Cloudinary Setup

Cloudinary entegrasyonu için gerekli adımlar.

## 1. Environment Variables

Vercel Dashboard'da veya `.env.local` dosyasına şu değişkenleri ekleyin:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 2. Cloudinary Dashboard'dan Bilgileri Al

1. https://cloudinary.com/console adresine gidin
2. Dashboard'a giriş yapın
3. Sağ üstte "Account Details" veya "Settings" > "Security" bölümüne gidin
4. Şu bilgileri kopyalayın:
   - **Cloud Name** (örn: `dxyz123`)
   - **API Key** (örn: `123456789012345`)
   - **API Secret** (örn: `abcdefghijklmnopqrstuvwxyz`)

## 3. Vercel'de Environment Variables Ekleme

1. Vercel Dashboard > Projeniz > Settings > Environment Variables
2. Şu değişkenleri ekleyin:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Production, Preview ve Development için ekleyin
4. Deploy edin

## 4. Test

Görsel yükleme özelliği artık Cloudinary kullanıyor:
- Ürün görselleri: `/dashboard/products`
- Logo: `/dashboard/settings`
- Banner: `/dashboard/settings`

## Notlar

- **Free Plan Limitleri:**
  - 25 GB depolama
  - 25 GB aylık bant genişliği
  - 25 GB aylık transformasyon
- Görseller otomatik optimize edilir
- URL'ler HTTPS ile döner
- Görseller CDN üzerinden servis edilir (hızlı yükleme)

## Sorun Giderme

- **"Invalid API Key" hatası:** Environment variables'ları kontrol edin
- **"Upload failed" hatası:** Dosya boyutunu kontrol edin (max 10MB)
- **"Network error":** Cloudinary dashboard'dan API key'lerin aktif olduğunu kontrol edin
