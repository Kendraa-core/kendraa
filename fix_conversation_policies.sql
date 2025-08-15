-- Fix infinite recursion in conversation_participants RLS policies
-- This script fixes the circular reference that was causing the 500 error

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view clinical notes they're involved with" ON clinical_notes;

-- Recreate the policies without circular references
CREATE POLICY "Users can view conversation participants" ON conversation_participants FOR SELECT USING (
    participant_id = auth.uid()
);

CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
    sender_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = messages.conversation_id 
        AND cp.participant_id = auth.uid()
        AND cp.left_at IS NULL
    )
);

CREATE POLICY "Users can view clinical notes they're involved with" ON clinical_notes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM messages m
        JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
        WHERE m.id = clinical_notes.message_id 
        AND cp.participant_id = auth.uid()
        AND cp.left_at IS NULL
    )
);
