-- Corrected Database Fix Script
-- This script addresses all the issues found in the Security Advisor

-- 1. Fix RLS Performance Issues by optimizing auth function calls
-- Replace direct auth.uid() calls with (select auth.uid()) for better performance

-- Profiles table policies
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- Connections table policies
DROP POLICY IF EXISTS "Connections are viewable by involved users" ON connections;
CREATE POLICY "Connections are viewable by involved users" ON connections
  FOR SELECT USING (
    (select auth.uid()) = requester_id OR 
    (select auth.uid()) = recipient_id
  );

DROP POLICY IF EXISTS "Users can update their connection requests" ON connections;
CREATE POLICY "Users can update their connection requests" ON connections
  FOR UPDATE USING ((select auth.uid()) = requester_id);

DROP POLICY IF EXISTS "Users can view their own connections" ON connections;
CREATE POLICY "Users can view their own connections" ON connections
  FOR SELECT USING (
    (select auth.uid()) = requester_id OR 
    (select auth.uid()) = recipient_id
  );

DROP POLICY IF EXISTS "Users can create connection requests" ON connections;
CREATE POLICY "Users can create connection requests" ON connections
  FOR INSERT WITH CHECK ((select auth.uid()) = requester_id);

DROP POLICY IF EXISTS "Users can update connections they're part of" ON connections;
CREATE POLICY "Users can update connections they're part of" ON connections
  FOR UPDATE USING (
    (select auth.uid()) = requester_id OR 
    (select auth.uid()) = recipient_id
  );

-- Experiences table policies
DROP POLICY IF EXISTS "Users can manage their own experiences" ON experiences;
CREATE POLICY "Users can manage their own experiences" ON experiences
  FOR ALL USING ((select auth.uid()) = profile_id);

-- Education table policies
DROP POLICY IF EXISTS "Users can manage their own education" ON education;
CREATE POLICY "Users can manage their own education" ON education
  FOR ALL USING ((select auth.uid()) = profile_id);

-- Post likes table policies
DROP POLICY IF EXISTS "Users can view all likes" ON post_likes;
CREATE POLICY "Users can view all likes" ON post_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own likes" ON post_likes;
CREATE POLICY "Users can manage own likes" ON post_likes
  FOR ALL USING ((select auth.uid()) = user_id);

-- Post comments table policies
DROP POLICY IF EXISTS "Users can view comments on visible posts" ON post_comments;
CREATE POLICY "Users can view comments on visible posts" ON post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_id AND (
        p.visibility = 'public' OR
        p.author_id = (select auth.uid()) OR
        (p.visibility = 'connections' AND EXISTS (
          SELECT 1 FROM connections 
          WHERE ((requester_id = (select auth.uid()) AND recipient_id = p.author_id) OR 
                 (requester_id = p.author_id AND recipient_id = (select auth.uid()))) 
          AND status = 'accepted'
        ))
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert comments on visible posts" ON post_comments;
CREATE POLICY "Users can insert comments on visible posts" ON post_comments
  FOR INSERT WITH CHECK (
    (select auth.uid()) = author_id AND
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_id AND (
        p.visibility = 'public' OR
        p.author_id = (select auth.uid()) OR
        (p.visibility = 'connections' AND EXISTS (
          SELECT 1 FROM connections 
          WHERE ((requester_id = (select auth.uid()) AND recipient_id = p.author_id) OR 
                 (requester_id = p.author_id AND recipient_id = (select auth.uid()))) 
          AND status = 'accepted'
        ))
      )
    )
  );

DROP POLICY IF EXISTS "Users can update their own comments" ON post_comments;
CREATE POLICY "Users can update their own comments" ON post_comments
  FOR UPDATE USING ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON post_comments;
CREATE POLICY "Users can delete their own comments" ON post_comments
  FOR DELETE USING ((select auth.uid()) = author_id);

-- Notifications table policies (using user_id column)
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING ((select auth.uid()) = user_id);

-- Profile views table policies
DROP POLICY IF EXISTS "Profile owners can view their profile views" ON profile_views;
CREATE POLICY "Profile owners can view their profile views" ON profile_views
  FOR SELECT USING ((select auth.uid()) = profile_id);

DROP POLICY IF EXISTS "Anyone can record profile views" ON profile_views;
CREATE POLICY "Anyone can record profile views" ON profile_views
  FOR INSERT WITH CHECK (true);

-- 2. Remove duplicate permissive policies to fix multiple permissive policies warnings

-- Remove the generic "Enable all operations" policies that are causing conflicts
DROP POLICY IF EXISTS "Enable all operations for connections" ON connections;
DROP POLICY IF EXISTS "Enable all operations for notifications" ON notifications;
DROP POLICY IF EXISTS "Enable all operations for post_comments" ON post_comments;
DROP POLICY IF EXISTS "Enable all operations for post_likes" ON post_likes;

-- 3. Fix schema issues by ensuring all required columns exist

-- Add missing columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_type VARCHAR(50) DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS specialization TEXT[] DEFAULT '{}';

