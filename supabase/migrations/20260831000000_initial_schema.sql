-- Forevere Jewellary Database Migration
-- Enabled UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  loyalty_points INT DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  discount_percent NUMERIC(5,2) DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CARTS / CART ITEMS
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'placed' CHECK (status IN ('placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  discount_amount NUMERIC(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  coupon_code TEXT,
  shipping_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  gift_message TEXT,
  is_gift BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  price_snapshot NUMERIC(10,2) NOT NULL CHECK (price_snapshot >= 0),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

-- 8. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent NUMERIC(5,2) CHECK (discount_percent IS NULL OR (discount_percent >= 0 AND discount_percent <= 100)),
  discount_amount NUMERIC(10,2) CHECK (discount_amount IS NULL OR discount_amount >= 0),
  min_order_value NUMERIC(10,2) DEFAULT 0,
  max_uses INT DEFAULT 1000,
  times_used INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SPEND DISCOUNT TIERS
CREATE TABLE IF NOT EXISTS public.spend_discount_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_spend NUMERIC(10,2) NOT NULL CHECK (min_spend >= 0),
  discount_percent NUMERIC(5,2) NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. OFFERS
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  bank_or_payment_method TEXT,
  discount_detail TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. POINTS SETTINGS (single-row configuration)
CREATE TABLE IF NOT EXISTS public.points_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  points_per_currency_unit NUMERIC(10,4) DEFAULT 0.05,
  point_name_singular TEXT DEFAULT 'Jewel Point',
  point_name_plural TEXT DEFAULT 'Jewel Points',
  point_to_coupon_conversion_rules JSONB DEFAULT '[{"points": 100, "discount_amount": 100}, {"points": 250, "discount_amount": 300}, {"points": 500, "discount_amount": 700}]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. POINTS LEDGER
CREATE TABLE IF NOT EXISTS public.points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INT NOT NULL,
  reason TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. REDEEMABLE COUPONS
CREATE TABLE IF NOT EXISTS public.redeemable_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  points_cost INT NOT NULL CHECK (points_cost > 0),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. HOMEPAGE CONTENT
CREATE TABLE IF NOT EXISTS public.homepage_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_image TEXT,
  hero_headline TEXT,
  hero_subheadline TEXT,
  about_us_text TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. PAYMENT METHODS
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  icon TEXT,
  sort_order INT DEFAULT 0
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spend_discount_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redeemable_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users RLS
CREATE POLICY "Users can read own record" ON public.users FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can insert own record" ON public.users FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

-- Public Read Metadata Tables (Products, Categories, Offers, Coupons, Spend Tiers, Points Settings, Redeemable Coupons, Homepage, Payment Methods, Reviews)
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin write categories" ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admin write products" ON public.products FOR ALL USING (public.is_admin());

CREATE POLICY "Public read offers" ON public.offers FOR SELECT USING (active = true OR public.is_admin());
CREATE POLICY "Admin write offers" ON public.offers FOR ALL USING (public.is_admin());

CREATE POLICY "Public read coupons" ON public.coupons FOR SELECT USING (active = true OR public.is_admin());
CREATE POLICY "Admin write coupons" ON public.coupons FOR ALL USING (public.is_admin());

CREATE POLICY "Public read spend_discount_tiers" ON public.spend_discount_tiers FOR SELECT USING (true);
CREATE POLICY "Admin write spend_discount_tiers" ON public.spend_discount_tiers FOR ALL USING (public.is_admin());

CREATE POLICY "Public read points_settings" ON public.points_settings FOR SELECT USING (true);
CREATE POLICY "Admin write points_settings" ON public.points_settings FOR ALL USING (public.is_admin());

CREATE POLICY "Public read redeemable_coupons" ON public.redeemable_coupons FOR SELECT USING (true);
CREATE POLICY "Admin write redeemable_coupons" ON public.redeemable_coupons FOR ALL USING (public.is_admin());

CREATE POLICY "Public read homepage_content" ON public.homepage_content FOR SELECT USING (true);
CREATE POLICY "Admin write homepage_content" ON public.homepage_content FOR ALL USING (public.is_admin());

CREATE POLICY "Public read payment_methods" ON public.payment_methods FOR SELECT USING (enabled = true OR public.is_admin());
CREATE POLICY "Admin write payment_methods" ON public.payment_methods FOR ALL USING (public.is_admin());

CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customer insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Customer Private Tables (Addresses, Cart Items, Orders, Order Items, Points Ledger)
CREATE POLICY "Customer read/write own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Customer read/write own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Customer read/write own orders" ON public.orders FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Customer read order items for own order" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Customer read own points ledger" ON public.points_ledger FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
