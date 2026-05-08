-- ============================================================
-- Glory8 Products — Full Database Migration
-- Run this in Supabase SQL Editor
-- ============================================================
-- NOTE: Zero hardcoded seed data. All categories, collections,
-- products, gallery categories, etc. are managed via the admin
-- dashboard by Super Admin.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE
);

-- Only seed the role names (not content data)
INSERT INTO roles (name) VALUES ('super_admin'), ('admin'), ('staff')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- PROFILES (linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  text,
  email      text,
  phone      text,
  role_id    uuid REFERENCES roles(id),
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ============================================================
-- PRODUCT CATEGORIES (created/managed by Super Admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_categories (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text,
  image_url   text,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- PRODUCT COLLECTIONS (created/managed by Super Admin / Admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_collections (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text,
  banner_url  text,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- GALLERY CATEGORIES (created/managed by Admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_categories (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       text NOT NULL UNIQUE,
  is_active  boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                text NOT NULL,
  slug                text NOT NULL UNIQUE,
  short_description   text,
  description         text,
  price               numeric(15,2) NOT NULL DEFAULT 0,
  unit                text NOT NULL DEFAULT 'm²',
  stock               int NOT NULL DEFAULT 0,
  category_id         uuid REFERENCES product_categories(id),
  collection_id       uuid REFERENCES product_collections(id),
  thickness           text,
  dimensions          text,
  installation_type   text,
  water_resistance    text,
  features            jsonb DEFAULT '[]',
  is_active           boolean NOT NULL DEFAULT true,
  is_featured         boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS set_products_updated_at ON products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        text NOT NULL,
  alt        text,
  is_primary boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- ============================================================
-- FEATURED PRODUCTS (managed via admin dashboard)
-- ============================================================
CREATE TABLE IF NOT EXISTS featured_products (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name   text NOT NULL,
  customer_phone  text,
  customer_email  text,
  notes           text,
  admin_region    text NOT NULL DEFAULT 'jakarta',
  subtotal        numeric(15,2) NOT NULL DEFAULT 0,
  total           numeric(15,2) NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'pending',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_orders_updated_at ON orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    uuid REFERENCES products(id),
  product_name  text NOT NULL,
  quantity      int NOT NULL DEFAULT 1,
  unit_price    numeric(15,2) NOT NULL DEFAULT 0,
  subtotal      numeric(15,2) NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid REFERENCES auth.users(id),
  action      text NOT NULL,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================================
-- CUSTOMER REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_requests (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       text NOT NULL,
  email      text,
  phone      text,
  subject    text,
  message    text NOT NULL,
  status     text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INSPIRATION GALLERY
-- ============================================================
CREATE TABLE IF NOT EXISTS inspiration_gallery (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  url        text NOT NULL,
  title      text,
  category   text,  -- matches gallery_categories.name
  is_active  boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images        ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspiration_gallery   ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.name = 'super_admin' AND p.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.name IN ('admin', 'super_admin') AND p.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION is_staff_or_higher()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.name IN ('staff', 'admin', 'super_admin') AND p.is_active = true
  );
$$;

-- PROFILES
CREATE POLICY "Users can view own profile"       ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles"     ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Users can update own profile"     ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Super admins manage all profiles" ON profiles FOR ALL USING (is_super_admin());

-- PRODUCT CATEGORIES
CREATE POLICY "Public read active categories"    ON product_categories FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins manage categories"         ON product_categories FOR ALL USING (is_admin());

-- PRODUCT COLLECTIONS
CREATE POLICY "Public read active collections"   ON product_collections FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins manage collections"        ON product_collections FOR ALL USING (is_admin());

-- GALLERY CATEGORIES
CREATE POLICY "Public read gallery categories"   ON gallery_categories FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins manage gallery categories" ON gallery_categories FOR ALL USING (is_admin());

-- PRODUCTS
CREATE POLICY "Public read active products"      ON products FOR SELECT USING (is_active = true OR is_staff_or_higher());
CREATE POLICY "Admins manage products"           ON products FOR ALL USING (is_admin());

-- PRODUCT IMAGES
CREATE POLICY "Public read product images"       ON product_images FOR SELECT USING (true);
CREATE POLICY "Admins manage product images"     ON product_images FOR ALL USING (is_admin());

-- FEATURED PRODUCTS
CREATE POLICY "Public read featured products"    ON featured_products FOR SELECT USING (true);
CREATE POLICY "Admins manage featured products"  ON featured_products FOR ALL USING (is_admin());

-- ORDERS
CREATE POLICY "Anyone can create orders"         ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can view orders"            ON orders FOR SELECT USING (is_staff_or_higher());
CREATE POLICY "Staff can update orders"          ON orders FOR UPDATE USING (is_staff_or_higher());

-- ORDER ITEMS
CREATE POLICY "Anyone can create order items"    ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can view order items"       ON order_items FOR SELECT USING (is_staff_or_higher());

-- ACTIVITY LOGS
CREATE POLICY "Staff view activity logs"         ON activity_logs FOR SELECT USING (is_staff_or_higher());
CREATE POLICY "Auth users insert logs"           ON activity_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- CUSTOMER REQUESTS
CREATE POLICY "Anyone create requests"           ON customer_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff view requests"              ON customer_requests FOR SELECT USING (is_staff_or_higher());
CREATE POLICY "Staff update requests"            ON customer_requests FOR UPDATE USING (is_staff_or_higher());

-- INSPIRATION GALLERY
CREATE POLICY "Public read active gallery"       ON inspiration_gallery FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins manage gallery"            ON inspiration_gallery FOR ALL USING (is_admin());

-- ============================================================
-- STORAGE BUCKET SETUP
-- ============================================================
-- Run this in SQL Editor or via Supabase Dashboard > Storage:
--
-- INSERT INTO storage.buckets (id, name, public)
--   VALUES ('glory8-assets', 'glory8-assets', true)
--   ON CONFLICT (id) DO NOTHING;
--
-- Storage Policies:
-- CREATE POLICY "Public read assets"
--   ON storage.objects FOR SELECT USING (bucket_id = 'glory8-assets');
-- CREATE POLICY "Admins upload assets"
--   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'glory8-assets' AND is_admin());
-- CREATE POLICY "Admins delete assets"
--   ON storage.objects FOR DELETE USING (bucket_id = 'glory8-assets' AND is_admin());

-- ============================================================
-- FIRST SUPER ADMIN SETUP
-- ============================================================
-- After migration:
-- 1. Create user via Supabase Auth Dashboard (or /login page)
-- 2. Run this SQL to promote to Super Admin:
--
-- UPDATE profiles
-- SET role_id = (SELECT id FROM roles WHERE name = 'super_admin'),
--     full_name = 'Nama Anda'
-- WHERE email = 'your@email.com';
--
-- 3. Login ke /login — Super Admin bisa langsung buat pengguna baru,
--    kategori, koleksi, dan semua konten dari dashboard.
-- ============================================================

-- ============================================================
-- PENDING INVITES
-- Saat Super Admin undang user, role disimpan di sini.
-- Trigger otomatis terapkan role saat user signup.
-- ============================================================
CREATE TABLE IF NOT EXISTS pending_invites (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       text NOT NULL UNIQUE,
  full_name   text,
  phone       text,
  role_id     uuid REFERENCES roles(id),
  invited_at  timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

-- Override handle_new_user agar cek pending_invites
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  invite_record pending_invites%ROWTYPE;
BEGIN
  -- Cek apakah ada invite untuk email ini
  SELECT * INTO invite_record
  FROM pending_invites
  WHERE email = NEW.email
  LIMIT 1;

  IF FOUND THEN
    -- Insert profile dengan role dari invite
    INSERT INTO profiles (id, email, full_name, phone, role_id)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(invite_record.full_name, NEW.raw_user_meta_data->>'full_name'),
      invite_record.phone,
      invite_record.role_id
    )
    ON CONFLICT (id) DO NOTHING;

    -- Tandai invite sebagai diterima
    UPDATE pending_invites
    SET accepted_at = now()
    WHERE email = NEW.email;
  ELSE
    -- User biasa tanpa invite
    INSERT INTO profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- RLS untuk pending_invites
ALTER TABLE pending_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage invites"
  ON pending_invites FOR ALL USING (is_super_admin());
