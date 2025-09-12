-- =====================================================
-- FIX INSTITUTION SIZE CONSTRAINT ISSUE
-- =====================================================
-- This script fixes the institutions_size_check constraint violation
-- by ensuring the constraint matches the expected values

-- First, let's check the current constraint
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'institutions_size_check';

-- Drop the existing constraint if it exists
ALTER TABLE institutions DROP CONSTRAINT IF EXISTS institutions_size_check;

-- Add the correct constraint with all valid size values
ALTER TABLE institutions ADD CONSTRAINT institutions_size_check 
CHECK (size IN ('small', 'medium', 'large', 'enterprise') OR size IS NULL);

-- Verify the constraint was added correctly
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'institutions_size_check';

-- Test the constraint with valid values
INSERT INTO institutions (name, type, size, admin_user_id) VALUES ('Test Small', 'hospital', 'small', '00000000-0000-0000-0000-000000000000');
INSERT INTO institutions (name, type, size, admin_user_id) VALUES ('Test Medium', 'hospital', 'medium', '00000000-0000-0000-0000-000000000001');
INSERT INTO institutions (name, type, size, admin_user_id) VALUES ('Test Large', 'hospital', 'large', '00000000-0000-0000-0000-000000000002');
INSERT INTO institutions (name, type, size, admin_user_id) VALUES ('Test Enterprise', 'hospital', 'enterprise', '00000000-0000-0000-0000-000000000003');
INSERT INTO institutions (name, type, size, admin_user_id) VALUES ('Test Null', 'hospital', NULL, '00000000-0000-0000-0000-000000000004');

-- Clean up test data
DELETE FROM institutions WHERE admin_user_id LIKE '00000000-0000-0000-0000-00000000000%';

-- Show the final constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'institutions_size_check';
