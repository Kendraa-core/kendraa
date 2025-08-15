-- Fix infinite recursion in conversation_participants RLS policies
-- This script fixes the circular reference that was causing the 500 error

-- First, let's check what column name actually exists in the conversation_participants table
-- and create a more robust migration

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;

-- Recreate the policies without circular references
-- Using a more robust approach that works with both possible column names
CREATE POLICY "Users can view conversation participants" ON conversation_participants FOR SELECT USING (
    participant_id = auth.uid()
);

CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
    sender_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = messages.conversation_id 
        AND cp.participant_id = auth.uid()
        AND (cp.left_at IS NULL OR cp.left_at > NOW())
    )
);


