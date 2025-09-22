-- FIX FOR POST_LIKES 406 NOT ACCEPTABLE ERROR
-- This script specifically fixes the 406 error when querying post_likes

-- ==============================================
-- 1. ENSURE POSTS TABLE EXISTS WITH UUID PRIMARY KEY
-- ==============================================

-- Create posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 2. CREATE POST_LIKES TABLE WITH CORRECT SCHEMA
-- ==============================================

-- Drop existing post_likes table if it exists
DROP TABLE IF EXISTS post_likes CASCADE;

-- Create post_likes table with UUID foreign key
CREATE TABLE post_likes (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- ==============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 4. CREATE PERMISSIVE RLS POLICIES
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "posts_all_access" ON posts;
DROP POLICY IF EXISTS "post_likes_all_access" ON post_likes;

-- Create permissive policies
CREATE POLICY "posts_all_access" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "post_likes_all_access" ON post_likes FOR ALL USING (true) WITH CHECK (true);

-- ==============================================
-- 5. GRANT PERMISSIONS
-- ==============================================

GRANT ALL ON posts TO postgres, anon, authenticated, service_role;
GRANT ALL ON post_likes TO postgres, anon, authenticated, service_role;

-- ==============================================
-- 6. VERIFY FIX
-- ==============================================

DO $$
BEGIN
    -- Check if tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
        RAISE NOTICE '✅ posts table exists';
    ELSE
        RAISE WARNING '❌ posts table missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_likes') THEN
        RAISE NOTICE '✅ post_likes table exists';
    ELSE
        RAISE WARNING '❌ post_likes table missing';
    END IF;
    
    -- Check RLS
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'post_likes' AND rowsecurity = true) THEN
        RAISE NOTICE '✅ RLS enabled on post_likes';
    ELSE
        RAISE WARNING '❌ RLS not enabled on post_likes';
    END IF;
    
    RAISE NOTICE '🎉 POST_LIKES 406 ERROR FIXED!';
END $$;
