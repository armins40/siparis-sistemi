# Neon PostgreSQL Kurulum - Adım Adım Rehber

## 📋 Adım 1: Neon Hesabı Oluştur

1. **Neon'a Git:** https://neon.tech
2. **"Sign Up"** butonuna tıkla
3. **GitHub ile giriş yap** (önerilen) veya email ile kayıt ol
4. Email doğrulamasını tamamla

## 📋 Adım 2: Database (Project) Oluştur

1. Neon Dashboard'a giriş yaptıktan sonra **"Create Project"** butonuna tıkla
2. **Project name:** `siparis-db` (veya istediğiniz bir isim)
3. **Region:** `Europe (Frankfurt)` seç (Türkiye'ye en yakın)
4. **PostgreSQL version:** `16` (varsayılan)
5. **"Create Project"** butonuna tıkla
6. ⏳ Database oluşturulmasını bekleyin (30-60 saniye)

## 📋 Adım 3: Connection String Kopyala

1. Project dashboard'da **"Connection Details"** sekmesine git
2. **"Connection string"** kısmında bir string göreceksiniz
3. **"Copy"** butonuna tıkla veya string'i seçip kopyala
4. Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

**💡 İpucu:** Bu string'i bir yere kaydedin, daha sonra Vercel'e ekleyeceğiz.

## 📋 Adım 4: SQL Editor'de Schema'yı Çalıştır

1. Neon Dashboard'da sol menüden **"SQL Editor"** sekmesine git
2. Aşağıdaki SQL kodunu kopyalayın (tam dosya içeriği):

---

### 📄 SQL Kodu (Aşağıdan Kopyala):

```sql
-- Vercel Postgres Database Schema
-- 1 milyon kullanıcı için production-ready yapı

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  name TEXT,
  password TEXT,
  plan TEXT NOT NULL DEFAULT 'trial',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  store_slug TEXT UNIQUE,
  sector TEXT,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  payment_method_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_store_slug ON users(store_slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  banner TEXT,
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  theme_id TEXT DEFAULT 'modern-blue',
  sector TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT,
  image TEXT,
  is_published BOOLEAN DEFAULT false,
  stock DECIMAL(10, 2),
  unit TEXT DEFAULT 'adet',
  created_at TIMESTAMP DEFAULT NOW(),
  sector TEXT,
  created_by TEXT DEFAULT 'user',
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  store_slug TEXT REFERENCES stores(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_store_slug ON products(store_slug);
CREATE INDEX IF NOT EXISTS idx_products_sector ON products(sector);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  sector TEXT,
  store_slug TEXT REFERENCES stores(slug) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_store_slug ON categories(store_slug);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  store_slug TEXT NOT NULL REFERENCES stores(slug) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  final_total DECIMAL(10, 2) NOT NULL,
  address TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_slug ON orders(store_slug);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase DECIMAL(10, 2),
  max_discount DECIMAL(10, 2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'active',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  payment_method TEXT,
  payment_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
```

---

3. **SQL Editor'e yapıştır**
4. **"Run"** butonuna tıkla (veya `Ctrl/Cmd + Enter`)
5. ✅ **Başarılı mesajı görmelisiniz:**
   - "Query executed successfully"
   - "CREATE TABLE" mesajları

## 📋 Adım 5: Connection String'i Vercel'e Ekle

1. **Vercel Dashboard'a git:** https://vercel.com/dashboard
2. Projenizi seçin
3. **Settings** sekmesine git
4. Sol menüden **"Environment Variables"** seç
5. **"Add New"** butonuna tıkla
6. Şu bilgileri gir:
   - **Name:** `POSTGRES_URL`
   - **Value:** Neon'dan kopyaladığınız connection string
   - **Environment:** `Production`, `Preview`, `Development` (hepsini seç)
7. **"Save"** butonuna tıkla

**Örnek:**
```
POSTGRES_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

## 📋 Adım 6: Redeploy Et

1. Vercel Dashboard > **Deployments** sekmesine git
2. Son deployment'ın yanındaki **"..."** menüsüne tıkla
3. **"Redeploy"** seç
4. Veya yeni bir commit push edin

## ✅ Test Et

1. Dashboard'da yeni bir ürün ekleyin
2. Console'da (F12) şu mesajları kontrol edin:
   - `✅ Product saved to DB successfully` → Başarılı!
3. Mobilde menü sayfasını açın
4. Ürünler görünmeli! 🎉

## 🆘 Sorun Giderme

### "POSTGRES_URL not set" Hatası
- ✅ Vercel'de environment variable'ın eklendiğinden emin olun
- ✅ Redeploy edin
- ✅ Tüm environment'larda (Production, Preview, Development) ekli olduğundan emin olun

### "Table does not exist" Hatası
- ✅ Neon SQL Editor'de schema'yı çalıştırdığınızdan emin olun
- ✅ SQL'i tamamen kopyalayıp yapıştırdığınızdan emin olun
- ✅ "Run" butonuna tıkladığınızdan emin olun

### Connection Error
- ✅ Connection string'in sonunda `?sslmode=require` olduğundan emin olun
- ✅ Connection string'i tekrar kopyalayıp deneyin

## 📞 Yardım

Sorun yaşarsanız:
1. Vercel deployment log'larını kontrol edin
2. Browser console'da hata mesajlarını kontrol edin
3. Neon Dashboard'da SQL Editor'de test query çalıştırın: `SELECT 1;`
