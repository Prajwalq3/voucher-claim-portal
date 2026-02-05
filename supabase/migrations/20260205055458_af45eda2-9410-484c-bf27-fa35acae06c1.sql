-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can register as teacher" ON public.teachers;

-- Create a more restrictive insert policy that validates the user_id matches or is null for anon
CREATE POLICY "Users can register as teacher"
ON public.teachers FOR INSERT
TO anon, authenticated
WITH CHECK (
    -- For authenticated users, ensure user_id matches auth.uid()
    -- For anon users during registration flow, user_id will be set by edge function
    user_id IS NULL OR user_id = auth.uid()
);