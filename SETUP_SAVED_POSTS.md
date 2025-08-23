# Setup Saved Posts Table

## Issue
The error `[Queries] Error getting saved posts: {}` occurs because the `saved_posts` table doesn't exist in your Supabase database.

## Solution
You need to run the SQL script to create the `saved_posts` table and its associated functions.

## Steps to Fix

1. **Go to your Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Select your project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the SQL Script**
   - Copy the contents of `fix_saved_posts_table.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the script

4. **Verify the Setup**
   - The script will create:
     - `saved_posts` table with proper structure
     - Indexes for performance
     - Row Level Security (RLS) policies
     - Helper functions for saving/unsaving posts

## What the Script Does

- Creates the `saved_posts` table with columns:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key to profiles)
  - `post_id` (UUID, Foreign Key to posts)
  - `created_at` (Timestamp)

- Sets up RLS policies for security
- Creates indexes for better performance
- Adds helper functions for common operations

## After Running the Script

The saved posts functionality should work correctly:
- Users can save posts using the bookmark button
- Saved posts will appear in the "Saved Items" page
- The error should be resolved

## Alternative: Manual Table Creation

If you prefer to create the table manually, here's the minimal SQL:

```sql
CREATE TABLE IF NOT EXISTS saved_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved posts" ON saved_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" ON saved_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their own posts" ON saved_posts
    FOR DELETE USING (auth.uid() = user_id);
```
