-- Fatura bilgileri (users tablosu)
ALTER TABLE users ADD COLUMN IF NOT EXISTS invoice_tax_no TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS invoice_address TEXT;
