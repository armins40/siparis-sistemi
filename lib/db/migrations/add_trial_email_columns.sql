-- Trial e-posta takip sütunları (cron trial-check için)
-- Neon/Vercel SQL editöründe çalıştırın. Endpoint otomatik ekler (ADD COLUMN IF NOT EXISTS).

ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_reminder_sent_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_expired_sent_at TIMESTAMP;
