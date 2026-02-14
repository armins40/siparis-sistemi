# AWS S3 Kurulum Rehberi

## 1. AWS S3 Bucket Oluşturma (Türkçe arayüz)

### AWS Konsolunu Türkçe yapma
1. Sağ üstte dil/hesap menüsüne tıkla
2. **Language / Dil** → **Türkçe** seç

### Bucket oluşturma adımları (Türkçe)

1. **AWS S3 sayfasına git:** https://console.aws.amazon.com/s3/
2. **"Bucket oluştur"** (Create bucket) butonuna tıkla.
3. **Bucket ayarları:**
   - **Bucket adı:** `siparis-urunler` (veya istediğin isim; tüm AWS’te benzersiz olmalı, sadece küçük harf, rakam, tire)
   - **AWS Bölgesi:** `us-east-1 (N. Virginia)` veya `eu-central-1 (Frankfurt)` (Türkiye’ye yakın)
   - **Nesne Sahipliği:** Varsayılan (ACL devre dışı - önerilen) bırakılabilir; public okuma için aşağıda bucket policy kullanacağız.
   - **Bu bucket için genel erişimi engelle:** Bu seçeneği **kapat** (checkbox’ı kaldır). Böylece bucket policy ile public read verebileceğiz.
   - **Bucket sürümü:** İsteğe bağlı (açık bırakabilirsin).
   - **Varsayılan şifreleme:** AES-256 (önerilir).
4. Sayfanın altında **"Bucket oluştur"** butonuna tıkla.

## 2. Genel Erişimi Engelle’i Kapat (Önce bunu yap)

Bucket ilkesini kaydedebilmek için **Genel erişimi engelle** kapalı olmalı:

1. Bucket’a tıkla → **İzinler** (Permissions)
2. **Genel erişimi engelle** (Block public access) → **Düzenle**
3. **“Tüm genel erişimi engelle”** kutusunu **kapat**
4. Onay kutusunu işaretleyip **Kaydet**

İlke kaydederken “public policies are prevented by the BlockPublicPolicy” hatası alırsan bu adımı yapmamışsındır.

## 3. Bucket İlkesi (Public Read Access)

Bucket oluşturduktan ve genel erişimi engelle’i kapattıktan sonra:

1. Oluşturduğun bucket adına tıkla → **İzinler** (Permissions) sekmesine geç
2. **Bucket ilkesi** (Bucket policy) bölümüne in
3. **Düzenle** (Edit) → Aşağıdaki ilkeyi yapıştır:

