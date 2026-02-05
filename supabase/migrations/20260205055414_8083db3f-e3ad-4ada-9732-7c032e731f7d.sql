-- Create teachers table for registration
CREATE TABLE public.teachers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sic_number TEXT NOT NULL UNIQUE,
    faculty_email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    visit_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_seats INTEGER NOT NULL DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create seat bookings table
CREATE TABLE public.seat_bookings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    seat_number INTEGER NOT NULL,
    booked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(teacher_id, event_id),
    UNIQUE(event_id, seat_number)
);

-- Create voucher claims table to track who claimed what
CREATE TABLE public.voucher_claims (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE UNIQUE,
    voucher_type TEXT NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_claims ENABLE ROW LEVEL SECURITY;

-- Helper function to get teacher_id from current user
CREATE OR REPLACE FUNCTION public.get_teacher_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.teachers WHERE user_id = auth.uid() LIMIT 1
$$;

-- Teachers policies
CREATE POLICY "Anyone can register as teacher"
ON public.teachers FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Teachers can view their own profile"
ON public.teachers FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Teachers can update their own profile"
ON public.teachers FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Events policies - everyone can view
CREATE POLICY "Everyone can view events"
ON public.events FOR SELECT
TO anon, authenticated
USING (true);

-- Seat bookings policies
CREATE POLICY "Teachers can book seats"
ON public.seat_bookings FOR INSERT
TO authenticated
WITH CHECK (teacher_id = public.get_teacher_id());

CREATE POLICY "Teachers can view their bookings"
ON public.seat_bookings FOR SELECT
TO authenticated
USING (teacher_id = public.get_teacher_id());

CREATE POLICY "Anyone can view seat bookings for display"
ON public.seat_bookings FOR SELECT
TO anon, authenticated
USING (true);

-- Voucher claims policies
CREATE POLICY "Teachers can claim vouchers"
ON public.voucher_claims FOR INSERT
TO authenticated
WITH CHECK (teacher_id = public.get_teacher_id());

CREATE POLICY "Teachers can view their claims"
ON public.voucher_claims FOR SELECT
TO authenticated
USING (teacher_id = public.get_teacher_id());

-- Insert sample events
INSERT INTO public.events (name, description, event_date, total_seats) VALUES
('Zygon X Noesis Main Event', 'The grand festival celebration with special performances', '2026-02-19 18:00:00+00', 20),
('Faculty Meet & Greet', 'Exclusive networking event for faculty members', '2026-02-19 14:00:00+00', 20),
('Cultural Evening', 'Traditional performances and cultural showcase', '2026-02-20 17:00:00+00', 20);