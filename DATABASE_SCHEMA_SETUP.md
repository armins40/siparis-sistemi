# Database Schema Kurulum Rehberi

## ⚠️ Vercel Postgres'te Query Sekmesi Yoksa

Vercel Postgres'in yeni arayüzünde Query sekmesi olmayabilir. İşte **3 kolay yöntem**:

## 🚀 YÖNTEM 1: API Route ile Otomatik Kurulum (EN KOLAY!)

1. **Vercel'de deploy edin** (eğer henüz deploy etmediyseniz)
2. **Tarayıcıda şu URL'yi açın:**
   ```
   https://siteniz.vercel.app/api/db/setup
   ```
3. **Veya terminal'de:**
   ```bash
   curl -X POST https://siteniz.vercel.app/api/db/setup
   ```
4. **Başarılı mesaj göreceksiniz:**
   ```json
   {
     "success": true,
     "message": "Database schema created successfully!",
     "tables": ["users", "stores", "products", ...]
   }
   ```

**✅ Bu yöntem en kolay! Sadece bir URL'ye gitmek yeterli.**

## Yöntem 1: Neon PostgreSQL Kullan (ÖNERİLEN - Daha Kolay)

Neon'da SQL Editor var ve daha kolay:

1. **Neon'a Git:** https://neon.tech
2. **Sign Up** (ücretsiz)
3. **Create Project** → İsim: `siparis-db`
4. **SQL Editor** sekmesine git (sol menüde)
5. `lib/db/schema.sql` dosyasının içeriğini kopyala
6. SQL Editor'e yapıştır
7. **Run** butonuna tıkla
8. Connection string'i kopyala
9. Vercel'de `POSTGRES_URL` environment variable olarak ekle

## Yöntem 2: Vercel CLI ile (Terminal)

```bash
# 1. Vercel CLI kur (eğer yoksa)
npm install -g vercel

# 2. Vercel'e login ol
vercel login

# 3. Environment variables'ı çek
vercel env pull .env.local

# 4. PostgreSQL'e bağlan (psql gerekli)
psql $POSTGRES_URL

# 5. Schema'yı çalıştır
\i lib/db/schema.sql
# veya
cat lib/db/schema.sql | psql $POSTGRES_URL
```

## Yöntem 3: Online SQL Client Kullan

1. **pgAdmin Web** veya **DBeaver** gibi bir SQL client kullan
2. Vercel Postgres connection string'ini al:
   - Vercel Dashboard > Storage > Postgres > Settings
   - Connection string'i kopyala
3. SQL client'te bağlan
4. `lib/db/schema.sql` dosyasını çalıştır

## Yöntem 4: Vercel Postgres Dashboard'da Tablo Oluşturma

Eğer Vercel Postgres'te manuel tablo oluşturmak isterseniz:

1. Vercel Dashboard > Storage > Postgres
2. "Tables" sekmesine git
3. Her tablo için "Create Table" butonuna tıkla
4. Aşağıdaki SQL komutlarını tek tek çalıştır

## Hızlı Çözüm: Neon Kullan

**En kolay yöntem Neon kullanmak:**

1. Neon'da database oluştur (2 dakika)
2. SQL Editor'de schema'yı çalıştır (1 dakika)
3. Connection string'i Vercel'e ekle (1 dakika)
4. Redeploy et

**Toplam: 5 dakika!**

## Schema SQL İçeriği

Aşağıdaki SQL'i kopyalayıp Neon SQL Editor'de çalıştırın:
