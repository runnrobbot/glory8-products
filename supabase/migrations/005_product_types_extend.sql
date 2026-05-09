-- Tambah kolom unit dan image_url ke tabel product_types
ALTER TABLE product_types
  ADD COLUMN IF NOT EXISTS unit      TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT;
