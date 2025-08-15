-- Diagnostic script to check the actual database structure
-- Run this first to see what columns actually exist

-- Check conversation_participants table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'conversation_participants' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'conversation_participants';

-- Check if the table exists and has data
SELECT COUNT(*) as participant_count FROM conversation_participants;

-- Check sample data structure
SELECT * FROM conversation_participants LIMIT 5;
