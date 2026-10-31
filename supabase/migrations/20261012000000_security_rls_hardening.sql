-- ==============================================================================
-- FOREVERE JEWELLARY - SECURITY & ROW LEVEL SECURITY (RLS) HARDENING MIGRATION
-- Migration: 20261012000000_security_rls_hardening.sql
-- ==============================================================================

-- 1. Ensure Row Level Security is strictly enabled on every public table
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.spend_discount_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.points_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.redeemable_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_methods ENABLE ROW LEVEL SECURITY;

-- 2. Hardened Admin Verification Helper Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Authenticated user must exist and have the 'admin' role in public.users
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke execute from public/anon, grant only to authenticated
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ==============================================================================
-- 3. DROP INSECURE OR LEGACY POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Users can read own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Admin write categories" ON public.categories;
DROP POLICY IF EXISTS "Public read active products" ON public.products;
DROP POLICY IF EXISTS "Admin write products" ON public.products;
DROP POLICY IF EXISTS "Public read offers" ON public.offers;
DROP POLICY IF EXISTS "Admin write offers" ON public.offers;
DROP POLICY IF EXISTS "Public read coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admin write coupons" ON public.coupons;
DROP POLICY IF EXISTS "Public read spend_discount_tiers" ON public.spend_discount_tiers;
DROP POLICY IF EXISTS "Admin write spend_discount_tiers" ON public.spend_discount_tiers;
DROP POLICY IF EXISTS "Public read points_settings" ON public.points_settings;
DROP POLICY IF EXISTS "Admin write points_settings" ON public.points_settings;
DROP POLICY IF EXISTS "Public read redeemable_coupons" ON public.redeemable_coupons;
DROP POLICY IF EXISTS "Admin write redeemable_coupons" ON public.redeemable_coupons;
DROP POLICY IF EXISTS "Public read homepage_content" ON public.homepage_content;
DROP POLICY IF EXISTS "Admin write homepage_content" ON public.homepage_content;
DROP POLICY IF EXISTS "Public read payment_methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admin write payment_methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Customer insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Customer read/write own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Customer read/write own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Customer read/write own orders" ON public.orders;
DROP POLICY IF EXISTS "Customer read order items for own order" ON public.order_items;
DROP POLICY IF EXISTS "Customer read own points ledger" ON public.points_ledger;

-- ==============================================================================
-- 4. CUSTOMER PROFILE TABLE (public.users)
-- ==============================================================================
-- Customers can only read and update their own profile; admins have full access.
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK ((auth.uid() = id AND role = 'customer') OR public.is_admin());

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK ((auth.uid() = id AND role = 'customer') OR public.is_admin());

-- ==============================================================================
-- 5. PUBLIC READ-ONLY CATALOG TABLES (Categories, Products, Offers, Coupons, etc.)
-- ==============================================================================
-- Categories: Public read, only admin can insert/update/delete
CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admin write categories"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Products: Public can only view active products; admin can view and write all
CREATE POLICY "Public read active products"
  ON public.products FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin write products"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Offers: Public can read active offers; admin writes
CREATE POLICY "Public read active offers"
  ON public.offers FOR SELECT
  USING (active = true OR public.is_admin());

CREATE POLICY "Admin write offers"
  ON public.offers FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Coupons: Public can view active coupons; admin writes
CREATE POLICY "Public read active coupons"
  ON public.coupons FOR SELECT
  USING (active = true OR public.is_admin());

CREATE POLICY "Admin write coupons"
  ON public.coupons FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Spend Discount Tiers
CREATE POLICY "Public read spend_discount_tiers"
  ON public.spend_discount_tiers FOR SELECT
  USING (true);

CREATE POLICY "Admin write spend_discount_tiers"
  ON public.spend_discount_tiers FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Points Settings
CREATE POLICY "Public read points_settings"
  ON public.points_settings FOR SELECT
  USING (true);

CREATE POLICY "Admin write points_settings"
  ON public.points_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Redeemable Coupons
CREATE POLICY "Public read redeemable_coupons"
  ON public.redeemable_coupons FOR SELECT
  USING (true);

CREATE POLICY "Admin write redeemable_coupons"
  ON public.redeemable_coupons FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Homepage Content
CREATE POLICY "Public read homepage_content"
  ON public.homepage_content FOR SELECT
  USING (true);

CREATE POLICY "Admin write homepage_content"
  ON public.homepage_content FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Payment Methods
CREATE POLICY "Public read payment_methods"
  ON public.payment_methods FOR SELECT
  USING (enabled = true OR public.is_admin());

CREATE POLICY "Admin write payment_methods"
  ON public.payment_methods FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Reviews: Public read, authenticated customer can insert own review, admin can moderate/delete
CREATE POLICY "Public read reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Customer insert own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin manage reviews"
  ON public.reviews FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 6. CUSTOMER PRIVATE DATA (Addresses, Cart, Orders, Points)
-- ==============================================================================
-- Addresses: Customers can CRUD only their own rows
CREATE POLICY "Customer select own addresses"
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Customer insert own addresses"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Customer update own addresses"
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Customer delete own addresses"
  ON public.addresses FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- Cart Items: Customers can CRUD only their own cart items
CREATE POLICY "Customer select own cart"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Customer insert own cart"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Customer update own cart"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Orders: Customer can read own orders; create own order; only admin can update status
CREATE POLICY "Customer select own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Customer create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admin update orders status"
  ON public.orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete orders"
  ON public.orders FOR DELETE
  USING (public.is_admin());

-- Order Items
CREATE POLICY "Customer select own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Customer insert order items for own order"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admin manage order items"
  ON public.order_items FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Points Ledger: Customers can only view their own point transactions
CREATE POLICY "Customer select own points"
  ON public.points_ledger FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admin manage points ledger"
  ON public.points_ledger FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 7. STORAGE BUCKET POLICIES (Private Storage with Admin Uploads Only)
-- ==============================================================================
-- Ensure product-images bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());
