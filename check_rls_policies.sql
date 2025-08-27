-- Check and fix RLS policies for education and experiences tables
-- Run this in your Supabase SQL editor

-- 1. Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('education', 'experiences');

-- 2. Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('education', 'experiences')
ORDER BY tablename, cmd;

-- 3. Check if authenticated users can access the tables
SELECT 
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name IN ('education', 'experiences')
AND grantee = 'authenticated';

-- 4. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can insert their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can update their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can delete their own experiences" ON experiences;

DROP POLICY IF EXISTS "Users can view their own education" ON education;
DROP POLICY IF EXISTS "Users can insert their own education" ON education;
DROP POLICY IF EXISTS "Users can update their own education" ON education;
DROP POLICY IF EXISTS "Users can delete their own education" ON education;

-- 5. Enable RLS on both tables
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;

-- 6. Create simple, permissive policies for testing
-- Allow all authenticated users to view, insert, update, and delete their own data

-- Experiences policies
CREATE POLICY "Users can view their own experiences" ON experiences
    FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own experiences" ON experiences
    FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own experiences" ON experiences
    FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Users can delete their own experiences" ON experiences
    FOR DELETE USING (profile_id = auth.uid());

-- Education policies
CREATE POLICY "Users can view their own education" ON education
    FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own education" ON education
    FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own education" ON education
    FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Users can delete their own education" ON education
    FOR DELETE USING (profile_id = auth.uid());

-- 7. Grant all permissions to authenticated users
GRANT ALL ON experiences TO authenticated;
GRANT ALL ON education TO authenticated;

-- 8. Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('education', 'experiences')
ORDER BY tablename, cmd;

-- 9. Test the policies by checking if we can select from the tables
-- This should return empty results but not throw an error
SELECT COUNT(*) as experiences_count FROM experiences WHERE profile_id = auth.uid();
SELECT COUNT(*) as education_count FROM education WHERE profile_id = auth.uid();

-- 10. Check table structure to make sure columns match what the app expects
SELECT 
    'experiences' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'experiences' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'education' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'education' 
AND table_schema = 'public'
ORDER BY ordinal_position;
