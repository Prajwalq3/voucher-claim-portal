-- Create a trigger to automatically set visit_order on teacher insert
CREATE OR REPLACE FUNCTION public.set_teacher_visit_order()
RETURNS TRIGGER AS $$
BEGIN
    SELECT COALESCE(MAX(visit_order), 0) + 1 INTO NEW.visit_order FROM public.teachers;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_visit_order_trigger
BEFORE INSERT ON public.teachers
FOR EACH ROW
WHEN (NEW.visit_order IS NULL)
EXECUTE FUNCTION public.set_teacher_visit_order();

-- Add policy for anon to lookup teachers (for SIC number lookup via edge function)
-- The edge function uses service role, so this is for additional safety