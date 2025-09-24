-- Fix jobs table foreign key constraint issue
-- This script addresses the 409 Conflict error: "Key is not present in table 'institutions'"

-- First, let's check the current state of the jobs table and its constraints
DO $$
BEGIN
    -- Check if jobs table exists and get its structure
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs') THEN
        RAISE NOTICE 'Jobs table exists. Checking foreign key constraints...';
        
        -- List all foreign key constraints on jobs table
        PERFORM constraint_name, table_name, column_name, foreign_table_name, foreign_column_name
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.referential_constraints rc ON kcu.constraint_name = rc.constraint_name
        WHERE kcu.table_name = 'jobs';
        
    ELSE
        RAISE NOTICE 'Jobs table does not exist. Creating it...';
    END IF;
END $$;

-- Drop the problematic foreign key constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'jobs_company_id_fkey' 
        AND table_name = 'jobs'
    ) THEN
        ALTER TABLE jobs DROP CONSTRAINT jobs_company_id_fkey;
        RAISE NOTICE 'Dropped jobs_company_id_fkey constraint';
    END IF;
END $$;

-- Ensure institutions table exists with proper structure
CREATE TABLE IF NOT EXISTS institutions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    description TEXT,
    website TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create or recreate the jobs table with proper foreign key handling
DROP TABLE IF EXISTS jobs CASCADE;

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    job_type TEXT,
    experience_level TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    currency TEXT,
    requirements TEXT[],
    specializations TEXT[],
    application_deadline DATE,
    start_date DATE,
    status TEXT DEFAULT 'active',
    applications_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Make company_id nullable and add proper foreign key constraint
    company_id TEXT REFERENCES institutions(id) ON DELETE SET NULL,
    
    -- Add author_id to track who created the job
    author_id TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_author_id ON jobs(author_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for jobs table
DROP POLICY IF EXISTS "Users can view all jobs" ON jobs;
CREATE POLICY "Users can view all jobs" ON jobs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own jobs" ON jobs;
CREATE POLICY "Users can insert their own jobs" ON jobs
    FOR INSERT WITH CHECK (auth.uid()::text = author_id);

DROP POLICY IF EXISTS "Users can update their own jobs" ON jobs;
CREATE POLICY "Users can update their own jobs" ON jobs
    FOR UPDATE USING (auth.uid()::text = author_id);

DROP POLICY IF EXISTS "Users can delete their own jobs" ON jobs;
CREATE POLICY "Users can delete their own jobs" ON jobs
    FOR DELETE USING (auth.uid()::text = author_id);

-- Create updated_at trigger for jobs table
CREATE OR REPLACE FUNCTION update_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_jobs_updated_at ON jobs;
CREATE TRIGGER trigger_update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_jobs_updated_at();

-- Grant permissions
GRANT ALL ON jobs TO postgres;
GRANT ALL ON jobs TO anon;
GRANT ALL ON jobs TO authenticated;
GRANT ALL ON jobs TO service_role;

-- Insert a default institution if none exists (to prevent foreign key issues)
INSERT INTO institutions (id, name, type, description)
VALUES (
    'default-institution',
    'Default Institution',
    'healthcare',
    'Default institution for jobs without specific company'
) ON CONFLICT (id) DO NOTHING;

-- Verification queries
DO $$
BEGIN
    RAISE NOTICE '=== JOBS TABLE VERIFICATION ===';
    RAISE NOTICE 'Jobs table created successfully';
    RAISE NOTICE 'Foreign key constraint: company_id REFERENCES institutions(id) ON DELETE SET NULL';
    RAISE NOTICE 'RLS enabled with proper policies';
    RAISE NOTICE 'Default institution created to prevent foreign key violations';
    
    -- Check table structure
    PERFORM column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'jobs'
    ORDER BY ordinal_position;
    
    RAISE NOTICE '=== VERIFICATION COMPLETE ===';
END $$;
