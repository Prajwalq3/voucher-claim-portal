-- Drop the broken trigger function that uses extensions.http_post (which doesn't exist)
-- and replace with a simpler version that doesn't block inserts

DROP FUNCTION IF EXISTS public.notify_voucher_email() CASCADE;

CREATE OR REPLACE FUNCTION public.notify_voucher_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Simply return NEW to allow the insert to proceed
  -- Voucher emails will be triggered from the application code instead
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_teacher_created
  AFTER INSERT ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_voucher_email();
