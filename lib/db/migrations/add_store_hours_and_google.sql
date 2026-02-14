-- Mağaza açılış/kapanış saatleri ve Google puanlama linki
-- Neon Console veya psql ile çalıştırın:
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS opening_hours JSONB;
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS google_review_url TEXT;

ALTER TABLE stores ADD COLUMN IF NOT EXISTS opening_hours JSONB;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS google_review_url TEXT;
