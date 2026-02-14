-- Ödeme bilgileri: affiliate'lere ödeme yapmak için IBAN ve hesap adı
-- Neon/Vercel SQL editöründe çalıştırın.

ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS payment_name TEXT;
