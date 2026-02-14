import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Trigger voucher SMS function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Webhook payload:", JSON.stringify(payload));

    const record = payload.record;

    if (!record || !record.id || !record.visit_order) {
      console.log("No valid teacher record in payload");
      return new Response(
        JSON.stringify({ success: false, message: "No valid teacher record" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (record.visit_order > 10) {
      console.log(`Teacher ${record.id} is position ${record.visit_order}, not eligible`);
      return new Response(
        JSON.stringify({ success: true, message: "Teacher not eligible for voucher" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Teacher ${record.name} is position ${record.visit_order}, sending voucher SMS`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase.functions.invoke("send-voucher-sms", {
      body: { teacher_id: record.id },
    });

    if (error) {
      console.error("Error invoking send-voucher-sms:", error);
      throw error;
    }

    console.log("Voucher SMS sent:", data);

    return new Response(
      JSON.stringify({ success: true, message: "Voucher SMS triggered", data }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in trigger-voucher-sms function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
