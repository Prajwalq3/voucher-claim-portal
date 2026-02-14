import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VoucherSmsRequest {
  teacher_id?: string;
  send_to_all_eligible?: boolean;
}

const voucherTypes = [
  { id: "premium_combo", name: "Premium Combo (Coffee + Burger + Dark Chocolate)", positions: [1] },
  { id: "combo_coffee_burger", name: "Combo: Coffee + Burger", positions: [3, 2] },
  { id: "burger", name: "Burger Voucher", positions: [6, 5, 4] },
  { id: "coffee", name: "Coffee Voucher", positions: [10, 9, 8, 7] },
];

function getVoucherForPosition(position: number) {
  if (position > 10) return null;
  return voucherTypes.find((v) => v.positions.includes(position));
}

async function sendSms(to: string, body: string) {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Missing Twilio environment variables");
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: body,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Twilio error: ${data.message || JSON.stringify(data)}`);
  }

  return data;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Voucher SMS function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { teacher_id, send_to_all_eligible }: VoucherSmsRequest = await req.json();

    let teachersToNotify: any[] = [];

    if (send_to_all_eligible) {
      const { data: eligibleTeachers, error: teachersError } = await supabase
        .from("teachers")
        .select("id, name, phone_number, visit_order")
        .lte("visit_order", 10)
        .order("visit_order", { ascending: true });

      if (teachersError) throw teachersError;

      const { data: claims } = await supabase
        .from("voucher_claims")
        .select("teacher_id");

      const claimedIds = new Set(claims?.map((c: any) => c.teacher_id) || []);
      teachersToNotify = (eligibleTeachers || []).filter((t: any) => !claimedIds.has(t.id));

      console.log(`Found ${teachersToNotify.length} eligible teachers without claims`);
    } else if (teacher_id) {
      const { data: teacher, error } = await supabase
        .from("teachers")
        .select("id, name, phone_number, visit_order")
        .eq("id", teacher_id)
        .single();

      if (error) throw error;
      if (teacher && teacher.visit_order <= 10) {
        teachersToNotify = [teacher];
      }
    }

    if (teachersToNotify.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No eligible teachers to notify", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const results = [];

    for (const teacher of teachersToNotify) {
      const voucher = getVoucherForPosition(teacher.visit_order);
      if (!voucher) continue;

      const smsBody = `🎉 Congratulations ${teacher.name}! As visitor #${teacher.visit_order}, you're eligible for: ${voucher.name}. Visit the vouchers page to claim your reward!`;

      console.log(`Sending SMS to ${teacher.phone_number} for voucher: ${voucher.name}`);

      try {
        await sendSms(teacher.phone_number, smsBody);
        results.push({ teacher_id: teacher.id, phone: teacher.phone_number, success: true });
        console.log(`SMS sent successfully to ${teacher.phone_number}`);
      } catch (smsError: any) {
        console.error(`Failed to send SMS to ${teacher.phone_number}:`, smsError);
        results.push({ teacher_id: teacher.id, phone: teacher.phone_number, success: false, error: smsError.message });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${successCount} of ${results.length} SMS messages`,
        sent: successCount,
        results,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-voucher-sms function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
