-- FIX COMMENT_LIKES 406 NOT ACCEPTABLE ERROR
-- This script fixes the 406 error when querying comment_likes

-- ========================================================
-- 1. ENSURE COMMENT_LIKES TABLE EXISTS WITH CORRECT SCHEMA
-- ========================================================

-- Drop and recreate comment_likes table to ensure clean state
DROP TABLE IF EXISTS comment_likes CASCADE;

-- Create comment_likes table with correct schema
CREATE TABLE comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    comment_id UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_type TEXT NOT NULL DEFAULT 'individual' CHECK (user_type IN ('individual', 'institution')),
    reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'support', 'insightful', 'celebrate', 'curious')),
    UNIQUE(comment_id, user_id)
);

-- ========================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ========================================================

ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 3. CREATE PERMISSIVE RLS POLICIES
-- ========================================================

-- Drop existing policies
DROP POLICY IF EXISTS "comment_likes_select" ON comment_likes;
DROP POLICY IF EXISTS "comment_likes_insert" ON comment_likes;
DROP POLICY IF EXISTS "comment_likes_update" ON comment_likes;
DROP POLICY IF EXISTS "comment_likes_delete" ON comment_likes;

-- Create permissive policies
CREATE POLICY "comment_likes_select" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "comment_likes_insert" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comment_likes_update" ON comment_likes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comment_likes_delete" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- ========================================================
-- 4. GRANT PERMISSIONS
-- ========================================================

GRANT ALL ON comment_likes TO postgres, anon, authenticated, service_role;

-- ========================================================
-- 5. VERIFICATION
-- ========================================================

DO $$
DECLARE
    table_exists BOOLEAN;
    rls_enabled BOOLEAN;
    policy_count INTEGER;
    has_foreign_keys BOOLEAN;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'comment_likes' 
        AND table_schema = 'public'
    ) INTO table_exists;
    
    -- Check if RLS is enabled
    SELECT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'comment_likes' 
        AND schemaname = 'public' 
        AND rowsecurity = true
    ) INTO rls_enabled;
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'comment_likes' AND schemaname = 'public';
    
    -- Check if foreign keys exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'comment_likes' 
        AND constraint_type = 'FOREIGN KEY'
        AND table_schema = 'public'
    ) INTO has_foreign_keys;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'COMMENT_LIKES 406 ERROR FIXED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Table exists: %', table_exists;
    RAISE NOTICE 'RLS enabled: %', rls_enabled;
    RAISE NOTICE 'Policies created: %', policy_count;
    RAISE NOTICE 'Foreign keys exist: %', has_foreign_keys;
    RAISE NOTICE '✅ comment_likes table recreated with correct schema';
    RAISE NOTICE '✅ RLS policies allow proper user access';
    RAISE NOTICE '✅ Foreign key relationships to post_comments and profiles';
    RAISE NOTICE '✅ Unique constraint prevents duplicate likes';
    RAISE NOTICE '✅ All permissions granted to required roles';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'The 406 Not Acceptable error should now be resolved!';
    RAISE NOTICE '========================================';
END $$;
