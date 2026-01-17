# Hosting Önerileri - 50.000 Üye İçin

## Mevcut Durumunuz
- Disk: 0.87 GB / 1 GB (Dolu!)
- Trafik: 17.2 MB / 15 GB
- **Sorun:** Shared hosting Next.js için yeterli değil

## 50.000 Üye İçin Gereksinimler

### 1. **VPS (Virtual Private Server) - ÖNERİLEN**

#### Seçenek A: DigitalOcean Droplet
- **Plan:** 4GB RAM, 2 vCPU, 80GB SSD
- **Fiyat:** ~$24/ay (~$0.036/saat)
- **Özellikler:**
  - Node.js 18+ desteği
  - PostgreSQL database
  - Yeterli RAM (4GB)
  - SSD disk (hızlı)
  - 4TB transfer

#### Seçenek B: Linode
- **Plan:** 4GB RAM, 2 vCPU, 80GB SSD
- **Fiyat:** ~$24/ay
- **Özellikler:** DigitalOcean'a benzer

#### Seçenek C: Hetzner (Avrupa - Daha Ucuz)
- **Plan:** CPX21 (4GB RAM, 3 vCPU, 80GB SSD)
- **Fiyat:** ~€5.83/ay (~$6.5/ay)
- **Özellikler:**
  - Çok uygun fiyat
  - Avrupa lokasyonu (Türkiye'ye yakın)
  - 20TB transfer

### 2. **Database Seçenekleri**

#### A) VPS Üzerinde PostgreSQL (Önerilen)
- VPS ile birlikte kurulur
- Ücretsiz
- Tam kontrol
- **Gereksinim:** 2-4GB RAM

#### B) Managed Database (Kolay)
- **Supabase:** Free tier (500MB, 2GB bandwidth)
- **Neon:** Free tier (3GB storage)
- **PlanetScale:** Free tier (5GB storage)
- **Avantaj:** Yönetim yok, otomatik backup

### 3. **Tahmini Kaynak Kullanımı (50K Üye)**

#### Disk Alanı:
- **Kod:** ~500MB
- **Database:** ~2-5GB (ürünler, kullanıcılar, siparişler)
- **Görseller (Cloudinary):** Sınırsız (Cloudinary'de)
- **Toplam:** ~5-10GB (güvenli)

#### RAM:
- **Next.js App:** ~500MB-1GB
- **PostgreSQL:** ~1-2GB
- **Sistem:** ~500MB
- **Toplam:** ~2-4GB (4GB önerilir)

#### CPU:
- **2 vCPU:** Yeterli (orta trafik)
- **4 vCPU:** İdeal (yüksek trafik)

#### Trafik:
- **Sayfa başına:** ~200KB (optimize edilmiş)
- **50K üye, aylık 2 ziyaret:** ~20GB
- **Önerilen:** 50-100GB/ay

## Önerilen Kurulum

### Seçenek 1: VPS + PostgreSQL (En Ekonomik)
```
Hetzner CPX21 (€5.83/ay)
+ PostgreSQL (ücretsiz)
+ Cloudinary (ücretsiz - görseller için)
= ~€6/ay (~$7/ay)
```

### Seçenek 2: VPS + Managed Database (Kolay)
```
Hetzner CPX21 (€5.83/ay)
+ Neon PostgreSQL (ücretsiz)
+ Cloudinary (ücretsiz)
= ~€6/ay (~$7/ay)
```

### Seçenek 3: Premium (Yüksek Performans)
```
DigitalOcean 4GB ($24/ay)
+ Managed PostgreSQL ($15/ay)
+ Cloudinary (ücretsiz)
= ~$39/ay
```

## Kurulum Adımları

### 1. VPS Kurulumu
```bash
# Ubuntu 22.04 LTS kurulumu
# Node.js 18+ kurulumu
# PM2 (process manager) kurulumu
# Nginx (reverse proxy) kurulumu
# SSL sertifikası (Let's Encrypt - ücretsiz)
```

### 2. Database Kurulumu
```bash
# PostgreSQL kurulumu
# Database oluşturma
# Schema migration
```

### 3. Next.js Deploy
```bash
# Git clone
# npm install
# npm run build
# PM2 ile çalıştırma
```

## Mevcut Shared Hosting Neden Yeterli Değil?

1. **Node.js Desteği:** Çoğu shared hosting Node.js desteklemez
2. **RAM:** 1GB yeterli değil (Next.js + Database)
3. **CPU:** Paylaşımlı CPU yavaş
4. **Database:** MySQL var ama PostgreSQL daha iyi
5. **SSR:** Server-side rendering için Node.js gerekli

## Alternatif: Shared Hosting + External Services

Eğer shared hosting'de kalmak isterseniz:
- **Frontend:** Static export (Next.js static)
- **Backend:** Vercel Serverless Functions (ücretsiz)
- **Database:** Supabase/Neon (ücretsiz)
- **Görseller:** Cloudinary (ücretsiz)

**Ama bu karmaşık ve önerilmez.**

## Önerim

**Hetzner CPX21 (€5.83/ay)** ile başlayın:
- Çok uygun fiyat
- 50K üye için yeterli
- Avrupa lokasyonu (hızlı)
- İhtiyaç olursa kolayca yükseltilebilir

## Sonraki Adımlar

1. VPS seçin (Hetzner önerilir)
2. Domain'i VPS'e yönlendirin
3. Database kurulumu (PostgreSQL)
4. Next.js deploy
5. SSL sertifikası (Let's Encrypt)

## Not

Kod zaten database-ready (`lib/db/` klasöründe). Sadece:
1. VPS kurulumu
2. PostgreSQL kurulumu
3. Environment variables
4. Deploy

Gerekirse detaylı kurulum rehberi hazırlayabilirim.
