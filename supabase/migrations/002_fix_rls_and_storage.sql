-- ============================================================
-- Migration 002: Fix RLS policies + Storage bucket setup
-- Jalankan di Supabase SQL Editor SETELAH 001_initial_schema.sql
-- ============================================================

-- ── 1. FIX PRODUCTS — staff boleh manage produk ──────────────
DROP POLICY IF EXISTS "Admins manage products"      ON products;
DROP POLICY IF EXISTS "Admins manage product images" ON product_images;

CREATE POLICY "Staff manage products"
  ON products FOR ALL
  USING (is_staff_or_higher())
  WITH CHECK (is_staff_or_higher());

CREATE POLICY "Staff manage product images"
  ON product_images FOR ALL
  USING (is_staff_or_higher())
  WITH CHECK (is_staff_or_higher());

-- ── 2. FIX CATEGORIES & COLLECTIONS — staff boleh manage ─────
DROP POLICY IF EXISTS "Admins manage categories"  ON product_categories;
DROP POLICY IF EXISTS "Admins manage collections" ON product_collections;

CREATE POLICY "Staff manage categories"
  ON product_categories FOR ALL
  USING (is_staff_or_higher())
  WITH CHECK (is_staff_or_higher());

CREATE POLICY "Staff manage collections"
  ON product_collections FOR ALL
  USING (is_staff_or_higher())
  WITH CHECK (is_staff_or_higher());

-- ── 3. FIX GALLERY — staff boleh manage ──────────────────────
DROP POLICY IF EXISTS "Admins manage gallery"      ON inspiration_gallery;
DROP POLICY IF EXISTS "Admins manage gallery categories" ON gallery_categories;

CREATE POLICY "Staff manage gallery"
  ON inspiration_gallery FOR ALL
  USING (is_staff_or_higher())
  WITH CHECK (is_staff_or_higher());

CREATE POLICY "Staff manage gallery categories"
  ON gallery_categories FOR ALL
  USING (is_staff_or_higher())
  WITH CHECK (is_staff_or_higher());

-- ── 4. FIX FEATURED PRODUCTS ─────────────────────────────────
DROP POLICY IF EXISTS "Admins manage featured products" ON featured_products;

CREATE POLICY "Staff manage featured products"
  ON featured_products FOR ALL
  USING (is_staff_or_higher())
  WITH CHECK (is_staff_or_higher());

-- ── 5. STORAGE BUCKET glory8-assets ──────────────────────────
-- Buat bucket (public = bisa diakses tanpa auth untuk baca)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'glory8-assets',
  'glory8-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'];

-- Storage policies — hapus dulu jika ada
DROP POLICY IF EXISTS "Public read assets"   ON storage.objects;
DROP POLICY IF EXISTS "Staff upload assets"  ON storage.objects;
DROP POLICY IF EXISTS "Staff delete assets"  ON storage.objects;
DROP POLICY IF EXISTS "Admins upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete assets" ON storage.objects;

-- Siapapun bisa lihat gambar (bucket public)
CREATE POLICY "Public read assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'glory8-assets');

-- Staff ke atas bisa upload
CREATE POLICY "Staff upload assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'glory8-assets' AND is_staff_or_higher());

-- Staff ke atas bisa update
CREATE POLICY "Staff update assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'glory8-assets' AND is_staff_or_higher());

-- Staff ke atas bisa hapus
CREATE POLICY "Staff delete assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'glory8-assets' AND is_staff_or_higher());

-- ── 6. FIX: PUBLIC READ juga bisa lihat semua produk aktif ───
-- (policy SELECT untuk produk tidak aktif tetap butuh staff)
-- Sudah benar di migration 001, tidak perlu diubah.

-- ── 7. Verifikasi ─────────────────────────────────────────────
-- Jalankan query ini untuk cek semua policy aktif:
-- SELECT schemaname, tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('products','product_images','product_categories',
--                     'product_collections','featured_products',
--                     'inspiration_gallery','gallery_categories')
-- ORDER BY tablename, policyname;
