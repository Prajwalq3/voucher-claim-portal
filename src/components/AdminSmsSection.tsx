import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminSmsSection = () => {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);

  const handleSendManualSms = async () => {
    if (!phone || !message) {
      toast.error("Please enter both phone number and message");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-manual-sms", {
        body: { phone_number: phone, message },
      });
      if (error) throw error;
      toast.success("SMS sent successfully! 📱");
      setPhone("");
      setMessage("");
    } catch (err: any) {
      toast.error("Failed to send SMS: " + (err.message || "Unknown error"));
    }
    setSending(false);
  };

  const handleSendSmsToAll = async () => {
    setSendingAll(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-voucher-sms", {
        body: { send_to_all_eligible: true },
      });
      if (error) throw error;
      toast.success(`${data?.message || "SMS sent to eligible teachers!"}`);
    } catch (err: any) {
      toast.error("Failed to send SMS: " + (err.message || "Unknown error"));
    }
    setSendingAll(false);
  };

  return (
    <div className="mx-auto mt-12 max-w-md">
      <h3 className="mb-6 text-center font-display text-xl tracking-wider text-gold">
        Admin SMS Panel
      </h3>

      {/* Send to all eligible */}
      <div className="mb-6 text-center">
        <Button
          onClick={handleSendSmsToAll}
          disabled={sendingAll}
          variant="outline"
          className="border-gold/30 text-gold hover:bg-gold/10"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          {sendingAll ? "SENDING..." : "SEND SMS TO ALL ELIGIBLE"}
        </Button>
      </div>

      {/* Manual SMS */}
      <div className="rounded-xl border border-gold/20 bg-card/50 p-6 backdrop-blur-md">
        <h4 className="mb-4 font-semibold text-cream">Send Manual SMS</h4>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-cream/70">Phone Number</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9XXXXXXXXX"
              className="border-gold/20 bg-background/50 text-cream"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-cream/70">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="border-gold/20 bg-background/50 text-cream"
              rows={3}
            />
          </div>
          <Button
            onClick={handleSendManualSms}
            disabled={sending}
            className="w-full bg-gold font-display text-sm tracking-wider text-background transition-all hover:bg-gold-light"
          >
            <Send className="mr-2 h-4 w-4" />
            {sending ? "SENDING..." : "SEND SMS"}
          </Button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-cream/40">
        Note: Twilio trial accounts can only send to verified numbers.
      </p>
    </div>
  );
};

export default AdminSmsSection;
