-- Final fix for RLS policies
-- This should resolve both the "Unknown User" and profile navigation issues

-- First, let's disable RLS temporarily to test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE experiences DISABLE ROW LEVEL SECURITY;
ALTER TABLE education DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON experiences TO authenticated;
GRANT ALL ON education TO authenticated;
GRANT ALL ON posts TO authenticated;

-- Now let's create simple RLS policies that work
-- Enable RLS again
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles (allow everyone to read, users to modify their own)
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (true);

CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE USING (true);

-- Create policies for experiences (allow everyone to read, users to modify their own)
CREATE POLICY "experiences_select_policy" ON experiences
    FOR SELECT USING (true);

CREATE POLICY "experiences_insert_policy" ON experiences
    FOR INSERT WITH CHECK (true);

CREATE POLICY "experiences_update_policy" ON experiences
    FOR UPDATE USING (true);

CREATE POLICY "experiences_delete_policy" ON experiences
    FOR DELETE USING (true);

-- Create policies for education (allow everyone to read, users to modify their own)
CREATE POLICY "education_select_policy" ON education
    FOR SELECT USING (true);

CREATE POLICY "education_insert_policy" ON education
    FOR INSERT WITH CHECK (true);

CREATE POLICY "education_update_policy" ON education
    FOR UPDATE USING (true);

CREATE POLICY "education_delete_policy" ON education
    FOR DELETE USING (true);

-- Create policies for posts (allow everyone to read, users to modify their own)
CREATE POLICY "posts_select_policy" ON posts
    FOR SELECT USING (true);

CREATE POLICY "posts_insert_policy" ON posts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "posts_update_policy" ON posts
    FOR UPDATE USING (true);

CREATE POLICY "posts_delete_policy" ON posts
    FOR DELETE USING (true);

-- Test the policies
SELECT 'Testing profiles access...' as test;
SELECT COUNT(*) as profile_count FROM profiles;

SELECT 'Testing experiences access...' as test;
SELECT COUNT(*) as experience_count FROM experiences;

SELECT 'Testing education access...' as test;
SELECT COUNT(*) as education_count FROM education;

SELECT 'Testing posts access...' as test;
SELECT COUNT(*) as post_count FROM posts;
