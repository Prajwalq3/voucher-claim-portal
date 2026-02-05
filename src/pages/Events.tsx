 import { useState, useEffect } from "react";
 import { useNavigate, Link } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { Calendar, MapPin, Users, ArrowLeft, Check, Armchair } from "lucide-react";
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
   teacher_name?: string;
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
     if (user) {
       fetchEvents();
     }
   }, [user]);
 
   useEffect(() => {
     if (selectedEvent) {
       fetchBookings(selectedEvent.id);
     }
   }, [selectedEvent]);
 
   useEffect(() => {
     if (teacher) {
       fetchMyBookings();
     }
   }, [teacher]);
 
   const fetchEvents = async () => {
     setLoadingData(true);
     const { data, error } = await (supabase.from("events") as any).select("*").order("event_date");
 
     if (!error && data) {
       setEvents(data);
       if (data.length > 0) {
         setSelectedEvent(data[0]);
       }
     }
     setLoadingData(false);
   };
 
   const fetchBookings = async (eventId: string) => {
     const { data } = await (supabase.from("seat_bookings") as any)
       .select("*")
       .eq("event_id", eventId);
 
     if (data) {
       setBookings(data);
     }
   };
 
   const fetchMyBookings = async () => {
     if (!teacher) return;
 
     const { data } = await (supabase.from("seat_bookings") as any)
       .select("*")
       .eq("teacher_id", teacher.id);
 
     if (data) {
       setMyBookings(data);
     }
   };
 
   const handleBookSeat = async (seatNumber: number) => {
     if (!teacher || !selectedEvent) return;
 
     // Check if already booked this event
     const hasBooked = myBookings.some((b) => b.event_id === selectedEvent.id);
     if (hasBooked) {
       toast.error("You have already booked a seat for this event.");
       return;
     }
 
     // Check if seat is available
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
       if (error.message.includes("duplicate")) {
         toast.error("Seat already booked or you already have a booking.");
       } else {
         toast.error("Failed to book seat. Please try again.");
       }
       return;
     }
 
     toast.success(`Seat ${seatNumber} booked successfully! 🎉`);
     fetchBookings(selectedEvent.id);
     fetchMyBookings();
   };
 
   const formatDate = (dateStr: string) => {
     return new Date(dateStr).toLocaleDateString("en-IN", {
       weekday: "long",
       year: "numeric",
       month: "long",
       day: "numeric",
       hour: "2-digit",
       minute: "2-digit",
     });
   };
 
   const getBookedSeats = () => {
     return bookings.reduce((acc, b) => {
       acc[b.seat_number] = b;
       return acc;
     }, {} as Record<number, SeatBooking>);
   };
 
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
             <Calendar className="h-8 w-8 text-gold" />
             <span className="font-display text-sm tracking-[0.3em] text-gold">EXCLUSIVE ACCESS</span>
             <Calendar className="h-8 w-8 text-gold" />
           </div>
           <h1 className="font-heading text-4xl font-semibold italic text-cream md:text-5xl lg:text-6xl">
             Event Seat Booking
           </h1>
           <p className="mt-4 text-cream/70">
             First 20 faculty members can reserve their seats!
           </p>
         </div>
 
         {/* Teacher Info */}
         {teacher && (
           <div className="mx-auto mb-8 max-w-md rounded-xl border border-gold/20 bg-card/50 p-6 text-center backdrop-blur-md">
             <p className="text-cream/70">
               Welcome, <span className="font-semibold text-gold">{teacher.name}</span>
             </p>
             <p className="mt-1 text-sm text-cream/50">{teacher.faculty_email}</p>
           </div>
         )}
 
         {/* Event Selection */}
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
 
         {/* Selected Event Details */}
         {selectedEvent && (
           <div className="mx-auto max-w-4xl">
             <div className="mb-8 rounded-2xl border border-gold/20 bg-card/50 p-6 backdrop-blur-md">
               <h2 className="font-heading text-2xl text-cream">{selectedEvent.name}</h2>
               {selectedEvent.description && (
                 <p className="mt-2 text-cream/70">{selectedEvent.description}</p>
               )}
               <div className="mt-4 flex flex-wrap gap-4 text-sm text-cream/60">
                 <span className="flex items-center gap-2">
                   <Calendar className="h-4 w-4" />
                   {formatDate(selectedEvent.event_date)}
                 </span>
                 <span className="flex items-center gap-2">
                   <Users className="h-4 w-4" />
                   {selectedEvent.total_seats} seats available
                 </span>
               </div>
             </div>
 
             {/* My Booking Status */}
             {myBookingForEvent && (
               <div className="mb-8 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
                 <Check className="mx-auto mb-2 h-8 w-8 text-green-500" />
                 <p className="text-cream">
                   You have booked <span className="font-bold text-gold">Seat #{myBookingForEvent.seat_number}</span>
                 </p>
               </div>
             )}
 
             {/* Seat Grid */}
             <div className="rounded-2xl border border-gold/20 bg-card/30 p-8 backdrop-blur-md">
               <div className="mb-6 text-center">
                 <div className="mx-auto h-2 w-48 rounded-full bg-gold/50" />
                 <p className="mt-2 text-xs text-cream/50">STAGE</p>
               </div>
 
               <div className="grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-10">
                 {Array.from({ length: selectedEvent.total_seats }, (_, i) => {
                   const seatNumber = i + 1;
                   const bookedSeats = getBookedSeats();
                   const isBooked = !!bookedSeats[seatNumber];
                   const isMyBooking = myBookingForEvent?.seat_number === seatNumber;
 
                   return (
                     <button
                       key={seatNumber}
                       onClick={() => !isBooked && !myBookingForEvent && handleBookSeat(seatNumber)}
                       disabled={isBooked || !!myBookingForEvent || booking}
                       className={`flex flex-col items-center justify-center rounded-lg p-3 transition-all ${
                         isMyBooking
                           ? "bg-green-500/30 border-2 border-green-500"
                           : isBooked
                           ? "bg-red-500/20 border border-red-500/30 cursor-not-allowed"
                           : myBookingForEvent
                           ? "bg-muted/20 border border-muted/30 cursor-not-allowed"
                           : "bg-gold/10 border border-gold/30 hover:bg-gold/30 cursor-pointer"
                       }`}
                     >
                       <Armchair
                         className={`h-6 w-6 ${
                           isMyBooking
                             ? "text-green-500"
                             : isBooked
                             ? "text-red-400"
                             : "text-gold"
                         }`}
                       />
                       <span className="mt-1 text-xs text-cream/70">{seatNumber}</span>
                     </button>
                   );
                 })}
               </div>
 
               {/* Legend */}
               <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-cream/60">
                 <div className="flex items-center gap-2">
                   <div className="h-4 w-4 rounded bg-gold/30" />
                   <span>Available</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="h-4 w-4 rounded bg-red-500/30" />
                   <span>Booked</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="h-4 w-4 rounded bg-green-500/30" />
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