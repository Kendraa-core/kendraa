# Comment Likes and Replies Setup

## Issue
The `comment_likes` table doesn't exist in your Supabase database, and the `post_comments` table may be missing the `parent_id` column needed for comment replies. This is causing 404 errors when trying to use comment reactions and replies.

## Solution
Run the following SQL in your Supabase SQL Editor:

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Go to the "SQL Editor" section
3. Create a new query

### Step 2: Run the Comprehensive SQL Script
Copy and paste the entire contents of `fix_missing_tables.sql` into the SQL editor and run it.

**This script will:**
- ✅ Create the missing `comment_likes` table
- ✅ Add `parent_id` column to `post_comments` for replies
- ✅ Add `likes_count` and `author_type` columns if missing
- ✅ Create proper RLS policies for security
- ✅ Add database indexes for performance
- ✅ Create helper functions for reactions

### Step 3: Verify the Tables
After running the SQL, you should see:
- A new `comment_likes` table in your database
- `post_comments` table with `parent_id` column for replies
- Proper RLS policies for security
- Functions for incrementing/decrementing likes

## What This Fixes
- ✅ Comment reactions will work properly
- ✅ Comment replies will work properly
- ✅ No more 404 errors for comment_likes queries
- ✅ Proper security with RLS policies
- ✅ Optimized performance with indexes

## Alternative: Quick Fix
If you want to temporarily disable comment reactions until the table is created, you can comment out the comment reaction components in your code.

## Testing
After creating the tables:
1. Refresh your application
2. Try reacting to a comment - should work without errors
3. Try replying to a comment - should work properly
4. Check that reactions and replies persist correctly
5. Verify that unreacting works properly

The console errors should disappear once the tables are created.

## Troubleshooting
If you still see errors after running the SQL:
1. Check that the SQL executed successfully
2. Verify the tables exist in your Supabase dashboard
3. Check that RLS policies are enabled
4. Ensure your database connection is working properly
