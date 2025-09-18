-- Add missing columns to existing tables
-- Run this after the main database_setup_complete.sql

-- First, let's check the actual data type of institutions.id
SELECT 'Checking institutions table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'institutions' 
ORDER BY ordinal_position;

-- Add company_id column to jobs table if it doesn't exist
-- Use UUID to match the actual institutions.id type
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'company_id') THEN
        ALTER TABLE jobs ADD COLUMN company_id UUID REFERENCES institutions(id);
    END IF;
END $$;

-- Add institution_id column to events table if it doesn't exist
-- Use UUID to match the actual institutions.id type
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'institution_id') THEN
        ALTER TABLE events ADD COLUMN institution_id UUID REFERENCES institutions(id);
    END IF;
END $$;

-- Verify the columns were added
SELECT 'Jobs table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY ordinal_position;

SELECT 'Events table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

SELECT 'Missing columns added successfully!' as status;
