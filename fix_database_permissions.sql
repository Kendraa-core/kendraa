-- Fix database permissions for experiences, education, and posts visibility
-- Run these SQL commands in your Supabase SQL editor

-- 1. Fix RLS policies for experiences table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all experiences" ON experiences;
DROP POLICY IF EXISTS "Users can insert their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can update their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can delete their own experiences" ON experiences;

-- Create new RLS policies for experiences
CREATE POLICY "Users can view all experiences" ON experiences
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own experiences" ON experiences
    FOR INSERT WITH CHECK (auth.uid()::text = profile_id);

CREATE POLICY "Users can update their own experiences" ON experiences
    FOR UPDATE USING (auth.uid()::text = profile_id);

CREATE POLICY "Users can delete their own experiences" ON experiences
    FOR DELETE USING (auth.uid()::text = profile_id);

-- 2. Fix RLS policies for education table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all education" ON education;
DROP POLICY IF EXISTS "Users can insert their own education" ON education;
DROP POLICY IF EXISTS "Users can update their own education" ON education;
DROP POLICY IF EXISTS "Users can delete their own education" ON education;

-- Create new RLS policies for education
CREATE POLICY "Users can view all education" ON education
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own education" ON education
    FOR INSERT WITH CHECK (auth.uid()::text = profile_id);

CREATE POLICY "Users can update their own education" ON education
    FOR UPDATE USING (auth.uid()::text = profile_id);

CREATE POLICY "Users can delete their own education" ON education
    FOR DELETE USING (auth.uid()::text = profile_id);

-- 3. Fix RLS policies for posts table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all posts" ON posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Create new RLS policies for posts
CREATE POLICY "Users can view all posts" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid()::text = author_id);

CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid()::text = author_id);

CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (auth.uid()::text = author_id);

-- 4. Fix RLS policies for profiles table (to fix "Unknown User" issue)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- Create new RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can delete their own profile" ON profiles
    FOR DELETE USING (auth.uid()::text = id);

-- 5. Ensure RLS is enabled on all tables
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Grant necessary permissions to authenticated users
GRANT ALL ON experiences TO authenticated;
GRANT ALL ON education TO authenticated;
GRANT ALL ON posts TO authenticated;
GRANT ALL ON profiles TO authenticated;

-- 7. Grant usage on sequences (if they exist)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 8. Optional: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_experiences_profile_id ON experiences(profile_id);
CREATE INDEX IF NOT EXISTS idx_education_profile_id ON education(profile_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- 9. Verify the tables exist and have correct structure
-- Check if experiences table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'experiences') THEN
        RAISE NOTICE 'experiences table does not exist - creating it';
        
        CREATE TABLE experiences (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            profile_id TEXT NOT NULL,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            company_type TEXT CHECK (company_type IN ('hospital', 'clinic', 'research', 'pharmaceutical', 'other')),
            location TEXT,
            start_date DATE NOT NULL,
            end_date DATE,
            current BOOLEAN DEFAULT FALSE,
            description TEXT,
            specialization TEXT[]
        );
    END IF;
END $$;

-- Check if education table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'education') THEN
        RAISE NOTICE 'education table does not exist - creating it';
        
        CREATE TABLE education (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            profile_id TEXT NOT NULL,
            school TEXT NOT NULL,
            degree TEXT NOT NULL,
            field TEXT,
            specialization TEXT,
            start_date DATE NOT NULL,
            end_date DATE,
            current BOOLEAN DEFAULT FALSE,
            description TEXT,
            gpa TEXT,
            honors TEXT[]
        );
    END IF;
END $$;

-- Check if posts table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') THEN
        RAISE NOTICE 'posts table does not exist - creating it';
        
        CREATE TABLE posts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            author_id TEXT NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT,
            likes_count INTEGER DEFAULT 0,
            comments_count INTEGER DEFAULT 0,
            shares_count INTEGER DEFAULT 0,
            is_public BOOLEAN DEFAULT TRUE
        );
    END IF;
END $$;

-- Check if profiles table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'profiles table does not exist - creating it';
        
        CREATE TABLE profiles (
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
    END IF;
END $$;

-- 10. Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
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

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 11. Final verification query
SELECT 
    'experiences' as table_name,
    COUNT(*) as row_count
FROM experiences
UNION ALL
SELECT 
    'education' as table_name,
    COUNT(*) as row_count
FROM education
UNION ALL
SELECT 
    'posts' as table_name,
    COUNT(*) as row_count
FROM posts
UNION ALL
SELECT 
    'profiles' as table_name,
    COUNT(*) as row_count
FROM profiles;
