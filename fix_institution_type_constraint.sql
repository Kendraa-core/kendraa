-- =====================================================
-- FIX INSTITUTION TYPE CONSTRAINT ISSUE
-- =====================================================
-- This script fixes the institutions_type_check constraint violation
-- by ensuring the constraint matches the expected values

-- First, let's check the current constraint
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'institutions_type_check';

-- Drop the existing constraint if it exists
ALTER TABLE institutions DROP CONSTRAINT IF EXISTS institutions_type_check;

-- Add the correct constraint with all valid institution types
ALTER TABLE institutions ADD CONSTRAINT institutions_type_check 
CHECK (type IN ('hospital', 'clinic', 'research_center', 'university', 'pharmaceutical', 'medical_device', 'other'));

-- Verify the constraint was added correctly
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'institutions_type_check';

-- Test the constraint with valid values
INSERT INTO institutions (name, type, admin_user_id) VALUES ('Test Hospital', 'hospital', '00000000-0000-0000-0000-000000000000');
INSERT INTO institutions (name, type, admin_user_id) VALUES ('Test Clinic', 'clinic', '00000000-0000-0000-0000-000000000001');
INSERT INTO institutions (name, type, admin_user_id) VALUES ('Test Research', 'research_center', '00000000-0000-0000-0000-000000000002');
INSERT INTO institutions (name, type, admin_user_id) VALUES ('Test University', 'university', '00000000-0000-0000-0000-000000000003');
INSERT INTO institutions (name, type, admin_user_id) VALUES ('Test Pharma', 'pharmaceutical', '00000000-0000-0000-0000-000000000004');
INSERT INTO institutions (name, type, admin_user_id) VALUES ('Test Device', 'medical_device', '00000000-0000-0000-0000-000000000005');
INSERT INTO institutions (name, type, admin_user_id) VALUES ('Test Other', 'other', '00000000-0000-0000-0000-000000000006');

-- Clean up test data
DELETE FROM institutions WHERE admin_user_id LIKE '00000000-0000-0000-0000-00000000000%';

-- Show the final constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'institutions_type_check';
