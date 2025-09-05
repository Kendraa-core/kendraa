-- Flexible RLS policies that work with both UUID and TEXT types
-- Run this in your Supabase SQL editor

-- First, let's check what types we're working with
-- This will help us determine the correct casting

-- Check auth.uid() type
SELECT 
    auth.uid() as current_user_id,
    pg_typeof(auth.uid()) as user_id_type;

-- Check profile_id type in experiences
SELECT 
    profile_id,
    pg_typeof(profile_id) as profile_id_type
FROM experiences 
LIMIT 1;

-- Check author_id type in posts
SELECT 
    author_id,
    pg_typeof(author_id) as author_id_type
FROM posts 
LIMIT 1;

-- Check id type in profiles
SELECT 
    id,
    pg_typeof(id) as id_type
FROM profiles 
LIMIT 1;

-- Now create the policies based on the actual types
-- If the above queries show UUID types, use the UUID version
-- If they show TEXT types, use the TEXT version

-- Option 1: If your IDs are stored as UUID (most common in Supabase)
-- Uncomment this section if your columns are UUID type:

/*
-- 1. Fix experiences table RLS policies (UUID version)
DROP POLICY IF EXISTS "Users can view all experiences" ON experiences;
DROP POLICY IF EXISTS "Users can insert their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can update their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can delete their own experiences" ON experiences;

CREATE POLICY "Users can view all experiences" ON experiences
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own experiences" ON experiences
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own experiences" ON experiences
    FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own experiences" ON experiences
    FOR DELETE USING (auth.uid() = profile_id);

-- 2. Fix education table RLS policies (UUID version)
DROP POLICY IF EXISTS "Users can view all education" ON education;
DROP POLICY IF EXISTS "Users can insert their own education" ON education;
DROP POLICY IF EXISTS "Users can update their own education" ON education;
DROP POLICY IF EXISTS "Users can delete their own education" ON education;

CREATE POLICY "Users can view all education" ON education
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own education" ON education
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own education" ON education
    FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own education" ON education
    FOR DELETE USING (auth.uid() = profile_id);

-- 3. Fix posts table RLS policies (UUID version)
DROP POLICY IF EXISTS "Users can view all posts" ON posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

CREATE POLICY "Users can view all posts" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (auth.uid() = author_id);

-- 4. Fix profiles table RLS policies (UUID version)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON profiles
    FOR DELETE USING (auth.uid() = id);
*/

-- Option 2: If your IDs are stored as TEXT (less common but possible)
-- Uncomment this section if your columns are TEXT type:

-- 1. Fix experiences table RLS policies (TEXT version)
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

-- 2. Fix education table RLS policies (TEXT version)
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

-- 3. Fix posts table RLS policies (TEXT version)
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

-- 4. Fix profiles table RLS policies (TEXT version)
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
