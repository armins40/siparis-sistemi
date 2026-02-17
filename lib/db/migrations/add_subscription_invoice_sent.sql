-- Abonelik fatura gönderim takibi (admin panel)
-- ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS invoice_sent BOOLEAN DEFAULT false;

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS invoice_sent BOOLEAN DEFAULT false;
