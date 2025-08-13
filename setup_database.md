# Database Setup Instructions

## 🔧 **Database Fixes Required**

The application is experiencing database errors because some tables and relationships are missing. Follow these steps to fix them:

### **Step 1: Access Supabase SQL Editor**

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** tab
3. Create a new query

### **Step 2: Run the SQL Commands**

Copy and paste the entire contents of `database_fixes.sql` into the SQL editor and run it.

### **Step 3: Verify the Changes**

After running the SQL, you should see:
- ✅ `profile_views` table created
- ✅ `post_comments` table created (if it didn't exist)
- ✅ Proper foreign key relationships established
- ✅ Row Level Security (RLS) policies configured
- ✅ Triggers for automatic count updates
- ✅ Indexes for better performance

### **Step 4: Test the Application**

Once the database is updated:
1. Refresh your application
2. Try viewing a profile - profile views should now record without errors
3. Try viewing posts with comments - comments should now display properly
4. Check the browser console - the 400 errors should be gone

## **What the SQL Fixes:**

### **1. Profile Views Table**
- Creates the missing `profile_views` table
- Establishes proper foreign key relationships to `profiles` table
- Adds automatic count tracking via triggers
- Sets up RLS policies for security

### **2. Post Comments Table**
- Ensures the `post_comments` table has proper foreign key relationships
- Links comments to both `posts` and `profiles` tables
- Adds automatic comment count tracking
- Sets up proper RLS policies

### **3. Performance Optimizations**
- Adds database indexes for faster queries
- Creates triggers for automatic count updates
- Ensures data consistency

### **4. Security**
- Enables Row Level Security (RLS)
- Creates policies to control data access
- Ensures users can only access appropriate data

## **Expected Results:**

After running the SQL:
- ✅ No more "Could not find the 'viewed_at' column" errors
- ✅ No more "Could not find a relationship between 'post_comments' and 'profiles'" errors
- ✅ Profile views will record successfully
- ✅ Comments will display with author information
- ✅ Automatic count updates will work
- ✅ Better query performance

## **Troubleshooting:**

If you encounter any issues:
1. Check that all SQL commands executed successfully
2. Verify the tables exist in the Supabase dashboard
3. Check that RLS policies are enabled
4. Ensure your application has the correct database URL and API keys

The SQL script is designed to be safe to run multiple times (uses `IF NOT EXISTS` clauses).
