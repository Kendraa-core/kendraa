-- Migration: Fix profile types and follow system
-- This migration properly adds support for different profile types without FK constraint issues

-- First, add new columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_type VARCHAR(20) DEFAULT 'individual' CHECK (profile_type IN ('individual', 'student', 'institution'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS institution_type VARCHAR(30) CHECK (institution_type IN ('hospital', 'clinic', 'medical_college', 'research_center', 'pharmaceutical', 'other'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS accreditations TEXT[];

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS departments TEXT[];

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS contact_info JSONB;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS education_level VARCHAR(20) CHECK (education_level IN ('undergraduate', 'graduate', 'postgraduate', 'resident', 'fellow'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS graduation_year INTEGER;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_institution VARCHAR(255);

-- Create follows table for the follow system if it doesn't exist
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    follower_type VARCHAR(20) NOT NULL CHECK (follower_type IN ('individual', 'student', 'institution')),
    following_type VARCHAR(20) NOT NULL CHECK (following_type IN ('individual', 'student', 'institution')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Grant permissions on follows table
GRANT ALL ON public.follows TO anon, authenticated;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for follows
CREATE POLICY "Enable all operations for follows" ON public.follows
    USING (true)
    WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_type ON public.profiles(profile_type);
CREATE INDEX IF NOT EXISTS idx_profiles_institution_type ON public.profiles(institution_type);

-- Update existing profiles to have profile_type
UPDATE public.profiles 
SET profile_type = 'individual', user_type = 'individual' 
WHERE profile_type IS NULL;

-- Update jobs table to only allow institutions to post jobs
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS posted_by_type VARCHAR(20) DEFAULT 'institution' CHECK (posted_by_type = 'institution');

-- Add constraint to ensure only institutions can post jobs
-- This will be enforced at the application level as well 