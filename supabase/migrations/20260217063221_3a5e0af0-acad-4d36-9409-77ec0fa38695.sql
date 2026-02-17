
-- Allow admins to view all teachers
CREATE POLICY "Admins can view all teachers"
ON public.teachers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all voucher claims
CREATE POLICY "Admins can view all voucher claims"
ON public.voucher_claims
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
