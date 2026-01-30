import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Mail, Lock, CheckCircle, GraduationCap } from "lucide-react";
import { toast } from "sonner";

const LoginSection = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Login successful! Redirecting...");
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-deep-black">
      {/* Stars background */}
      <div className="stars pointer-events-none" />
      
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Gift className="h-8 w-8 text-gold" />
            <span className="font-display text-sm tracking-[0.3em] text-gold">EXCLUSIVE FOR TEACHERS</span>
            <Gift className="h-8 w-8 text-gold" />
          </div>
          <h2 className="font-heading text-4xl font-semibold italic text-cream md:text-5xl lg:text-6xl">
            Verify Your ID
          </h2>
          <p className="mt-4 font-heading text-xl text-cream/80 md:text-2xl">
            Claim Your <span className="text-gold">Free Vouchers</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Login with your faculty credentials to access exclusive festival benefits
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gold/20 bg-card/50 p-8 backdrop-blur-md">
            {/* Header with icon */}
            <div className="mb-8 flex items-center justify-center gap-3">
              <GraduationCap className="h-6 w-6 text-gold" />
              <span className="font-display text-lg tracking-wider text-cream">Faculty Login</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-cream/80">
                  Faculty Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.name@silicon.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gold/30 bg-background/50 pl-10 text-cream placeholder:text-muted-foreground focus:border-gold focus:ring-gold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-cream/80">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gold/30 bg-background/50 pl-10 text-cream placeholder:text-muted-foreground focus:border-gold focus:ring-gold"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gold py-6 font-display text-sm tracking-wider text-background transition-all hover:bg-gold-light hover:shadow-lg animate-pulse-glow"
              >
                LOGIN & CLAIM VOUCHERS
              </Button>
            </form>

            {/* Benefits */}
            <div className="mt-8 space-y-3 border-t border-gold/20 pt-6">
              <p className="text-center text-xs tracking-wider text-muted-foreground">TEACHER BENEFITS</p>
              <div className="grid gap-2">
                {["Complimentary food vouchers", "Priority event access", "Exclusive faculty lounge access"].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-sm text-cream/70">
                    <CheckCircle className="h-4 w-4 text-gold" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginSection;
