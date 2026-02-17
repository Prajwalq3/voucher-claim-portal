import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Shield, Users, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AdminSmsSection from "@/components/AdminSmsSection";

interface TeacherRow {
  id: string;
  name: string;
  sic_number: string;
  faculty_email: string;
  phone_number: string;
  visit_order: number | null;
  created_at: string;
}

interface VoucherClaim {
  id: string;
  teacher_id: string;
  voucher_type: string;
  claimed_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [claims, setClaims] = useState<VoucherClaim[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      checkAdminRole();
    }
  }, [user, loading]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const checkAdminRole = async () => {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: user!.id,
      _role: "admin",
    });
    setIsAdmin(!!data && !error);
  };

  const fetchAllData = async () => {
    const [teacherRes, claimRes] = await Promise.all([
      (supabase.from("teachers") as any).select("*").order("visit_order", { ascending: true }),
      (supabase.from("voucher_claims") as any).select("*"),
    ]);
    if (teacherRes.data) setTeachers(teacherRes.data);
    if (claimRes.data) setClaims(claimRes.data);
  };

  if (loading || isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-deep-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <section className="relative min-h-screen w-full overflow-hidden bg-deep-black">
        <div className="stars pointer-events-none" />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
          <Shield className="mb-4 h-16 w-16 text-destructive" />
          <h1 className="font-heading text-3xl text-cream">Access Denied</h1>
          <p className="mt-2 text-cream/70">You do not have admin privileges.</p>
          <Link to="/" className="mt-6 text-gold hover:underline">← Back to Home</Link>
        </div>
      </section>
    );
  }

  const getClaimForTeacher = (teacherId: string) =>
    claims.find((c) => c.teacher_id === teacherId);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-deep-black">
      <div className="stars pointer-events-none" />
      <div className="relative z-10 min-h-screen px-6 py-12">
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
            <Shield className="h-8 w-8 text-gold" />
            <span className="font-display text-sm tracking-[0.3em] text-gold">ADMIN PANEL</span>
            <Shield className="h-8 w-8 text-gold" />
          </div>
          <h1 className="font-heading text-4xl font-semibold italic text-cream md:text-5xl">
            Admin Dashboard
          </h1>
        </div>

        {/* Teachers Table */}
        <div className="mx-auto mb-12 max-w-5xl">
          <h3 className="mb-4 flex items-center gap-2 font-display text-xl tracking-wider text-gold">
            <Users className="h-5 w-5" /> All Teachers ({teachers.length})
          </h3>
          <div className="overflow-x-auto rounded-xl border border-gold/20 bg-card/50 backdrop-blur-md">
            <table className="w-full text-left text-sm text-cream">
              <thead className="border-b border-gold/20 text-xs uppercase text-gold">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">SIC</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Visit Order</th>
                  <th className="px-4 py-3">Voucher</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t, i) => {
                  const claim = getClaimForTeacher(t.id);
                  return (
                    <tr key={t.id} className="border-b border-gold/10 hover:bg-gold/5">
                      <td className="px-4 py-3 text-cream/50">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold">{t.name}</td>
                      <td className="px-4 py-3">{t.sic_number}</td>
                      <td className="px-4 py-3 text-cream/70">{t.faculty_email}</td>
                      <td className="px-4 py-3 text-cream/70">{t.phone_number}</td>
                      <td className="px-4 py-3 text-gold">{t.visit_order ?? "N/A"}</td>
                      <td className="px-4 py-3">
                        {claim ? (
                          <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                            {claim.voucher_type}
                          </span>
                        ) : (
                          <span className="text-cream/40">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {teachers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-cream/50">
                      No teachers registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SMS Section */}
        <AdminSmsSection />
      </div>
    </section>
  );
};

export default Admin;
