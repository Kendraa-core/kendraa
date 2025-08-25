# Quick Storage Setup Guide

## 🚨 URGENT: Create Storage Buckets Now

Your Kendraa application needs storage buckets to work properly. Follow these steps **immediately**:

## Step 1: Access Your Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Click on your **Kendraa project**

## Step 2: Navigate to Storage

1. In the left sidebar, click **"Storage"**
2. You'll see the storage management page

## Step 3: Create the `avatars` Bucket

1. Click **"Create a new bucket"** button
2. Fill in these exact details:
   - **Name**: `avatars` (exactly like this)
   - **Public bucket**: ✅ **CHECK THIS BOX** (very important!)
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/*`
3. Click **"Create bucket"**

## Step 4: Create the `banners` Bucket

1. Click **"Create a new bucket"** again
2. Fill in these exact details:
   - **Name**: `banners` (exactly like this)
   - **Public bucket**: ✅ **CHECK THIS BOX** (very important!)
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: `image/*`
3. Click **"Create bucket"**

## Step 5: Set Up Policies (Important!)

### For the `avatars` bucket:

1. Click on the `avatars` bucket name
2. Go to the **"Policies"** tab
3. Click **"New Policy"**
4. Choose **"Create a policy from scratch"**
5. Create these two policies:

**Policy 1:**
- **Policy Name**: `Allow authenticated users to upload avatars`
- **Target roles**: `authenticated`
- **Using policy definition**: `(auth.uid()::text = (storage.foldername(name))[1])`

**Policy 2:**
- **Policy Name**: `Allow public to view avatars`
- **Target roles**: `public`
- **Using policy definition**: `true`

### For the `banners` bucket:

1. Click on the `banners` bucket name
2. Go to the **"Policies"** tab
3. Click **"New Policy"**
4. Choose **"Create a policy from scratch"**
5. Create these two policies:

**Policy 1:**
- **Policy Name**: `Allow authenticated users to upload banners`
- **Target roles**: `authenticated`
- **Using policy definition**: `(auth.uid()::text = (storage.foldername(name))[1])`

**Policy 2:**
- **Policy Name**: `Allow public to view banners`
- **Target roles**: `public`
- **Using policy definition**: `true`

## Step 6: Test the Setup

1. Go back to your Kendraa application
2. Try to upload a profile picture or banner
3. It should work without errors now!

## 🆘 If You Still Get Errors

1. **Check bucket names**: Make sure they are exactly `avatars` and `banners`
2. **Check public setting**: Both buckets must be marked as "Public"
3. **Check policies**: Make sure all 4 policies are created and active
4. **Refresh the page**: Sometimes you need to refresh after creating buckets

## 📞 Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Verify all steps above are completed
3. Make sure you're in the correct Supabase project

---

**This setup is required for profile image uploads to work!**
