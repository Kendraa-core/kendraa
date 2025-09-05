-- Check the actual column types in your tables
-- Run this first to see what types we're working with

-- Check experiences table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'experiences' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check education table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'education' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check posts table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check what auth.uid() returns
SELECT 
    auth.uid() as current_user_id,
    pg_typeof(auth.uid()) as user_id_type;

-- Check sample data types
SELECT 
    'experiences' as table_name,
    profile_id,
    pg_typeof(profile_id) as profile_id_type
FROM experiences 
LIMIT 1
UNION ALL
SELECT 
    'education' as table_name,
    profile_id,
    pg_typeof(profile_id) as profile_id_type
FROM education 
LIMIT 1
UNION ALL
SELECT 
    'posts' as table_name,
    author_id,
    pg_typeof(author_id) as author_id_type
FROM posts 
LIMIT 1
UNION ALL
SELECT 
    'profiles' as table_name,
    id,
    pg_typeof(id) as id_type
FROM profiles 
LIMIT 1;
