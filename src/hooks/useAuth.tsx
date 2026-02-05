 import { useState, useEffect, createContext, useContext, ReactNode } from "react";
 import { User, Session } from "@supabase/supabase-js";
 import { supabase } from "@/integrations/supabase/client";
 
 interface Teacher {
   id: string;
   sic_number: string;
   faculty_email: string;
   name: string;
   phone_number: string;
   visit_order: number | null;
   created_at: string;
 }
 
 interface AuthContextType {
   user: User | null;
   session: Session | null;
   teacher: Teacher | null;
   loading: boolean;
   signUp: (email: string, password: string, teacherData: { name: string; phone_number: string; sic_number: string }) => Promise<{ error: Error | null }>;
   signIn: (sicNumber: string, password: string) => Promise<{ error: Error | null }>;
   signOut: () => Promise<void>;
 }
 
 const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
 export function AuthProvider({ children }: { children: ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
   const [session, setSession] = useState<Session | null>(null);
   const [teacher, setTeacher] = useState<Teacher | null>(null);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       (event, session) => {
         setSession(session);
         setUser(session?.user ?? null);
         
         if (session?.user) {
           setTimeout(() => {
             fetchTeacherProfile(session.user.id);
           }, 0);
         } else {
           setTeacher(null);
         }
       }
     );
 
     supabase.auth.getSession().then(({ data: { session } }) => {
       setSession(session);
       setUser(session?.user ?? null);
       if (session?.user) {
         fetchTeacherProfile(session.user.id);
       }
       setLoading(false);
     });
 
     return () => subscription.unsubscribe();
   }, []);
 
   const fetchTeacherProfile = async (userId: string) => {
     const { data, error } = await supabase
       .from("teachers")
       .select("*")
       .eq("user_id", userId)
       .single();
 
     if (!error && data) {
       setTeacher(data);
     }
   };
 
   const signUp = async (
     email: string,
     password: string,
     teacherData: { name: string; phone_number: string; sic_number: string }
   ) => {
     const redirectUrl = `${window.location.origin}/`;
 
     const { data: authData, error: authError } = await supabase.auth.signUp({
       email,
       password,
       options: {
         emailRedirectTo: redirectUrl,
       },
     });
 
     if (authError) {
       return { error: authError };
     }
 
     if (authData.user) {
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       const { error: teacherError } = await (supabase.from("teachers") as any).insert({
         user_id: authData.user.id,
         faculty_email: email,
         name: teacherData.name,
         phone_number: teacherData.phone_number,
         sic_number: teacherData.sic_number,
       });
 
       if (teacherError) {
         return { error: teacherError };
       }
     }
 
     return { error: null };
   };
 
   const signIn = async (sicNumber: string, password: string) => {
     // We need to use a function or edge function to lookup by SIC since RLS blocks anon
     // For now, we'll prompt user to use their email for login
     const { error } = await supabase.auth.signInWithPassword({
       email: sicNumber, // Treating SIC as email for now, will be fixed with edge function
       password,
     });
 
     if (error) {
       return { error };
     }
 
     return { error: null };
   };
 
   const signOut = async () => {
     await supabase.auth.signOut();
     setTeacher(null);
   };
 
   return (
     <AuthContext.Provider
       value={{
         user,
         session,
         teacher,
         loading,
         signUp,
         signIn,
         signOut,
       }}
     >
       {children}
     </AuthContext.Provider>
   );
 }
 
 export function useAuth() {
   const context = useContext(AuthContext);
   if (context === undefined) {
     throw new Error("useAuth must be used within an AuthProvider");
   }
   return context;
 }