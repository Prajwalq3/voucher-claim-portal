import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Coffee, UtensilsCrossed, Gift, Check, ArrowLeft, Cake } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AdminSmsSection from "@/components/AdminSmsSection";
 
 interface VoucherType {
   id: string;
   name: string;
   description: string;
   icon: React.ReactNode;
   positions: number[];
 }
 
 const voucherTypes: VoucherType[] = [
   {
     id: "coffee",
     name: "Coffee Voucher",
     description: "Complimentary coffee at the faculty lounge",
     icon: <Coffee className="h-8 w-8" />,
     positions: [10, 9, 8, 7],
   },
   {
     id: "burger",
     name: "Burger Voucher",
     description: "Delicious burger at the festival food court",
     icon: <UtensilsCrossed className="h-8 w-8" />,
     positions: [6, 5, 4],
   },
   {
     id: "combo_coffee_burger",
     name: "Combo: Coffee + Burger",
     description: "Coffee and burger combo deal",
     icon: <Gift className="h-8 w-8" />,
     positions: [3, 2],
   },
   {
     id: "premium_combo",
     name: "Premium Combo",
     description: "Coffee + Burger + Dark Chocolate",
     icon: <Cake className="h-8 w-8" />,
     positions: [1],
   },
 ];
 
 const Vouchers = () => {
   const navigate = useNavigate();
   const { user, teacher, loading } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [claimedVoucher, setClaimedVoucher] = useState<string | null>(null);
  const [eligibleVoucher, setEligibleVoucher] = useState<VoucherType | null>(null);
  
 
   useEffect(() => {
     if (!loading && !user) {
       navigate("/auth");
     }
   }, [user, loading, navigate]);
 
   useEffect(() => {
     if (teacher) {
       checkVoucherStatus();
       determineEligibleVoucher();
     }
   }, [teacher]);
 
   const checkVoucherStatus = async () => {
     if (!teacher) return;
 
     const { data } = await (supabase.from("voucher_claims") as any)
       .select("voucher_type")
       .eq("teacher_id", teacher.id)
       .single();
 
     if (data) {
       setHasClaimed(true);
       setClaimedVoucher(data.voucher_type);
     }
   };
 
   const determineEligibleVoucher = () => {
     if (!teacher?.visit_order) return;
 
     const position = teacher.visit_order;
     
     // Only first 10 get vouchers
     if (position > 10) {
       setEligibleVoucher(null);
       return;
     }
 
     const voucher = voucherTypes.find((v) => v.positions.includes(position));
     setEligibleVoucher(voucher || null);
   };
 
   const handleClaimVoucher = async () => {
     if (!teacher || !eligibleVoucher) return;
 
     setClaiming(true);
 
     const { error } = await (supabase.from("voucher_claims") as any).insert({
       teacher_id: teacher.id,
       voucher_type: eligibleVoucher.id,
     });
 
     setClaiming(false);
 
     if (error) {
       if (error.message.includes("duplicate")) {
         toast.error("You have already claimed your voucher.");
       } else {
         toast.error("Failed to claim voucher. Please try again.");
       }
       return;
     }
 
    setHasClaimed(true);
    setClaimedVoucher(eligibleVoucher.id);
    toast.success("Voucher claimed successfully! 🎉");
  };

 
   if (loading) {
     return (
       <div className="flex min-h-screen items-center justify-center bg-deep-black">
         <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
       </div>
     );
   }
 
   return (
     <section className="relative min-h-screen w-full overflow-hidden bg-deep-black">
       <div className="stars pointer-events-none" />
       
       <div className="relative z-10 min-h-screen px-6 py-12">
         {/* Back Button */}
         <Link
           to="/"
           className="mb-8 inline-flex items-center gap-2 text-sm text-cream/70 transition-colors hover:text-gold"
         >
           <ArrowLeft className="h-4 w-4" />
           Back to Home
         </Link>
 
         {/* Header */}
         <div className="mb-12 text-center">
           <div className="mb-4 flex items-center justify-center gap-3">
             <Gift className="h-8 w-8 text-gold" />
             <span className="font-display text-sm tracking-[0.3em] text-gold">COMPLIMENTARY</span>
             <Gift className="h-8 w-8 text-gold" />
           </div>
           <h1 className="font-heading text-4xl font-semibold italic text-cream md:text-5xl lg:text-6xl">
             Food Vouchers
           </h1>
           <p className="mt-4 text-cream/70">
             First 10 faculty members to visit get exclusive vouchers!
           </p>
         </div>
 
         {/* Teacher Info */}
         {teacher && (
           <div className="mx-auto mb-8 max-w-md rounded-xl border border-gold/20 bg-card/50 p-6 text-center backdrop-blur-md">
             <p className="text-cream/70">Welcome, <span className="text-gold font-semibold">{teacher.name}</span></p>
             <p className="mt-2 text-sm text-cream/50">
               You are visitor #{teacher.visit_order || "N/A"}
             </p>
           </div>
         )}
 
         {/* Voucher Status */}
         <div className="mx-auto max-w-2xl">
           {hasClaimed ? (
             <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center">
               <Check className="mx-auto mb-4 h-16 w-16 text-green-500" />
               <h2 className="font-heading text-2xl text-cream">Voucher Claimed!</h2>
               <p className="mt-2 text-cream/70">
                 You have already claimed your{" "}
                 <span className="font-semibold text-gold">
                   {voucherTypes.find((v) => v.id === claimedVoucher)?.name}
                 </span>
               </p>
               <p className="mt-4 text-sm text-cream/50">
                 Show this at the designated counter to redeem.
               </p>
             </div>
           ) : eligibleVoucher ? (
             <div className="rounded-2xl border border-gold/30 bg-card/50 p-8 text-center backdrop-blur-md">
               <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gold/20 text-gold">
                 {eligibleVoucher.icon}
               </div>
               <h2 className="font-heading text-2xl text-cream">{eligibleVoucher.name}</h2>
               <p className="mt-2 text-cream/70">{eligibleVoucher.description}</p>
               <p className="mt-4 text-sm text-gold">
                 You're eligible for this voucher as visitor #{teacher?.visit_order}!
               </p>
               <Button
                 onClick={handleClaimVoucher}
                 disabled={claiming}
                 className="mt-6 bg-gold px-8 py-6 font-display text-sm tracking-wider text-background transition-all hover:bg-gold-light"
               >
                 {claiming ? "CLAIMING..." : "CLAIM NOW"}
               </Button>
             </div>
           ) : (
             <div className="rounded-2xl border border-muted/30 bg-card/50 p-8 text-center backdrop-blur-md">
               <Gift className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
               <h2 className="font-heading text-2xl text-cream">Not Eligible</h2>
               <p className="mt-2 text-cream/70">
                 Unfortunately, vouchers are only available for the first 10 visitors.
               </p>
               <p className="mt-2 text-sm text-cream/50">
                 Your position: #{teacher?.visit_order || "N/A"}
               </p>
             </div>
           )}
         </div>
 
          {/* Admin SMS Panel */}
          <AdminSmsSection />

          {/* Voucher Guide */}
          <div className="mx-auto mt-12 max-w-3xl">
           <h3 className="mb-6 text-center font-display text-xl tracking-wider text-gold">
             Voucher Distribution
           </h3>
           <div className="grid gap-4 md:grid-cols-2">
             {voucherTypes.map((voucher) => (
               <div
                 key={voucher.id}
                 className="rounded-xl border border-gold/10 bg-card/30 p-4 backdrop-blur-sm"
               >
                 <div className="flex items-center gap-4">
                   <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
                     {voucher.icon}
                   </div>
                   <div>
                     <h4 className="font-semibold text-cream">{voucher.name}</h4>
                     <p className="text-sm text-cream/50">
                       Positions: {voucher.positions.join(", ")}
                     </p>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>
     </section>
   );
 };
 
 export default Vouchers;