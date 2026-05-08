-- ============================================================
-- GLORY8 — DROP ALL TABLES (Reset Database)
-- Jalankan ini di Supabase SQL Editor untuk hapus semua data
-- dan mulai dari awal dengan migration 001_initial_schema.sql
-- ============================================================

-- Matikan trigger dulu
DROP TRIGGER IF EXISTS on_auth_user_created    ON auth.users;
DROP TRIGGER IF EXISTS set_products_updated_at ON products;
DROP TRIGGER IF EXISTS set_orders_updated_at   ON orders;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user()      CASCADE;
DROP FUNCTION IF EXISTS set_updated_at()       CASCADE;
DROP FUNCTION IF EXISTS is_super_admin()       CASCADE;
DROP FUNCTION IF EXISTS is_admin()             CASCADE;
DROP FUNCTION IF EXISTS is_staff_or_higher()   CASCADE;

-- Drop tables (urutan penting — child dulu, baru parent)
DROP TABLE IF EXISTS pending_invites        CASCADE;
DROP TABLE IF EXISTS activity_logs          CASCADE;
DROP TABLE IF EXISTS customer_requests      CASCADE;
DROP TABLE IF EXISTS inspiration_gallery    CASCADE;
DROP TABLE IF EXISTS gallery_categories     CASCADE;
DROP TABLE IF EXISTS order_items            CASCADE;
DROP TABLE IF EXISTS orders                 CASCADE;
DROP TABLE IF EXISTS featured_products      CASCADE;
DROP TABLE IF EXISTS product_images         CASCADE;
DROP TABLE IF EXISTS products               CASCADE;
DROP TABLE IF EXISTS product_collections    CASCADE;
DROP TABLE IF EXISTS product_categories     CASCADE;
DROP TABLE IF EXISTS profiles               CASCADE;
DROP TABLE IF EXISTS roles                  CASCADE;

-- ============================================================
-- Setelah ini, jalankan 001_initial_schema.sql untuk rebuild
-- ============================================================
