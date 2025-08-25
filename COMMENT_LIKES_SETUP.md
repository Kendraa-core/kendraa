# Comment Likes Table Setup

## Issue
The `comment_likes` table doesn't exist in your Supabase database, which is causing 404 errors when trying to use comment reactions.

## Solution
Run the following SQL in your Supabase SQL Editor:

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Go to the "SQL Editor" section
3. Create a new query

### Step 2: Run the SQL Script
Copy and paste the entire contents of `fix_comment_likes_table.sql` into the SQL editor and run it.

### Step 3: Verify the Table
After running the SQL, you should see:
- A new `comment_likes` table in your database
- Proper RLS policies for security
- Functions for incrementing/decrementing likes

## What This Fixes
- ✅ Comment reactions will work properly
- ✅ No more 404 errors for comment_likes queries
- ✅ Proper security with RLS policies
- ✅ Optimized performance with indexes

## Alternative: Quick Fix
If you want to temporarily disable comment reactions until the table is created, you can comment out the comment reaction components in your code.

## Testing
After creating the table:
1. Refresh your application
2. Try reacting to a comment
3. Check that the reaction appears and persists
4. Verify that unreacting works properly

The console errors should disappear once the table is created.
