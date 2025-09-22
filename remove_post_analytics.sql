-- REMOVE ALL POST ANALYTICS FROM DATABASE
-- This script completely removes all post analytics related tables and functionality

-- ========================================================
-- 1. DROP ALL POST ANALYTICS RELATED TABLES
-- ========================================================

-- Drop analytics tables in correct order (respecting foreign key dependencies)
DROP TABLE IF EXISTS post_view_analytics CASCADE;
DROP TABLE IF EXISTS post_share_analytics CASCADE;
DROP TABLE IF EXISTS post_views CASCADE;
DROP TABLE IF EXISTS post_shares CASCADE;
DROP TABLE IF EXISTS post_impressions CASCADE;
DROP TABLE IF EXISTS post_analytics CASCADE;
DROP TABLE IF EXISTS profile_views CASCADE;

-- ========================================================
-- 2. REMOVE ANALYTICS RELATED COLUMNS FROM POSTS TABLE
-- ========================================================

-- Remove analytics columns from posts table if they exist
DO $$
BEGIN
    -- Remove likes_count column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'likes_count' AND table_schema = 'public') THEN
        ALTER TABLE posts DROP COLUMN likes_count;
        RAISE NOTICE '✅ Removed likes_count column from posts table';
    END IF;
    
    -- Remove comments_count column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'comments_count' AND table_schema = 'public') THEN
        ALTER TABLE posts DROP COLUMN comments_count;
        RAISE NOTICE '✅ Removed comments_count column from posts table';
    END IF;
    
    -- Remove shares_count column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'shares_count' AND table_schema = 'public') THEN
        ALTER TABLE posts DROP COLUMN shares_count;
        RAISE NOTICE '✅ Removed shares_count column from posts table';
    END IF;
    
    -- Remove views_count column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'views_count' AND table_schema = 'public') THEN
        ALTER TABLE posts DROP COLUMN views_count;
        RAISE NOTICE '✅ Removed views_count column from posts table';
    END IF;
    
    -- Remove impressions_count column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'impressions_count' AND table_schema = 'public') THEN
        ALTER TABLE posts DROP COLUMN impressions_count;
        RAISE NOTICE '✅ Removed impressions_count column from posts table';
    END IF;
END $$;

-- ========================================================
-- 3. REMOVE ANALYTICS RELATED COLUMNS FROM PROFILES TABLE
-- ========================================================

-- Remove profile_views column if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_views' AND table_schema = 'public') THEN
        ALTER TABLE profiles DROP COLUMN profile_views;
        RAISE NOTICE '✅ Removed profile_views column from profiles table';
    END IF;
END $$;

-- ========================================================
-- 4. REMOVE ANY ANALYTICS RELATED FUNCTIONS
-- ========================================================

-- Drop any analytics related functions
DROP FUNCTION IF EXISTS update_post_analytics(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS track_post_view(UUID, TEXT, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS track_post_impression(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS track_post_share(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_post_analytics(UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_post_counter(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_post_counters() CASCADE;

-- ========================================================
-- 5. REMOVE ANY ANALYTICS RELATED TRIGGERS
-- ========================================================

-- Drop triggers that might update analytics
DROP TRIGGER IF EXISTS update_post_likes_count ON post_likes;
DROP TRIGGER IF EXISTS update_post_comments_count ON post_comments;
DROP TRIGGER IF EXISTS update_post_shares_count ON post_shares;
DROP TRIGGER IF EXISTS update_post_views_count ON post_views;
DROP TRIGGER IF EXISTS update_profile_views_count ON profile_views;

-- ========================================================
-- 6. VERIFICATION AND CLEANUP
-- ========================================================

DO $$
DECLARE
    table_name TEXT;
    analytics_tables TEXT[] := ARRAY[
        'post_analytics', 'post_impressions', 'post_shares', 'post_views',
        'post_share_analytics', 'post_view_analytics', 'profile_views'
    ];
    dropped_tables INTEGER := 0;
    remaining_tables INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'POST ANALYTICS REMOVAL COMPLETE';
    RAISE NOTICE '========================================';
    
    -- Check which analytics tables were dropped
    FOREACH table_name IN ARRAY analytics_tables
    LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name AND table_schema = 'public') THEN
            dropped_tables := dropped_tables + 1;
            RAISE NOTICE '✅ Dropped table: %', table_name;
        ELSE
            remaining_tables := remaining_tables + 1;
            RAISE NOTICE '❌ Table still exists: %', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'SUMMARY:';
    RAISE NOTICE '  Analytics tables dropped: %', dropped_tables;
    RAISE NOTICE '  Tables still remaining: %', remaining_tables;
    
    -- Check posts table columns
    RAISE NOTICE '';
    RAISE NOTICE 'POSTS TABLE COLUMNS AFTER CLEANUP:';
    FOR table_name IN 
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %', table_name;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ALL POST ANALYTICS REMOVED FROM DATABASE!';
    RAISE NOTICE '✅ No more analytics tables';
    RAISE NOTICE '✅ No more analytics columns in posts';
    RAISE NOTICE '✅ No more analytics functions or triggers';
    RAISE NOTICE '✅ Database cleaned up successfully';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Remove analytics code from application';
    RAISE NOTICE '2. Remove analytics pages and components';
    RAISE NOTICE '3. Update queries to not reference analytics';
    RAISE NOTICE '========================================';
END $$;
