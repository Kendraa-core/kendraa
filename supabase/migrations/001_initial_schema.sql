-- =============================================
-- MEDICAL LINKEDIN CLONE - COMPLETE DATABASE SCHEMA
-- =============================================

-- Drop all existing tables and functions to start fresh
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PROFILES TABLE (Individual Users)
-- =============================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    banner_url TEXT,
    headline TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    phone TEXT,
    specialization TEXT[],
    is_premium BOOLEAN DEFAULT FALSE NOT NULL,
    profile_views INTEGER DEFAULT 0 NOT NULL,
    user_type TEXT DEFAULT 'individual' CHECK (user_type IN ('individual', 'institution')) NOT NULL
);

-- =============================================
-- INSTITUTIONS TABLE (Hospitals, Clinics, etc.)
-- =============================================
CREATE TABLE public.institutions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('hospital', 'clinic', 'research_center', 'university', 'pharmaceutical', 'medical_device', 'other')),
    description TEXT,
    location TEXT,
    website TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    banner_url TEXT,
    specialties TEXT[],
    license_number TEXT,
    accreditation TEXT[],
    established_year INTEGER,
    size TEXT CHECK (size IN ('small', 'medium', 'large', 'enterprise')),
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    admin_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- =============================================
-- POSTS TABLE
-- =============================================
CREATE TABLE public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL,
    author_type TEXT DEFAULT 'individual' CHECK (author_type IN ('individual', 'institution')) NOT NULL,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')) NOT NULL,
    image_url TEXT,
    images TEXT[],
    likes_count INTEGER DEFAULT 0 NOT NULL,
    comments_count INTEGER DEFAULT 0 NOT NULL,
    shares_count INTEGER DEFAULT 0 NOT NULL
);

-- =============================================
-- POST COMMENTS TABLE
-- =============================================
CREATE TABLE public.post_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID NOT NULL,
    author_type TEXT DEFAULT 'individual' CHECK (author_type IN ('individual', 'institution')) NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0 NOT NULL
);

-- =============================================
-- POST LIKES TABLE
-- =============================================
CREATE TABLE public.post_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    user_type TEXT DEFAULT 'individual' CHECK (user_type IN ('individual', 'institution')) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- =============================================
-- CONNECTIONS TABLE
-- =============================================
CREATE TABLE public.connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')) NOT NULL,
    UNIQUE(requester_id, recipient_id)
);

-- =============================================
-- EXPERIENCES TABLE
-- =============================================
CREATE TABLE public.experiences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    company_type TEXT CHECK (company_type IN ('hospital', 'clinic', 'research', 'pharmaceutical', 'other')),
    location TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    current BOOLEAN DEFAULT FALSE NOT NULL,
    description TEXT,
    specialization TEXT[]
);

-- =============================================
-- EDUCATION TABLE
-- =============================================
CREATE TABLE public.education (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    school TEXT NOT NULL,
    degree TEXT NOT NULL,
    field TEXT,
    specialization TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    current BOOLEAN DEFAULT FALSE NOT NULL,
    description TEXT,
    gpa TEXT,
    honors TEXT[]
);

-- =============================================
-- JOBS TABLE
-- =============================================
CREATE TABLE public.jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[],
    salary_min DECIMAL,
    salary_max DECIMAL,
    currency TEXT DEFAULT 'USD',
    location TEXT,
    job_type TEXT DEFAULT 'full_time' CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship', 'volunteer')) NOT NULL,
    experience_level TEXT DEFAULT 'mid' CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')) NOT NULL,
    specializations TEXT[],
    company_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    posted_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')) NOT NULL,
    application_deadline TIMESTAMPTZ,
    applications_count INTEGER DEFAULT 0 NOT NULL
);

-- =============================================
-- JOB APPLICATIONS TABLE
-- =============================================
CREATE TABLE public.job_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    cover_letter TEXT,
    resume_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'interview', 'accepted', 'rejected')) NOT NULL,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    UNIQUE(job_id, applicant_id)
);

