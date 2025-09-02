# Onboarding Completion Database Setup Guide

## Overview
This guide explains how to add a database column to track whether users have completed their onboarding process, and how the application will automatically redirect users to onboarding until completion.

## Database Changes

### 1. Add the Column
Run the following SQL in your Supabase SQL Editor:

```sql
-- Add onboarding_completed column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add a comment to document the column purpose
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Indicates whether the user has completed their onboarding process';

-- Update existing profiles to mark them as not completed
UPDATE public.profiles 
SET onboarding_completed = FALSE 
WHERE onboarding_completed IS NULL;

-- Create an index for better query performance
CREATE INDEX idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);

-- Add RLS policy to allow users to update their own onboarding status
CREATE POLICY "Users can update their own onboarding completion status" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'onboarding_completed';
```

### 2. Expected Result
After running the SQL, you should see:
- A new `onboarding_completed` column in the `profiles` table
- Default value: `FALSE`
- All existing profiles will have `onboarding_completed = FALSE`

## Application Changes Made

### 1. Database Types Updated
- Added `onboarding_completed: boolean` to the `Profile` interface in `types/database.types.ts`

### 2. Dashboard Layout Updated
- Modified `app/(dashboard)/layout.tsx` to check `profile.onboarding_completed` instead of localStorage
- Users are redirected to `/onboarding` if completion < 50% AND onboarding not completed

### 3. Onboarding Modal Updated
- Modified `components/profile/OnboardingModal.tsx` to:
  - Check `profile.onboarding_completed` from database instead of localStorage
  - Update `onboarding_completed = true` in database when onboarding is complete
  - Automatically redirect to `/feed` when onboarding is marked complete

### 4. Profile Page Updated
- Modified `app/profile/[id]/page.tsx` to check `profile.onboarding_completed` instead of localStorage
- "Complete Your Profile" button only shows if onboarding is not completed

## How It Works

### 1. User Registration
- New users get `onboarding_completed = FALSE` by default
- They are automatically redirected to `/onboarding` when trying to access dashboard

### 2. Onboarding Process
- Users go through the onboarding steps
- Each step saves progress to the database
- When all required fields are completed, `onboarding_completed` is set to `TRUE`

### 3. Post-Onboarding
- Users with `onboarding_completed = TRUE` can access the full dashboard
- They are no longer redirected to onboarding
- The onboarding modal won't show again

### 4. Automatic Redirects
- **Dashboard Access**: Users with incomplete profiles (< 50%) AND `onboarding_completed = FALSE` → redirected to `/onboarding`
- **Profile Completion**: Users with complete profiles → `onboarding_completed` automatically set to `TRUE`
- **Feed Access**: Only available after onboarding completion

## Testing the Setup

### 1. Test New User Flow
1. Create a new user account
2. Try to access `/feed` or dashboard
3. Should be redirected to `/onboarding`
4. Complete onboarding steps
5. Should be redirected to `/feed`
6. Try accessing `/onboarding` again - should not be accessible

### 2. Test Existing User Flow
1. Existing users will have `onboarding_completed = FALSE`
2. They will be redirected to onboarding until completion
3. After completion, they can access the full application

### 3. Database Verification
```sql
-- Check onboarding completion status
SELECT 
    id, 
    full_name, 
    onboarding_completed,
    created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Check completion rate
SELECT 
    onboarding_completed,
    COUNT(*) as user_count
FROM public.profiles 
GROUP BY onboarding_completed;
```

## Troubleshooting

### 1. Column Not Added
- Ensure you have admin access to the database
- Check if the column already exists
- Verify the SQL executed without errors

### 2. Users Still Redirected
- Check if `onboarding_completed` column exists
- Verify the column has the correct default value
- Check browser console for any errors

### 3. Onboarding Not Marking Complete
- Verify the `isProfileComplete()` function logic
- Check if all required fields are being saved
- Look for database update errors in console

## Security Considerations

- The `onboarding_completed` field is protected by RLS policies
- Users can only update their own onboarding status
- The field is included in profile updates but cannot be manipulated by other users

## Performance Notes

- Added index on `onboarding_completed` for faster queries
- The field is checked on every dashboard access
- Consider caching if performance becomes an issue

## Future Enhancements

1. **Onboarding Progress Tracking**: Add a progress percentage field
2. **Step Completion**: Track which specific onboarding steps are completed
3. **Onboarding History**: Log when onboarding was completed
4. **Re-onboarding**: Allow users to restart onboarding if needed
5. **Admin Override**: Allow admins to mark onboarding complete for users
