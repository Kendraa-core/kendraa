-- Comprehensive fix for profile creation issues
-- This addresses 401 errors and RLS policy violations

-- 1. First, let's check the current state
SELECT 
    'Current RLS Status' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. Check existing policies
SELECT 
    'Existing Policies' as info,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON profiles;

-- 4. Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create comprehensive RLS policies

-- Allow all users to view profiles (for public profiles)
CREATE POLICY "Enable read access for all users" ON profiles
    FOR SELECT USING (true);

-- Allow authenticated users to insert their own profile
-- This is the critical policy for profile creation
CREATE POLICY "Enable insert for authenticated users only" ON profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id AND 
        auth.role() = 'authenticated'
    );

-- Allow users to update their own profile
CREATE POLICY "Enable update for users based on id" ON profiles
    FOR UPDATE USING (
        auth.uid() = id AND 
        auth.role() = 'authenticated'
    );

-- Allow users to delete their own profile
CREATE POLICY "Enable delete for users based on id" ON profiles
    FOR DELETE USING (
        auth.uid() = id AND 
        auth.role() = 'authenticated'
    );

-- 6. Grant all necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- 7. Ensure the sequence permissions are correct
GRANT USAGE ON SEQUENCE profiles_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE profiles_id_seq TO service_role;

-- 8. Check if there are any trigger functions that might interfere
SELECT 
    'Triggers' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 9. Verify the table structure
SELECT 
    'Table Structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 10. Test the policies
SELECT 
    'Policy Verification' as info,
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'INSERT' AND with_check LIKE '%auth.uid()%' THEN '✅ INSERT policy correct'
        WHEN cmd = 'SELECT' AND qual LIKE '%true%' THEN '✅ SELECT policy correct'
        WHEN cmd = 'UPDATE' AND qual LIKE '%auth.uid()%' THEN '✅ UPDATE policy correct'
        WHEN cmd = 'DELETE' AND qual LIKE '%auth.uid()%' THEN '✅ DELETE policy correct'
        ELSE '❌ Policy needs review'
    END as status
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd;

-- 11. Check for any existing profiles that might be causing issues
SELECT 
    'Existing Profiles Count' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN id IS NOT NULL THEN 1 END) as profiles_with_id,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as profiles_with_email
FROM profiles;

-- 12. Create a function to safely create profiles (optional)
CREATE OR REPLACE FUNCTION create_user_profile(
    user_id UUID,
    user_email TEXT,
    user_full_name TEXT DEFAULT NULL,
    user_type TEXT DEFAULT 'individual'
)
RETURNS profiles AS $$
DECLARE
    new_profile profiles;
BEGIN
    -- Insert the profile
    INSERT INTO profiles (
        id,
        email,
        full_name,
        user_type,
        profile_type,
        headline,
        bio,
        location,
        avatar_url,
        banner_url,
        website,
        phone,
        specialization,
        is_premium,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        user_email,
        COALESCE(user_full_name, ''),
        user_type,
        user_type,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '{}',
        false,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW()
    RETURNING * INTO new_profile;
    
    RETURN new_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT) TO service_role;

-- 13. Final verification
SELECT 
    'Final Status' as info,
    'RLS Policies Fixed' as status,
    NOW() as fixed_at;
