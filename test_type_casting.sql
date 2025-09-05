-- Test which type casting approach works
-- Run this to see which approach is correct

-- Test 1: Check the types
SELECT 
    'auth.uid()' as source,
    auth.uid() as value,
    pg_typeof(auth.uid()) as type
UNION ALL
SELECT 
    'profile_id sample' as source,
    profile_id as value,
    pg_typeof(profile_id) as type
FROM experiences 
LIMIT 1;

-- Test 2: Try different casting approaches
-- This will show us which one works

-- Test auth.uid()::text = profile_id
SELECT 
    'auth.uid()::text = profile_id' as test,
    CASE 
        WHEN auth.uid()::text = (SELECT profile_id FROM experiences LIMIT 1) 
        THEN 'SUCCESS' 
        ELSE 'FAILED' 
    END as result;

-- Test auth.uid() = profile_id::uuid  
SELECT 
    'auth.uid() = profile_id::uuid' as test,
    CASE 
        WHEN auth.uid() = (SELECT profile_id::uuid FROM experiences LIMIT 1) 
        THEN 'SUCCESS' 
        ELSE 'FAILED' 
    END as result;

-- Test auth.uid()::text = profile_id::text
SELECT 
    'auth.uid()::text = profile_id::text' as test,
    CASE 
        WHEN auth.uid()::text = (SELECT profile_id::text FROM experiences LIMIT 1) 
        THEN 'SUCCESS' 
        ELSE 'FAILED' 
    END as result;

-- Test auth.uid()::uuid = profile_id::uuid
SELECT 
    'auth.uid()::uuid = profile_id::uuid' as test,
    CASE 
        WHEN auth.uid()::uuid = (SELECT profile_id::uuid FROM experiences LIMIT 1) 
        THEN 'SUCCESS' 
        ELSE 'FAILED' 
    END as result;