-- =============================================
-- EVENTS TABLE
-- =============================================
CREATE TABLE public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    venue TEXT,
    event_type TEXT DEFAULT 'conference' CHECK (event_type IN ('conference', 'workshop', 'seminar', 'webinar', 'networking', 'training')) NOT NULL,
    specializations TEXT[],
    organizer_id UUID NOT NULL,
    organizer_type TEXT DEFAULT 'individual' CHECK (organizer_type IN ('individual', 'institution')) NOT NULL,
    max_attendees INTEGER,
    registration_fee DECIMAL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) NOT NULL,
    is_virtual BOOLEAN DEFAULT FALSE NOT NULL,
    meeting_link TEXT,
    banner_url TEXT,
    attendees_count INTEGER DEFAULT 0 NOT NULL
);

-- =============================================
-- EVENT ATTENDEES TABLE
-- =============================================
CREATE TABLE public.event_attendees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    attendee_id UUID NOT NULL,
    attendee_type TEXT DEFAULT 'individual' CHECK (attendee_type IN ('individual', 'institution')) NOT NULL,
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')) NOT NULL,
    registration_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(event_id, attendee_id)
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('connection_request', 'connection_accepted', 'post_like', 'post_comment', 'job_application', 'event_reminder', 'mention')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    data JSONB,
    action_url TEXT
);

-- =============================================
-- PROFILE VIEWS TABLE
-- =============================================
CREATE TABLE public.profile_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_posts_author_created ON public.posts(author_id, created_at DESC);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX idx_post_comments_post ON public.post_comments(post_id, created_at DESC);
CREATE INDEX idx_post_likes_post_user ON public.post_likes(post_id, user_id);
CREATE INDEX idx_connections_recipient_status ON public.connections(recipient_id, status);
CREATE INDEX idx_connections_requester_recipient ON public.connections(requester_id, recipient_id);
CREATE INDEX idx_jobs_company_status ON public.jobs(company_id, status);
CREATE INDEX idx_job_applications_job ON public.job_applications(job_id, status);
CREATE INDEX idx_events_status_start ON public.events(status, start_date);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read, created_at DESC);
CREATE INDEX idx_profile_views_profile ON public.profile_views(profile_id, created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid()::uuid = id);

-- Institutions policies
CREATE POLICY "Institutions are viewable by everyone" ON public.institutions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create institutions" ON public.institutions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin users can update their institutions" ON public.institutions FOR UPDATE USING (auth.uid() = admin_user_id);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid()::uuid = author_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid()::uuid = author_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid()::uuid = author_id);

-- Post comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.post_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own comments" ON public.post_comments FOR UPDATE USING (auth.uid()::uuid = author_id);
CREATE POLICY "Users can delete their own comments" ON public.post_comments FOR DELETE USING (auth.uid()::uuid = author_id);

-- Post likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage their likes" ON public.post_likes FOR ALL USING (auth.uid()::uuid = user_id);

-- Connections policies
CREATE POLICY "Connections are viewable by involved users" ON public.connections 
    FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can create connection requests" ON public.connections 
    FOR INSERT WITH CHECK (auth.uid()::uuid = requester_id);
CREATE POLICY "Users can update their connection requests" ON public.connections 
    FOR UPDATE USING (auth.uid()::uuid = recipient_id OR auth.uid()::uuid = requester_id);

-- Experiences policies
CREATE POLICY "Experiences are viewable by everyone" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Users can manage their own experiences" ON public.experiences FOR ALL USING (auth.uid()::uuid = profile_id);

-- Education policies
CREATE POLICY "Education is viewable by everyone" ON public.education FOR SELECT USING (true);
CREATE POLICY "Users can manage their own education" ON public.education FOR ALL USING (auth.uid()::uuid = profile_id);

-- Jobs policies
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Users can create jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid()::uuid = posted_by);
CREATE POLICY "Users can update their posted jobs" ON public.jobs FOR UPDATE USING (auth.uid()::uuid = posted_by);

-- Job applications policies
CREATE POLICY "Applications viewable by applicant and job poster" ON public.job_applications 
    FOR SELECT USING (
        auth.uid() = applicant_id OR 
        auth.uid() IN (SELECT posted_by FROM public.jobs WHERE id = job_id)
    );
CREATE POLICY "Users can create applications" ON public.job_applications 
    FOR INSERT WITH CHECK (auth.uid()::uuid = applicant_id);

