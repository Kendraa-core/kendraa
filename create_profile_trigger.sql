-- Create a trigger to automatically create profiles when users sign up
-- This ensures that every new user gets a profile record automatically

-- 1. Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type, profile_type, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'profile_type', 'individual'),
    COALESCE(NEW.raw_user_meta_data->>'profile_type', 'individual'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.experiences TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.education TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.posts TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.institutions TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.jobs TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.events TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.follows TO postgres, anon, authenticated, service_role;

-- 4. Ensure the function has the right security context
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
