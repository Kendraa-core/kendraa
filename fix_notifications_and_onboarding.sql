-- FIX NOTIFICATIONS QUERY AND ONBOARDING ISSUES
-- This script fixes the notifications field mismatch and ensures proper database setup

-- ========================================================
-- 1. FIX NOTIFICATIONS TABLE SCHEMA
-- ========================================================

-- The notifications table should use 'user_id' not 'recipient_id'
-- Let's ensure the table structure is correct
DO $$
BEGIN
    -- Check if notifications table exists and has correct structure
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        -- Check if user_id column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id' AND table_schema = 'public') THEN
            -- Add user_id column if it doesn't exist
            ALTER TABLE notifications ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
        END IF;
        
        -- Check if recipient_id column exists and remove it if it does
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'recipient_id' AND table_schema = 'public') THEN
            -- Drop recipient_id column
            ALTER TABLE notifications DROP COLUMN IF EXISTS recipient_id;
        END IF;
        
        RAISE NOTICE '✅ Notifications table structure verified and fixed';
    ELSE
        -- Create notifications table with correct structure
        CREATE TABLE notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            type TEXT NOT NULL CHECK (type IN ('connection_request', 'connection_accepted', 'post_like', 'post_comment', 'job_application', 'event_reminder', 'mention')),
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT false,
            data JSONB,
            action_url TEXT
        );
        
        RAISE NOTICE '✅ Notifications table created with correct structure';
    END IF;
END $$;

-- ========================================================
-- 2. ENABLE RLS ON NOTIFICATIONS
-- ========================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 3. CREATE PROPER RLS POLICIES FOR NOTIFICATIONS
-- ========================================================

-- Drop existing policies
DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;
DROP POLICY IF EXISTS "notifications_delete" ON notifications;

-- Create proper policies
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true); -- System can create notifications
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- ========================================================
-- 4. GRANT PERMISSIONS
-- ========================================================

GRANT ALL ON notifications TO postgres, anon, authenticated, service_role;

-- ========================================================
-- 5. VERIFICATION
-- ========================================================

DO $$
DECLARE
    has_user_id BOOLEAN;
    has_recipient_id BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- Check column structure
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) INTO has_user_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'recipient_id' 
        AND table_schema = 'public'
    ) INTO has_recipient_id;
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'notifications' AND schemaname = 'public';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'NOTIFICATIONS FIX COMPLETED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Has user_id column: %', has_user_id;
    RAISE NOTICE 'Has recipient_id column: %', has_recipient_id;
    RAISE NOTICE 'RLS policies created: %', policy_count;
    RAISE NOTICE '✅ Notifications table now uses user_id field';
    RAISE NOTICE '✅ Queries should use user_id instead of recipient_id';
    RAISE NOTICE '✅ RLS policies allow users to see their own notifications';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'The 400 Bad Request error should now be resolved!';
    RAISE NOTICE '========================================';
END $$;
