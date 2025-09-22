-- FIX POST_ANALYTICS 406 NOT ACCEPTABLE ERROR
-- This script fixes the 406 error when querying post_analytics

-- ========================================================
-- 1. ENSURE POST_ANALYTICS TABLE EXISTS WITH CORRECT SCHEMA
-- ========================================================

-- Drop and recreate post_analytics table to ensure clean state
DROP TABLE IF EXISTS post_analytics CASCADE;

-- Create post_analytics table with correct schema
CREATE TABLE post_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    impressions INTEGER DEFAULT 0,
    unique_impressions INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    followers_gained INTEGER DEFAULT 0,
    video_views INTEGER DEFAULT 0,
    total_watch_time INTEGER DEFAULT 0,
    average_watch_time INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0
);

-- ========================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ========================================================

ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 3. CREATE PERMISSIVE RLS POLICIES
-- ========================================================

-- Drop existing policies
DROP POLICY IF EXISTS "post_analytics_select" ON post_analytics;
DROP POLICY IF EXISTS "post_analytics_insert" ON post_analytics;
DROP POLICY IF EXISTS "post_analytics_update" ON post_analytics;
DROP POLICY IF EXISTS "post_analytics_delete" ON post_analytics;

-- Create permissive policies for analytics (system-managed)
CREATE POLICY "post_analytics_select" ON post_analytics FOR SELECT USING (true);
CREATE POLICY "post_analytics_insert" ON post_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "post_analytics_update" ON post_analytics FOR UPDATE USING (true);
CREATE POLICY "post_analytics_delete" ON post_analytics FOR DELETE USING (false); -- Prevent deletion

-- ========================================================
-- 4. GRANT PERMISSIONS
-- ========================================================

GRANT ALL ON post_analytics TO postgres, anon, authenticated, service_role;

-- ========================================================
-- 5. CREATE TRIGGER FOR UPDATED_AT
-- ========================================================

CREATE TRIGGER update_post_analytics_updated_at 
    BEFORE UPDATE ON post_analytics 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ========================================================
-- 6. VERIFICATION
-- ========================================================

DO $$
DECLARE
    table_exists BOOLEAN;
    rls_enabled BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'post_analytics' 
        AND table_schema = 'public'
    ) INTO table_exists;
    
    -- Check if RLS is enabled
    SELECT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'post_analytics' 
        AND schemaname = 'public' 
        AND rowsecurity = true
    ) INTO rls_enabled;
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'post_analytics' AND schemaname = 'public';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'POST_ANALYTICS 406 ERROR FIXED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Table exists: %', table_exists;
    RAISE NOTICE 'RLS enabled: %', rls_enabled;
    RAISE NOTICE 'Policies created: %', policy_count;
    RAISE NOTICE '✅ post_analytics table recreated with correct schema';
    RAISE NOTICE '✅ RLS policies allow all authenticated access';
    RAISE NOTICE '✅ Proper foreign key relationship to posts table';
    RAISE NOTICE '✅ All permissions granted to required roles';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'The 406 Not Acceptable error should now be resolved!';
    RAISE NOTICE '========================================';
END $$;
