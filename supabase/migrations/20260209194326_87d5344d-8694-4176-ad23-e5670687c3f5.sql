
-- Create a database webhook trigger to auto-send voucher emails on teacher registration
-- Using pg_net to call the edge function
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.notify_voucher_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only trigger for teachers in top 10
  IF NEW.visit_order IS NOT NULL AND NEW.visit_order <= 10 THEN
    PERFORM extensions.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/trigger-voucher-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY')
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_teacher_insert_send_voucher_email
  AFTER INSERT ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_voucher_email();
