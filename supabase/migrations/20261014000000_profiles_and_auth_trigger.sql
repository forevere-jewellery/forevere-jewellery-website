-- ==============================================================================
-- FOREVERE JEWELLERY - PROFILES TABLE & AUTH TRIGGER MIGRATION
-- Migration: 20261014000000_profiles_and_auth_trigger.sql
-- ==============================================================================

-- 1. Create PROFILES table extending auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  points INT DEFAULT 0,
  loyalty_points INT DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure loyalty_points stays synchronized with points
CREATE OR REPLACE FUNCTION public.sync_profile_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.points IS DISTINCT FROM OLD.points AND NEW.loyalty_points IS NOT DISTINCT FROM OLD.loyalty_points THEN
    NEW.loyalty_points := NEW.points;
  ELSIF NEW.loyalty_points IS DISTINCT FROM OLD.loyalty_points AND NEW.points IS NOT DISTINCT FROM OLD.points THEN
    NEW.points := NEW.loyalty_points;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_profile_points ON public.profiles;
CREATE TRIGGER tr_sync_profile_points
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_points();

-- 2. Create handle_new_user() trigger function on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_full_name TEXT;
  new_phone TEXT;
  new_role TEXT;
  new_ref_code TEXT;
BEGIN
  -- Extract full_name and phone from metadata or user object
  new_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(COALESCE(NEW.email, ''), '@', 1)
  );

  new_phone := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'phone',
    NULL
  );

  -- Explicitly designate admin@forevere.com as admin, otherwise customer
  IF LOWER(COALESCE(NEW.email, '')) = 'admin@forevere.com' THEN
    new_role := 'admin';
  ELSIF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    new_role := 'admin';
  ELSE
    new_role := 'customer';
  END IF;

  -- Generate unique referral code
  new_ref_code := 'REF' || UPPER(SUBSTRING(MD5(NEW.id::TEXT || RANDOM()::TEXT) FROM 1 FOR 6));

  -- Insert or update public.profiles
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    role,
    points,
    loyalty_points,
    referral_code,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    new_full_name,
    NEW.email,
    new_phone,
    new_role,
    50, -- 50 Welcome bonus points
    50,
    new_ref_code,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN EXCLUDED.full_name IS NOT NULL AND EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    phone = CASE WHEN EXCLUDED.phone IS NOT NULL AND EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE public.profiles.phone END,
    role = CASE WHEN LOWER(EXCLUDED.email) = 'admin@forevere.com' THEN 'admin' ELSE public.profiles.role END,
    updated_at = NOW();

  -- Maintain backward compatibility with public.users if table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    BEGIN
      INSERT INTO public.users (
        id,
        full_name,
        phone,
        phone_verified,
        role,
        loyalty_points,
        referral_code,
        created_at
      )
      VALUES (
        NEW.id,
        new_full_name,
        new_phone,
        NEW.phone_confirmed_at IS NOT NULL,
        new_role,
        50,
        new_ref_code,
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        full_name = CASE WHEN EXCLUDED.full_name IS NOT NULL AND EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.users.full_name END,
        phone = CASE WHEN EXCLUDED.phone IS NOT NULL AND EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE public.users.phone END,
        role = CASE WHEN LOWER(NEW.email) = 'admin@forevere.com' THEN 'admin' ELSE public.users.role END;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore any secondary sync errors
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Enable RLS and setup policies for public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security Definer admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- RLS Policies on profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 4. Backfill profiles for all existing auth.users
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  phone,
  role,
  points,
  loyalty_points,
  referral_code,
  created_at,
  updated_at
)
SELECT
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    (SELECT full_name FROM public.users usr WHERE usr.id = u.id LIMIT 1),
    split_part(COALESCE(u.email, ''), '@', 1)
  ),
  u.email,
  COALESCE(u.phone, u.raw_user_meta_data->>'phone', (SELECT phone FROM public.users usr WHERE usr.id = u.id LIMIT 1)),
  CASE
    WHEN LOWER(COALESCE(u.email, '')) = 'admin@forevere.com' THEN 'admin'
    ELSE 'customer'
  END,
  100,
  100,
  'REF' || UPPER(SUBSTRING(MD5(u.id::TEXT) FROM 1 FOR 6)),
  COALESCE(u.created_at, NOW()),
  NOW()
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = CASE WHEN LOWER(EXCLUDED.email) = 'admin@forevere.com' THEN 'admin' ELSE public.profiles.role END;

-- Explicitly ensure admin@forevere.com is admin
UPDATE public.profiles
SET role = 'admin'
WHERE LOWER(email) = 'admin@forevere.com';

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    UPDATE public.users
    SET role = 'admin'
    WHERE id IN (SELECT id FROM auth.users WHERE LOWER(email) = 'admin@forevere.com');
  END IF;
END $$;
