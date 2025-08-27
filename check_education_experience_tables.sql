-- Check if education and experience tables exist and have correct structure
-- Run this in your Supabase SQL editor to verify the tables

-- Check if tables exist
SELECT 
    table_name,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = t.table_name
    ) as table_exists
FROM (VALUES ('education'), ('experiences')) as t(table_name);

-- Check education table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'education' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check experiences table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'experiences' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS policies
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
WHERE tablename IN ('education', 'experiences');

-- Check if tables have any data
SELECT 'education' as table_name, COUNT(*) as row_count FROM education
UNION ALL
SELECT 'experiences' as table_name, COUNT(*) as row_count FROM experiences;
