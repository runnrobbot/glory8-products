-- ============================================================
-- Glory8 — Product Types / Variants
-- Migration 004
-- ============================================================
-- Setiap produk bisa punya banyak tipe/varian.
-- Contoh: WPC Wall Panel → Tipe 3D Motif, Tipe Polos, Tipe Kayu
-- Setiap tipe bisa punya nama, harga, stok, kode sendiri.
-- ============================================================

CREATE TABLE IF NOT EXISTS product_types (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name        text NOT NULL,           -- "Tipe 3D Motif", "Polos", "Kayu Oak"
  code        text,                    -- kode SKU opsional, misal "WPC-3D-01"
  price       numeric(15,2),           -- null = pakai harga produk induk
  stock       int,                     -- null = tidak dilacak
  description text,                    -- penjelasan singkat tipe ini
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  int     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_types_product ON product_types(product_id, sort_order);

-- RLS
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read product types"
  ON product_types FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin read all product types"
  ON product_types FOR SELECT
  USING (is_staff_or_higher());

CREATE POLICY "Staff manage product types"
  ON product_types FOR ALL
  USING (is_staff_or_higher());
