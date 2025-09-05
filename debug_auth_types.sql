-- Debug script to understand the exact type mismatch
-- Run this first to see what we're working with

-- Check what auth.uid() returns
SELECT 
    auth.uid() as current_user_id,
    pg_typeof(auth.uid()) as user_id_type,
    auth.uid()::text as user_id_as_text;

-- Check a sample profile_id from experiences
SELECT 
    profile_id,
    pg_typeof(profile_id) as profile_id_type
FROM experiences 
LIMIT 1;

-- Check a sample author_id from posts  
SELECT 
    author_id,
    pg_typeof(author_id) as author_id_type
FROM posts 
LIMIT 1;

-- Check a sample id from profiles
SELECT 
    id,
    pg_typeof(id) as id_type
FROM profiles 
LIMIT 1;

-- Test the comparison that's failing
-- This will show us exactly what's happening
SELECT 
    auth.uid() as auth_uid,
    auth.uid()::text as auth_uid_text,
    (SELECT profile_id FROM experiences LIMIT 1) as sample_profile_id,
    pg_typeof(auth.uid()) as auth_type,
    pg_typeof((SELECT profile_id FROM experiences LIMIT 1)) as profile_id_type;
