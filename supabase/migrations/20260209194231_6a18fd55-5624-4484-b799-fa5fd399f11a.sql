
-- Fix voucher_claims policies: drop RESTRICTIVE ones and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Teachers can claim vouchers" ON public.voucher_claims;
DROP POLICY IF EXISTS "Teachers can view their claims" ON public.voucher_claims;

CREATE POLICY "Teachers can claim vouchers"
ON public.voucher_claims
FOR INSERT
TO authenticated
WITH CHECK (teacher_id = get_teacher_id());

CREATE POLICY "Teachers can view their claims"
ON public.voucher_claims
FOR SELECT
TO authenticated
USING (teacher_id = get_teacher_id());

-- Also fix teachers table policies to be PERMISSIVE
DROP POLICY IF EXISTS "Teachers can view their own profile" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can update their own profile" ON public.teachers;
DROP POLICY IF EXISTS "Users can register as teacher" ON public.teachers;

CREATE POLICY "Teachers can view their own profile"
ON public.teachers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Teachers can update their own profile"
ON public.teachers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can register as teacher"
ON public.teachers
FOR INSERT
TO authenticated
WITH CHECK ((user_id IS NULL) OR (user_id = auth.uid()));
