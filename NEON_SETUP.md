# Neon PostgreSQL Setup (Vercel ile)

Neon, Vercel ile mükemmel çalışan ücretsiz PostgreSQL servisi.

## 1. Neon Hesabı Oluştur

1. https://neon.tech adresine gidin
2. "Sign Up" ile ücretsiz hesap oluşturun
3. GitHub ile giriş yapabilirsiniz

## 2. Database Oluştur

1. Dashboard'da "Create Project" tıklayın
2. Project name: `siparis-db`
3. Region: `Europe (Frankfurt)` veya `US East` (Türkiye'ye yakın)
4. PostgreSQL version: `16` (en son)
5. "Create Project" tıklayın

## 3. Connection String Al

1. Project dashboard'da "Connection Details" sekmesine gidin
2. "Connection string" kısmından connection string'i kopyalayın
3. Format: `postgresql://user:password@host/database?sslmode=require`

## 4. Vercel'de Environment Variables Ekle

1. Vercel Dashboard > Projeniz > Settings > Environment Variables
2. Şu değişkenleri ekleyin:

```env
POSTGRES_URL=postgresql://user:password@host/database?sslmode=require
POSTGRES_PRISMA_URL=postgresql://user:password@host/database?sslmode=require&pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://user:password@host/database?sslmode=require
```

**Not:** Neon'dan aldığınız connection string'i kullanın.

## 5. Schema'yı Yükle

1. Neon Dashboard > SQL Editor
2. `lib/db/schema.sql` dosyasındaki SQL'i kopyalayın
3. SQL Editor'de çalıştırın
4. Tablolar oluşturulacak

## 6. Kod Değişikliği (Minimal)

Kod zaten hazır! Sadece `@vercel/postgres` Neon ile de çalışır.

**Test:**
```bash
# Local'de test etmek için .env.local'e ekle
POSTGRES_URL=neon_connection_string
```

## 7. Deploy

```bash
git add .
git commit -m "Add Neon PostgreSQL"
git push
```

Vercel otomatik deploy eder!

## Neon Free Tier Limitleri

- **Storage:** 3GB (50K üye için yeterli)
- **Compute:** 0.5 vCPU (yeterli)
- **Bandwidth:** 10GB/ay (yeterli)
- **Projects:** 1 (yeterli)

## Avantajlar

- ✅ Ücretsiz
- ✅ Vercel ile entegre
- ✅ Otomatik backup
- ✅ Branching (development database)
- ✅ Web UI (kolay yönetim)

## Sorun Giderme

### Connection Error
- SSL mode kontrol et (`?sslmode=require`)
- Firewall ayarlarını kontrol et
- Connection string'i doğru kopyaladığınızdan emin olun

### Schema Error
- SQL syntax'ı kontrol et
- Tablolar zaten varsa hata vermez (IF NOT EXISTS)

## Sonraki Adımlar

1. Neon'da database oluştur ✅
2. Schema'yı yükle ✅
3. Vercel'de environment variables ekle ✅
4. Deploy et ✅
5. Test et ✅

**Toplam süre: 10 dakika**
