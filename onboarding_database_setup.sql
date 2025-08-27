-- Onboarding Database Setup for Kendraa
-- This file creates all necessary tables and columns for the onboarding system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Update existing table with missing columns)
-- Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
    END IF;
    
    -- Add website column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
        ALTER TABLE profiles ADD COLUMN website TEXT;
    END IF;
    
    -- Add specialization column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'specialization') THEN
        ALTER TABLE profiles ADD COLUMN specialization TEXT[];
    END IF;
    
    -- Add is_premium column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_premium') THEN
        ALTER TABLE profiles ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add user_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_type') THEN
        ALTER TABLE profiles ADD COLUMN user_type TEXT DEFAULT 'individual' CHECK (user_type IN ('individual', 'institution'));
    END IF;
    
    -- Add profile_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_type') THEN
        ALTER TABLE profiles ADD COLUMN profile_type TEXT DEFAULT 'individual' CHECK (profile_type IN ('individual', 'institution'));
    END IF;
END $$;

-- 2. EXPERIENCES TABLE
CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    company_type TEXT CHECK (company_type IN ('hospital', 'clinic', 'research', 'pharmaceutical', 'other')),
    location TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    current BOOLEAN DEFAULT FALSE,
    description TEXT,
    specialization TEXT[]
);

-- 3. EDUCATION TABLE
CREATE TABLE IF NOT EXISTS education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    school TEXT NOT NULL,
    degree TEXT NOT NULL,
    field TEXT,
    specialization TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    current BOOLEAN DEFAULT FALSE,
    description TEXT,
    gpa TEXT,
    honors TEXT[]
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_experiences_profile_id ON experiences(profile_id);
CREATE INDEX IF NOT EXISTS idx_experiences_start_date ON experiences(start_date);
CREATE INDEX IF NOT EXISTS idx_education_profile_id ON education(profile_id);
CREATE INDEX IF NOT EXISTS idx_education_start_date ON education(start_date);
CREATE INDEX IF NOT EXISTS idx_education_current ON education(current);

-- 5. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Add updated_at triggers
DROP TRIGGER IF EXISTS update_experiences_updated_at ON experiences;
CREATE TRIGGER update_experiences_updated_at 
    BEFORE UPDATE ON experiences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_education_updated_at ON education;
CREATE TRIGGER update_education_updated_at 
    BEFORE UPDATE ON education 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Row Level Security (RLS) Policies

-- Enable RLS on tables
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;

-- Experiences policies
DROP POLICY IF EXISTS "Users can view their own experiences" ON experiences;
CREATE POLICY "Users can view their own experiences" ON experiences
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own experiences" ON experiences;
CREATE POLICY "Users can insert their own experiences" ON experiences
    FOR INSERT WITH CHECK (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own experiences" ON experiences;
CREATE POLICY "Users can update their own experiences" ON experiences
    FOR UPDATE USING (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own experiences" ON experiences;
CREATE POLICY "Users can delete their own experiences" ON experiences
    FOR DELETE USING (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

-- Education policies
DROP POLICY IF EXISTS "Users can view their own education" ON education;
CREATE POLICY "Users can view their own education" ON education
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own education" ON education;
CREATE POLICY "Users can insert their own education" ON education
    FOR INSERT WITH CHECK (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own education" ON education;
CREATE POLICY "Users can update their own education" ON education
    FOR UPDATE USING (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own education" ON education;
CREATE POLICY "Users can delete their own education" ON education
    FOR DELETE USING (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

-- 8. Grant necessary permissions
GRANT ALL ON experiences TO authenticated;
GRANT ALL ON education TO authenticated;
GRANT USAGE ON SEQUENCE experiences_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE education_id_seq TO authenticated;

-- 9. Insert some sample data for testing (optional)
-- Uncomment the following lines if you want to add sample data

/*
INSERT INTO experiences (profile_id, title, company, location, start_date, current, description) VALUES
('your-profile-id-here', 'Software Engineer', 'Tech Corp', 'San Francisco, CA', '2023-01-01', true, 'Full-stack development with React and Node.js');

INSERT INTO education (profile_id, school, degree, field, start_date, current, description) VALUES
('your-profile-id-here', 'Stanford University', 'Bachelor of Science', 'Computer Science', '2019-09-01', false, 'Graduated with honors');
*/

-- 10. Verify the setup
SELECT 
    'profiles' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

SELECT 
    'experiences' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'experiences' 
ORDER BY ordinal_position;

SELECT 
    'education' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'education' 
ORDER BY ordinal_position;
