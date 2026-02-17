
-- Fix: restrict user_roles policy to authenticated only
DROP POLICY "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
