-- Public storefront policies call this helper to let admins see inactive rows.
-- It is SECURITY DEFINER and only returns whether auth.uid() is an admin, so
-- allowing anon to execute it lets unauthenticated policy checks return false
-- instead of failing with permission denied.
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
-- Prevent authenticated users from assigning themselves an elevated role.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK ((auth.uid() = id AND role = 'customer') OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ((auth.uid() = id AND role = 'customer') OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK ((auth.uid() = id AND role = 'customer') OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK ((auth.uid() = id AND role = 'customer') OR public.is_admin());
