# Database Setup - Vercel Postgres

1 milyon kullanıcı için production-ready database setup.

## Vercel Postgres Kurulumu

### 1. Vercel Dashboard'da Postgres Oluştur

1. https://vercel.com/dashboard'a git
2. Projene git
3. **"Storage"** sekmesine git
4. **"Create Database"** > **"Postgres"** seç
5. Bir isim ver (örn: "siparis-db")
6. Region seç (EU veya US - kullanıcılarınıza yakın)

### 2. Environment Variables

Vercel otomatik olarak şu environment variables'ları ekler:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

**Not:** Bu değişkenler otomatik olarak production'a eklenir. Local development için `.env.local` dosyasına eklemeniz gerekebilir.

### 3. Paket Kurulumu

```bash
npm install @vercel/postgres
```

Paket zaten kurulu ✅

### 4. Database Schema Oluşturma

**Önemli:** Schema'yı Vercel Dashboard'dan çalıştırmanız gerekiyor.

1. Vercel Dashboard'da projenize gidin
2. **Storage** sekmesine gidin
3. Postgres database'inize tıklayın
4. **"Query"** sekmesine gidin
5. `lib/db/schema.sql` dosyasındaki SQL'i kopyalayıp çalıştırın

**Alternatif:** Vercel CLI kullanarak:
```bash
vercel env pull .env.local
# Sonra psql ile bağlanıp schema.sql'i çalıştırın
```

### 5. Schema Tabloları

- `users` - Kullanıcılar (1M+ kullanıcı için optimize edilmiş indekslerle)
- `products` - Ürünler (store_slug, user_id, sector indeksleriyle)
- `categories` - Kategoriler
- `stores` - Mağaza bilgileri
- `orders` - Siparişler (JSONB items ile)
- `coupons` - Kuponlar
- `subscriptions` - Abonelikler

### 6. Migration (Gelecek Adım)

localStorage verilerini database'e taşımak için migration script'i oluşturulacak.

### 7. API Routes

Database fonksiyonları hazır:
- `lib/db/client.ts` - Database connection
- `lib/db/products.ts` - Products CRUD
- `lib/db/stores.ts` - Stores CRUD
- `lib/db/users.ts` - Users CRUD
- `app/api/menu/[slug]/route.ts` - Müşteri sayfası API (database'den okuyor)

### 8. Test

Database bağlantısını test etmek için:
- API route'ları çağırın
- Vercel Dashboard'dan query çalıştırın
