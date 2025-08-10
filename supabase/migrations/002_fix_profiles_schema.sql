-- Migration to fix profiles table schema to match TypeScript types
-- This adds missing columns and renames existing ones

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_type VARCHAR(50) DEFAULT 'individual';

-- Rename cover_url to banner_url to match TypeScript types
ALTER TABLE public.profiles RENAME COLUMN cover_url TO banner_url;

-- Rename user_type to profile_type (but keep both for compatibility)
-- We'll keep user_type and add profile_type as a copy
UPDATE public.profiles SET profile_type = user_type WHERE profile_type IS NULL;

-- Add missing columns to institutions table to match TypeScript types
ALTER TABLE public.institutions 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS specialties TEXT[],
ADD COLUMN IF NOT EXISTS license_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS accreditation TEXT[],
ADD COLUMN IF NOT EXISTS established_year INTEGER,
ADD COLUMN IF NOT EXISTS size VARCHAR(20) CHECK (size IN ('small', 'medium', 'large', 'enterprise')),
ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES public.profiles(id);

-- Rename logo_url to banner_url in institutions (but keep both for compatibility)
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS banner_url TEXT;
UPDATE public.institutions SET banner_url = logo_url WHERE banner_url IS NULL;

-- Add missing columns to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS author_type VARCHAR(20) DEFAULT 'individual' CHECK (author_type IN ('individual', 'institution')),
ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private'));

-- Add missing columns to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS applications_count INTEGER DEFAULT 0;

-- Add missing columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS venue VARCHAR(255),
ADD COLUMN IF NOT EXISTS registration_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS attendees_count INTEGER DEFAULT 0;

-- Rename event_date to start_date and end_date to match TypeScript types
ALTER TABLE public.events RENAME COLUMN event_date TO start_date;
ALTER TABLE public.events RENAME COLUMN virtual_link TO meeting_link;

-- Add missing columns to experiences table
ALTER TABLE public.experiences 
ADD COLUMN IF NOT EXISTS company_type VARCHAR(50) CHECK (company_type IN ('hospital', 'clinic', 'research', 'pharmaceutical', 'other')),
ADD COLUMN IF NOT EXISTS current BOOLEAN DEFAULT FALSE;

-- Rename is_current to current
ALTER TABLE public.experiences RENAME COLUMN is_current TO current;

-- Add missing columns to education table
ALTER TABLE public.education 
ADD COLUMN IF NOT EXISTS school VARCHAR(255),
ADD COLUMN IF NOT EXISTS degree VARCHAR(255),
ADD COLUMN IF NOT EXISTS field VARCHAR(255),
ADD COLUMN IF NOT EXISTS specialization VARCHAR(255),
ADD COLUMN IF NOT EXISTS current BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gpa VARCHAR(10),
ADD COLUMN IF NOT EXISTS honors TEXT[];

-- Rename institution to school and degree to match TypeScript types
ALTER TABLE public.education RENAME COLUMN institution TO school;
ALTER TABLE public.education RENAME COLUMN field_of_study TO field;

-- Add missing columns to notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS data JSONB;

-- Rename recipient_id to user_id
ALTER TABLE public.notifications RENAME COLUMN recipient_id TO user_id;

-- Add missing columns to post_comments table
ALTER TABLE public.post_comments 
ADD COLUMN IF NOT EXISTS author_type VARCHAR(20) DEFAULT 'individual' CHECK (author_type IN ('individual', 'institution')),
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Add missing columns to post_likes table
ALTER TABLE public.post_likes 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'individual' CHECK (user_type IN ('individual', 'institution'));

-- Add missing columns to job_applications table
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'interview', 'accepted', 'rejected'));

-- Add missing columns to event_attendees table
ALTER TABLE public.event_attendees 
ADD COLUMN IF NOT EXISTS attendee_type VARCHAR(20) DEFAULT 'individual' CHECK (attendee_type IN ('individual', 'institution'));

-- Create follows table if it doesn't exist (for the follow system)
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    follower_type VARCHAR(20) DEFAULT 'individual' CHECK (follower_type IN ('individual', 'institution')),
    following_type VARCHAR(20) DEFAULT 'individual' CHECK (following_type IN ('individual', 'institution')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Enable RLS for follows table
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for follows table
CREATE POLICY "Users can view follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can create follows" ON public.follows FOR INSERT WITH CHECK (auth.uid()::uuid = follower_id);
CREATE POLICY "Users can delete their own follows" ON public.follows FOR DELETE USING (auth.uid()::uuid = follower_id);

-- Create indexes for follows table
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

-- Grant permissions
GRANT ALL ON public.follows TO anon, authenticated;

-- Update the handle_new_user function to match the new schema
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, profile_type, created_at, updated_at)
    VALUES (
        NEW.id::uuid,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'individual',
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$; 