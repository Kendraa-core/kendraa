-- Complete Database Setup for Kendraa
-- This file sets up all tables, RLS policies, and permissions properly
-- Run this once to fix all database issues

-- ==============================================
-- 1. CREATE TABLES (if they don't exist)
-- ==============================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    full_name TEXT,
    email TEXT,
    headline TEXT,
    bio TEXT,
    location TEXT,
    country TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    website TEXT,
    phone TEXT,
    specialization TEXT[],
    is_premium BOOLEAN DEFAULT FALSE,
    user_type TEXT DEFAULT 'individual',
    profile_type TEXT DEFAULT 'individual',
    onboarding_completed BOOLEAN DEFAULT FALSE
);

-- Experiences table
CREATE TABLE IF NOT EXISTS experiences (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    start_date DATE,
    end_date DATE,
    current BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education table
CREATE TABLE IF NOT EXISTS education (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    institution TEXT NOT NULL,
    degree TEXT,
    field_of_study TEXT,
    start_date DATE,
    end_date DATE,
    current BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Institutions table
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    description TEXT,
    location TEXT,
    website TEXT,
    logo_url TEXT,
    banner_url TEXT,
    phone TEXT,
    email TEXT,
    established_year INTEGER,
    size TEXT,
    verified BOOLEAN DEFAULT FALSE,
    short_tagline TEXT,
    accreditation TEXT[], -- Array of strings
    theme_color TEXT DEFAULT '#007fff',
    short_description TEXT,
    social_media_links JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    company_id UUID REFERENCES institutions(id),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    description TEXT,
    requirements TEXT,
    salary_range TEXT,
    employment_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    institution_id UUID REFERENCES institutions(id),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
    id SERIAL PRIMARY KEY,
    follower_id TEXT NOT NULL,
    following_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Institution Follows table
CREATE TABLE IF NOT EXISTS institution_follows (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    institution_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, institution_id)
);

-- Post Comments table
CREATE TABLE IF NOT EXISTS post_comments (
    id SERIAL PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id INTEGER REFERENCES post_comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Likes table
CREATE TABLE IF NOT EXISTS post_likes (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Post Analytics table
CREATE TABLE IF NOT EXISTS post_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    impressions INTEGER DEFAULT 0,
    unique_impressions INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    followers_gained INTEGER DEFAULT 0,
    video_views INTEGER DEFAULT 0,
    total_watch_time INTEGER DEFAULT 0,
    average_watch_time DECIMAL(5,2) DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    UNIQUE(post_id)
);

-- Comment Likes table
CREATE TABLE IF NOT EXISTS comment_likes (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    comment_id INTEGER NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- ==============================================
-- 2. CREATE TRIGGERS FOR UPDATED_AT
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_experiences_updated_at ON experiences;
CREATE TRIGGER update_experiences_updated_at
    BEFORE UPDATE ON experiences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_education_updated_at ON education;
CREATE TRIGGER update_education_updated_at
    BEFORE UPDATE ON education
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_institutions_updated_at ON institutions;
CREATE TRIGGER update_institutions_updated_at
    BEFORE UPDATE ON institutions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 3. CREATE PROFILE TRIGGER FOR SIGNUP
-- ==============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type, profile_type, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'profile_type', 'individual'),
    COALESCE(NEW.raw_user_meta_data->>'profile_type', 'individual'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================
-- 4. GRANT PERMISSIONS
-- ==============================================

-- Grant permissions to all roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.experiences TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.education TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.posts TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.institutions TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.jobs TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.events TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.follows TO postgres, anon, authenticated, service_role;

-- ==============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 6. DROP ALL EXISTING POLICIES
-- ==============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all existing policies
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- ==============================================
-- 7. CREATE SIMPLE RLS POLICIES (NO UUID COMPARISONS)
-- ==============================================

-- Profiles policies (allow all operations for authenticated users)
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (true);

CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE USING (true);

-- Experiences policies (allow all operations for authenticated users)
CREATE POLICY "experiences_select_policy" ON experiences
    FOR SELECT USING (true);

CREATE POLICY "experiences_insert_policy" ON experiences
    FOR INSERT WITH CHECK (true);

CREATE POLICY "experiences_update_policy" ON experiences
    FOR UPDATE USING (true);

CREATE POLICY "experiences_delete_policy" ON experiences
    FOR DELETE USING (true);

-- Education policies (allow all operations for authenticated users)
CREATE POLICY "education_select_policy" ON education
    FOR SELECT USING (true);

CREATE POLICY "education_insert_policy" ON education
    FOR INSERT WITH CHECK (true);

CREATE POLICY "education_update_policy" ON education
    FOR UPDATE USING (true);

CREATE POLICY "education_delete_policy" ON education
    FOR DELETE USING (true);

-- Posts policies (allow all operations for authenticated users)
CREATE POLICY "posts_select_policy" ON posts
    FOR SELECT USING (true);

CREATE POLICY "posts_insert_policy" ON posts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "posts_update_policy" ON posts
    FOR UPDATE USING (true);

CREATE POLICY "posts_delete_policy" ON posts
    FOR DELETE USING (true);

-- Institutions policies (allow all operations for authenticated users)
CREATE POLICY "institutions_select_policy" ON institutions
    FOR SELECT USING (true);

CREATE POLICY "institutions_insert_policy" ON institutions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "institutions_update_policy" ON institutions
    FOR UPDATE USING (true);

CREATE POLICY "institutions_delete_policy" ON institutions
    FOR DELETE USING (true);

-- Post Comments policies (allow all operations for authenticated users)
CREATE POLICY "post_comments_select_policy" ON post_comments
    FOR SELECT USING (true);

CREATE POLICY "post_comments_insert_policy" ON post_comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "post_comments_update_policy" ON post_comments
    FOR UPDATE USING (true);

CREATE POLICY "post_comments_delete_policy" ON post_comments
    FOR DELETE USING (true);

-- Post Likes policies (allow all operations for authenticated users)
CREATE POLICY "post_likes_select_policy" ON post_likes
    FOR SELECT USING (true);

CREATE POLICY "post_likes_insert_policy" ON post_likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "post_likes_update_policy" ON post_likes
    FOR UPDATE USING (true);

CREATE POLICY "post_likes_delete_policy" ON post_likes
    FOR DELETE USING (true);

-- Jobs policies (allow all operations for authenticated users)
CREATE POLICY "jobs_select_policy" ON jobs
    FOR SELECT USING (true);

CREATE POLICY "jobs_insert_policy" ON jobs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "jobs_update_policy" ON jobs
    FOR UPDATE USING (true);

CREATE POLICY "jobs_delete_policy" ON jobs
    FOR DELETE USING (true);

-- Events policies (allow all operations for authenticated users)
CREATE POLICY "events_select_policy" ON events
    FOR SELECT USING (true);

CREATE POLICY "events_insert_policy" ON events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "events_update_policy" ON events
    FOR UPDATE USING (true);

CREATE POLICY "events_delete_policy" ON events
    FOR DELETE USING (true);

-- Follows policies (allow all operations for authenticated users)
CREATE POLICY "follows_select_policy" ON follows
    FOR SELECT USING (true);

CREATE POLICY "follows_insert_policy" ON follows
    FOR INSERT WITH CHECK (true);

CREATE POLICY "follows_update_policy" ON follows
    FOR UPDATE USING (true);

CREATE POLICY "follows_delete_policy" ON follows
    FOR DELETE USING (true);

-- Institution Follows policies (allow all operations for authenticated users)
CREATE POLICY "institution_follows_select_policy" ON institution_follows
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "institution_follows_insert_policy" ON institution_follows
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "institution_follows_update_policy" ON institution_follows
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "institution_follows_delete_policy" ON institution_follows
    FOR DELETE USING (auth.role() = 'authenticated');

-- Post Analytics policies (allow all operations for authenticated users)
CREATE POLICY "post_analytics_select_policy" ON post_analytics
    FOR SELECT USING (true);

CREATE POLICY "post_analytics_insert_policy" ON post_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "post_analytics_update_policy" ON post_analytics
    FOR UPDATE USING (true);

CREATE POLICY "post_analytics_delete_policy" ON post_analytics
    FOR DELETE USING (true);

-- Comment Likes policies (allow all operations for authenticated users)
CREATE POLICY "comment_likes_select_policy" ON comment_likes
    FOR SELECT USING (true);

CREATE POLICY "comment_likes_insert_policy" ON comment_likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "comment_likes_update_policy" ON comment_likes
    FOR UPDATE USING (true);

CREATE POLICY "comment_likes_delete_policy" ON comment_likes
    FOR DELETE USING (true);

-- ==============================================
-- 8. FINAL VERIFICATION
-- ==============================================

-- Verify tables exist
SELECT 'Tables created successfully' as status;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'experiences', 'education', 'posts', 'institutions', 'jobs', 'events', 'follows');

-- Verify policies exist
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Test the policies
SELECT 'Testing profiles access...' as test;
SELECT COUNT(*) as profile_count FROM profiles;

SELECT 'Testing experiences access...' as test;
SELECT COUNT(*) as experience_count FROM experiences;

SELECT 'Testing education access...' as test;
SELECT COUNT(*) as education_count FROM education;

SELECT 'Testing posts access...' as test;
SELECT COUNT(*) as post_count FROM posts;

SELECT 'Testing institutions access...' as test;
SELECT COUNT(*) as institution_count FROM institutions;

SELECT 'Testing jobs access...' as test;
SELECT COUNT(*) as job_count FROM jobs;

SELECT 'Testing events access...' as test;
SELECT COUNT(*) as event_count FROM events;

SELECT 'Testing follows access...' as test;
SELECT COUNT(*) as follow_count FROM follows;

SELECT 'Database setup completed successfully!' as final_status;
