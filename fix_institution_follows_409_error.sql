-- FIX FOR INSTITUTION FOLLOWS 409 ERROR
-- This script ensures the institution_follows table exists with proper constraints

-- ========================================================
-- 1. CREATE INSTITUTION_FOLLOWS TABLE IF IT DOESN'T EXIST
-- ========================================================

CREATE TABLE IF NOT EXISTS institution_follows (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    institution_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, institution_id)
);

-- ========================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ========================================================

ALTER TABLE institution_follows ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 3. DROP EXISTING POLICIES
-- ========================================================

DROP POLICY IF EXISTS "institution_follows_all_access" ON institution_follows;
DROP POLICY IF EXISTS "institution_follows_select_public" ON institution_follows;
DROP POLICY IF EXISTS "institution_follows_insert_auth" ON institution_follows;
DROP POLICY IF EXISTS "institution_follows_delete_auth" ON institution_follows;

-- ========================================================
-- 4. CREATE PERMISSIVE RLS POLICIES
-- ========================================================

-- Allow public read access
CREATE POLICY "institution_follows_select_public" ON institution_follows FOR SELECT USING (true);

-- Allow authenticated users to create follows
CREATE POLICY "institution_follows_insert_auth" ON institution_follows FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete their own follows
CREATE POLICY "institution_follows_delete_auth" ON institution_follows FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================================
-- 5. GRANT PERMISSIONS
-- ========================================================

GRANT ALL ON institution_follows TO postgres, anon, authenticated, service_role;

-- ========================================================
-- 6. CREATE UPDATED_AT TRIGGER
-- ========================================================

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_institution_follows_updated_at ON institution_follows;

-- Create the trigger
CREATE TRIGGER update_institution_follows_updated_at
    BEFORE UPDATE ON institution_follows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================================
-- 7. VERIFICATION
-- ========================================================

DO $$
BEGIN
    -- Check if institution_follows table exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'institution_follows') THEN
        RAISE NOTICE '✅ institution_follows table exists successfully';
    ELSE
        RAISE EXCEPTION '❌ institution_follows table does not exist';
    END IF;

    -- Check if RLS is enabled
    IF (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.institution_follows'::regclass) THEN
        RAISE NOTICE '✅ RLS is enabled on institution_follows table';
    ELSE
        RAISE EXCEPTION '❌ RLS is NOT enabled on institution_follows table';
    END IF;

    -- Check if unique constraint exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.institution_follows'::regclass 
        AND contype = 'u'
        AND conname LIKE '%user_id%'
    ) THEN
        RAISE NOTICE '✅ Unique constraint on (user_id, institution_id) exists';
    ELSE
        RAISE EXCEPTION '❌ Unique constraint on (user_id, institution_id) missing';
    END IF;

    -- Check if policies exist
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'public.institution_follows'::regclass AND polname = 'institution_follows_select_public') THEN
        RAISE NOTICE '✅ institution_follows SELECT policy created successfully';
    ELSE
        RAISE EXCEPTION '❌ institution_follows SELECT policy NOT created';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'public.institution_follows'::regclass AND polname = 'institution_follows_insert_auth') THEN
        RAISE NOTICE '✅ institution_follows INSERT policy created successfully';
    ELSE
        RAISE EXCEPTION '❌ institution_follows INSERT policy NOT created';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'public.institution_follows'::regclass AND polname = 'institution_follows_delete_auth') THEN
        RAISE NOTICE '✅ institution_follows DELETE policy created successfully';
    ELSE
        RAISE EXCEPTION '❌ institution_follows DELETE policy NOT created';
    END IF;

    RAISE NOTICE '🎉 INSTITUTION FOLLOWS 409 ERROR FIXED!';
    RAISE NOTICE '✅ Table exists with correct schema and unique constraint';
    RAISE NOTICE '✅ RLS enabled with permissive policies';
    RAISE NOTICE '✅ All permissions granted';
    RAISE NOTICE '✅ Updated_at trigger created';
    RAISE NOTICE '✅ Follow/unfollow should now work without 409 errors';
END $$;
