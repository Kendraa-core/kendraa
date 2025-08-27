-- Comprehensive fix for education and experience tables
-- Run this in your Supabase SQL editor

-- 1. First, let's check what tables exist
SELECT 
    table_name,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = t.table_name
    ) as table_exists
FROM (VALUES ('education'), ('experiences')) as t(table_name);

-- 2. Create the experiences table if it doesn't exist
CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 3. Create the education table if it doesn't exist
CREATE TABLE IF NOT EXISTS education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 5. Create updated_at trigger function if it doesn't exist
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

-- 7. Enable Row Level Security (RLS)
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;

-- 8. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can insert their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can update their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can delete their own experiences" ON experiences;

DROP POLICY IF EXISTS "Users can view their own education" ON education;
DROP POLICY IF EXISTS "Users can insert their own education" ON education;
DROP POLICY IF EXISTS "Users can update their own education" ON education;
DROP POLICY IF EXISTS "Users can delete their own education" ON education;

-- 9. Create RLS policies for experiences
CREATE POLICY "Users can view their own experiences" ON experiences
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own experiences" ON experiences
    FOR INSERT WITH CHECK (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own experiences" ON experiences
    FOR UPDATE USING (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own experiences" ON experiences
    FOR DELETE USING (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

-- 10. Create RLS policies for education
CREATE POLICY "Users can view their own education" ON education
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own education" ON education
    FOR INSERT WITH CHECK (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own education" ON education
    FOR UPDATE USING (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own education" ON education
    FOR DELETE USING (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

-- 11. Grant permissions
GRANT ALL ON experiences TO authenticated;
GRANT ALL ON education TO authenticated;
GRANT USAGE ON SEQUENCE experiences_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE education_id_seq TO authenticated;

-- 12. Verify the tables were created successfully
SELECT 
    table_name,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = t.table_name
    ) as table_exists
FROM (VALUES ('education'), ('experiences')) as t(table_name);

-- 13. Check table structure
SELECT 
    'experiences' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'experiences' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'education' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'education' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 14. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('education', 'experiences');

-- 15. Test insert permissions (this will fail if RLS is not working correctly)
-- You can uncomment and run this to test, but it will create test data
/*
INSERT INTO experiences (profile_id, title, company, start_date) 
VALUES (auth.uid(), 'Test Experience', 'Test Company', '2020-01-01')
ON CONFLICT DO NOTHING;

INSERT INTO education (profile_id, school, degree, start_date) 
VALUES (auth.uid(), 'Test School', 'Test Degree', '2015-01-01')
ON CONFLICT DO NOTHING;
*/
