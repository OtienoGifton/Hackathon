-- FoodLink Database Schema
-- Run this script in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('donor', 'ngo', 'beneficiary')),
    phone TEXT,
    location TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NGOs table
CREATE TABLE IF NOT EXISTS public.ngos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food requests table
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ngo_id UUID REFERENCES public.ngos(id),
    description TEXT NOT NULL,
    food_type TEXT,
    quantity_needed INTEGER,
    urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'approved', 'fulfilled', 'rejected')) DEFAULT 'pending',
    location TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations table
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    donor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    payment_provider TEXT,
    transaction_id TEXT,
    payment_reference TEXT,
    currency TEXT DEFAULT 'NGN',
    donation_type TEXT CHECK (donation_type IN ('request_specific', 'general')) DEFAULT 'request_specific',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transparency feed table
CREATE TABLE IF NOT EXISTS public.transparency_feed (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT CHECK (type IN ('donation', 'distribution', 'update', 'milestone')),
    amount DECIMAL(10,2),
    location TEXT,
    beneficiaries_count INTEGER,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food distribution programs table
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ngo_id UUID NOT NULL REFERENCES public.ngos(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    target_beneficiaries INTEGER,
    status TEXT CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Program beneficiaries table
CREATE TABLE IF NOT EXISTS public.program_beneficiaries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('enrolled', 'served', 'completed')) DEFAULT 'enrolled',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    served_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_verified ON public.users(verified);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_ngo_id ON public.requests(ngo_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_request_id ON public.donations(request_id);
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON public.donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_ngos_verified ON public.ngos(verified);
CREATE INDEX IF NOT EXISTS idx_programs_ngo_id ON public.programs(ngo_id);
CREATE INDEX IF NOT EXISTS idx_programs_status ON public.programs(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ngos_updated_at BEFORE UPDATE ON public.ngos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON public.requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transparency_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_beneficiaries ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view verified users" ON public.users
    FOR SELECT USING (verified = true);

-- NGOs policies
CREATE POLICY "Anyone can view verified NGOs" ON public.ngos
    FOR SELECT USING (verified = true);

CREATE POLICY "NGO admins can manage their NGO" ON public.ngos
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM public.users WHERE role = 'ngo' AND verified = true
    ));

-- Requests policies
CREATE POLICY "Anyone can view pending requests" ON public.requests
    FOR SELECT USING (status = 'pending');

CREATE POLICY "Users can view their own requests" ON public.requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests" ON public.requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" ON public.requests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "NGOs can view and update assigned requests" ON public.requests
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM public.users WHERE role = 'ngo' AND verified = true
    ));

-- Donations policies
CREATE POLICY "Donors can view their own donations" ON public.donations
    FOR SELECT USING (auth.uid() = donor_id);

CREATE POLICY "Donors can create donations to any request" ON public.donations
    FOR INSERT WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Anyone can view completed donations for transparency" ON public.donations
    FOR SELECT USING (payment_status = 'completed');

CREATE POLICY "Users can view donations for their requests" ON public.donations
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.requests WHERE id = request_id
        )
    );

-- Transparency feed policies
CREATE POLICY "Anyone can view transparency feed" ON public.transparency_feed
    FOR SELECT USING (true);

-- Programs policies
CREATE POLICY "Anyone can view active programs" ON public.programs
    FOR SELECT USING (status = 'active');

CREATE POLICY "NGOs can manage their programs" ON public.programs
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM public.users WHERE role = 'ngo' AND verified = true
    ));

-- Program beneficiaries policies
CREATE POLICY "Users can view their own program enrollments" ON public.program_beneficiaries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "NGOs can manage program beneficiaries" ON public.program_beneficiaries
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM public.users WHERE role = 'ngo' AND verified = true
    ));

-- Insert sample data for testing
INSERT INTO public.ngos (name, description, location, verified) VALUES
('Community Food Bank', 'Providing food assistance to local communities', 'Lagos, Nigeria', true),
('Hope Foundation', 'Supporting vulnerable families with food aid', 'Abuja, Nigeria', true),
('Food for All Initiative', 'Ensuring no family goes hungry', 'Port Harcourt, Nigeria', true)
ON CONFLICT DO NOTHING;

-- Create a function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
    total_requests INTEGER,
    pending_requests INTEGER,
    fulfilled_requests INTEGER,
    total_donations INTEGER,
    total_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(r.id)::INTEGER as total_requests,
        COUNT(r.id) FILTER (WHERE r.status = 'pending')::INTEGER as pending_requests,
        COUNT(r.id) FILTER (WHERE r.status = 'fulfilled')::INTEGER as fulfilled_requests,
        COUNT(d.id)::INTEGER as total_donations,
        COALESCE(SUM(d.amount), 0) as total_amount
    FROM public.users u
    LEFT JOIN public.requests r ON u.id = r.user_id
    LEFT JOIN public.donations d ON u.id = d.donor_id
    WHERE u.id = user_uuid
    GROUP BY u.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
