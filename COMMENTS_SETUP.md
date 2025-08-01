# Comments Setup Guide

## Issue
Comments are being created but not displayed because the `post_comments` table is missing from the database.

## Solution
You need to manually run the SQL script to create the missing table.

### Steps:

1. **Access your Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the SQL Script**
   - Copy the contents of `create_comments_table.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

3. **Verify the Table was Created**
   - Go to the "Table Editor" in your Supabase dashboard
   - You should see a new table called `post_comments`

4. **Test the Application**
   - Restart your development server if needed
   - Try creating a comment on a post
   - The comment should now be visible

## What the Script Does

The SQL script creates:
- `post_comments` table with proper structure
- RLS policies for security
- Functions to increment/decrement comment counts
- Proper permissions for authenticated users

## Alternative Solution

If you have Docker running, you can also run:
```bash
npx supabase db reset
```

This will apply all migrations including the updated `003_fix_permissions.sql` file.

## Troubleshooting

If comments still don't appear after running the script:
1. Check the browser console for any errors
2. Verify the table was created in Supabase dashboard
3. Try refreshing the page
4. Check if the user is properly authenticated 