-- Rename cover_url to banner_url if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'cover_url') THEN
        ALTER TABLE public.profiles RENAME COLUMN cover_url TO banner_url;
    END IF;
END $$;

-- 4. Create missing tables if they don't exist

-- Create follows table
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    follower_type VARCHAR(20) DEFAULT 'individual',
    following_type VARCHAR(20) DEFAULT 'individual',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Create institutions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) DEFAULT 'hospital',
    location VARCHAR(255),
    website VARCHAR(255),
    admin_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    logo_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    company_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    posted_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    location VARCHAR(255),
    salary_min INTEGER,
    salary_max INTEGER,
    job_type VARCHAR(50) DEFAULT 'full-time',
    experience_level VARCHAR(50) DEFAULT 'entry',
    requirements TEXT[],
    benefits TEXT[],
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create job_applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    cover_letter TEXT,
    resume_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location VARCHAR(255),
    event_type VARCHAR(50) DEFAULT 'conference',
    max_attendees INTEGER,
    registration_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create event_attendees table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    attendee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'registered',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, attendee_id)
);

-- 5. Enable RLS on new tables
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for new tables

-- Follows policies
CREATE POLICY "Users can view follows" ON public.follows 
  FOR SELECT USING (true);

CREATE POLICY "Users can create follows" ON public.follows 
  FOR INSERT WITH CHECK ((select auth.uid()) = follower_id);

CREATE POLICY "Users can delete their own follows" ON public.follows 
  FOR DELETE USING ((select auth.uid()) = follower_id);

-- Institutions policies
CREATE POLICY "Institutions are viewable by everyone" ON public.institutions 
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage their institutions" ON public.institutions 
  FOR ALL USING ((select auth.uid()) = admin_user_id);

-- Jobs policies
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs 
  FOR SELECT USING (true);

CREATE POLICY "Users can create jobs" ON public.jobs 
  FOR INSERT WITH CHECK ((select auth.uid()) = posted_by);

CREATE POLICY "Users can update their posted jobs" ON public.jobs 
  FOR UPDATE USING ((select auth.uid()) = posted_by);

-- Job applications policies
CREATE POLICY "Applications viewable by applicant and job poster" ON public.job_applications 
  FOR SELECT USING (
    (select auth.uid()) = applicant_id OR 
    (select auth.uid()) IN (
      SELECT posted_by FROM jobs WHERE id = job_id
    )
  );

CREATE POLICY "Users can create applications" ON public.job_applications 
  FOR INSERT WITH CHECK ((select auth.uid()) = applicant_id);

-- Events policies
CREATE POLICY "Events are viewable by everyone" ON public.events 
  FOR SELECT USING (true);

CREATE POLICY "Users can create events" ON public.events 
  FOR INSERT WITH CHECK ((select auth.uid()) = organizer_id);

CREATE POLICY "Organizers can update their events" ON public.events 
  FOR UPDATE USING ((select auth.uid()) = organizer_id);

-- Event attendees policies
CREATE POLICY "Attendees viewable by organizer and attendee" ON public.event_attendees 
  FOR SELECT USING (
    (select auth.uid()) = attendee_id OR 
    (select auth.uid()) IN (
      SELECT organizer_id FROM events WHERE id = event_id
    )
  );

CREATE POLICY "Users can register for events" ON public.event_attendees 
  FOR INSERT WITH CHECK ((select auth.uid()) = attendee_id);

-- 7. Grant necessary permissions
GRANT ALL ON public.follows TO anon, authenticated;
GRANT ALL ON public.institutions TO anon, authenticated;
GRANT ALL ON public.jobs TO anon, authenticated;
GRANT ALL ON public.job_applications TO anon, authenticated;
GRANT ALL ON public.events TO anon, authenticated;
GRANT ALL ON public.event_attendees TO anon, authenticated;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_institutions_admin_user_id ON public.institutions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON public.jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id ON public.job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_attendee_id ON public.event_attendees(attendee_id);

-- 9. Update the handle_new_user function to ensure it works correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, profile_type, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'profile_type', 'individual'),
    COALESCE(NEW.raw_user_meta_data->>'profile_type', 'individual')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Create a function to fix existing profiles that might be missing data
CREATE OR REPLACE FUNCTION public.fix_existing_profiles()
RETURNS void AS $$
BEGIN
  -- Update profiles that don't have profile_type set
  UPDATE public.profiles 
  SET profile_type = 'individual', user_type = 'individual'
  WHERE profile_type IS NULL OR user_type IS NULL;
  
  -- Update profiles that don't have specialization set
  UPDATE public.profiles 
  SET specialization = '{}'
  WHERE specialization IS NULL;
  
  -- Update profiles that don't have is_premium set
  UPDATE public.profiles 
  SET is_premium = FALSE
  WHERE is_premium IS NULL;
  
  -- Update profiles that don't have profile_views set
  UPDATE public.profiles 
  SET profile_views = 0
  WHERE profile_views IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the fix function
SELECT public.fix_existing_profiles();

-- 12. Clean up the function
DROP FUNCTION public.fix_existing_profiles();

-- Success message
SELECT 'Database issues fixed successfully!' as status; 