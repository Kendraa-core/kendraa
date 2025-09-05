-- Simple fix for the UUID/TEXT type mismatch error
-- Run this in your Supabase SQL editor

-- 1. Fix experiences table RLS policies
DROP POLICY IF EXISTS "Users can view all experiences" ON experiences;
DROP POLICY IF EXISTS "Users can insert their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can update their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can delete their own experiences" ON experiences;

CREATE POLICY "Users can view all experiences" ON experiences
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own experiences" ON experiences
    FOR INSERT WITH CHECK (auth.uid()::text = profile_id);

CREATE POLICY "Users can update their own experiences" ON experiences
    FOR UPDATE USING (auth.uid()::text = profile_id);

CREATE POLICY "Users can delete their own experiences" ON experiences
    FOR DELETE USING (auth.uid()::text = profile_id);

-- 2. Fix education table RLS policies
DROP POLICY IF EXISTS "Users can view all education" ON education;
DROP POLICY IF EXISTS "Users can insert their own education" ON education;
DROP POLICY IF EXISTS "Users can update their own education" ON education;
DROP POLICY IF EXISTS "Users can delete their own education" ON education;

CREATE POLICY "Users can view all education" ON education
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own education" ON education
    FOR INSERT WITH CHECK (auth.uid()::text = profile_id);

CREATE POLICY "Users can update their own education" ON education
    FOR UPDATE USING (auth.uid()::text = profile_id);

CREATE POLICY "Users can delete their own education" ON education
    FOR DELETE USING (auth.uid()::text = profile_id);

-- 3. Fix posts table RLS policies
DROP POLICY IF EXISTS "Users can view all posts" ON posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

CREATE POLICY "Users can view all posts" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid()::text = author_id);

CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid()::text = author_id);

CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (auth.uid()::text = author_id);

-- 4. Fix profiles table RLS policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can delete their own profile" ON profiles
    FOR DELETE USING (auth.uid()::text = id);

-- 5. Ensure RLS is enabled
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Grant permissions
GRANT ALL ON experiences TO authenticated;
GRANT ALL ON education TO authenticated;
GRANT ALL ON posts TO authenticated;
GRANT ALL ON profiles TO authenticated;
