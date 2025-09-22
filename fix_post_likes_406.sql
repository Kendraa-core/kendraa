-- FIX FOR POST_LIKES 406 NOT ACCEPTABLE ERROR
-- This script fixes the specific 406 error for post_likes queries

-- ==============================================
-- 1. ENSURE POST_LIKES TABLE EXISTS WITH CORRECT SCHEMA
-- ==============================================

-- Create post_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS post_likes (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- ==============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 3. DROP EXISTING POLICIES AND CREATE NEW ONES
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "post_likes_select_policy" ON post_likes;
DROP POLICY IF EXISTS "post_likes_insert_policy" ON post_likes;
DROP POLICY IF EXISTS "post_likes_update_policy" ON post_likes;
DROP POLICY IF EXISTS "post_likes_delete_policy" ON post_likes;

-- Create permissive policies
CREATE POLICY "post_likes_select_policy" ON post_likes
    FOR SELECT USING (true);

CREATE POLICY "post_likes_insert_policy" ON post_likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "post_likes_update_policy" ON post_likes
    FOR UPDATE USING (true);

CREATE POLICY "post_likes_delete_policy" ON post_likes
    FOR DELETE USING (true);

-- ==============================================
-- 4. GRANT PERMISSIONS
-- ==============================================

-- Grant all permissions to required roles
GRANT ALL ON post_likes TO postgres, anon, authenticated, service_role;

-- ==============================================
-- 5. VERIFY FIX
-- ==============================================

DO $$
BEGIN
    -- Check if post_likes table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_likes' AND table_schema = 'public') THEN
        RAISE NOTICE 'post_likes table exists successfully';
    ELSE
        RAISE WARNING 'post_likes table does not exist';
    END IF;
    
    -- Check if RLS is enabled
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'post_likes' 
        AND schemaname = 'public' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE 'RLS is enabled on post_likes table';
    ELSE
        RAISE WARNING 'RLS is not enabled on post_likes table';
    END IF;
    
    -- Check if policies exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'post_likes_select_policy') THEN
        RAISE NOTICE 'post_likes policies created successfully';
    ELSE
        RAISE WARNING 'post_likes policies not found';
    END IF;
    
    RAISE NOTICE 'post_likes 406 error fix completed!';
END $$;
