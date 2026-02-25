import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Gift, Ticket } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Vouchers = () => {
  const navigate = useNavigate();
  const { user, teacher, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

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
        </div>

        {/* Voucher Number Card */}
        {teacher && (
          <div className="mx-auto max-w-md">
            <div className="rounded-2xl border border-gold/30 bg-card/50 p-10 text-center backdrop-blur-md">
              <Ticket className="mx-auto mb-4 h-12 w-12 text-gold" />
              <p className="text-sm text-cream/60 uppercase tracking-widest font-display">Your Voucher Number</p>
              <div className="my-6 flex items-center justify-center">
                <span className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-gold bg-gold/10 font-heading text-6xl font-bold text-gold">
                  {teacher.visit_order ?? "–"}
                </span>
              </div>
              <p className="text-cream/70">
                Show this number at the food counter to redeem your voucher.
              </p>
            </div>

            <p className="mt-6 text-center text-sm text-cream/40">
              * Only applicable for the first 20 visitors.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Vouchers;
