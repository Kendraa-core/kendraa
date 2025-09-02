-- =====================================================
-- Add Onboarding Completion Column to Profiles Table
-- =====================================================
-- This script adds a column to track whether users have completed onboarding
-- Run this in your Supabase SQL Editor

-- Step 1: Add the new column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Step 2: Add documentation comment
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Indicates whether the user has completed their onboarding process';

-- Step 3: Update existing profiles to mark them as not completed
UPDATE public.profiles 
SET onboarding_completed = FALSE 
WHERE onboarding_completed IS NULL;

-- Step 4: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);

-- Step 5: Add RLS policy to allow users to update their own onboarding status
DROP POLICY IF EXISTS "Users can update their own onboarding completion status" ON public.profiles;
CREATE POLICY "Users can update their own onboarding completion status" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Step 6: Grant necessary permissions
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Step 7: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'onboarding_completed';

-- Step 8: Check current onboarding completion status
SELECT 
    onboarding_completed,
    COUNT(*) as user_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.profiles), 2) as percentage
FROM public.profiles 
GROUP BY onboarding_completed
ORDER BY onboarding_completed;

-- Step 9: Show sample of profiles with their completion status
SELECT 
    id, 
    full_name, 
    email,
    onboarding_completed,
    created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;
