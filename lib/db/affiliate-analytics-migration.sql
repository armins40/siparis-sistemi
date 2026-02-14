-- Affiliate dönüşüm analizi, tıklama, ödeme geçmişi, bildirimler
-- Neon/Vercel SQL editöründe çalıştırın.

-- 1) Tıklama kaydı (referans linkine giriş; IP hash ile spam kontrolü)
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created ON affiliate_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_ip_affiliate ON affiliate_clicks(affiliate_id, ip_hash, created_at);

-- 2) Komisyon durum takibi: onaylanma/ödeme tarihi, 7 gün güvenlik bekleme
ALTER TABLE affiliate_commissions ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE affiliate_commissions ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;
-- status: pending | approved | paid | cancelled

-- 3) Affiliate ödeme geçmişi (yapılan havale/EFT kayıtları)
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
CREATE INDEX IF NOT EXISTS idx_affiliate_payments_paid_at ON affiliate_payments(paid_at);

-- 4) Affiliate bildirimleri
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
CREATE INDEX IF NOT EXISTS idx_affiliate_notifications_created ON affiliate_notifications(created_at);

-- 5) Hesap askıya alma (admin)
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;

-- 6) Şüpheli satış flag (fraud)
ALTER TABLE affiliate_commissions ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;
ALTER TABLE affiliate_commissions ADD COLUMN IF NOT EXISTS flag_reason TEXT;
