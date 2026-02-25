import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Check, Armchair, Hash } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  total_seats: number;
}

interface SeatBooking {
  id: string;
  teacher_id: string;
  event_id: string;
  seat_number: number;
}

const Events = () => {
  const navigate = useNavigate();
  const { user, teacher, loading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [bookings, setBookings] = useState<SeatBooking[]>([]);
  const [myBookings, setMyBookings] = useState<SeatBooking[]>([]);
  const [booking, setBooking] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchEvents();
  }, [user]);

  useEffect(() => {
    if (selectedEvent) fetchBookings(selectedEvent.id);
  }, [selectedEvent]);

  useEffect(() => {
    if (teacher) fetchMyBookings();
  }, [teacher]);

  const fetchEvents = async () => {
    setLoadingData(true);
    const { data, error } = await (supabase.from("events") as any).select("*").order("event_date");
    if (!error && data) {
      setEvents(data);
      if (data.length > 0) setSelectedEvent(data[0]);
    }
    setLoadingData(false);
  };

  const fetchBookings = async (eventId: string) => {
    const { data } = await (supabase.from("seat_bookings") as any)
      .select("*")
      .eq("event_id", eventId);
    if (data) setBookings(data);
  };

  const fetchMyBookings = async () => {
    if (!teacher) return;
    const { data } = await (supabase.from("seat_bookings") as any)
      .select("*")
      .eq("teacher_id", teacher.id);
    if (data) setMyBookings(data);
  };

  const handleBookSeat = async (seatNumber: number) => {
    if (!teacher || !selectedEvent) return;

    const hasBooked = myBookings.some((b) => b.event_id === selectedEvent.id);
    if (hasBooked) {
      toast.error("You have already booked a seat for this event.");
      return;
    }

    const seatTaken = bookings.some((b) => b.seat_number === seatNumber);
    if (seatTaken) {
      toast.error("This seat is already taken.");
      return;
    }

    setBooking(true);
    const { error } = await (supabase.from("seat_bookings") as any).insert({
      teacher_id: teacher.id,
      event_id: selectedEvent.id,
      seat_number: seatNumber,
    });
    setBooking(false);

    if (error) {
      toast.error(error.message.includes("duplicate")
        ? "Seat already booked or you already have a booking."
        : "Failed to book seat. Please try again.");
      return;
    }

    toast.success(`Seat ${seatNumber} booked successfully! 🎉`);
    fetchBookings(selectedEvent.id);
    fetchMyBookings();
  };

  const getBookedSeats = () =>
    bookings.reduce((acc, b) => {
      acc[b.seat_number] = b;
      return acc;
    }, {} as Record<number, SeatBooking>);

  const myBookingForEvent = selectedEvent
    ? myBookings.find((b) => b.event_id === selectedEvent.id)
    : null;

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-deep-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  const bookedSeats = getBookedSeats();
  const totalBooked = bookings.length;

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
        <div className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Armchair className="h-8 w-8 text-gold" />
            <span className="font-display text-sm tracking-[0.3em] text-gold">SEAT BOOKING</span>
            <Armchair className="h-8 w-8 text-gold" />
          </div>
          <h1 className="font-heading text-4xl font-semibold italic text-cream md:text-5xl lg:text-6xl">
            Reserve Your Seat
          </h1>
          <p className="mt-4 text-cream/70">
            Login, pick a seat, and you're in!
          </p>
        </div>

        {/* User Info Card */}
        {teacher && (
          <div className="mx-auto mb-8 max-w-md rounded-xl border border-gold/20 bg-card/50 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cream/70">
                  Welcome, <span className="font-semibold text-gold">{teacher.name}</span>
                </p>
                <p className="mt-1 text-sm text-cream/50">{teacher.faculty_email}</p>
              </div>
              {teacher.visit_order && (
                <div className="flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-4 py-2">
                  <Hash className="h-4 w-4 text-gold" />
                  <span className="font-heading text-2xl font-bold text-gold">{teacher.visit_order}</span>
                  <span className="text-xs text-cream/50">Reg. No.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Event Tabs */}
        {events.length > 1 && (
          <div className="mx-auto mb-8 max-w-4xl">
            <div className="flex flex-wrap justify-center gap-4">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`rounded-xl border px-6 py-4 transition-all ${
                    selectedEvent?.id === event.id
                      ? "border-gold bg-gold/20"
                      : "border-gold/20 bg-card/30 hover:border-gold/50"
                  }`}
                >
                  <h3 className="font-display text-lg text-cream">{event.name}</h3>
                  <p className="mt-1 text-sm text-cream/50">
                    {new Date(event.event_date).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Event */}
        {selectedEvent && (
          <div className="mx-auto max-w-5xl">
            {/* Stats Bar */}
            <div className="mb-6 flex flex-wrap justify-center gap-6 rounded-xl border border-gold/20 bg-card/40 px-6 py-4 backdrop-blur-md">
              <div className="text-center">
                <p className="text-2xl font-bold text-gold">{totalBooked}</p>
                <p className="text-xs text-cream/50">Booked</p>
              </div>
              <div className="h-10 w-px bg-gold/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-cream">{selectedEvent.total_seats - totalBooked}</p>
                <p className="text-xs text-cream/50">Available</p>
              </div>
              <div className="h-10 w-px bg-gold/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-cream/50">{selectedEvent.total_seats}</p>
                <p className="text-xs text-cream/50">Total</p>
              </div>
            </div>

            {/* My Booking Status */}
            {myBookingForEvent && (
              <div className="mb-6 flex items-center justify-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <Check className="h-6 w-6 text-emerald-400" />
                <p className="text-cream">
                  Your seat: <span className="font-heading text-xl font-bold text-gold">#{myBookingForEvent.seat_number}</span>
                </p>
              </div>
            )}

            {/* Seat Grid */}
            <div className="rounded-2xl border border-gold/20 bg-card/30 p-6 backdrop-blur-md md:p-8">
              <div className="mb-6 text-center">
                <div className="mx-auto h-2 w-48 rounded-full bg-gold/50" />
                <p className="mt-2 text-xs text-cream/50">STAGE</p>
              </div>

              <div className="grid grid-cols-5 gap-3 sm:grid-cols-8 md:grid-cols-10">
                {Array.from({ length: selectedEvent.total_seats }, (_, i) => {
                  const seatNumber = i + 1;
                  const isBooked = !!bookedSeats[seatNumber];
                  const isMyBooking = myBookingForEvent?.seat_number === seatNumber;

                  return (
                    <button
                      key={seatNumber}
                      onClick={() => !isBooked && !myBookingForEvent && handleBookSeat(seatNumber)}
                      disabled={isBooked || !!myBookingForEvent || booking}
                      className={`group flex flex-col items-center justify-center rounded-lg p-2 transition-all sm:p-3 ${
                        isMyBooking
                          ? "border-2 border-emerald-500 bg-emerald-500/20 shadow-lg shadow-emerald-500/10"
                          : isBooked
                          ? "border border-red-500/30 bg-red-500/10 cursor-not-allowed opacity-60"
                          : myBookingForEvent
                          ? "border border-muted/30 bg-muted/10 cursor-not-allowed opacity-40"
                          : "border border-gold/30 bg-gold/5 hover:bg-gold/20 hover:border-gold hover:scale-105 cursor-pointer"
                      }`}
                    >
                      <Armchair
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          isMyBooking
                            ? "text-emerald-400"
                            : isBooked
                            ? "text-red-400"
                            : "text-gold group-hover:text-gold"
                        }`}
                      />
                      <span className="mt-1 text-[10px] sm:text-xs text-cream/70">{seatNumber}</span>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-cream/60">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-gold/30 bg-gold/10" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-red-500/30 bg-red-500/10" />
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border-2 border-emerald-500 bg-emerald-500/20" />
                  <span>Your Seat</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Events;
