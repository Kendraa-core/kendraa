-- =====================================================
-- FIX ACCREDITATION FIELD ARRAY HANDLING
-- =====================================================
-- This script safely handles the accreditation field as an array type
-- and cleans up any problematic data

-- Check current column definition
SELECT column_name, data_type, udt_name, is_nullable
FROM information_schema.columns 
WHERE table_name = 'institutions' 
  AND column_name = 'accreditation';

-- Show current data to understand what we're working with
SELECT 
    id, 
    name, 
    accreditation,
    pg_typeof(accreditation) as data_type,
    CASE 
        WHEN accreditation IS NULL THEN 'NULL'
        WHEN array_length(accreditation, 1) IS NULL THEN 'EMPTY_ARRAY'
        WHEN array_length(accreditation, 1) = 0 THEN 'EMPTY_ARRAY'
        ELSE 'HAS_VALUE'
    END as accreditation_status
FROM institutions 
LIMIT 10;

-- Safely update empty arrays to NULL
-- This handles both empty arrays {} and NULL values
UPDATE institutions 
SET accreditation = NULL 
WHERE accreditation IS NOT NULL 
  AND array_length(accreditation, 1) IS NULL;

-- Also handle arrays with zero length
UPDATE institutions 
SET accreditation = NULL 
WHERE accreditation IS NOT NULL 
  AND array_length(accreditation, 1) = 0;

-- Verify the fix
SELECT 
    id, 
    name, 
    accreditation,
    pg_typeof(accreditation) as data_type,
    CASE 
        WHEN accreditation IS NULL THEN 'NULL'
        WHEN array_length(accreditation, 1) IS NULL THEN 'EMPTY_ARRAY'
        WHEN array_length(accreditation, 1) = 0 THEN 'EMPTY_ARRAY'
        ELSE 'HAS_VALUE'
    END as accreditation_status
FROM institutions 
LIMIT 10;

-- Show final column definition
SELECT column_name, data_type, udt_name, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'institutions' 
  AND column_name = 'accreditation';
