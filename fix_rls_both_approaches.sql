-- Try both approaches to fix the type mismatch
-- Run this step by step

-- First, let's see what types we have
SELECT 
    'auth.uid() type:' as info,
    pg_typeof(auth.uid()) as type
UNION ALL
SELECT 
    'sample profile_id type:' as info,
    pg_typeof(profile_id) as type
FROM experiences 
LIMIT 1;

-- Approach 1: Cast columns to UUID (if they're stored as text)
-- Uncomment and run this section if the above shows profile_id as text:

/*
-- 1. Fix experiences table RLS policies (cast column to UUID)
DROP POLICY IF EXISTS "Users can view all experiences" ON experiences;
DROP POLICY IF EXISTS "Users can insert their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can update their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can delete their own experiences" ON experiences;

CREATE POLICY "Users can view all experiences" ON experiences
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own experiences" ON experiences
    FOR INSERT WITH CHECK (auth.uid() = profile_id::uuid);

CREATE POLICY "Users can update their own experiences" ON experiences
    FOR UPDATE USING (auth.uid() = profile_id::uuid);

CREATE POLICY "Users can delete their own experiences" ON experiences
    FOR DELETE USING (auth.uid() = profile_id::uuid);

-- 2. Fix education table RLS policies (cast column to UUID)
DROP POLICY IF EXISTS "Users can view all education" ON education;
DROP POLICY IF EXISTS "Users can insert their own education" ON education;
DROP POLICY IF EXISTS "Users can update their own education" ON education;
DROP POLICY IF EXISTS "Users can delete their own education" ON education;

CREATE POLICY "Users can view all education" ON education
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own education" ON education
    FOR INSERT WITH CHECK (auth.uid() = profile_id::uuid);

CREATE POLICY "Users can update their own education" ON education
    FOR UPDATE USING (auth.uid() = profile_id::uuid);

CREATE POLICY "Users can delete their own education" ON education
    FOR DELETE USING (auth.uid() = profile_id::uuid);

-- 3. Fix posts table RLS policies (cast column to UUID)
DROP POLICY IF EXISTS "Users can view all posts" ON posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

CREATE POLICY "Users can view all posts" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = author_id::uuid);

CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid() = author_id::uuid);

CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (auth.uid() = author_id::uuid);

-- 4. Fix profiles table RLS policies (cast column to UUID)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id::uuid);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id::uuid);

CREATE POLICY "Users can delete their own profile" ON profiles
    FOR DELETE USING (auth.uid() = id::uuid);
*/

-- Approach 2: Cast auth.uid() to text (if columns are stored as text)
-- Uncomment and run this section if the above shows profile_id as text:

-- 1. Fix experiences table RLS policies (cast auth.uid() to text)
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

-- 2. Fix education table RLS policies (cast auth.uid() to text)
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

-- 3. Fix posts table RLS policies (cast auth.uid() to text)
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

-- 4. Fix profiles table RLS policies (cast auth.uid() to text)
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
