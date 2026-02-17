-- Sipariş fatura gönderim takibi
-- Neon Console veya psql ile çalıştırın:
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_sent BOOLEAN DEFAULT false;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_sent BOOLEAN DEFAULT false;
