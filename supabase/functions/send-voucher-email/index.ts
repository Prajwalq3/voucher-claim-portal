import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VoucherEmailRequest {
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

const handler = async (req: Request): Promise<Response> => {
  console.log("Voucher email function called");
  
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
    
    const { teacher_id, send_to_all_eligible }: VoucherEmailRequest = await req.json();
    
    let teachersToEmail: any[] = [];

    if (send_to_all_eligible) {
      // Get all eligible teachers (visit_order 1-10) who haven't claimed yet
      const { data: eligibleTeachers, error: teachersError } = await supabase
        .from("teachers")
        .select("id, name, faculty_email, visit_order")
        .lte("visit_order", 10)
        .order("visit_order", { ascending: true });

      if (teachersError) throw teachersError;

      // Filter out those who already claimed
      const { data: claims } = await supabase
        .from("voucher_claims")
        .select("teacher_id");

      const claimedIds = new Set(claims?.map((c: any) => c.teacher_id) || []);
      teachersToEmail = (eligibleTeachers || []).filter((t: any) => !claimedIds.has(t.id));
      
      console.log(`Found ${teachersToEmail.length} eligible teachers without claims`);
    } else if (teacher_id) {
      // Single teacher
      const { data: teacher, error } = await supabase
        .from("teachers")
        .select("id, name, faculty_email, visit_order")
        .eq("id", teacher_id)
        .single();

      if (error) throw error;
      if (teacher && teacher.visit_order <= 10) {
        teachersToEmail = [teacher];
      }
    }

    if (teachersToEmail.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No eligible teachers to email", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const results = [];
    
    for (const teacher of teachersToEmail) {
      const voucher = getVoucherForPosition(teacher.visit_order);
      if (!voucher) continue;

      console.log(`Sending email to ${teacher.faculty_email} for voucher: ${voucher.name}`);

      try {
        const emailResponse = await resend.emails.send({
          from: "Event Team <onboarding@resend.dev>", // Replace with your verified domain
          to: [teacher.faculty_email],
          subject: "🎉 You're Eligible for a Complimentary Voucher!",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #1a1a2e; color: #f5f5dc; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { color: #d4af37; font-size: 28px; margin: 0; }
                .card { background: linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%); border: 1px solid #d4af37; border-radius: 16px; padding: 30px; margin: 20px 0; }
                .voucher-name { color: #d4af37; font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 10px; }
                .position { text-align: center; color: #f5f5dc; opacity: 0.8; font-size: 14px; }
                .cta { text-align: center; margin-top: 30px; }
                .cta a { background: #d4af37; color: #1a1a2e; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
                .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎁 Congratulations, ${teacher.name}!</h1>
                </div>
                <div class="card">
                  <p style="text-align: center; margin-bottom: 20px;">As one of our first ${teacher.visit_order === 1 ? '' : teacher.visit_order} visitor${teacher.visit_order === 1 ? '' : 's'}, you're eligible for:</p>
                  <div class="voucher-name">${voucher.name}</div>
                  <p class="position">Your position: #${teacher.visit_order}</p>
                </div>
                <div class="cta">
                  <a href="#">Claim Your Voucher Now</a>
                </div>
                <div class="footer">
                  <p>Please visit the vouchers page to claim your reward before the event!</p>
                  <p>This is an exclusive offer for our early visitors.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        results.push({ teacher_id: teacher.id, email: teacher.faculty_email, success: true });
        console.log(`Email sent successfully to ${teacher.faculty_email}`);
      } catch (emailError: any) {
        console.error(`Failed to send email to ${teacher.faculty_email}:`, emailError);
        results.push({ teacher_id: teacher.id, email: teacher.faculty_email, success: false, error: emailError.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${successCount} of ${results.length} emails`,
        sent: successCount,
        results 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-voucher-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
