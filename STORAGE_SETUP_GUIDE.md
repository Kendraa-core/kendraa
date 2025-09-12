# 🔧 Storage Setup Guide

## Issue: "Failed to save profile picture" Error

The error you're seeing is due to missing storage buckets and Row Level Security (RLS) policies in your Supabase project.

## 🚨 Root Cause
1. **Missing Storage Buckets**: The `avatars` and `banners` buckets don't exist
2. **Missing RLS Policies**: Even if buckets existed, there are no policies allowing uploads

## ✅ Solution Steps

### Step 1: Create Storage Buckets

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project
3. Go to **Storage** in the left sidebar
4. Click **"New bucket"**
5. Create two buckets:

   **Bucket 1: `avatars`**
   - Name: `avatars`
   - Public: ✅ Yes
   - File size limit: `5242880` (5MB)
   - Allowed MIME types: `image/*`

   **Bucket 2: `banners`**
   - Name: `banners`
   - Public: ✅ Yes
   - File size limit: `10485760` (10MB)
   - Allowed MIME types: `image/*`

### Step 2: Set Up RLS Policies

1. In your Supabase Dashboard, go to **Storage** → **Policies**
2. For each bucket (`avatars` and `banners`), create these policies:

   **Policy 1: Allow authenticated users to upload**
   ```sql
   CREATE POLICY "Allow authenticated users to upload" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'avatars' AND auth.role() = 'authenticated'
   );
   ```

   **Policy 2: Allow authenticated users to update**
   ```sql
   CREATE POLICY "Allow authenticated users to update" ON storage.objects
   FOR UPDATE USING (
     bucket_id = 'avatars' AND auth.role() = 'authenticated'
   );
   ```

   **Policy 3: Allow authenticated users to delete**
   ```sql
   CREATE POLICY "Allow authenticated users to delete" ON storage.objects
   FOR DELETE USING (
     bucket_id = 'avatars' AND auth.role() = 'authenticated'
   );
   ```

   **Policy 4: Allow public read access**
   ```sql
   CREATE POLICY "Allow public read access" ON storage.objects
   FOR SELECT USING (bucket_id = 'avatars');
   ```

3. Repeat the same policies for the `banners` bucket (replace `'avatars'` with `'banners'`)

### Step 3: Alternative - Use SQL Editor

If you prefer, you can run the SQL script I created:

1. Go to **SQL Editor** in your Supabase Dashboard
2. Copy and paste the contents of `fix_storage_policies.sql`
3. Run the script

### Step 4: Test the Fix

1. Restart your development server: `npm run dev`
2. Try uploading a profile picture again
3. The error should be resolved

## 🔍 Verification

After setting up the buckets and policies, you can verify everything is working by running:

```bash
node test-storage.js
```

This should show:
- ✅ Both buckets exist
- ✅ Upload test successful

## 🛠️ What I Fixed in the Code

1. **Better Error Messages**: Updated the error handling to provide more specific feedback
2. **Path Handling**: Fixed the `getSupabaseStorageUrl` function to properly handle file paths
3. **Upload Logging**: Added detailed logging to help debug upload issues

## 📝 Files Modified

- `lib/utils.ts` - Fixed storage URL generation and improved error handling
- `components/profile/EnhancedProfileImageEditor.tsx` - Better error messages for users
- `fix_storage_policies.sql` - SQL script to create RLS policies
- `test-storage.js` - Test script to verify storage setup

## 🆘 If Issues Persist

1. Check your `.env.local` file has the correct Supabase credentials
2. Ensure your Supabase project is active and not paused
3. Verify you have the correct permissions in your Supabase project
4. Check the browser console for any additional error messages

## 📞 Support

If you continue to have issues after following these steps, the error messages in the UI will now be more helpful in identifying the specific problem.
