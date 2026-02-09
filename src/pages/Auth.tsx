 import { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Gift, Mail, Lock, User, Phone, GraduationCap, Hash } from "lucide-react";
 import { toast } from "sonner";
 import { useAuth } from "@/hooks/useAuth";
 import { supabase } from "@/integrations/supabase/client";
 import { z } from "zod";
 
 const signupSchema = z.object({
   email: z.string().email("Invalid email address"),
   password: z.string().min(6, "Password must be at least 6 characters"),
   name: z.string().min(2, "Name must be at least 2 characters"),
   phone: z.string().min(10, "Phone number must be at least 10 digits"),
   sicNumber: z.string().min(1, "SIC number is required"),
 });
 
 const loginSchema = z.object({
   sicNumber: z.string().min(1, "SIC number is required"),
   password: z.string().min(1, "Password is required"),
 });
 
 const Auth = () => {
   const navigate = useNavigate();
   const { user, signUp, signOut, loading } = useAuth();
   const [isSubmitting, setIsSubmitting] = useState(false);
   
   // Signup form state
   const [signupData, setSignupData] = useState({
     email: "",
     password: "",
     name: "",
     phone: "",
     sicNumber: "",
   });
   
   // Login form state
   const [loginData, setLoginData] = useState({
     sicNumber: "",
     password: "",
   });
 
   useEffect(() => {
     if (user && !loading) {
       navigate("/");
     }
   }, [user, loading, navigate]);
 
   const handleSignup = async (e: React.FormEvent) => {
     e.preventDefault();
     
     const validation = signupSchema.safeParse(signupData);
     if (!validation.success) {
       toast.error(validation.error.errors[0].message);
       return;
     }
 
     setIsSubmitting(true);
     
      const { error } = await signUp(signupData.email, signupData.password, {
        name: signupData.name,
        phone_number: signupData.phone,
        sic_number: signupData.sicNumber,
      });

      setIsSubmitting(false);

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please login instead.");
        } else if (error.message.includes("duplicate key")) {
          toast.error("This SIC number or email is already registered.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Fetch the teacher's visit order to show them
      const { data: teacherData } = await supabase
        .from("teachers")
        .select("visit_order")
        .eq("faculty_email", signupData.email)
        .single();

      const visitOrder = teacherData?.visit_order;
      if (visitOrder && visitOrder <= 10) {
        toast.success(`🎉 Registration successful! You are visitor #${visitOrder} — you're eligible for a voucher! Check your email.`, { duration: 8000 });
      } else if (visitOrder) {
        toast.success(`Registration successful! You are visitor #${visitOrder}. Check your email to verify your account.`, { duration: 6000 });
      } else {
        toast.success("Registration successful! Please check your email to verify your account.");
      }
   };
 
   const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     
     const validation = loginSchema.safeParse(loginData);
     if (!validation.success) {
       toast.error(validation.error.errors[0].message);
       return;
     }
 
     setIsSubmitting(true);
     
     try {
       // Call edge function to lookup email by SIC number
       const { data, error: lookupError } = await supabase.functions.invoke("lookup-teacher", {
         body: { sic_number: loginData.sicNumber },
       });
 
       if (lookupError || !data?.faculty_email) {
         toast.error("Invalid SIC number. Please check and try again.");
         setIsSubmitting(false);
         return;
       }
 
       // Login with the found email
       const { error } = await supabase.auth.signInWithPassword({
         email: data.faculty_email,
         password: loginData.password,
       });
 
       if (error) {
         toast.error("Invalid credentials. Please check your password.");
         setIsSubmitting(false);
         return;
       }
 
       toast.success("Login successful! Redirecting...");
       navigate("/");
     } catch (err) {
       toast.error("An error occurred. Please try again.");
     }
 
     setIsSubmitting(false);
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
       
       <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-20">
         {/* Header */}
         <div className="mb-12 text-center">
           <div className="mb-4 flex items-center justify-center gap-3">
             <Gift className="h-8 w-8 text-gold" />
             <span className="font-display text-sm tracking-[0.3em] text-gold">EXCLUSIVE FOR TEACHERS</span>
             <Gift className="h-8 w-8 text-gold" />
           </div>
           <h2 className="font-heading text-4xl font-semibold italic text-cream md:text-5xl lg:text-6xl">
             Faculty Portal
           </h2>
           <p className="mt-4 font-heading text-xl text-cream/80 md:text-2xl">
             Claim Your <span className="text-gold">Free Vouchers</span>
           </p>
         </div>
 
         {/* Auth Card */}
         <div className="w-full max-w-md">
           <div className="rounded-2xl border border-gold/20 bg-card/50 p-8 backdrop-blur-md">
             <Tabs defaultValue="login" className="w-full">
               <TabsList className="mb-6 grid w-full grid-cols-2 bg-background/50">
                 <TabsTrigger value="login" className="font-display tracking-wider">Login</TabsTrigger>
                 <TabsTrigger value="signup" className="font-display tracking-wider">Register</TabsTrigger>
               </TabsList>
 
               {/* Login Tab */}
               <TabsContent value="login">
                 <form onSubmit={handleLogin} className="space-y-6">
                   <div className="space-y-2">
                     <Label htmlFor="login-sic" className="text-cream/80">
                       SIC Number
                     </Label>
                     <div className="relative">
                       <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
                       <Input
                         id="login-sic"
                         type="text"
                         placeholder="Enter your SIC number"
                         value={loginData.sicNumber}
                         onChange={(e) => setLoginData({ ...loginData, sicNumber: e.target.value })}
                         className="border-gold/30 bg-background/50 pl-10 text-cream placeholder:text-muted-foreground focus:border-gold focus:ring-gold"
                         required
                       />
                     </div>
                   </div>
 
                   <div className="space-y-2">
                     <Label htmlFor="login-password" className="text-cream/80">
                       College ERP Password
                     </Label>
                     <div className="relative">
                       <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
                       <Input
                         id="login-password"
                         type="password"
                         placeholder="Enter your ERP password"
                         value={loginData.password}
                         onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                         className="border-gold/30 bg-background/50 pl-10 text-cream placeholder:text-muted-foreground focus:border-gold focus:ring-gold"
                         required
                       />
                     </div>
                   </div>
 
                   <Button
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full bg-gold py-6 font-display text-sm tracking-wider text-background transition-all hover:bg-gold-light hover:shadow-lg animate-pulse-glow"
                   >
                     {isSubmitting ? "LOGGING IN..." : "LOGIN & CLAIM VOUCHERS"}
                   </Button>
                 </form>
               </TabsContent>
 
               {/* Signup Tab */}
               <TabsContent value="signup">
                 <form onSubmit={handleSignup} className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="signup-name" className="text-cream/80">
                       Full Name
                     </Label>
                     <div className="relative">
                       <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
                       <Input
                         id="signup-name"
                         type="text"
                         placeholder="Dr. John Doe"
                         value={signupData.name}
                         onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                         className="border-gold/30 bg-background/50 pl-10 text-cream placeholder:text-muted-foreground focus:border-gold focus:ring-gold"
                         required
                       />
                     </div>
                   </div>
 
                   <div className="space-y-2">
                     <Label htmlFor="signup-email" className="text-cream/80">
                       Faculty Email
                     </Label>
                     <div className="relative">
                       <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
                       <Input
                         id="signup-email"
                         type="email"
                         placeholder="your.name@silicon.edu"
                         value={signupData.email}
                         onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                         className="border-gold/30 bg-background/50 pl-10 text-cream placeholder:text-muted-foreground focus:border-gold focus:ring-gold"
                         required
                       />
                     </div>
                   </div>
 
                   <div className="space-y-2">
                     <Label htmlFor="signup-phone" className="text-cream/80">
                       Phone Number
                     </Label>
                     <div className="relative">
                       <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
                       <Input
                         id="signup-phone"
                         type="tel"
                         placeholder="+91 9876543210"
                         value={signupData.phone}
                         onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                         className="border-gold/30 bg-background/50 pl-10 text-cream placeholder:text-muted-foreground focus:border-gold focus:ring-gold"
                         required
                       />
                     </div>
                   </div>
 
                   <div className="space-y-2">
                     <Label htmlFor="signup-sic" className="text-cream/80">
                       SIC Number
                     </Label>
                     <div className="relative">
                       <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
                       <Input
                         id="signup-sic"
                         type="text"
                         placeholder="SIC123456"
                         value={signupData.sicNumber}
                         onChange={(e) => setSignupData({ ...signupData, sicNumber: e.target.value })}
                         className="border-gold/30 bg-background/50 pl-10 text-cream placeholder:text-muted-foreground focus:border-gold focus:ring-gold"
                         required
                       />
                     </div>
                   </div>
 
                   <div className="space-y-2">
                     <Label htmlFor="signup-password" className="text-cream/80">
                       College ERP Password
                     </Label>
                     <div className="relative">
                       <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
                       <Input
                         id="signup-password"
                         type="password"
                         placeholder="Your ERP password"
                         value={signupData.password}
                         onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                         className="border-gold/30 bg-background/50 pl-10 text-cream placeholder:text-muted-foreground focus:border-gold focus:ring-gold"
                         required
                       />
                     </div>
                   </div>
 
                   <Button
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full bg-gold py-6 font-display text-sm tracking-wider text-background transition-all hover:bg-gold-light hover:shadow-lg animate-pulse-glow"
                   >
                     {isSubmitting ? "REGISTERING..." : "REGISTER NOW"}
                   </Button>
                 </form>
               </TabsContent>
             </Tabs>
 
             {/* Footer */}
             <div className="mt-6 text-center">
               <p className="text-xs text-muted-foreground">
                 By registering, you agree to our terms and conditions
               </p>
             </div>
           </div>
         </div>
       </div>
     </section>
   );
 };
 
 export default Auth;