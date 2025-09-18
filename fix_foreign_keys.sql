-- Fix foreign key constraints for existing database
-- This script handles the UUID type mismatch issue

-- First, let's check the current structure
SELECT 'Current institutions table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'institutions' 
ORDER BY ordinal_position;

-- Check if the columns already exist
SELECT 'Checking existing columns:' as info;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE (table_name = 'jobs' AND column_name = 'company_id') 
   OR (table_name = 'events' AND column_name = 'institution_id');

-- Add company_id column to jobs table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'company_id') THEN
        ALTER TABLE jobs ADD COLUMN company_id UUID REFERENCES institutions(id);
        RAISE NOTICE 'Added company_id column to jobs table';
    ELSE
        RAISE NOTICE 'company_id column already exists in jobs table';
    END IF;
END $$;

-- Add institution_id column to events table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'institution_id') THEN
        ALTER TABLE events ADD COLUMN institution_id UUID REFERENCES institutions(id);
        RAISE NOTICE 'Added institution_id column to events table';
    ELSE
        RAISE NOTICE 'institution_id column already exists in events table';
    END IF;
END $$;

-- Verify the columns were added successfully
SELECT 'Final verification - Jobs table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY ordinal_position;

SELECT 'Final verification - Events table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

SELECT 'Foreign key constraints added successfully!' as status;
