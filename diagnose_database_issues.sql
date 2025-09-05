-- Diagnostic queries to identify database issues
-- Run these in your Supabase SQL editor to check the current state

-- 1. Check if tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('experiences', 'education', 'posts', 'profiles')
ORDER BY table_name;

-- 2. Check RLS status on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('experiences', 'education', 'posts', 'profiles');

-- 3. Check existing RLS policies
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
WHERE schemaname = 'public' 
AND tablename IN ('experiences', 'education', 'posts', 'profiles')
ORDER BY tablename, policyname;

-- 4. Check table permissions
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('experiences', 'education', 'posts', 'profiles')
ORDER BY table_name, privilege_type;

-- 5. Check if there's data in the tables
SELECT 'experiences' as table_name, COUNT(*) as row_count FROM experiences
UNION ALL
SELECT 'education' as table_name, COUNT(*) as row_count FROM education
UNION ALL
SELECT 'posts' as table_name, COUNT(*) as row_count FROM posts
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles;

-- 6. Check sample data from experiences (if any)
SELECT 
    id,
    profile_id,
    title,
    company,
    start_date,
    end_date,
    current
FROM experiences 
LIMIT 5;

-- 7. Check sample data from education (if any)
SELECT 
    id,
    profile_id,
    school,
    degree,
    start_date,
    end_date,
    current
FROM education 
LIMIT 5;

-- 8. Check sample data from posts (if any)
SELECT 
    id,
    author_id,
    content,
    created_at
FROM posts 
LIMIT 5;

-- 9. Check sample data from profiles (if any)
SELECT 
    id,
    full_name,
    email,
    headline
FROM profiles 
LIMIT 5;

-- 10. Check if there are any foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('experiences', 'education', 'posts', 'profiles');

-- 11. Check current user and authentication status
SELECT 
    current_user,
    session_user,
    current_database();

-- 12. Test a simple query to see if RLS is blocking access
-- This should work if RLS policies are correct
SELECT COUNT(*) as accessible_experiences FROM experiences;
SELECT COUNT(*) as accessible_education FROM education;
SELECT COUNT(*) as accessible_posts FROM posts;
SELECT COUNT(*) as accessible_profiles FROM profiles;