-- Events policies
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid()::uuid = organizer_id::uuid);
CREATE POLICY "Organizers can update their events" ON public.events FOR UPDATE USING (auth.uid()::uuid = organizer_id::uuid);

-- Event attendees policies
CREATE POLICY "Attendees viewable by organizer and attendee" ON public.event_attendees 
    FOR SELECT USING (
        auth.uid()::uuid = attendee_id OR 
        auth.uid()::uuid IN (SELECT organizer_id FROM public.events WHERE id = event_id)
    );
CREATE POLICY "Users can register for events" ON public.event_attendees 
    FOR INSERT WITH CHECK (auth.uid()::uuid = attendee_id::uuid);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications 
    FOR SELECT USING (auth.uid()::uuid = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications 
    FOR UPDATE USING (auth.uid()::uuid = user_id);

-- Profile views policies
CREATE POLICY "Profile views are viewable by profile owner" ON public.profile_views 
    FOR SELECT USING (auth.uid()::uuid = profile_id);
CREATE POLICY "Authenticated users can record views" ON public.profile_views 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id::uuid,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.institutions;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.institutions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.posts;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.connections;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- COUNTER UPDATE FUNCTIONS
-- =============================================

-- Function to increment post likes
CREATE OR REPLACE FUNCTION public.increment_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = post_id::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement post likes
CREATE OR REPLACE FUNCTION public.decrement_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = post_id::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment post comments
CREATE OR REPLACE FUNCTION public.increment_post_comments(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = post_id::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment job applications
CREATE OR REPLACE FUNCTION public.increment_job_applications(job_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.jobs SET applications_count = applications_count + 1 WHERE id = job_id::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment event attendees
CREATE OR REPLACE FUNCTION public.increment_event_attendees(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.events SET attendees_count = attendees_count + 1 WHERE id = event_id::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample institutions
INSERT INTO public.institutions (name, type, description, location, specialties, verified) VALUES
('Johns Hopkins Hospital', 'hospital', 'World-renowned medical institution specializing in complex cases', 'Baltimore, MD', ARRAY['Cardiology', 'Neurology', 'Oncology'], true),
('Mayo Clinic', 'hospital', 'Leading healthcare provider with multiple specialties', 'Rochester, MN', ARRAY['Internal Medicine', 'Surgery', 'Radiology'], true),
('Harvard Medical Research Center', 'research_center', 'Cutting-edge medical research facility', 'Boston, MA', ARRAY['Medical Research', 'Clinical Trials'], true),
('Pfizer Inc.', 'pharmaceutical', 'Global pharmaceutical company', 'New York, NY', ARRAY['Drug Development', 'Clinical Research'], true),
('Community Health Clinic', 'clinic', 'Providing accessible healthcare to the community', 'Austin, TX', ARRAY['Family Medicine', 'Pediatrics'], false);

-- Insert sample jobs
INSERT INTO public.jobs (title, description, location, job_type, experience_level, specializations, company_id, posted_by, salary_min, salary_max) 
SELECT 
  'Cardiologist - Full Time',
  'Join our world-class cardiology team. We are seeking an experienced cardiologist to provide comprehensive cardiac care.',
  'Baltimore, MD',
  'full_time',
  'senior',
  ARRAY['Cardiology', 'Internal Medicine'],
  i.id,
  p.id,
  200000,
  350000
FROM public.institutions i, public.profiles p 
WHERE i.name = 'Johns Hopkins Hospital' AND p.email IS NOT NULL 
LIMIT 1;

-- Insert sample events
INSERT INTO public.events (title, description, start_date, end_date, location, event_type, specializations, organizer_id, organizer_type, registration_fee, is_virtual)
SELECT 
  'International Cardiology Conference 2024',
  'Leading experts will discuss the latest advances in cardiovascular medicine, including new treatment protocols and research findings.',
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '32 days',
  'Virtual Event',
  'conference',
  ARRAY['Cardiology', 'Internal Medicine'],
  i.id::text,
  'institution',
  299.00,
  true
FROM public.institutions i 
WHERE i.name = 'Johns Hopkins Hospital'
LIMIT 1;

-- Grant necessary permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema'; 