-- Correct RLS policies fix
-- The issue is likely that we need to cast the columns to UUID, not auth.uid() to text

-- 1. Fix experiences table RLS policies
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

-- 2. Fix education table RLS policies
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

-- 3. Fix posts table RLS policies
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

-- 4. Fix profiles table RLS policies
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
