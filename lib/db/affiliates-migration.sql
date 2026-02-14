-- Affiliate programı ayrı: YouTuber/promoter hesabı (müşteri hesabından bağımsız)
-- Neon/Vercel SQL editöründe bu dosyanın İÇERİĞİNİ yapıştırıp çalıştırın.

-- 1) Affiliate hesapları (isim, email, şifre, benzersiz kod)
CREATE TABLE IF NOT EXISTS affiliates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(code);
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON affiliates(email);

-- 2) users.referred_by_affiliate_id artık affiliates.id tutacak (FK kaldırılıyor)
-- Mevcut FK varsa kaldır (Neon'da constraint adı farklı olabilir, hata verirse atlayın)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_referred_by_affiliate_id_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_referred;
-- referred_by_affiliate_id zaten varsa bırak, yoksa ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_affiliate_id TEXT;

-- 3) affiliate_commissions.affiliate_id artık affiliates.id (FK users'dan kaldır)
ALTER TABLE affiliate_commissions DROP CONSTRAINT IF EXISTS affiliate_commissions_affiliate_id_fkey;
ALTER TABLE affiliate_commissions DROP CONSTRAINT IF EXISTS affiliate_commissions_referred_user_id_fkey;
-- affiliate_id ve referred_user_id sütunları kalır; affiliate_id = affiliates.id
