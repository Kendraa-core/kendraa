-- Fix the signup trigger to handle profile creation properly
-- This script addresses potential issues with the automatic profile creation

-- 1. Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create a new, more robust function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with all required fields and proper defaults
  INSERT INTO public.profiles (
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
    onboarding_completed,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'profile_type', 'individual'),
    COALESCE(NEW.raw_user_meta_data->>'profile_type', 'individual'),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '{}',
    false,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    user_type = COALESCE(EXCLUDED.user_type, profiles.user_type),
    profile_type = COALESCE(EXCLUDED.profile_type, profiles.profile_type),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Ensure proper permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;

-- 5. Set security context
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
