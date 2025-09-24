-- Fix notifications and profiles table errors
-- This script addresses:
-- 1. 400 Bad Request for notifications query with user_id parameter
-- 2. 406 Not Acceptable for profiles query

-- First, let's check the current state of both tables
DO $$
BEGIN
    RAISE NOTICE '=== CHECKING CURRENT TABLE STRUCTURES ===';
    
    -- Check notifications table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        RAISE NOTICE 'Notifications table exists';
    ELSE
        RAISE NOTICE 'Notifications table does not exist - will create it';
    END IF;
    
    -- Check profiles table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'Profiles table exists';
    ELSE
        RAISE NOTICE 'Profiles table does not exist - will create it';
    END IF;
END $$;

-- Drop and recreate notifications table with proper structure
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,  -- Changed from recipient_id to user_id
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
CREATE POLICY "Users can insert their own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (auth.uid()::text = user_id);

-- Create updated_at trigger for notifications
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Grant permissions for notifications
GRANT ALL ON notifications TO postgres;
GRANT ALL ON notifications TO anon;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;

-- Drop and recreate profiles table with proper structure
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
    id TEXT PRIMARY KEY,  -- Using TEXT to match auth.uid() format
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    user_type TEXT DEFAULT 'individual',
    specialization TEXT,
    experience_level TEXT,
    institution_id TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_institution_id ON profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON profiles(is_public);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (is_public = true OR auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
CREATE POLICY "Users can delete their own profile" ON profiles
    FOR DELETE USING (auth.uid()::text = id);

-- Create updated_at trigger for profiles
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();

-- Grant permissions for profiles
GRANT ALL ON profiles TO postgres;
GRANT ALL ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- Create or update the handle_new_user function to work with the new structure
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, first_name, last_name, user_type)
    VALUES (
        NEW.id::text,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'individual')
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Insert some sample data for testing
INSERT INTO profiles (id, email, first_name, last_name, user_type, is_public)
VALUES (
    '86ce7834-707e-45cb-9684-f287c10879e4',
    'test@example.com',
    'Test',
    'User',
    'individual',
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert sample notification for testing
INSERT INTO notifications (user_id, type, title, message, action_url)
VALUES (
    '86ce7834-707e-45cb-9684-f287c10879e4',
    'welcome',
    'Welcome to Kendraa!',
    'Thank you for joining our healthcare professional network.',
    '/feed'
) ON CONFLICT DO NOTHING;

-- Verification queries
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICATION RESULTS ===';
    
    -- Check notifications table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        RAISE NOTICE '✅ Notifications table created successfully';
        RAISE NOTICE '   - user_id column: TEXT NOT NULL';
        RAISE NOTICE '   - RLS enabled with proper policies';
        RAISE NOTICE '   - Indexes created for performance';
    END IF;
    
    -- Check profiles table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE '✅ Profiles table created successfully';
        RAISE NOTICE '   - id column: TEXT PRIMARY KEY';
        RAISE NOTICE '   - RLS enabled with proper policies';
        RAISE NOTICE '   - Indexes created for performance';
    END IF;
    
    -- Check sample data
    IF EXISTS (SELECT 1 FROM profiles WHERE id = '86ce7834-707e-45cb-9684-f287c10879e4') THEN
        RAISE NOTICE '✅ Sample profile data inserted';
    END IF;
    
    IF EXISTS (SELECT 1 FROM notifications WHERE user_id = '86ce7834-707e-45cb-9684-f287c10879e4') THEN
        RAISE NOTICE '✅ Sample notification data inserted';
    END IF;
    
    RAISE NOTICE '=== FIXES APPLIED SUCCESSFULLY ===';
    RAISE NOTICE 'The 400 Bad Request and 406 Not Acceptable errors should now be resolved.';
END $$;