**Not:** İlke kaydederken “TR-TR” veya dil hatası alırsan konsol dilini geçici olarak **English** yapıp tekrar kaydet.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::siparis-urunler/*"
    }
  ]
}
```

**Not**: `siparis-urunler` yerine kendi bucket adını yaz.

## 4. CORS Ayarları

1. Aynı bucket’ta **İzinler** (Permissions) → **Kaynaklar arası kaynak paylaşımı (CORS)** (Cross-origin resource sharing)
2. **Düzenle** → Aşağıdaki CORS yapılandırmasını yapıştır:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## 5. IAM Kullanıcısı Oluşturma (API Anahtarları)

1. AWS Console → **IAM** → **Kullanıcılar** (Users) → **Kullanıcı oluştur** (Create user)
2. **Kullanıcı adı:** `siparis-s3-uploader`
3. **Erişim türü:** "Programatik erişim" (Programmatic access) işaretle
4. **İzinler:** "Doğrudan mevcut ilkeleri ekle" (Attach existing policies directly) → `AmazonS3FullAccess` seç (veya sadece bu bucket için özel policy oluştur)
5. **Kullanıcı oluştur** butonuna tıkla
6. **Erişim anahtarı kimliği** (Access Key ID) ve **Gizli erişim anahtarı** (Secret Access Key) değerlerini kopyala; gizli anahtar bir daha gösterilmez!

## 6. Environment Variables (Vercel) – Zorunlu

**siparis-sistemi.com Vercel’de çalışıyor; bu yüzden AWS değişkenleri mutlaka Vercel’de tanımlı olmalı.**  
`backend/.env.local` sadece local backend içindir; canlı sitede kullanılmaz.

1. **Vercel Dashboard** → https://vercel.com/dashboard  
2. **siparis** projesini seç (siparis-sistemi.com’u deploy eden proje)  
3. **Settings** → **Environment Variables**  
4. Aşağıdaki dört değişkeni ekle (Production, Preview, Development hepsinde kullanılacaksa üçünü de seç):

| Name | Value |
|------|--------|
| `AWS_ACCESS_KEY_ID` | IAM’dan kopyaladığın Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | IAM’dan kopyaladığın Secret Access Key |
| `AWS_S3_BUCKET_NAME` | `siparis-urunler` (veya kendi bucket adın) |
| `AWS_REGION` | `eu-north-1` (Stockholm) veya bucket’ının bölgesi |

5. **Save** de.  
6. **Yeni bir deploy al:** Deployments → son deployment’ın sağındaki ⋮ → **Redeploy**.  
   (Env değişince bazen redeploy gerekir.)

**Opsiyonel (CloudFront için):**
```
AWS_CLOUDFRONT_URL=https://d1234567890.cloudfront.net
```

## 7. Local Development (.env.local)

`backend/.env.local` dosyasına ekle:

```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG...
AWS_S3_BUCKET_NAME=siparis-urunler
AWS_REGION=us-east-1
```

## 8. CloudFront Kurulumu (Opsiyonel - CDN)

1. AWS Console → **CloudFront** → **Dağıtım oluştur** (Create distribution)
2. **Kaynak etki alanı** (Origin domain): S3 bucket’ını seç
3. **Görüntüleyici protokol ilkesi** (Viewer protocol policy): HTTP’den HTTPS’e yönlendir
4. **İzin verilen HTTP yöntemleri:** GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
5. Dağıtımı oluştur (5–10 dakika sürebilir)
6. **Etki alanı adı** (Domain name) değerini kopyala ve `AWS_CLOUDFRONT_URL` olarak env’e ekle

## 9. Test

1. **Ürün görselleri:** Admin veya Dashboard ürün ekle
2. **Logo / Profil fotoğrafı:** Dashboard → Ayarlar → "Fotoğraf Yükle (AWS S3)" → logos/ klasörüne yüklenir
3. **Banner:** Dashboard → Ayarlar → "Banner Yükle (AWS S3)" → banners/ klasörüne yüklenir
4. Dosyalar doğrudan S3'e gider (Vercel 4.5MB limiti yok; max 10MB)

## Maliyet Tahmini

### Free Tier (İlk 12 Ay):
- 5GB storage ücretsiz
- 100GB transfer/ay ücretsiz
- Aşan kısım için:
  - Storage: $0.023/GB/ay
  - Transfer: $0.09/GB

### Örnek Senaryolar:

**10k kullanıcı (250GB storage, 50GB transfer/ay):**
- İlk 12 ay: ~$5.64/ay (storage) + $0 (transfer free tier içinde) = **~$5.64/ay**
- 12 ay sonrası: ~$5.75/ay (storage) + ~$4.5/ay (transfer) = **~$10.25/ay**

**50k kullanıcı (1.25TB storage, 250GB transfer/ay):**
- İlk 12 ay: ~$28.75/ay (storage) + ~$13.5/ay (transfer) = **~$42.25/ay**
- 12 ay sonrası: ~$29/ay (storage) + ~$22.5/ay (transfer) = **~$51.5/ay**

## Güvenlik Notları

1. **IAM User**: Mümkünse sadece bu bucket için kısıtlı policy kullan
2. **Bucket Policy**: Sadece GET (read) için public, PUT/POST için IAM user gerekli
3. **Access Keys**: Asla commit etme, sadece environment variables'da tut
4. **CloudFront**: Production'da CloudFront kullan (daha hızlı ve güvenli)

## Troubleshooting

### "Access Denied" hatası:
- IAM user'ın bucket'a yazma izni olduğundan emin ol
- Bucket policy'yi kontrol et

### "InvalidAccessKeyId" hatası:
- Access Key ID ve Secret Key'i kontrol et
- Environment variables'ın doğru yüklendiğinden emin ol

### "NoSuchBucket" hatası:
- Bucket adını kontrol et
- Region'ın doğru olduğundan emin ol
