-- Affiliate: users tablosuna alanlar (referans ile gelen kullanıcı + affiliate kodu)
-- Mevcut veritabanında çalıştırmak için: Vercel/Neon SQL editöründe bu dosyayı çalıştırın.
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_affiliate_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS affiliate_code TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by_affiliate_id);
CREATE INDEX IF NOT EXISTS idx_users_affiliate_code ON users(affiliate_code);

-- Komisyon kayıtları: KDV sonrası tutar üzerinden oran uygulanır (yıllık %20, aylık %10)
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  amount_gross DECIMAL(12,2) NOT NULL,
  amount_after_vat DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'first',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_created ON affiliate_commissions(created_at);
