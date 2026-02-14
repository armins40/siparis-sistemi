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
  payment_method_id TEXT,
  referred_by_affiliate_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_store_slug ON users(store_slug);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by_affiliate_id);
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
  delivery_fee DECIMAL(10, 2),
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

-- Affiliates (YouTuber/promoter hesapları; müşteri hesabından ayrı)
CREATE TABLE IF NOT EXISTS affiliates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  iban TEXT,
  payment_name TEXT,
  is_suspended BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(code);
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON affiliates(email);

-- Affiliate commissions (affiliate_id = affiliates.id, referred_user_id = users.id)
-- status: pending | approved | paid | cancelled. 7 gün güvenlik bekleme sonrası approved.
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  amount_gross DECIMAL(12,2) NOT NULL,
  amount_after_vat DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'first',
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMP,
  paid_at TIMESTAMP,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_created ON affiliate_commissions(created_at);

-- Affiliate tıklama (referans linkine giriş; ip_hash ile spam kontrolü)
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created ON affiliate_clicks(created_at);

-- Affiliate ödeme geçmişi (yapılan havale/EFT)
CREATE TABLE IF NOT EXISTS affiliate_payments (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  paid_at TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  masked_iban TEXT,
  transaction_ref TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_payments_affiliate ON affiliate_payments(affiliate_id);

-- Affiliate bildirimleri
CREATE TABLE IF NOT EXISTS affiliate_notifications (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_notifications_affiliate ON affiliate_notifications(affiliate_id);

-- Settings table (for global app settings)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Push tokens for PWA FCM notifications
CREATE TABLE IF NOT EXISTS push_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(token)
);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);

-- Insert default settings
INSERT INTO settings (key, value) VALUES ('whatsapp_number', '905535057059')
ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('yearly_price', '2490')
ON CONFLICT (key) DO NOTHING;
